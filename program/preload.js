// 웹 페이지에 창 조작 버튼에 필요한 것만 살짝 열어 줘요
const { contextBridge, ipcRenderer, webFrame } = require("electron");
contextBridge.exposeInMainWorld("deskShell", {
  min: () => ipcRenderer.send("win-min"),
  max: () => ipcRenderer.send("win-max"),
  close: () => ipcRenderer.send("win-close"),
  closeNow: () => ipcRenderer.send("win-close-now"),
  resize: (w, h) => ipcRenderer.send("win-resize", w, h),
  resizeEnd: () => ipcRenderer.send("win-resize-end"),
  retry: () => ipcRenderer.send("win-retry"),
  setIgnore: (on) => ipcRenderer.send("win-ignore", !!on),
  // 브라우저 확대/축소처럼 전체 크기를 바꿔요 (50~150%)
  zoom: (f) => { const z = Number(f); if (isFinite(z)) webFrame.setZoomFactor(Math.max(0.5, Math.min(1.5, z))); },
  onBeforeClose: (fn) => ipcRenderer.on("before-close", () => fn()),
  onMaxState: (fn) => ipcRenderer.on("max-state", (_e, v) => fn(!!v)),
});
