// DREAM GUILD 데스크톱 친구들 — 메인 프로세스
// 보통 프로그램처럼 동작해요: 작업표시줄(Dock)에 보이고, 다른 창에 가려지고, 누르면 앞으로 나와요.
const { app, BrowserWindow, screen, Tray, Menu, ipcMain, globalShortcut, nativeImage } = require("electron");
const path = require("path");

let STRIP_H = 760; // 캐릭터 + 말풍선 + 카드가 들어갈 높이 (빈 곳은 투명하고 클릭이 통과돼요)
let win = null, tray = null;
const ICON = path.join(__dirname, "assets", "appicon.png");

if (!app.requestSingleInstanceLock()) { app.quit(); }
app.on("second-instance", () => bringFront());

function placeWindow() {
  if (!win) return;
  const wa = screen.getPrimaryDisplay().workArea; // 작업표시줄·Dock을 뺀 영역
  STRIP_H = Math.min(760, wa.height);
  win.setBounds({ x: wa.x, y: wa.y + wa.height - STRIP_H, width: wa.width, height: STRIP_H });
}

function createWindow() {
  win = new BrowserWindow({
    width: 800, height: STRIP_H, show: false,
    transparent: true, frame: false, resizable: false, movable: false, maximizable: false, minimizable: true,
    hasShadow: false, skipTaskbar: false, alwaysOnTop: false, fullscreenable: false,
    backgroundColor: "#00000000", title: "DREAM GUILD", icon: ICON,
    webPreferences: { preload: path.join(__dirname, "preload.js"), contextIsolation: true, nodeIntegration: false, backgroundThrottling: false }
  });
  win.setIgnoreMouseEvents(true, { forward: true });
  placeWindow();
  win.loadFile(path.join(__dirname, "index.html"));
  win.once("ready-to-show", () => win.show());
  win.on("show", refreshMenu); win.on("hide", refreshMenu); win.on("minimize", refreshMenu); win.on("restore", refreshMenu);
}

function bringFront() {
  if (!win) return;
  if (win.isMinimized()) win.restore();
  win.show(); win.focus();
}
function trayImage() {
  const img = nativeImage.createFromPath(path.join(__dirname, "assets", "tray.png"));
  img.addRepresentation({ scaleFactor: 2, buffer: nativeImage.createFromPath(path.join(__dirname, "assets", "tray@2x.png")).toPNG() });
  return img;
}
function buildMenu() {
  const auto = app.getLoginItemSettings().openAtLogin;
  return Menu.buildFromTemplate([
    { label: "DREAM GUILD", enabled: false },
    { type: "separator" },
    { label: "앞으로 꺼내기", click: bringFront },
    { label: "최소화", click: () => win && win.minimize() },
    { label: "걷기 모드 (← → 로 걷기)", click: () => send("open-walk") },
    { label: "내 자리로 돌아가기", click: () => send("go-home") },
    { label: "채팅하기  (Ctrl/⌘ + Shift + Space)", click: openChat },
    { label: "채팅 기록 보기", click: () => send("open-log") },
    { label: "내 방 · 할 일 보기", click: () => send("open-mine") },
    { label: "사람 바꾸기", click: () => send("open-who") },
    { label: "팀 연결 설정 (Supabase)", click: () => send("open-settings") },
    { type: "separator" },
    { label: "컴퓨터 켤 때 자동 실행", type: "checkbox", checked: auto, click: (i) => app.setLoginItemSettings({ openAtLogin: i.checked }) },
    { label: "종료", click: () => app.quit() }
  ]);
}
function refreshMenu() { if (tray) tray.setContextMenu(buildMenu()); }
function send(ch) { if (!win) return; bringFront(); win.webContents.send(ch); }
function openChat() { send("open-chat"); }

app.whenReady().then(() => {
  if (process.platform === "darwin" && app.dock) { try { app.dock.setIcon(nativeImage.createFromPath(ICON)); } catch (e) {} }
  createWindow();
  tray = new Tray(trayImage());
  tray.setToolTip("DREAM GUILD");
  refreshMenu();
  tray.on("click", () => { if (process.platform === "win32") bringFront(); });
  globalShortcut.register("CommandOrControl+Shift+Space", openChat);
  screen.on("display-metrics-changed", placeWindow);
  screen.on("display-added", placeWindow);
  screen.on("display-removed", placeWindow);
});
app.on("activate", bringFront); // Mac: Dock 아이콘을 누르면 앞으로

// 마우스가 캐릭터·카드 위에 있을 때만 클릭을 받아요
ipcMain.on("set-clickable", (_e, on) => {
  if (!win) return;
  if (on) win.setIgnoreMouseEvents(false);
  else win.setIgnoreMouseEvents(true, { forward: true });
});
// 입력칸을 쓸 때 창이 키보드를 받아요
ipcMain.on("want-focus", (_e, on) => { if (!win) return; if (on) win.focus(); });
ipcMain.on("minimize", () => { if (win) win.minimize(); });
ipcMain.on("quit-app", () => app.quit());

app.on("will-quit", () => globalShortcut.unregisterAll());
app.on("window-all-closed", () => app.quit());
