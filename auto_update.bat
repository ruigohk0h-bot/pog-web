@echo off
chcp 65001 > nul
cd /d "C:\Users\ruigo\Documents\claude-work\pog-web"

echo [%date% %time%] POG自動更新 開始
"C:\Users\ruigo\scoop\apps\python\current\python.exe" scrape_results.py

echo [%date% %time%] Gitにpush中...
git add public/data/results.json public/data/upcoming.json public/data/kettonums.json public/data/news.json public/data/updated.json kettonum_cache.json
git diff --staged --quiet && (
    echo [%date% %time%] 変更なし。pushスキップ。
) || (
    git commit -m "自動更新: 最新レース結果"
    git pull --rebase origin main
    git push
    echo [%date% %time%] push完了
)

echo [%date% %time%] 完了
