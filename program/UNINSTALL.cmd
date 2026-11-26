@echo off
rem DREAM GUILD 지우기 — 프로그램 폴더와 아이콘(바탕화면·시작 메뉴·자동 실행)을 지워요
chcp 65001 >nul
setlocal
title DREAM GUILD 지우기
set "DST=%LOCALAPPDATA%\Programs\DreamGuild"
echo.
choice /C YN /M "  DREAM GUILD 를 이 PC에서 지울까요"
if errorlevel 2 exit /b 0
taskkill /IM DreamGuild.exe >nul 2>&1
powershell -NoProfile -Command "foreach($d in [Environment]::GetFolderPath('Desktop'),[Environment]::GetFolderPath('Programs'),[Environment]::GetFolderPath('Startup')){ Remove-Item -LiteralPath (Join-Path $d 'DREAM GUILD.lnk') -ErrorAction SilentlyContinue }"
echo   아이콘을 지웠어요. 프로그램 폴더도 곧 지워져요.
cd /d "%TEMP%"
start "" /min cmd /c "timeout /t 3 >nul & rmdir /s /q "%DST%""
timeout /t 2 >nul
