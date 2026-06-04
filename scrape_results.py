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
    "レッジェランツァ":"P01","ヴェルバーニア":"P01","エスクアドラ":"P01","コナパームス":"P01",
    # P02 川村厩舎
    "マイクストーリー":"P02","アトミックリーチ":"P02","ヤングリッチ":"P02",
    "ダノンチャンピオン":"P02","コーズダヴィンチ":"P02","セイルトゥグローリ":"P02","デミアン":"P02",
    # P03 長谷部厩舎
    "クロダテ":"P03","ツキノエ":"P03","マーゴットセレッソ":"P03",
    "セドゥクトーラ":"P03","ゼットターム":"P03","エクレアカミング":"P03",
    "オールベット":"P03","ムーンベリル":"P03","ボードゥロレーヌ":"P03",
    # P04 ミリオン厩舎
    "ミクニブレイブ":"P04","トゥザファイナル":"P04","ソメデイストワール":"P04",
    # P05 田崎厩舎
    "ディーヴァレギオン":"P05","ヴィルダースヴィル":"P05","ディルイーヤ":"P05",
    "ブックオブケルズ":"P05","ケンシロウワールド":"P05","ハイウェイワン":"P05",
    "トルヴァスト":"P05","オメガマサヤ":"P05",
    # P06 涼子厩舎
    "ホウオウシュウ":"P06","オールシティキング":"P06","デュガピー":"P06",
    "ウラノグラフィア":"P06","ヴェトロテンペスタ":"P06","ホーフアイゼン":"P06",
    # P07 成田厩舎
    "ウィンターブリーズ":"P07","ソルテヴェローチェ":"P07","トリプルウィン":"P07",
    "タクティシアン":"P07","テンブレイクワン":"P07","アンドレバローズ":"P07","イレイザー":"P07",
}

# 地方競馬場リスト
LOCAL_VENUES = {"大井","船橋","川崎","浦和","門別","盛岡","水沢","金沢","笠松","名古屋","園田","姫路","高知","佐賀","荒尾","福山","帯広"}

# 主要場（東京・阪神・中山・京都）以外は賞金が約80%
MAJOR_VENUES = {"東京","阪神","中山","京都"}

# JRA標準本賞金テーブル（万円・1着〜5着、主要場基準）
PRIZE_TABLE = {
    "新馬":   [270,  89,  57,  35,  23],
    "未勝利": [270,  89,  57,  35,  23],
    "1勝":    [530, 210, 133,  80,  53],
    "2勝":    [880, 353, 224, 134,  89],
    "3勝":   [1400, 567, 360, 216, 144],
    "OP":    [2000, 800, 510, 306, 204],
    "L":     [3500,1400, 890, 534, 356],
    "GⅢ":   [5000,2000,1270, 762, 508],
    "GⅡ":   [9000,3600,2290,1370, 914],
    "GⅠ":  [20000,8000,5080,3050,2030],
    "JpnI":  [8000,3200,2030,1220, 810],
    "JpnII": [4000,1600,1020, 610, 406],
    "JpnIII":[2000, 800, 510, 305, 203],
}

def calc_rawpt(race_name, grade, venue, surface, order):
    """ダートレースの本賞金（万円）を概算。芝・5着外は0"""
    if surface != "dirt" or order < 1 or order > 5:
        return 0
    idx = order - 1
    if grade in PRIZE_TABLE:
        prize = PRIZE_TABLE[grade][idx]
    elif "新馬" in race_name:
        prize = PRIZE_TABLE["新馬"][idx]
    elif "未勝利" in race_name:
        prize = PRIZE_TABLE["未勝利"][idx]
    elif "1勝" in race_name:
        prize = PRIZE_TABLE["1勝"][idx]
    elif "2勝" in race_name:
        prize = PRIZE_TABLE["2勝"][idx]
    elif "3勝" in race_name:
        prize = PRIZE_TABLE["3勝"][idx]
    else:
        prize = PRIZE_TABLE["OP"][idx]
    # 小会場（函館・福島・小倉・新潟・中京等）は80%
    if venue not in MAJOR_VENUES and venue not in LOCAL_VENUES:
        prize = int(prize * 0.8)
    return prize

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

