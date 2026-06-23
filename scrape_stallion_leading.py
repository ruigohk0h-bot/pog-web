#!/usr/bin/env python3
# scrape_stallion_leading.py
# db-keiba.com からダートリーディング・芝リーディングを取得
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

DIRT_URL = "https://db-keiba.com/stallion-dirt-new/"
TURF_URL = "https://db-keiba.com/stallion-turf-new/"


def scrape_leading(base_url, year=None):
    """リーディングを取得。(rows, actual_year) を返す"""
    url = base_url if not year else f"{base_url}?year={year}"
    try:
        resp = requests.get(url, headers=HEADERS, timeout=20)
        resp.raise_for_status()
        resp.encoding = "utf-8"
    except Exception as e:
        print(f"    取得失敗: {e}", flush=True)
        return [], None

    soup = BeautifulSoup(resp.text, "html.parser")

    # ページタイトルから実際の年度を取得
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


def fetch_3years(base_url, label, current_year):
    """重複なく3年分取得して {year: rows} の辞書を返す"""
    result = {}
    check_year = current_year
    while len(result) < 3 and check_year >= 2020:
        print(f"  [{label}] {check_year}年試行...", flush=True)
        param = None if check_year == current_year else check_year
        rows, actual_year = scrape_leading(base_url, param)
        if rows and actual_year and str(actual_year) not in result:
            result[str(actual_year)] = rows
            print(f"    {actual_year}年: {len(rows)}頭取得", flush=True)
        elif rows and actual_year and str(actual_year) in result:
            print(f"    {actual_year}年は取得済みスキップ", flush=True)
        else:
            print(f"    データなし", flush=True)
        check_year -= 1
    return result


def load_existing(out_path):
    """既存JSONを読み込む（存在しない場合は空を返す）"""
    if os.path.exists(out_path):
        with open(out_path, encoding="utf-8") as f:
            return json.load(f)
    return {}


def main():
    out_dir = os.path.join(os.path.dirname(__file__), "public", "data")
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "stallion_leading.json")
    jst = datetime.now(timezone(timedelta(hours=9)))

    print("=== 種牡馬リーディング取得 ===", flush=True)

    current_year = jst.year

    # 日本ダート
    print("\n【日本ダート】", flush=True)
    dirt_jpn = fetch_3years(DIRT_URL, "日本ダート", current_year)

    # 日本芝
    print("\n【日本芝】", flush=True)
    turf_jpn = fetch_3years(TURF_URL, "日本芝", current_year)

    # 既存データを読み込み（米国ダートは手動更新のため保持）
    existing = load_existing(out_path)
    dirt_usa = existing.get("dirt_usa", {})

    out = {
        "updated": jst.strftime("%Y/%m/%d %H:%M"),
        "dirt_jpn": dirt_jpn,
        "turf_jpn": turf_jpn,
        "dirt_usa": dirt_usa,
    }

    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)

    total = sum(len(v) for v in dirt_jpn.values()) + sum(len(v) for v in turf_jpn.values())
    print(f"\n完了: {total}件 → stallion_leading.json", flush=True)


if __name__ == "__main__":
    main()
