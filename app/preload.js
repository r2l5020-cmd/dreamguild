const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("desk", {
  setClickable: (on) => ipcRenderer.send("set-clickable", !!on),
  wantFocus: (on) => ipcRenderer.send("want-focus", !!on),
  on: (channel, fn) => {
    if (["open-chat", "open-mine", "open-who", "open-settings", "open-walk", "go-home", "open-log"].includes(channel)) ipcRenderer.on(channel, () => fn());
  },
  quit: () => ipcRenderer.send("quit-app"),
  minimize: () => ipcRenderer.send("minimize"),
  platform: process.platform
});
