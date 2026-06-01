@echo off
chcp 65001 > nul
cd /d "C:\Users\ruigo\Documents\claude-work\pog-web"

echo [%date% %time%] ニュース更新 開始
"C:\Users\ruigo\scoop\apps\python\current\python.exe" scrape_news.py

echo [%date% %time%] Gitにpush中...
git add public/data/news.json public/data/updated.json
git diff --staged --quiet && (
    echo [%date% %time%] 変更なし。pushスキップ。
) || (
    git commit -m "自動更新: 指名馬ニュース"
    git pull --rebase origin main
    git push
    echo [%date% %time%] push完了
)

echo [%date% %time%] 完了
