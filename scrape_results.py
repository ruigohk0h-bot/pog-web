#!/usr/bin/env python3
# scrape_results.py
# POG砂遊び 全馬の最新レース結果をnetkeiba.comから取得
# 生成: public/data/results.json / upcoming.json

import requests
from bs4 import BeautifulSoup
import json, re, time, os, urllib.parse
from datetime import datetime, timedelta

# ============================================================
# 馬名 → プレイヤーID マッピング
# ============================================================
HORSE_PLAYER = {
    # P01 前田厩舎
    "クラッチスラッガー":"P01","キンダーブンシュ":"P01","ゲタリア":"P01",
    "インシオン":"P01","ウンナターシャ":"P01","サントマーレ":"P01",
    "セヴェロ":"P01","キセログラフィカ":"P01","スマイルガーデン":"P01",
    "ワンモメンタム":"P01","ネイティヴプライド":"P01","ブロンザイト":"P01",
    # P02 川村厩舎
    "アニマレイ":"P02","リベッチオ":"P02","サンラザール":"P02",
    "アローメタル":"P02","ブームバップビート":"P02","ハイライトニング":"P02",
    "パドゼフィール":"P02","ダンジョンヒーロー":"P02","アリハム":"P02",
    "グラムエッジ":"P02","ウェンロック":"P02","ヒットホーム":"P02",
    # P03 長谷部厩舎
    "フィンガー":"P03","チュウワカーネギー":"P03","ヘリテージブルーム":"P03",
    "ゴールドバローズ":"P03","エクストラプッシュ":"P03","エコロボルト":"P03",
    "エジプシャンマウ":"P03","アメリカンコール":"P03","セスティーナ":"P03",
    "ゲレイロ":"P03","サンライズメジェド":"P03","ワンインザスカイ":"P03",
    # P04 ミリオン厩舎
    "アルデトップガン":"P04","クラウトロック":"P04","アクアアイ":"P04",
    "ペトリコール":"P04","マルシュボヌール":"P04","フィデリス":"P04",
    "アンビエントポップ":"P04","ホウオウファラオ":"P04","メイショウバンサン":"P04",
    "ヤマニンコルザ":"P04","エコロデュラン":"P04",
    # P05 田崎厩舎
    "パントルナイーフ":"P05","アドマイヤクワッズ":"P05","サトノボヤージュ":"P05",
    "テーオーグレーザー":"P05","カットソロ":"P05","ジャスティンダラス":"P05",
    "フリーガー":"P05","エコログロウ":"P05","ミリオンヴォイス":"P05",
    "ゾネブルーム":"P05","モンスターラッシュ":"P05","レッドフレーザー":"P05",
    # P06 涼子厩舎
    "ロックターミガン":"P06","トリグラフヒル":"P06","キッコベッロ":"P06",
    "イナズマダイモン":"P06","ペルセア":"P06","ムスクレスト":"P06",
    "リアライズタキオン":"P06","バートラガッツ":"P06","ライトフライヤー":"P06",
    "フローズンブーケ":"P06","ブルースプレイヤー":"P06",
    # P07 成田厩舎
    "デアヴェローチェ":"P07","アーガイルショア":"P07","アルカディアカフェ":"P07",
    "ホットシート":"P07","ミティリーニ":"P07","リーグナイト":"P07",
    "ホウオウストライク":"P07","リュウカルネ":"P07","アイデアユー":"P07",
    "メイショウコシュウ":"P07","アイランド":"P07","ジュピターバローズ":"P07",
}

# 地方競馬場リスト
LOCAL_VENUES = {"大井","船橋","川崎","浦和","門別","盛岡","水沢","金沢","笠松","名古屋","園田","姫路","高知","佐賀","荒尾","福山","帯広"}

HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
CACHE_FILE = os.path.join(os.path.dirname(__file__), "kettonum_cache.json")

def load_cache():
    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE, encoding="utf-8") as f:
            return json.load(f)
    return {}

def save_cache(cache):
    with open(CACHE_FILE, "w", encoding="utf-8") as f:
        json.dump(cache, f, ensure_ascii=False, indent=2)

def get_kettonum(name, cache):
    """馬名からnetkeiba上のkettonumを取得（2023年産限定）"""
    if name in cache:
        return cache[name]
    encoded = urllib.parse.quote(name.encode('euc-jp'))
    url = f"https://db.netkeiba.com/?pid=horse_search_list&word={encoded}&bf=1&yob=2023"
    try:
        r = requests.get(url, headers=HEADERS, timeout=10)
        soup = BeautifulSoup(r.content, "lxml", from_encoding="euc-jp")
        for a in soup.find_all("a", href=re.compile(r"/horse/2023\d+")):
            m = re.search(r"/horse/(2023\d+)", a["href"])
            if m:
                cache[name] = m.group(1)
                print(f"  ✓ {name}: {m.group(1)}")
                return m.group(1)
    except Exception as e:
        print(f"  ✗ {name}: エラー {e}")
    cache[name] = None
    print(f"  ? {name}: 見つからず")
    return None

