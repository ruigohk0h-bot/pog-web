#!/usr/bin/env python3
# scrape_pogstarion.py
# pogstarion.com から以下を取得:
#   1. 2025-26グループ: 予定・結果 → results.json / pogstarion.json
#   2. 2026-27グループ: 特別登録・登録馬名 → regist2627.json
# 生成: public/data/pogstarion.json / results.json / regist2627.json

import requests
import json
import os
import re
from datetime import datetime, timezone, timedelta
from bs4 import BeautifulSoup

# ============================================================
# グループ番号
# ============================================================
GROUP_2526 = "0601142541"   # 砂遊び 2025-26 シーズン（メイン）
GROUP_2627 = "0601093409"   # 砂遊び 2026-27 シーズン（登録馬名取得用）

URL_2526 = f"https://pogstarion.com/newresultlist.do?group_num={GROUP_2526}"
URL_2627 = f"https://pogstarion.com/newresultlist.do?group_num={GROUP_2627}"

# 各厩舎の user_num（2025-26グループ）
STABLE_USERS_2526 = {
    "P04": "380049",  # ミリオン厩舎
    "P01": "380046",  # 前田厩舎
    "P02": "380044",  # 川村厩舎
    "P07": "380051",  # 成田厩舎
    "P06": "380050",  # 涼子厩舎
    "P05": "380048",  # 田崎厩舎
    "P03": "380045",  # 長谷部厩舎
}

# 各厩舎の user_num（2026-27グループ・登録馬名取得用）
STABLE_USERS_2627 = {
    "P04": "407309",  # ミリオン厩舎
    "P01": "407310",  # 前田厩舎
    "P02": "407303",  # 川村厩舎
    "P07": "407305",  # 成田厩舎
    "P06": "407306",  # 涼子厩舎
    "P05": "407307",  # 田崎厩舎
    "P03": "407304",  # 長谷部厩舎
}

# 所有者名 → プレイヤーID
OWNER_TO_PLAYER = {
    "ミリオン厩舎": "P04",
    "前田厩舎":     "P01",
    "川村厩舎":     "P02",
    "長谷部厩舎":   "P03",
    "田崎厩舎":     "P05",
    "涼子厩舎":     "P06",
    "成田厩舎":     "P07",
}

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                  "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept-Language": "ja-JP,ja;q=0.9",
}


def cell_text(td):
    txt = td.get_text(strip=True)
    if txt:
        return txt
    img = td.find("img")
    if img and img.get("alt"):
        return img.get("alt").strip()
    return ""


def parse_table(table):
    rows = table.find_all("tr")
    if not rows:
        return None, []
    header_cells = rows[0].find_all(["th", "td"])
    headers = [cell_text(c) for c in header_cells]
    data = []
    for tr in rows[1:]:
        cells = tr.find_all(["th", "td"])
        if not cells:
            continue
        values = [cell_text(c) for c in cells]
        rec = {}
        for i, v in enumerate(values):
            key = headers[i] if i < len(headers) and headers[i] else f"col{i}"
            rec[key] = v
        links = [a.get("href") for a in tr.find_all("a") if a.get("href")]
        if links:
            rec["_links"] = links
        data.append(rec)
    return headers, data


def detect_grade(race_name):
    """レース名からグレードタグを判定"""
    if re.search(r'GⅠ|G1|ジャパンC|有馬|天皇賞|宝塚|菊花|桜花|オークス|皐月|ダービー|ホープフル|阪神ジュベナイル|朝日杯', race_name):
        return "GⅠ"
    if re.search(r'GⅡ|G2', race_name):
        return "GⅡ"
    if re.search(r'GⅢ|G3', race_name):
        return "GⅢ"
    if re.search(r'JpnI|Jpn1|Jpn１', race_name):
        return "JpnI"
    if re.search(r'JpnII|Jpn2|Jpn２', race_name):
        return "JpnII"
    if re.search(r'JpnIII|Jpn3|Jpn３', race_name):
        return "JpnIII"
    return None


