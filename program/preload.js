// 웹 페이지에 창 조작 버튼에 필요한 것만 살짝 열어 줘요
const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("deskShell", {
  min: () => ipcRenderer.send("win-min"),
  max: () => ipcRenderer.send("win-max"),
  close: () => ipcRenderer.send("win-close"),
  closeNow: () => ipcRenderer.send("win-close-now"),
  resize: (w, h) => ipcRenderer.send("win-resize", w, h),
  resizeEnd: () => ipcRenderer.send("win-resize-end"),
  retry: () => ipcRenderer.send("win-retry"),
  onBeforeClose: (fn) => ipcRenderer.on("before-close", () => fn()),
  onMaxState: (fn) => ipcRenderer.on("max-state", (_e, v) => fn(!!v)),
});