def get_kettonum_by_url(name):
    """requests でURL直打ち検索して kettonum を取得（Playwright不要）"""
    encoded = urllib.parse.quote(name)
    url = f"https://db.netkeiba.com/horse/search/?word={encoded}&pid=horse_list"
    try:
        resp = requests.get(url, headers=HEADERS, timeout=20)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.content, "lxml")
        # 完全一致を優先
        for a in soup.find_all("a", href=re.compile(r"/horse/202[0-4]\d+")):
            m = re.search(r"/horse/(202[0-4]\d+)", a["href"])
            if m and a.get_text(strip=True) == name:
                return m.group(1)
        # 完全一致がなければ先頭ヒット
        for a in soup.find_all("a", href=re.compile(r"/horse/202[0-4]\d+")):
            m = re.search(r"/horse/(202[0-4]\d+)", a["href"])
            if m:
                return m.group(1)
    except Exception as e:
        raise e
    return None

def get_kettonum(name, cache):
    """馬名からnetkeiba上のkettonumを取得"""
    if name in cache and cache[name] is not None:
        return cache[name]
    try:
        result = get_kettonum_by_url(name)
        if result:
            cache[name] = result
            print(f"  OK {name}: {result}", flush=True)
            return result
    except Exception as e:
        print(f"  NG {name}: エラー {e}", flush=True)
    cache[name] = None
    print(f"  -- {name}: not found", flush=True)
    return None

def parse_grade(race_name):
    """レース名からグレードを判定（半角・全角両対応）"""
    if re.search(r'[GＧ][Ⅰ１1]|ジャパンカップ|有馬記念|天皇賞|宝塚記念|菊花賞|桜花賞|オークス|皐月賞|ダービー|東京優駿|ホープフルS|阪神ジュベナイル|朝日杯FS', race_name):
        return "GⅠ"
    if re.search(r'[GＧ][Ⅱ２2]', race_name): return "GⅡ"
    if re.search(r'[GＧ][Ⅲ３3]', race_name): return "GⅢ"
    if re.search(r'JpnI|Jpn1|Jpn１', race_name): return "JpnI"
    if re.search(r'JpnII|Jpn2|Jpn２', race_name): return "JpnII"
    if re.search(r'JpnIII|Jpn3|Jpn３', race_name): return "JpnIII"
    return ""

def fetch_race_prizes(race_path):
    """keibalab レースページから本賞金リスト（万円, 1〜5着）を取得"""
    url = f"https://www.keibalab.jp{race_path}"
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15)
        resp.raise_for_status()
        text = resp.text
        m = re.search(r'本賞金[\s　]+(\d[\d,万\s　]+)', text)
        if m:
            prizes = re.findall(r'(\d[\d,]+)万', m.group(0))
            return [int(p.replace(',','')) for p in prizes[:5]]
    except Exception:
        pass
    return []

def get_results_from_html(html, horse_name, days=60):
    """keibalab HTMLからレース結果を解析
    列: 年月日/場/コース/天気/馬場/レース/人気/着/騎手/斤量/頭数/枠番/馬番/タイム/着差/...
    """
    soup = BeautifulSoup(html, "lxml")
    today = datetime.today()
    cutoff = today - timedelta(days=days)
    results = []

    # keibalab: 3番目のテーブルがレース結果
    tables = soup.find_all("table")
    if len(tables) < 3:
        return []
    table = tables[2]

    for row in table.find_all("tr")[1:]:  # ヘッダー行をスキップ
        cells = [td.get_text(strip=True) for td in row.find_all(["th", "td"])]
        if len(cells) < 8:
            continue

        # 日付パターンで始まる行のみ処理（サブ行をスキップ）
        m = re.match(r'(\d{4})[./](\d{2})[./](\d{2})', cells[0])
        if not m:
            continue

        race_date = datetime(int(m.group(1)), int(m.group(2)), int(m.group(3)))
        if race_date < cutoff:
            continue

        date_label = f"{int(m.group(2)):02d}/{int(m.group(3)):02d}"

        # 場（例: "2回東京12" → "東京"）
        venue_raw = cells[1] if len(cells) > 1 else ""
        venue_name = re.sub(r'\d+回|\d+$', '', venue_raw).strip()

        # コース（例: "芝2400"）
        course = cells[2] if len(cells) > 2 else ""
        surface = "dirt" if course.startswith("ダ") else "turf"
        dist_m = re.search(r'\d+', course)
        dist = int(dist_m.group()) if dist_m else 0

        race_name = cells[5] if len(cells) > 5 else ""
        grade = parse_grade(race_name)

        # 着順（数字でない場合はスキップ：中止・除外など）
        order_str = cells[7] if len(cells) > 7 else ""
        if not re.match(r'^\d+$', order_str):
            continue
        order = int(order_str)

        # レースページURLを取得（ダート5着以内のみ後で賞金取得）
        race_link = ""
        first_a = row.find("a", href=re.compile(r'/db/race/\d+/'))
        if first_a:
            race_link = first_a["href"]

        local = venue_name in LOCAL_VENUES
        player = HORSE_PLAYER.get(horse_name, "")

        results.append({
            "date": date_label,
            "venue": venue_name,
            "grade": grade,
            "local": local,
            "race": race_name,
            "surface": surface,
            "dist": dist,
            "horse": horse_name,
            "order": order,
            "rawPt": 0,   # ダート5着以内: 後でレースページから更新
            "turfPt": 0,  # 芝5着以内: 参考表示用
            "player": player,
            "_ts": race_date.strftime("%Y-%m-%d"),
            "_race_link": race_link,  # 賞金取得用（保存時に削除）
        })

    return results

