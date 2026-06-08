#!/usr/bin/env python3
# scrape_news.py
# POG砂遊び 指名馬ニュースを取得
# ① Google News RSS（馬名検索 + netkeiba/SPAIA絞り込み）
# ② 専門メディアRSSフィード直接購読
# 生成: public/data/news.json

import requests
import json
import os
import re
import time
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

# 2026-27シーズン馬セット: regist2627.json から動的に読み込む
def _load_horses_2627():
    """regist2627.json を読み込んで馬名セットとHORSE_PLAYERマッピングを返す"""
    path = os.path.join(os.path.dirname(__file__), "public", "data", "regist2627.json")
    if not os.path.exists(path):
        return set(), {}
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception:
        return set(), {}
    horses = set()
    mapping = {}
    for player_id, dam_to_name in data.items():
        for horse_name in dam_to_name.values():
            if horse_name:
                horses.add(horse_name)
                mapping[horse_name] = player_id
    return horses, mapping

HORSES_2627, _HORSE_PLAYER_2627 = _load_horses_2627()
# HORSE_PLAYER に26-27馬を追加（scrape_results.pyにない馬をカバー）
for _name, _pid in _HORSE_PLAYER_2627.items():
    if _name not in HORSE_PLAYER:
        HORSE_PLAYER[_name] = _pid

# ----------------------------------------------------------------
# 専門メディアRSSフィード一覧（案B）
# ----------------------------------------------------------------
# ----------------------------------------------------------------
# 低品質記事の除外ルール
# ----------------------------------------------------------------
# 除外するソース（馬名データベース系・中身なし）
EXCLUDE_SOURCES = {"UMATOKU", "馬トク", "競馬ラボ", "競走馬データベース"}
# タイトルに含まれていたら除外するキーワード
EXCLUDE_TITLE_KEYWORDS = ["競走馬データベース", "血統表", "競走馬情報", "馬データベース", "データベース"]

def is_low_quality(title, desc, source, horse_name):
    """中身のない記事を除外するフィルター"""
    # 除外ソース
    for ex in EXCLUDE_SOURCES:
        if ex in source:
            return True
    # タイトルNGワード
    for kw in EXCLUDE_TITLE_KEYWORDS:
        if kw in title:
            return True
    # タイトルが馬名だけ（＝データベースの馬ページ）
    if title.strip() == horse_name:
        return True
    # 「馬名 (英語表記)」パターン（＝netkeibaのデータベース馬ページ）
    if re.match(r'^' + re.escape(horse_name) + r'\s*\([A-Za-z\s]+\)\s*$', title):
        return True
    # 「馬名 (英語表記) | 競走馬データ」などの完全なデータベースタイトル
    if re.match(r'^' + re.escape(horse_name) + r'\s*\([A-Za-z\s]+\)', title):
        return True
    # 「馬名の掲示板」パターン（＝ファンの掲示板ページ、本文なし）
    if re.match(r'^' + re.escape(horse_name) + r'の掲示板', title):
        return True
    # netkeibaのタイトルが馬名のみ（descがあっても弾く）
    if "netkeiba" in source.lower() and title.strip() == horse_name:
        return True
    # 本文なし
    if not desc:
        return True
    return False

MEDIA_RSS_FEEDS = [
    { "url": "https://rss.netkeiba.com/?pid=rss_netkeiba&site=netkeiba", "source": "netkeiba" },
    { "url": "https://uma-furusato.com/st/rss/horse_news.xml",           "source": "うまふる"  },
    { "url": "https://uma-furusato.com/st/rss/winner_info.xml",          "source": "うまふる重賞" },
]