def parse_grade(race_name):
    """レース名からグレードを判定"""
    if re.search(r'GⅠ|G1|ジャパンカップ|有馬記念|天皇賞|宝塚記念|菊花賞|桜花賞|オークス|皐月賞|ダービー', race_name):
        return "GⅠ"
    if re.search(r'GⅡ|G2', race_name): return "GⅡ"
    if re.search(r'GⅢ|G3', race_name): return "GⅢ"
    if re.search(r'JpnI|Jpn1|Jpn１', race_name): return "JpnI"
    if re.search(r'JpnII|Jpn2|Jpn２', race_name): return "JpnII"
    if re.search(r'JpnIII|Jpn3|Jpn３', race_name): return "JpnIII"
    return ""

def get_results(kettonum, horse_name, days=60):
    """馬の最近のレース結果を取得"""
    url = f"https://db.netkeiba.com/horse/{kettonum}/"
    try:
        r = requests.get(url, headers=HEADERS, timeout=10)
        soup = BeautifulSoup(r.content, "lxml", from_encoding="euc-jp")
    except Exception as e:
        print(f"    取得エラー: {e}")
        return []

    today = datetime.today()
    cutoff = today - timedelta(days=days)
    results = []

    # レース結果テーブルを探す（class="race_table_01"）
    table = soup.find("table", class_="race_table_01")
    if not table:
        return []

    for row in table.find_all("tr")[1:]:
        cells = [td.get_text(strip=True) for td in row.find_all("td")]
        if len(cells) < 20:
            continue

        # 日付（例: 2025.05.31）
        m = re.match(r'(\d{4})\.(\d{2})\.(\d{2})', cells[0])
        if not m:
            continue
        race_date = datetime(int(m.group(1)), int(m.group(2)), int(m.group(3)))
        if race_date < cutoff:
            continue

        date_label = f"{int(m.group(2)):02d}/{int(m.group(3)):02d}"

        # 開催地（例: "2回東京3日" → "東京"）
        venue_raw = cells[1]
        venue_name = re.sub(r'\d+回|\d+日目?', '', venue_raw).strip()
        # R番号
        r_num = cells[3]  # 例 "11"
        venue = f"{venue_name}{r_num}R" if r_num.isdigit() else venue_name

        # レース名
        race_name = cells[4]
        grade = parse_grade(race_name)

        # コース（例: "ダ1600"）
        course = cells[14] if len(cells) > 14 else ""
        surface = "dirt" if course.startswith("ダ") else "turf"
        dist_m = re.search(r'\d+', course)
        dist = int(dist_m.group()) if dist_m else 0

        # 着順
        order_str = re.sub(r'[^\d]', '', cells[11]) if len(cells) > 11 else ""
        order = int(order_str) if order_str else 0

        # 賞金（万円 → 円）→ ポイント
        prize_str = re.sub(r'[^\d.]', '', cells[27]) if len(cells) > 27 else "0"
        try:
            prize_man = float(prize_str or "0")
            raw_pt = int(prize_man) if surface == "dirt" and 1 <= order <= 5 else 0
        except:
            raw_pt = 0

        # 地方競馬判定
        local = venue_name in LOCAL_VENUES

        player = HORSE_PLAYER.get(horse_name, "")

        results.append({
            "date": date_label,
            "venue": venue,
            "grade": grade,
            "local": local,
            "race": race_name,
            "surface": surface,
            "dist": dist,
            "horse": horse_name,
            "order": order,
            "rawPt": raw_pt,
            "player": player,
            "_ts": race_date.strftime("%Y-%m-%d"),
        })

    return results

def main():
    print("=== POG砂遊び 最新結果スクレイパー ===")
    print(f"実行日時: {datetime.now().strftime('%Y/%m/%d %H:%M')}\n")

    cache = load_cache()

    # Step1: kettonum取得
    print("【Step1】kettonum取得...")
    changed = False
    for name in HORSE_PLAYER:
        if name not in cache:
            get_kettonum(name, cache)
            changed = True
            time.sleep(0.6)
    if changed:
        save_cache(cache)
        print(f"キャッシュ保存: {CACHE_FILE}\n")

    # Step2: 最新レース結果取得
    print("【Step2】直近60日のレース結果取得...")
    all_results = []

    for name, player in HORSE_PLAYER.items():
        kettonum = cache.get(name)
        if not kettonum:
            continue
        print(f"  {name}...")
        res = get_results(kettonum, name, days=60)
        all_results.extend(res)
        time.sleep(0.6)

    # 日付降順ソート
    all_results.sort(key=lambda x: x["_ts"], reverse=True)
    today_str = datetime.today().strftime("%Y-%m-%d")

    past     = [r for r in all_results if r["_ts"] <= today_str]
    upcoming = [r for r in all_results if r["_ts"] >  today_str]

    for r in past + upcoming:
        del r["_ts"]

    # 保存
    out_dir = os.path.join(os.path.dirname(__file__), "public", "data")
    os.makedirs(out_dir, exist_ok=True)

    with open(os.path.join(out_dir, "results.json"), "w", encoding="utf-8") as f:
        json.dump(past[:30], f, ensure_ascii=False, indent=2)

    with open(os.path.join(out_dir, "upcoming.json"), "w", encoding="utf-8") as f:
        json.dump(upcoming[:10], f, ensure_ascii=False, indent=2)

    print(f"\n✓ 完了！ 確定結果: {len(past)}件 / 出走予定: {len(upcoming)}件")
    print(f"  → public/data/results.json")
    print(f"  → public/data/upcoming.json")

if __name__ == "__main__":
    main()