def main():
    print("=== POG砂遊び 最新結果スクレイパー ===")
    print(f"実行日時: {datetime.now().strftime('%Y/%m/%d %H:%M')}\n")

    cache = load_cache()

    all_results = []

    # Step1: kettonum取得（未キャッシュ分のみ）
    missing = [name for name in HORSE_PLAYER if name not in cache or cache.get(name) is None]
    if missing:
        print(f"【Step1】{len(missing)}頭のkettonum取得...", flush=True)
        for name in missing:
            get_kettonum(name, cache)
            time.sleep(0.5)
        save_cache(cache)
        print("キャッシュ保存完了\n", flush=True)
    else:
        print("【Step1】kettonum取得済み（スキップ）", flush=True)

    # Step2: 最新レース結果取得（requests）
    targets = [(name, cache[name]) for name in HORSE_PLAYER if cache.get(name)]
    print(f"【Step2】{len(targets)}頭のレース結果取得...", flush=True)
    for name, kettonum in targets:
        try:
            url = f"https://www.keibalab.jp/db/horse/{kettonum}/"
            resp = requests.get(url, headers=HEADERS, timeout=20)
            resp.raise_for_status()
            res = get_results_from_html(resp.content, name, days=60)
            all_results.extend(res)
            if res:
                print(f"  {name}: {len(res)}件", flush=True)
            time.sleep(0.5)
        except Exception as e:
            print(f"  {name}: エラー {e}", flush=True)

    # Step2.5: 5着以内（ダート・芝とも）の賞金をレースページから取得
    # ダート→rawPt（得点計算に使用）、芝→turfPt（参考表示用）
    race_prize_cache = {}  # race_link → [1着賞金, 2着, 3着, 4着, 5着]
    prize_targets = [r for r in all_results if 1 <= r["order"] <= 5 and r["_race_link"]]
    if prize_targets:
        print(f"\n【Step2.5】{len(prize_targets)}件の入着賞金取得（ダート+芝）...", flush=True)
        for r in prize_targets:
            link = r["_race_link"]
            if link not in race_prize_cache:
                prizes = fetch_race_prizes(link)
                race_prize_cache[link] = prizes
                time.sleep(0.4)
            prizes = race_prize_cache.get(link, [])
            if prizes and r["order"] <= len(prizes):
                prize = prizes[r["order"] - 1]
                if r["surface"] == "dirt":
                    r["rawPt"] = prize
                    print(f"  [ダ] {r['horse']} {r['order']}着 {r['race']}: {prize}万pt", flush=True)
                else:
                    r["turfPt"] = prize
                    print(f"  [芝] {r['horse']} {r['order']}着 {r['race']}: {prize}万 (参考)", flush=True)

    # 日付降順ソート
    all_results.sort(key=lambda x: x["_ts"], reverse=True)
    today_str = datetime.today().strftime("%Y-%m-%d")

    past     = [r for r in all_results if r["_ts"] <= today_str]
    upcoming = [r for r in all_results if r["_ts"] >  today_str]

    for r in past + upcoming:
        del r["_ts"]
        r.pop("_race_link", None)  # 内部フィールドを削除

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
