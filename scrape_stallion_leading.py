#!/usr/bin/env python3
# scrape_stallion_leading.py
# db-keiba.com からダート種牡馬リーディングを取得
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

BASE_URL = "https://db-keiba.com/stallion-dirt-new/"


def scrape_leading(year=None):
    """ダート種牡馬リーディングを取得。ページ実際の年度も返す"""
    url = BASE_URL if not year else f"{BASE_URL}?year={year}"
    try:
        resp = requests.get(url, headers=HEADERS, timeout=20)
        resp.raise_for_status()
        resp.encoding = "utf-8"
    except Exception as e:
        print(f"  取得失敗: {e}", flush=True)
        return [], None, None

    soup = BeautifulSoup(resp.text, "html.parser")

    # ページタイトルから実際の年度を取得（例: 「種牡馬（ダート）リーディング（2026）」）
    actual_year = None
    title = soup.title.text if soup.title else ""
    m = re.search(r'[（(](\d{4})[）)]', title)
    if m:
        actual_year = int(m.group(1))

    updated_text = ""
    for tag in soup.find_all(string=re.compile(r"更新日")):
        updated_text = tag.strip()
        break

    rows = []
    table = soup.find("table")
    if not table:
        print("  テーブルが見つかりません", flush=True)
        return [], updated_text, actual_year

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

    return rows, updated_text, actual_year


def main():
    out_dir = os.path.join(os.path.dirname(__file__), "public", "data")
    os.makedirs(out_dir, exist_ok=True)
    jst = datetime.now(timezone(timedelta(hours=9)))

    print("=== ダート種牡馬リーディング取得 ===", flush=True)

    result = {}
    # 現在年から遡りながら重複なく3年分取得
    check_year = jst.year
    while len(result) < 3 and check_year >= 2020:
        print(f"  {check_year}年度試行中...", flush=True)
        # 最新はyearパラメータなし、過去年はyearパラメータあり
        param = None if check_year == jst.year else check_year
        rows, _, actual_year = scrape_leading(param)
        if rows and actual_year and str(actual_year) not in result:
            result[str(actual_year)] = rows
            print(f"    {actual_year}年度: {len(rows)}頭取得", flush=True)
        elif rows and actual_year and str(actual_year) in result:
            print(f"    {actual_year}年度は取得済みのためスキップ → ?year={check_year-1} を試みます", flush=True)
        else:
            print(f"    データなし", flush=True)
        check_year -= 1

    out = {
        "updated": jst.strftime("%Y/%m/%d %H:%M"),
        "years": result,
    }

    out_path = os.path.join(out_dir, "stallion_leading.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)

    total = sum(len(v) for v in result.values())
    print(f"  完了: {total}件 → stallion_leading.json", flush=True)


if __name__ == "__main__":
    main()
