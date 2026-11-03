@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo 낚멍 로컬 서버 시작 (http://localhost:8787)
where python >nul 2>nul && (start "" http://localhost:8787/nakmeong.html & python -m http.server 8787 & goto :eof)
where py >nul 2>nul && (start "" http://localhost:8787/nakmeong.html & py -m http.server 8787 & goto :eof)
echo Python이 없어 파일로 직접 엽니다 (더블클릭 실행도 지원).
start "" "%~dp0nakmeong.html"