def parse_results_from_schedule(schedule_results):
    """
    pogstarionの予定・結果リストから「確定結果」を抽出し
    results.json 形式のリストに変換する。
    芝レースは rawPt=0（turfPtに賞金を記録）。
    """
    results = []
    seen = set()  # 重複防止: (horse, date)

    for row in schedule_results:
        # 順位が数字のものだけ処理（空=出走前）
        order_str = row.get("順位", "").strip()
        if not order_str or not order_str.isdigit():
            continue
        order = int(order_str)

        date  = row.get("日時", "").strip()     # 例: "06/06"
        venue_raw = row.get("競走", "").strip() # 例: "阪神01R"
        race  = row.get("レース名", "").strip() # 例: "未勝利"
        dist_raw  = row.get("距離", "").strip() # 例: "ダ1400" or "芝1600"
        horse = row.get("馬名", "").strip()
        owner = row.get("所有者", "").strip()

        # 賞金（= POGポイント）
        pt_str = row.get("賞金", "").strip()
        pt = int(pt_str) if pt_str and pt_str.isdigit() else 0

        if not date or not horse or not owner:
            continue

        # 重複チェック
        key = (horse, date)
        if key in seen:
            continue
        seen.add(key)

        # 場名: "阪神01R" → "阪神"
        venue = re.sub(r'\d+回|\d+[Rr]$|\d+$', '', venue_raw).strip()

        # 距離・コース
        surface = "turf" if dist_raw.startswith("芝") else "dirt"
        dist_m = re.search(r'\d+', dist_raw)
        dist = int(dist_m.group()) if dist_m else 0

        # ポイント: 芝は強制0pt（turfPtに記録）
        if surface == "turf":
            raw_pt  = 0
            turf_pt = pt
        else:
            raw_pt  = pt
            turf_pt = 0

        # プレイヤーID
        player = OWNER_TO_PLAYER.get(owner)
        if not player:
            continue

        # グレード
        grade = detect_grade(race)
        local = bool(re.search(r'Jpn|地方|盛岡|船橋|川崎|大井|浦和|金沢|笠松|名古屋|園田|姫路|高知|佐賀', race + venue_raw))

        results.append({
            "date":    date,
            "venue":   venue,
            "race":    race,
            "course":  dist_raw,
            "surface": surface,
            "dist":    dist,
            "horse":   horse,
            "player":  player,
            "order":   order,
            "grade":   grade,
            "local":   local,
            "rawPt":   raw_pt,
            "turfPt":  turf_pt,
            "_ts":     date,
        })

    # 日付降順でソート
    results.sort(key=lambda r: r["date"], reverse=True)
    return results


def scrape_registrations(group_num, stable_users):
    """各厩舎の登録馬一覧から、馬名・在厩・血統を取得する"""
    import time
    result = {}
    for pid, user_num in stable_users.items():
        url = f"https://pogstarion.com/userumalist.do?group_num={group_num}&user_num={user_num}"
        try:
            resp = requests.get(url, headers=HEADERS, timeout=20)
            resp.raise_for_status()
            resp.encoding = resp.apparent_encoding
        except Exception as e:
            print(f"  [{pid}] 取得失敗: {e}", flush=True)
            continue

        soup = BeautifulSoup(resp.text, "html.parser")
        dam_to_name = {}
        horses = []
        for t in soup.find_all("table"):
            rows = t.find_all("tr")
            if not rows:
                continue
            headers = [cell_text(c) for c in rows[0].find_all(["th", "td"])]
            hjoin = "".join(headers)
            if "馬名" not in hjoin or "血統" not in hjoin:
                continue

            # カラムインデックスを取得
            try:
                name_idx  = headers.index("馬名")
            except ValueError:
                continue
            active_idx = headers.index("在厩") if "在厩" in headers else None
            ped_idx    = len(headers) - 1  # 血統は最終列

            for tr in rows[1:]:
                cells = [cell_text(c) for c in tr.find_all(["th", "td"])]
                if len(cells) <= ped_idx:
                    continue
                name = cells[name_idx].strip()
                ped  = cells[ped_idx]

                # 在厩: "Ｏ"(全角O=0xff2f) → True, "−"(マイナス=0x2212) → False
                active = False
                if active_idx is not None and active_idx < len(cells):
                    val = cells[active_idx].strip()
                    active = val in ("Ｏ", "O", "○", "〇")

                # 血統から父・母を抽出（例: "父Yaupon\n母Shanghai Starlet"）
                sire_m = re.search(r"父(.+?)(?:\s|母|$)", ped)
                dam_m  = re.search(r"母(.+?)$", ped.strip())
                sire   = sire_m.group(1).strip() if sire_m else ""
                dam    = dam_m.group(1).strip()  if dam_m  else ""

                if dam:
                    dam_to_name[dam] = name if name else None

                horses.append({
                    "name":   name if name else None,
                    "active": active,
                    "sire":   sire,
                    "dam":    dam,
                })

            break  # 最初に見つかったテーブルのみ処理

        if horses:
            result[pid] = {
                "dam_to_name": dam_to_name,
                "horses": horses,
            }
            named   = sum(1 for h in horses if h["name"])
            active  = sum(1 for h in horses if h["active"])
            print(f"  [{pid}] {len(horses)}頭（名前あり{named}・在厩{active}）", flush=True)
        time.sleep(0.5)
    return result