def parse_rss_items(content, source_name, horse_names_set, days):
    """RSSのXMLをパースして指名馬に関係する記事を返す"""
    cutoff = datetime.now() - timedelta(days=days)
    results = []
    try:
        root = ET.fromstring(content)
    except Exception:
        return []

    for item in root.findall(".//item"):
        title_el   = item.find("title")
        link_el    = item.find("link")
        pubdate_el = item.find("pubDate")
        desc_el    = item.find("description")

        if title_el is None or link_el is None:
            continue

        title = title_el.text or ""
        link  = link_el.text or ""
        desc_raw = desc_el.text if desc_el is not None else ""
        desc = re.sub(r'<[^>]+>', '', desc_raw).strip() if desc_raw else ""
        full_text = title + " " + desc

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
        ts = pub_dt.strftime("%Y-%m-%d %H:%M") if pub_dt else "0000-00-00 00:00"

        # どの指名馬の記事か判定
        for horse_name in horse_names_set:
            if horse_name in full_text:
                if is_low_quality(title, desc, source_name, horse_name):
                    break
                results.append({
                    "horse":  horse_name,
                    "player": HORSE_PLAYER.get(horse_name, ""),
                    "title":  title,
                    "desc":   desc,
                    "source": source_name,
                    "date":   date_label,
                    "url":    link,
                    "_ts":    ts,
                })
                break  # 1記事で複数馬ヒットしても1件だけ登録

    return results


def fetch_site_batch(site_query, source_name, horse_names_set, days=30):
    """Google Newsでサイト指定一括取得 → 馬名でフィルター（デイリー馬三郎など）"""
    cutoff = datetime.now() - timedelta(days=days)
    results = []
    seen = set()
    encoded = urllib.parse.quote(site_query)
    url = f"https://news.google.com/rss/search?q={encoded}&hl=ja&gl=JP&ceid=JP:ja"
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15)
        resp.raise_for_status()
        root = ET.fromstring(resp.content)
    except Exception as e:
        print(f"  [{source_name}] NG: {e}", flush=True)
        return []

    for item in root.findall(".//item"):
        title_el   = item.find("title")
        link_el    = item.find("link")
        pubdate_el = item.find("pubDate")
        desc_el    = item.find("description")
        if title_el is None or link_el is None:
            continue
        title    = title_el.text or ""
        link     = link_el.text or ""
        desc_raw = desc_el.text if desc_el is not None else ""
        desc     = re.sub(r'<[^>]+>', '', desc_raw).strip() if desc_raw else ""
        full_text = title + " " + desc

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
        ts = pub_dt.strftime("%Y-%m-%d %H:%M") if pub_dt else "0000-00-00 00:00"

        for horse_name in horse_names_set:
            if horse_name in full_text and title not in seen:
                if is_low_quality(title, desc, source_name, horse_name):
                    break
                seen.add(title)
                results.append({
                    "horse":  horse_name,
                    "player": HORSE_PLAYER.get(horse_name, ""),
                    "title":  title,
                    "desc":   desc,
                    "source": source_name,
                    "date":   date_label,
                    "url":    link,
                    "_ts":    ts,
                })
                break
    if results:
        print(f"  [{source_name}] {len(results)}件", flush=True)
    return results


def fetch_media_rss(horse_names_set, days=90):
    """専門メディアRSSを直接購読して指名馬関連記事を返す"""
    all_items = []
    for feed in MEDIA_RSS_FEEDS:
        try:
            resp = requests.get(feed["url"], headers=HEADERS, timeout=15)
            resp.raise_for_status()
            items = parse_rss_items(resp.content, feed["source"], horse_names_set, days)
            if items:
                print(f"  [{feed['source']}] {len(items)}件", flush=True)
            all_items.extend(items)
            time.sleep(0.5)
        except Exception as e:
            print(f"  [{feed['source']}] NG: {e}", flush=True)
    return all_items


def fetch_news_for_horse(horse_name, days=30):
    """Google News RSSで馬名を検索してニュース一覧を返す"""
    cutoff = datetime.now() - timedelta(days=days)
    results = []

    # クエリ①: 通常検索
    # クエリ②: netkeiba絞り込み
    # クエリ③: デイリー馬三郎絞り込み
    # クエリ④: SPAIA絞り込み（2026-27馬のみ追加）
    queries = [
        f"{horse_name} 競馬",
        f"{horse_name} site:netkeiba.com",
        f"{horse_name} デイリー馬三郎",
    ]
    if horse_name in HORSES_2627:
        queries.append(f"{horse_name} site:spaia-keiba.com")

    seen_in_horse = set()
    for query in queries:
        encoded = urllib.parse.quote(query)
        url = f"https://news.google.com/rss/search?q={encoded}&hl=ja&gl=JP&ceid=JP:ja"
        try:
            resp = requests.get(url, headers=HEADERS, timeout=15)
            resp.raise_for_status()
            root = ET.fromstring(resp.content)
        except Exception as e:
            print(f"  NG {horse_name}: {e}", flush=True)
            continue

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
            if title in seen_in_horse:
                continue

            source = source_el.text if source_el is not None else ""
            desc_raw = desc_el.text if desc_el is not None else ""
            desc = re.sub(r'<[^>]+>', '', desc_raw).strip() if desc_raw else ""

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
            full_text = title + " " + desc
            if horse_name not in full_text:
                continue
            if is_low_quality(title, desc, source, horse_name):
                continue

            seen_in_horse.add(title)
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

        time.sleep(0.3)

    return results


