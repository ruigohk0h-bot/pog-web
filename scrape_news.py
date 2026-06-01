#!/usr/bin/env python3
# scrape_news.py
# POG砂遊び 指名馬ニュースをGoogle News RSSから取得
# 生成: public/data/news.json

import requests
import json
import os
import re
import urllib.parse
from datetime import datetime, timedelta
from xml.etree import ElementTree as ET

# scrape_results.py と同じ馬名→プレイヤーマッピングをインポート
try:
    from scrape_results import HORSE_PLAYER
except ImportError:
    HORSE_PLAYER = {}

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept-Language": "ja-JP,ja;q=0.9",
}

def fetch_news_for_horse(horse_name, days=30):
    """Google News RSSで馬名を検索してニュース一覧を返す"""
    query = urllib.parse.quote(f"{horse_name} 競馬")
    url = f"https://news.google.com/rss/search?q={query}&hl=ja&gl=JP&ceid=JP:ja"
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15)
        resp.raise_for_status()
        root = ET.fromstring(resp.content)
    except Exception as e:
        print(f"  NG {horse_name}: {e}", flush=True)
        return []

    cutoff = datetime.now() - timedelta(days=days)
    results = []

    for item in root.findall(".//item"):
        title_el   = item.find("title")
        link_el    = item.find("link")
        pubdate_el = item.find("pubDate")
        source_el  = item.find("source")
        desc_el    = item.find("description")

        if title_el is None or link_el is None:
            continue

        title = title_el.text or ""
        link  = link_el.text or ""

        # ソース名（媒体）
        source = source_el.text if source_el is not None else ""

        # description（記事抜粋）をHTMLタグ除去してテキスト化
        desc_raw = desc_el.text if desc_el is not None else ""
        desc = re.sub(r'<[^>]+>', '', desc_raw).strip() if desc_raw else ""

        # 日付パース（例: "Wed, 07 May 2026 12:34:56 GMT"）
        pub_str = pubdate_el.text if pubdate_el is not None else ""
        pub_dt = None
        try:
            pub_dt = datetime.strptime(pub_str, "%a, %d %b %Y %H:%M:%S %Z")
        except:
            try:
                pub_dt = datetime.strptime(pub_str[:25], "%a, %d %b %Y %H:%M:%S")
            except:
                pass

        if pub_dt and pub_dt < cutoff:
            continue

        date_label = pub_dt.strftime("%Y/%m/%d") if pub_dt else ""

        # 馬名がタイトルまたはdescriptionに含まれているか確認
        full_text = title + " " + desc
        if horse_name not in full_text:
            continue

        results.append({
            "horse":  horse_name,
            "player": HORSE_PLAYER.get(horse_name, ""),
            "title":  title,
            "desc":   desc,
            "source": source,
            "date":   date_label,
            "url":    link,
            "_ts":    pub_dt.strftime("%Y-%m-%d %H:%M") if pub_dt else "0000-00-00 00:00",
        })

    return results


def main():
    print("=== POG砂遊び ニュース取得 ===", flush=True)
    print(f"実行日時: {datetime.now().strftime('%Y/%m/%d %H:%M')}\n", flush=True)

    all_news = []
    horse_names = list(HORSE_PLAYER.keys())

    # 2026-27シーズン馬は90日、それ以外は30日
    horses_2627 = {
        "ミクニプレイブ","トゥザファイナル","ソメデイストワール",
        "スターフラッシュ","ラキアーヴェ","ミシェルバローズ","レッジェランツァ","ヴェルバニア","エスクアドラ","コナバームス",
        "マイクストーリー","アトミックリーチ","ヤングリッチ","ダノンチャンピオン","コーズダヴィンチ","セイルトゥグローリー","デミアン",
        "クロダテ","ツキノエ","マーゴットセレッツォ","セドゥクトーラ","ゼットターム","エクレアカミング","オールベット","ムーンベリル","ボードゥロレーヌ",
        "ディーヴァレギオン","ヴィルダースヴィル","ディルイーヤ","ブックオブケルズ","ケンシロウワールド","ハイウェイワン","トルヴァスト","オメガマサヤ",
        "ホウオウシュウ","オールシティキング","デュガビー","ウラノグラフィア","ヴェトロテンペスタ","ホーフアイゼン",
        "ウィンタープリーズ","ソルテヴェローチェ","トリプルウィン","タクティシアン","テンブレイクワン","アンドレバローズ","イレイザー",
    }

    for i, name in enumerate(horse_names):
        days = 90 if name in horses_2627 else 30
        items = fetch_news_for_horse(name, days=days)
        if items:
            print(f"  {name}: {len(items)}件", flush=True)
            all_news.extend(items)
        else:
            print(f"  {name}: 0件", flush=True)

    # 日付降順ソート・重複除去（同タイトル）
    seen_titles = set()
    unique_news = []
    for n in sorted(all_news, key=lambda x: x["_ts"], reverse=True):
        if n["title"] not in seen_titles:
            seen_titles.add(n["title"])
            del n["_ts"]
            unique_news.append(n)

    # 保存
    out_dir = os.path.join(os.path.dirname(__file__), "public", "data")
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "news.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(unique_news, f, ensure_ascii=False, indent=2)

    print(f"\n完了！ {len(unique_news)}件のニュースを保存", flush=True)
    print(f"  → public/data/news.json", flush=True)


def write_updated_json():
    """更新日時をpublic/data/updated.jsonに書き込む"""
    from datetime import timezone
    jst = datetime.now(timezone(timedelta(hours=9)))
    ts = jst.strftime("%Y/%m/%d %H:%M")
    out = os.path.join(os.path.dirname(__file__), "public", "data", "updated.json")
    with open(out, "w", encoding="utf-8") as f:
        json.dump({"updated": ts}, f, ensure_ascii=False)
    print(f"  → updated.json ({ts})", flush=True)

if __name__ == "__main__":
    main()
    write_updated_json()
