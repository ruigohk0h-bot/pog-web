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
    """ダート種牡馬リーディングを取得して返す"""
    url = BASE_URL if not year else f"{BASE_URL}?year={year}"
    try:
        resp = requests.get(url, headers=HEADERS, timeout=20)
        resp.raise_for_status()
        resp.encoding = resp.apparent_encoding
    except Exception as e:
        print(f"  取得失敗: {e}", flush=True)
        return [], None

    soup = BeautifulSoup(resp.text, "html.parser")

    # 更新日を取得
    updated_text = ""
    for tag in soup.find_all(string=re.compile(r"更新日")):
        updated_text = tag.strip()
        break

    rows = []
    table = soup.find("table")
    if not table:
        print("  テーブルが見つかりません", flush=True)
        return [], updated_text

    headers = []
    for th in table.find_all("th"):
        headers.append(th.get_text(strip=True))

    for tr in table.find_all("tr")[1:]:
        cells = [td.get_text(strip=True) for td in tr.find_all(["td", "th"])]
        if len(cells) < 5:
            continue

        # 種牡馬名リンクからIDを取得
        sire_link = ""
        for a in tr.find_all("a"):
            href = a.get("href", "")
            if "stallion" in href or "sire" in href:
                sire_link = href
                break

        def safe(idx, default=""):
            return cells[idx].replace(",", "") if idx < len(cells) else default

        row = {
            "rank":     safe(0),
            "name":     safe(1),
            "win":      safe(2),
            "second":   safe(3),
            "third":    safe(4),
            "out":      safe(5),
            "runs":     safe(6),
            "winRate":  safe(7),
            "top2Rate": safe(8),
            "top3Rate": safe(9),
            "singleRet": safe(10),
            "multiRet":  safe(11),
        }
        if row["name"]:
            rows.append(row)

    return rows, updated_text


def main():
    out_dir = os.path.join(os.path.dirname(__file__), "public", "data")
    os.makedirs(out_dir, exist_ok=True)
    jst = datetime.now(timezone(timedelta(hours=9)))

    print("=== ダート種牡馬リーディング取得 ===", flush=True)

    # 現在年度
    current_year = jst.year
    result = {}

    for year in [current_year, current_year - 1, current_year - 2]:
        print(f"  {year}年度取得中...", flush=True)
        rows, updated = scrape_leading(year if year != current_year else None)
        if rows:
            result[str(year)] = rows
            print(f"    {len(rows)}頭取得", flush=True)
        else:
            print(f"    データなし", flush=True)

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
