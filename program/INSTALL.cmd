@echo off
rem DREAM GUILD 설치 — 더블클릭하면 내 계정에 설치하고 바탕화면·시작 메뉴 아이콘을 만들어요 (관리자 권한 필요 없음)
chcp 65001 >nul
setlocal
title DREAM GUILD 설치
set "SRC=%~dp0"
set "DST=%LOCALAPPDATA%\Programs\DreamGuild"
echo.
echo   DREAM GUILD - 홍보영상팀 마을 설치
echo   ---------------------------------
if not exist "%SRC%DreamGuild.exe" (
  echo.
  echo   [!] 압축을 먼저 풀어 주세요.
  echo       zip 파일을 오른쪽 클릭 - "압축 풀기" 를 한 뒤,
  echo       풀린 폴더 안의 INSTALL.cmd 를 다시 더블클릭해요.
  echo.
  pause
  exit /b 1
)
tasklist /FI "IMAGENAME eq DreamGuild.exe" 2>nul | find /I "DreamGuild.exe" >nul
if not errorlevel 1 (
  echo.
  echo   DREAM GUILD 가 켜져 있어요. 제목 줄의 X 로 닫은 뒤 아무 키나 눌러 주세요.
  pause >nul
)
echo.
echo   설치하는 중이에요... (%DST%)
robocopy "%SRC%." "%DST%" /E /NFL /NDL /NJH /NJS /NP /XF INSTALL.cmd >nul
if errorlevel 8 (
  echo   [!] 복사하지 못했어요. 프로그램이 완전히 닫혔는지 확인하고 다시 해 주세요.
  pause
  exit /b 1
)
powershell -NoProfile -Command "$e=Join-Path $env:LOCALAPPDATA 'Programs\DreamGuild\DreamGuild.exe'; $w=New-Object -ComObject WScript.Shell; foreach($d in [Environment]::GetFolderPath('Desktop'),[Environment]::GetFolderPath('Programs')){ $s=$w.CreateShortcut((Join-Path $d 'DREAM GUILD.lnk')); $s.TargetPath=$e; $s.WorkingDirectory=(Split-Path $e); $s.IconLocation=$e+',0'; $s.Save() }"
echo   바탕화면과 시작 메뉴에 「DREAM GUILD」 아이콘을 만들었어요.
echo.
choice /C YN /M "  윈도우를 켤 때 자동으로 실행할까요"
if errorlevel 2 goto run
powershell -NoProfile -Command "$e=Join-Path $env:LOCALAPPDATA 'Programs\DreamGuild\DreamGuild.exe'; $s=(New-Object -ComObject WScript.Shell).CreateShortcut((Join-Path ([Environment]::GetFolderPath('Startup')) 'DREAM GUILD.lnk')); $s.TargetPath=$e; $s.WorkingDirectory=(Split-Path $e); $s.IconLocation=$e+',0'; $s.Save()"
echo   다음부터 윈도우를 켜면 자동으로 실행돼요.
:run
echo.
echo   설치 끝! DREAM GUILD 를 켤게요. 이 창은 닫아도 돼요.
echo   (지울 때는 %DST% 안의 UNINSTALL.cmd 를 실행해요)
start "" "%DST%\DreamGuild.exe"
timeout /t 5 >nul
