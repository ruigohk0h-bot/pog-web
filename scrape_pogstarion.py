#!/usr/bin/env python3
# scrape_pogstarion.py
# pogstarion.com の「最新状況」ページを取得して JSON 化する
#   - 予定・結果（出走予定／出走確定／確定結果）
#   - 特別登録
# 生成: public/data/pogstarion.json

import requests
import json
import os
import re
from datetime import datetime, timezone, timedelta
from bs4 import BeautifulSoup

# 取得対象（最新状況ページ）
TARGET_URL = "https://pogstarion.com/newresultlist.do?group_num=0601093409"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                  "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept-Language": "ja-JP,ja;q=0.9",
}


def cell_text(td):
    """セルのテキストを取得（画像のalt等も拾う）"""
    txt = td.get_text(strip=True)
    if txt:
        return txt
    img = td.find("img")
    if img and img.get("alt"):
        return img.get("alt").strip()
    return ""


def parse_table(table):
    """テーブルをヘッダー行＋データ行に分解して辞書のリストで返す"""
    rows = table.find_all("tr")
    if not rows:
        return None, []

    # 1行目をヘッダーとして扱う
    header_cells = rows[0].find_all(["th", "td"])
    headers = [cell_text(c) for c in header_cells]

    data = []
    for tr in rows[1:]:
        cells = tr.find_all(["th", "td"])
        if not cells:
            continue
        values = [cell_text(c) for c in cells]
        # ヘッダー数に合わせて辞書化（足りない/余る分はそのまま）
        rec = {}
        for i, v in enumerate(values):
            key = headers[i] if i < len(headers) and headers[i] else f"col{i}"
            rec[key] = v
        # リンクがあれば拾う（競走名→netkeiba等）
        links = [a.get("href") for a in tr.find_all("a") if a.get("href")]
        if links:
            rec["_links"] = links
        data.append(rec)
    return headers, data


def main():
    print("=== pogstarion 最新状況 取得 ===", flush=True)
    try:
        resp = requests.get(TARGET_URL, headers=HEADERS, timeout=20)
        resp.raise_for_status()
        resp.encoding = resp.apparent_encoding
    except Exception as e:
        print(f"取得失敗: {e}", flush=True)
        return

    soup = BeautifulSoup(resp.text, "html.parser")
    tables = soup.find_all("table")

    schedule_results = []   # 予定・結果（騎手・順位・賞金あり）
    special_regist = []     # 特別登録（所有者ありだが順位なし）

    for t in tables:
        headers, data = parse_table(t)
        if headers is None:
            continue
        hjoin = "".join(headers)
        # 予定・結果テーブル：順位 or 騎手 or 賞金 を含む
        if ("順位" in hjoin or "騎手" in hjoin or "賞金" in hjoin) and "馬名" in hjoin:
            schedule_results.extend(data)
        # 特別登録テーブル：馬名と所有者を含み、順位・騎手・賞金を含まない
        elif "馬名" in hjoin and "所有者" in hjoin:
            special_regist.extend(data)

    jst = datetime.now(timezone(timedelta(hours=9)))
    out = {
        "updated": jst.strftime("%Y/%m/%d %H:%M"),
        "source": TARGET_URL,
        "schedule_results": schedule_results,
        "special_regist": special_regist,
    }

    out_dir = os.path.join(os.path.dirname(__file__), "public", "data")
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "pogstarion.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)

    print(f"完了: 予定・結果 {len(schedule_results)}件 / 特別登録 {len(special_regist)}件", flush=True)
    print(f"  → public/data/pogstarion.json", flush=True)


if __name__ == "__main__":
    main()
