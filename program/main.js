// DREAM GUILD 프로그램 (윈도우용 창 버전)
// 껍데기(투명한 창, 제목 줄, 크기 조절)만 이 프로그램이 맡고, 안의 마을은 배포된 웹 페이지를 불러와요.
// 그래서 웹을 고치면 프로그램은 다시 켜기만 하면 최신이 돼요.
const { app, BrowserWindow, ipcMain, shell, screen, nativeImage } = require("electron");
const path = require("path");
const fs = require("fs");

const ORIGIN = "https://r2l5020-cmd.github.io";
const PAGE = ORIGIN + "/dreamguild/?app=program";
const ICON = path.join(__dirname, "icon.png");
const MIN_W = 900, MIN_H = 560;

let win = null, quitting = false, saved = null, maxed = false;
const stateFile = () => path.join(app.getPath("userData"), "window.json");
function loadState() { try { return JSON.parse(fs.readFileSync(stateFile(), "utf8")); } catch (e) { return null; } }
function saveState() { try { if (win && !maxed) fs.writeFileSync(stateFile(), JSON.stringify(win.getBounds())); } catch (e) {} }

if (!app.requestSingleInstanceLock()) app.quit();
app.on("second-instance", () => { if (win) { if (win.isMinimized()) win.restore(); win.show(); win.focus(); } });

function createWindow() {
  const wa = screen.getPrimaryDisplay().workArea, st = loadState();
  const w = Math.min(wa.width, 1440), h = Math.min(wa.height, 860);
  const b = st && st.width >= MIN_W && st.height >= MIN_H ? st : { width: w, height: h, x: Math.round(wa.x + (wa.width - w) / 2), y: Math.round(wa.y + (wa.height - h) / 2) };
  win = new BrowserWindow({
    ...b, show: false, transparent: true, frame: false, resizable: false, maximizable: false, fullscreenable: false,
    hasShadow: false, backgroundColor: "#00000000", title: "DREAM GUILD", icon: nativeImage.createFromPath(ICON),
    webPreferences: { preload: path.join(__dirname, "preload.js"), contextIsolation: true, nodeIntegration: false, sandbox: true, backgroundThrottling: false },
  });
  win.loadURL(PAGE);
  win.once("ready-to-show", () => win.show());
  win.on("moved", saveState);
  // 인터넷이 없을 때 안내 화면
  win.webContents.on("did-fail-load", (_e, code, _d, url, isMain) => { if (isMain && code !== -3) win.loadFile(path.join(__dirname, "offline.html")); });
  // 마을 밖 링크는 기본 브라우저로
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:/.test(url)) shell.openExternal(url); return { action: "deny" }; });
  win.webContents.on("will-navigate", (e, url) => { if (!url.startsWith(ORIGIN) && !url.startsWith("file:")) { e.preventDefault(); if (/^https?:/.test(url)) shell.openExternal(url); } });
  // 닫을 때: 마을에 "나갔어요"를 남길 시간을 잠깐 줘요
  win.on("close", (e) => {
    if (quitting) return;
    e.preventDefault(); saveState();
    win.webContents.send("before-close");
    setTimeout(() => { quitting = true; if (win) win.close(); }, 2000);
  });
}

/* 화면 쪽(preload)에서 오는 요청 — 우리 페이지에서 온 것만 받아요 */
const ok = (e) => { try { const u = e.senderFrame && e.senderFrame.url; return !u || u.startsWith(ORIGIN) || u.startsWith("file:"); } catch (x) { return false; } };
ipcMain.on("win-min", (e) => { if (ok(e) && win) win.minimize(); });
ipcMain.on("win-close", (e) => { if (ok(e) && win) win.close(); });
ipcMain.on("win-close-now", (e) => { if (ok(e) && win) { quitting = true; win.close(); } });
ipcMain.on("win-max", (e) => {
  if (!ok(e) || !win) return;
  if (maxed) { if (saved) win.setBounds(saved); maxed = false; }
  else { saved = win.getBounds(); win.setBounds(screen.getDisplayMatching(saved).workArea); maxed = true; }
  win.webContents.send("max-state", maxed);
});
ipcMain.on("win-resize", (e, wpx, hpx) => {
  if (!ok(e) || !win) return;
  const b = win.getBounds(), wa = screen.getDisplayMatching(b).workArea;
  const w = Math.max(MIN_W, Math.min(Math.round(wpx), wa.x + wa.width - b.x)), h = Math.max(MIN_H, Math.min(Math.round(hpx), wa.y + wa.height - b.y));
  win.setBounds({ x: b.x, y: b.y, width: w, height: h }); maxed = false;
});
ipcMain.on("win-resize-end", (e) => { if (ok(e)) saveState(); });
ipcMain.on("win-retry", (e) => { if (ok(e) && win) win.loadURL(PAGE); });

app.whenReady().then(createWindow);
app.on("window-all-closed", () => app.quit());