def load_registered_horses():
    """pogstarionから取得した登録馬名（regist2627.json）を読み込み、
    HORSE_PLAYER と HORSES_2627 に新しい馬名を追加する。
    これにより、新しく馬名登録された馬のニュースも自動で拾えるようになる。
    形式: { "P03": { "母名": "馬名", ... }, ... }
    """
    path = os.path.join(os.path.dirname(__file__), "public", "data", "regist2627.json")
    if not os.path.exists(path):
        return
    try:
        with open(path, encoding="utf-8") as f:
            regist = json.load(f)
    except Exception as e:
        print(f"  登録馬名の読み込み失敗: {e}", flush=True)
        return
    added = 0
    for pid, mapping in regist.items():
        for dam, name in mapping.items():
            name = (name or "").strip()
            if name and name not in HORSE_PLAYER:
                HORSE_PLAYER[name] = pid
                HORSES_2627.add(name)
                added += 1
            elif name:
                # 既存でも2026-27馬として90日窓・SPAIA検索対象にする
                HORSES_2627.add(name)
    if added:
        print(f"  登録馬名を {added}件 追加", flush=True)


def main():
    print("=== POG砂遊び ニュース取得 ===", flush=True)
    print(f"実行日時: {datetime.now().strftime('%Y/%m/%d %H:%M')}\n", flush=True)

    # pogstarionの最新登録馬名を検索リストに反映
    load_registered_horses()

    all_news = []
    horse_names = list(HORSE_PLAYER.keys())

    # ① Google News RSS（馬名別）
    print("--- Google News RSS ---", flush=True)
    for name in horse_names:
        days = 90 if name in HORSES_2627 else 30
        items = fetch_news_for_horse(name, days=days)
        if items:
            print(f"  {name}: {len(items)}件", flush=True)
            all_news.extend(items)

    # ② デイリー馬三郎・サンスポ競馬 一括取得
    print("\n--- デイリー馬三郎・サンスポ競馬 ---", flush=True)
    all_news.extend(fetch_site_batch("競馬 site:daily.co.jp/horse", "デイリー馬三郎", set(horse_names), days=30))
    time.sleep(0.5)
    all_news.extend(fetch_site_batch("競馬 site:sanspo.com", "サンスポ競馬", set(horse_names), days=30))
    time.sleep(0.5)

    # ③ 専門メディアRSS直接購読
    print("\n--- 専門メディアRSS ---", flush=True)
    media_items = fetch_media_rss(set(horse_names), days=90)
    all_news.extend(media_items)

    def normalize_title(title):
        """タイトル末尾のサイト名・セクション名を除去して正規化（重複チェック用）"""
        # Step1: 末尾の「| ～」を除去（例: "| 競馬写真ニュース"）
        t = re.sub(r'\s*\|.*$', '', title)
        # Step2: 末尾の「- サイト名/セクション名」を除去
        t = re.sub(r'\s*[-–—]\s*(netkeiba|SPAIA|サンスポ|デイリー|日刊スポーツ|競馬ニュース|競馬|うまふる|２歳馬特集|競馬写真|スポーツ報知|馬三郎)[^\s／]*.*$', '', t, flags=re.IGNORECASE)
        return t.strip()

    # 日付降順ソート・重複除去（正規化タイトルで比較）
    seen_titles = set()
    unique_news = []
    for n in sorted(all_news, key=lambda x: x["_ts"], reverse=True):
        key = normalize_title(n["title"])
        if key not in seen_titles:
            seen_titles.add(key)
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
