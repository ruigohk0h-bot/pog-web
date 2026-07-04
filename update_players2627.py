"""
regist2627.json（POGスタリオンから取得済み）を読み込み、
src/App.jsx の PLAYERS_2627 にある name:null のエントリを
登録された馬名で自動更新する。
"""
import json
import re

REGIST_PATH = "public/data/regist2627.json"
APP_PATH    = "src/App.jsx"

with open(REGIST_PATH, encoding="utf-8") as f:
    regist = json.load(f)

with open(APP_PATH, encoding="utf-8") as f:
    content = f.read()

updated = 0

for pid, data in regist.items():
    for horse in data.get("horses", []):
        dam  = horse.get("dam")
        name = horse.get("name")
        sire = horse.get("sire", "")

        if not (dam and name):
            continue  # 未登録はスキップ

        # sire が "母XXX" 形式（パース失敗）の場合は除外
        if sire.startswith("母"):
            sire = ""

        dam_esc = re.escape(dam)

        # 対象パターン: name:null, ... dam:"DAM"
        pattern = rf'(name:null,\s+dam:"{dam_esc}")'

        if not re.search(pattern, content):
            continue  # すでに更新済み or 該当なし

        if sire:
            replacement = f'name:"{name}", sire:"{sire}", dam:"{dam}"'
        else:
            replacement = f'name:"{name}", dam:"{dam}"'

        content = re.sub(pattern, replacement, content)
        print(f"  [{pid}] {dam} → {name}" + (f"（父:{sire}）" if sire else ""))
        updated += 1

if updated > 0:
    with open(APP_PATH, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"\n✅ {updated}頭を更新しました → {APP_PATH}")
else:
    print("更新なし（新規登録馬なし）")