def fetch_schedule(url):
    """pogstarionの最新状況ページを取得してschedule_results, special_registを返す"""
    resp = requests.get(url, headers=HEADERS, timeout=20)
    resp.raise_for_status()
    resp.encoding = resp.apparent_encoding
    soup = BeautifulSoup(resp.text, "html.parser")

    schedule_results = []
    special_regist   = []
    for t in soup.find_all("table"):
        headers, data = parse_table(t)
        if headers is None:
            continue
        hjoin = "".join(headers)
        if ("順位" in hjoin or "騎手" in hjoin or "賞金" in hjoin) and "馬名" in hjoin:
            schedule_results.extend(data)
        elif "馬名" in hjoin and "所有者" in hjoin:
            special_regist.extend(data)
    return schedule_results, special_regist


def main():
    out_dir = os.path.join(os.path.dirname(__file__), "public", "data")
    os.makedirs(out_dir, exist_ok=True)
    jst = datetime.now(timezone(timedelta(hours=9)))

    # ── 1. 2026-27 グループ: 予定・結果・特別登録 ──────────────────
    print("=== 2026-27 最新状況 取得 ===", flush=True)
    try:
        schedule_results, special_regist = fetch_schedule(URL_2627)
    except Exception as e:
        print(f"取得失敗: {e}", flush=True)
        schedule_results, special_regist = [], []

    # pogstarion.json 保存
    pogstarion_out = {
        "updated": jst.strftime("%Y/%m/%d %H:%M"),
        "source": URL_2627,
        "schedule_results": schedule_results,
        "special_regist": special_regist,
    }
    with open(os.path.join(out_dir, "pogstarion.json"), "w", encoding="utf-8") as f:
        json.dump(pogstarion_out, f, ensure_ascii=False, indent=2)
    print(f"  予定・結果 {len(schedule_results)}件 / 特別登録 {len(special_regist)}件", flush=True)

    # ── 2. 確定結果 → results.json（既存データとマージ）──────────
    new_confirmed = parse_results_from_schedule(schedule_results)

    # 既存 results.json を読み込んでマージ（馬名+日付で重複排除）
    results_path = os.path.join(out_dir, "results.json")
    existing = []
    if os.path.exists(results_path):
        try:
            with open(results_path, "r", encoding="utf-8") as f:
                existing = json.load(f)
        except Exception:
            existing = []

    existing_keys = {(r["horse"], r["date"]) for r in existing}
    added = [r for r in new_confirmed if (r["horse"], r["date"]) not in existing_keys]
    merged = added + existing
    merged.sort(key=lambda r: r["date"], reverse=True)

    dirt_conf  = [r for r in new_confirmed if r["rawPt"] > 0]
    turf_conf  = [r for r in new_confirmed if r["surface"] == "turf"]
    print(f"  pogstarion新規: {len(new_confirmed)}件（うち新追加 {len(added)}件）", flush=True)
    print(f"  マージ後合計: {len(merged)}件（ダート得点あり {len(dirt_conf)}件 / 芝0pt {len(turf_conf)}件）", flush=True)

    with open(results_path, "w", encoding="utf-8") as f:
        json.dump(merged, f, ensure_ascii=False, indent=2)
    with open(os.path.join(out_dir, "upcoming.json"), "w", encoding="utf-8") as f:
        upcoming = [r for r in schedule_results if not r.get("順位", "").strip().isdigit()]
        json.dump(upcoming[:10], f, ensure_ascii=False, indent=2)
    print(f"  → results.json / upcoming.json 保存完了", flush=True)

    # ── 3. updated.json ───────────────────────────────────────────
    with open(os.path.join(out_dir, "updated.json"), "w", encoding="utf-8") as f:
        json.dump({"updated": jst.strftime("%Y/%m/%d %H:%M")}, f, ensure_ascii=False)

    # ── 4. 2026-27 グループ: 登録馬名 ──────────────────────────────
    print("\n=== 2026-27 登録馬名 取得 ===", flush=True)
    regist = scrape_registrations(GROUP_2627, STABLE_USERS_2627)
    with open(os.path.join(out_dir, "regist2627.json"), "w", encoding="utf-8") as f:
        json.dump(regist, f, ensure_ascii=False, indent=2)
    total = sum(len(v) for v in regist.values())
    print(f"  登録馬名 計{total}件 → regist2627.json 保存完了", flush=True)


if __name__ == "__main__":
    main()
