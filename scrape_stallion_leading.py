#!/usr/bin/env python3
# scrape_stallion_leading.py
# 種牡馬リーディング取得
#   日本ダート / 日本芝 : db-keiba.com（勝利数ベース）
#   JRA総合             : netkeiba own（入着賞金ベース）
# 生成: public/data/stallion_leading.json

import requests
from bs4 import BeautifulSoup
import json
import os
import re
from datetime import datetime, timezone, timedelta

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                  "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept-Language": "ja-JP,ja;q=0.9",
}

DIRT_URL     = "https://db-keiba.com/stallion-dirt-new/"
TURF_URL     = "https://db-keiba.com/stallion-turf-new/"
NETKEIBA_URL = "https://own.netkeiba.com/sire/stallion_leading.html"
JBIS_URL     = "https://www.jbis.or.jp/ranking/result/"


# ── db-keiba スクレイパー ─────────────────────────────────────

def scrape_dbkeiba(base_url, year=None):
    """db-keiba からリーディングを取得。(rows, actual_year) を返す"""
    url = base_url if not year else f"{base_url}?year={year}"
    try:
        resp = requests.get(url, headers=HEADERS, timeout=20)
        resp.raise_for_status()
        resp.encoding = "utf-8"
    except Exception as e:
        print(f"    取得失敗: {e}", flush=True)
        return [], None

    soup = BeautifulSoup(resp.text, "html.parser")

    actual_year = None
    title = soup.title.text if soup.title else ""
    m = re.search(r"[（(](\d{4})[）)]", title)
    if m:
        actual_year = int(m.group(1))

    table = soup.find("table")
    if not table:
        return [], actual_year

    rows = []
    for tr in table.find_all("tr")[1:]:
        cells = [td.get_text(strip=True) for td in tr.find_all(["td", "th"])]
        if len(cells) < 5:
            continue

        def safe(idx, default=""):
            return cells[idx].replace(",", "") if idx < len(cells) else default

        row = {
            "rank":      safe(0),
            "name":      safe(1),
            "win":       safe(2),
            "second":    safe(3),
            "third":     safe(4),
            "out":       safe(5),
            "runs":      safe(6),
            "winRate":   safe(7),
            "top2Rate":  safe(8),
            "top3Rate":  safe(9),
            "singleRet": safe(10),
            "multiRet":  safe(11),
        }
        if row["name"]:
            rows.append(row)

    return rows, actual_year


# ── netkeiba スクレイパー ─────────────────────────────────────
# 列インデックス（23列構成）:
#  0:順位 1:馬名 2:出走頭数 3:勝馬頭数
#  4:出走回数 5:勝利回数
#  6:重賞出走 7:重賞勝利
#  8:特別出走 9:特別勝利
# 10:平場出走 11:平場勝利
# 12:芝出走   13:芝勝利
# 14:ダート出走 15:ダート勝利
# 16:勝馬率 17:EI 18:入着賞金(万円)
# 19:平均距離(芝) 20:平均距離(ダ)
# 21:代表馬 22:順位変動

def scrape_netkeiba(year):
    """netkeiba JRA総合リーディングを取得。rows を返す"""
    url = f"{NETKEIBA_URL}?year={year}"
    try:
        resp = requests.get(url, headers=HEADERS, timeout=20)
        resp.raise_for_status()
        resp.encoding = "utf-8"
    except Exception as e:
        print(f"    取得失敗: {e}", flush=True)
        return []

    soup = BeautifulSoup(resp.text, "html.parser")
    table = soup.find("table")
    if not table:
        return []

    rows = []
    for tr in table.find_all("tr")[2:]:  # 最初の2行はヘッダー
        cells = [td.get_text(strip=True) for td in tr.find_all(["td", "th"])]
        if len(cells) < 19:
            continue

        def safe(idx, default=""):
            return cells[idx] if idx < len(cells) else default

        def num(idx):
            return cells[idx].replace(",", "") if idx < len(cells) else ""

        row = {
            "rank":       num(0),
            "name":       safe(1),
            "runs":       num(4),
            "win":        num(5),
            "gradeWin":   num(7),
            "turfWin":    num(13),
            "dirtWin":    num(15),
            "winRate":    safe(16),
            "ei":         safe(17),
            "prize":      num(18),   # 入着賞金（万円）
            "repHorse":   safe(21),
        }
        if row["name"]:
            rows.append(row)

    return rows


# ── JBISサーチ スクレイパー ───────────────────────────────────
# db-keibaに年度ページが存在しない欠番年を補完するための代替ソース。
# 出走回数・勝利回数ベース（db-keibaの勝率/連対率/複勝率/単勝回収率とは
# 統計の種類が異なるため、勝率のみ計算し、他は "－" とする）
# racetype1: 2=芝 3=ダート／racetype2: 2=平地（障害除く）／division: 2=中央（JRA）

