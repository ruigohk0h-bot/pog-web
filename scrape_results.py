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
    # 2025-26シーズン（2023年生まれ）のみ対象
    # ※過去シーズンはシーズン終了済み（毎年6/14まで）のためスクレイピング不要
    # ※過去馬データはApp.jsxのPAST_HORSESに記録済み

    # 2025-26シーズン（2023年生まれ）
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

    # 2026-27シーズン（2024年生まれ）登録済み馬のみ
    # P01 前田厩舎
    "スターフラッシュ":"P01","ラキアーヴェ":"P01","ミシェルバローズ":"P01",
    "レッジェランツァ":"P01","ヴェルバニア":"P01","エスクアドラ":"P01","コナバームス":"P01",
    # P02 川村厩舎
    "マイクストーリー":"P02","アトミックリーチ":"P02","ヤングリッチ":"P02",
    "ダノンチャンピオン":"P02","コーズダヴィンチ":"P02","セイルトゥグローリー":"P02","デミアン":"P02",
    # P03 長谷部厩舎
    "クロダテ":"P03","ツキノエ":"P03","マーゴットセレッツォ":"P03",
    "セドゥクトーラ":"P03","ゼットターム":"P03","エクレアカミング":"P03",
    "オールベット":"P03","ムーンベリル":"P03","ボードゥロレーヌ":"P03",
    # P04 ミリオン厩舎
    "ミクニプレイブ":"P04","トゥザファイナル":"P04","ソメデイストワール":"P04",
    # P05 田崎厩舎
    "ディーヴァレギオン":"P05","ヴィルダースヴィル":"P05","ディルイーヤ":"P05",
    "ブックオブケルズ":"P05","ケンシロウワールド":"P05","ハイウェイワン":"P05",
    "トルヴァスト":"P05","オメガマサヤ":"P05",
    # P06 涼子厩舎
    "ホウオウシュウ":"P06","オールシティキング":"P06","デュガビー":"P06",
    "ウラノグラフィア":"P06","ヴェトロテンペスタ":"P06","ホーフアイゼン":"P06",
    # P07 成田厩舎
    "ウィンタープリーズ":"P07","ソルテヴェローチェ":"P07","トリプルウィン":"P07",
    "タクティシアン":"P07","テンブレイクワン":"P07","アンドレバローズ":"P07","イレイザー":"P07",
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

def get_kettonum_browser(name):
    """Playwright でフォーム検索して kettonum を取得"""
    from playwright.sync_api import sync_playwright
    import time as _time
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("https://db.netkeiba.com/horse/search/", timeout=30000, wait_until="load")
        _time.sleep(2)
        page.fill("input[name=word]", name)
        page.click("input[name=submit]")
        _time.sleep(3)
        content = page.content()
        browser.close()
    soup = BeautifulSoup(content, "lxml")
    for a in soup.find_all("a", href=re.compile(r"/horse/202[0-3]\d+")):
        m = re.search(r"/horse/(202[0-3]\d+)", a["href"])
        if m and a.get_text(strip=True) == name:
            return m.group(1)
    # 完全一致がなければ先頭
    for a in soup.find_all("a", href=re.compile(r"/horse/202[0-3]\d+")):
        m = re.search(r"/horse/(202[0-3]\d+)", a["href"])
        if m:
            return m.group(1)
    return None

def get_kettonum(name, cache):
    """馬名からnetkeiba上のkettonumを取得"""
    if name in cache and cache[name] is not None:
        return cache[name]
    try:
        result = get_kettonum_browser(name)
        if result:
            cache[name] = result
            print(f"  OK{name}: {result}", flush=True)
            return result
    except Exception as e:
        print(f"  NG{name}: エラー {e}", flush=True)
    cache[name] = None
    print(f"  -- {name}: not found", flush=True)
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

