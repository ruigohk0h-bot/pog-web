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