def scrape_jbis(year, racetype1):
    """JBISサーチからサラ系・中央・平地の年度別サイアーランキングを取得"""
    url = (f"{JBIS_URL}?ranking=1&y1={year}&kind=1&division=2"
           f"&racetype1={racetype1}&racetype2=2&items=100&order=A")
    try:
        resp = requests.get(url, headers=HEADERS, timeout=20)
        resp.raise_for_status()
        resp.encoding = "utf-8"
    except Exception as e:
        print(f"    取得失敗: {e}", flush=True)
        return []

    soup = BeautifulSoup(resp.text, "html.parser")
    rows = []
    # 行コンテナ: [順位, 種牡馬名(jc-left), 出走回数, 出走頭数, 勝利回数, 勝利頭数,
    #             重賞勝回数, 重賞勝頭数, AEI, AEI(重賞), 収得賞金, 収得賞金(重賞), 代表産駒(jc-left)]
    # 代表産駒もjc-leftなので、行コンテナ単位でcells[1]（1番目のjc-left）だけを種牡馬名として使う
    for row_div in soup.find_all("div", recursive=True):
        cells = row_div.find_all("div", recursive=False)
        if len(cells) < 12:
            continue
        rank = cells[0].get_text(strip=True)
        if not rank.isdigit():
            continue
        name_link = cells[1].find("a")
        if not name_link or not name_link.get("href", "").startswith("/horse/"):
            continue
        name = name_link.get_text(strip=True)
        runs = cells[2].get_text(strip=True).replace(",", "")
        win  = cells[4].get_text(strip=True).replace(",", "")
        try:
            win_rate = round(int(win) / int(runs) * 100, 1) if int(runs) > 0 else 0
        except ValueError:
            win_rate = 0
        if not name:
            continue
        rows.append({
            "rank": rank, "name": name,
            "win": win, "runs": runs,
            "winRate": str(win_rate),
            "top2Rate": "－", "top3Rate": "－", "singleRet": "－", "multiRet": "－",
            "source": "jbis",
        })
    return rows


# ── 共通ユーティリティ ────────────────────────────────────────

def fetch_3years_dbkeiba(base_url, label, current_year):
    """重複なく3年分取得"""
    result = {}
    check_year = current_year
    while len(result) < 3 and check_year >= 2020:
        print(f"  [{label}] {check_year}年試行...", flush=True)
        param = None if check_year == current_year else check_year
        rows, actual_year = scrape_dbkeiba(base_url, param)
        if rows and actual_year and str(actual_year) not in result:
            result[str(actual_year)] = rows
            print(f"    {actual_year}年: {len(rows)}頭取得", flush=True)
        elif rows and actual_year and str(actual_year) in result:
            print(f"    {actual_year}年は取得済みスキップ", flush=True)
        else:
            print(f"    データなし", flush=True)
        check_year -= 1
    return result


def fetch_netkeiba_years(years):
    """netkeiba から指定年リストを取得"""
    result = {}
    for year in years:
        print(f"  [JRA総合] {year}年取得...", flush=True)
        rows = scrape_netkeiba(year)
        if rows:
            result[str(year)] = rows
            print(f"    {len(rows)}頭取得", flush=True)
        else:
            print(f"    データなし", flush=True)
    return result


def load_existing(out_path):
    if os.path.exists(out_path):
        with open(out_path, encoding="utf-8") as f:
            return json.load(f)
    return {}


# ── メイン ───────────────────────────────────────────────────

def main():
    out_dir = os.path.join(os.path.dirname(__file__), "public", "data")
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "stallion_leading.json")
    jst = datetime.now(timezone(timedelta(hours=9)))
    current_year = jst.year

    print("=== 種牡馬リーディング取得 ===", flush=True)

    print("\n【日本ダート（db-keiba）】", flush=True)
    dirt_jpn = fetch_3years_dbkeiba(DIRT_URL, "日本ダート", current_year)

    print("\n【日本芝（db-keiba）】", flush=True)
    turf_jpn = fetch_3years_dbkeiba(TURF_URL, "日本芝", current_year)

    # db-keibaに年度ページが無い欠番年（直近3年のうち）はJBISサーチで補完
    needed_years = [current_year, current_year - 1, current_year - 2]
    print("\n【欠番年をJBISサーチで補完】", flush=True)
    for label, target, racetype1 in [("日本ダート", dirt_jpn, 3), ("日本芝", turf_jpn, 2)]:
        for y in needed_years:
            if str(y) in target:
                continue
            print(f"  [{label}] {y}年をJBISサーチで取得...", flush=True)
            rows = scrape_jbis(y, racetype1)
            if rows:
                target[str(y)] = rows
                print(f"    {len(rows)}頭取得（JBIS）", flush=True)
            else:
                print(f"    データなし", flush=True)

    print("\n【JRA総合リーディング（netkeiba・賞金）】", flush=True)
    jpn_total = fetch_netkeiba_years([current_year, current_year - 1, current_year - 2])

    existing = load_existing(out_path)
    dirt_usa = existing.get("dirt_usa", {})

    out = {
        "updated":   jst.strftime("%Y/%m/%d %H:%M"),
        "dirt_jpn":  dirt_jpn,
        "turf_jpn":  turf_jpn,
        "jpn_total": jpn_total,
        "dirt_usa":  dirt_usa,
    }

    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)

    total = sum(len(v) for v in dirt_jpn.values()) + sum(len(v) for v in turf_jpn.values()) + sum(len(v) for v in jpn_total.values())
    print(f"\n完了: {total}件 → stallion_leading.json", flush=True)


if __name__ == "__main__":
    main()