def get_results_from_html(html, horse_name, days=60):
    """HTML文字列からレース結果を解析"""
    soup = BeautifulSoup(html, "lxml")
    today = datetime.today()
    cutoff = today - timedelta(days=days)
    results = []

    # 新テーブルクラス: db_h_race_results（旧: race_table_01）
    table = soup.find("table", class_="db_h_race_results") or soup.find("table", class_="race_table_01")
    if not table:
        return []

    for row in table.find_all("tr")[1:]:
        cells = [td.get_text(strip=True) for td in row.find_all("td")]
        if len(cells) < 15:
            continue

        # 日付（例: 2026/04/29）
        m = re.match(r'(\d{4})[./](\d{2})[./](\d{2})', cells[0])
        if not m:
            continue
        race_date = datetime(int(m.group(1)), int(m.group(2)), int(m.group(3)))
        if race_date < cutoff:
            continue

        date_label = f"{int(m.group(2)):02d}/{int(m.group(3)):02d}"

        venue_raw = cells[1]
        venue_name = re.sub(r'\d+回|\d+日目?', '', venue_raw).strip()
        r_num = cells[3]
        venue = f"{venue_name}{r_num}R" if r_num.isdigit() else venue_name

        race_name = cells[4]
        grade = parse_grade(race_name)

        course = cells[14] if len(cells) > 14 else ""
        surface = "dirt" if course.startswith("ダ") else "turf"
        dist_m = re.search(r'\d+', course)
        dist = int(dist_m.group()) if dist_m else 0

        order_str = re.sub(r'[^\d]', '', cells[11]) if len(cells) > 11 else ""
        order = int(order_str) if order_str else 0

        # 賞金列: 新テーブルは末尾（32列目）
        prize_idx = len(cells) - 1
        prize_str = re.sub(r'[^\d.]', '', cells[prize_idx]) if cells else "0"
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

    from playwright.sync_api import sync_playwright
    import time as _time

    all_results = []

    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
        )
        ctx = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            viewport={"width": 1280, "height": 800},
            locale="ja-JP",
        )
        page = ctx.new_page()

        # Step1: kettonum取得
        missing = [name for name in HORSE_PLAYER if name not in cache or cache.get(name) is None]
        if missing:
            print(f"【Step1】{len(missing)}頭のkettonum取得...", flush=True)
            for name in missing:
                try:
                    page.goto("https://db.netkeiba.com/horse/search/", timeout=30000, wait_until="load")
                    page.wait_for_selector("input[name=word]", timeout=20000)
                    page.fill("input[name=word]", name)
                    page.click("input[name=submit]")
                    _time.sleep(3)
                    content = page.content()
                    soup = BeautifulSoup(content, "lxml")
                    found = None
                    for a in soup.find_all("a", href=re.compile(r"/horse/202[0-3]\d+")):
                        if a.get_text(strip=True) == name:
                            found = re.search(r"/horse/(202[0-3]\d+)", a["href"]).group(1)
                            break
                    if not found:
                        a = soup.find("a", href=re.compile(r"/horse/202[0-3]\d+"))
                        if a:
                            found = re.search(r"/horse/(202[0-3]\d+)", a["href"]).group(1)
                    cache[name] = found
                    if found:
                        print(f"  OK{name}: {found}", flush=True)
                    else:
                        print(f"  -- {name}: not found", flush=True)
                except Exception as e:
                    print(f"  NG{name}: {e}", flush=True)
                    cache[name] = None
            save_cache(cache)
            print("キャッシュ保存完了\n", flush=True)
        else:
            print("【Step1】kettonum取得済み（スキップ）", flush=True)

        # Step2: 最新レース結果取得（Playwright）
        targets = [(name, cache[name]) for name in HORSE_PLAYER if cache.get(name)]
        print(f"【Step2】{len(targets)}頭のレース結果取得...", flush=True)
        for name, kettonum in targets:
            try:
                url = f"https://db.netkeiba.com/horse/{kettonum}/"
                page.goto(url, timeout=30000, wait_until="load")
                _time.sleep(2)
                html = page.content()
                res = get_results_from_html(html, name, days=60)
                all_results.extend(res)
                print(f"  {name}: {len(res)}件", flush=True)
            except Exception as e:
                print(f"  {name}: エラー {e}", flush=True)

        ctx.close()
        browser.close()

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
        json.dump(past, f, ensure_ascii=False, indent=2)

    with open(os.path.join(out_dir, "upcoming.json"), "w", encoding="utf-8") as f:
        json.dump(upcoming[:10], f, ensure_ascii=False, indent=2)

    # kettonums.json（馬名 → ID）を保存（フロントエンドのリンク用）
    kettonums_for_front = {k: v for k, v in cache.items() if v is not None}
    with open(os.path.join(out_dir, "kettonums.json"), "w", encoding="utf-8") as f:
        json.dump(kettonums_for_front, f, ensure_ascii=False, indent=2)

    print(f"\n完了！ 確定結果: {len(past)}件 / 出走予定: {len(upcoming)}件")
    print(f"  → public/data/results.json")
    print(f"  → public/data/upcoming.json")

def write_updated_json():
    """更新日時をpublic/data/updated.jsonに書き込む"""
    import json as _json
    from datetime import timezone, timedelta as _td
    jst = datetime.now(timezone(timedelta(hours=9)))
    ts = jst.strftime("%Y/%m/%d %H:%M")
    out = os.path.join(os.path.dirname(__file__), "public", "data", "updated.json")
    with open(out, "w", encoding="utf-8") as f:
        _json.dump({"updated": ts}, f, ensure_ascii=False)
    print(f"  → updated.json ({ts})", flush=True)

if __name__ == "__main__":
    main()
    # ニュース取得（Google News RSS）
    print("\n【Step3】指名馬ニュース取得...", flush=True)
    try:
        import scrape_news
        scrape_news.main()
    except Exception as e:
        print(f"  ニュース取得エラー: {e}", flush=True)
    # 更新日時記録
    write_updated_json()
