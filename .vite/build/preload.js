"use strict";
const electron = require("electron");
var FileIPC = /* @__PURE__ */ ((FileIPC2) => {
  FileIPC2["READ"] = "file:read";
  FileIPC2["WRITE"] = "file:write";
  FileIPC2["EXISTS"] = "file:exists";
  FileIPC2["SELECT_DIRECTORY"] = "file:select-directory";
  FileIPC2["VALIDATE_IMAGE_DIRECTORY"] = "file:validate-image-directory";
  return FileIPC2;
})(FileIPC || {});
var MetadataIPC = /* @__PURE__ */ ((MetadataIPC2) => {
  MetadataIPC2["METADATA_READ"] = "metadata:read";
  MetadataIPC2["METADATA_WRITE"] = "metadata:write";
  return MetadataIPC2;
})(MetadataIPC || {});
const IPC = {
  ...FileIPC,
  ...MetadataIPC
};
const createAPIProxy = (channels) => {
  return channels.reduce((api2, channel) => {
    api2[channel] = (...args) => electron.ipcRenderer.invoke(channel, ...args);
    return api2;
  }, {});
};
const API_CHANNELS = Object.values(IPC);
const api = createAPIProxy(API_CHANNELS);
electron.contextBridge.exposeInMainWorld("electronAPI", {
  ...api,
  // 添加系統信息 API
  getSystemInfo: () => electron.ipcRenderer.invoke("get-system-info"),
  getSystemInfoSync: () => electron.ipcRenderer.sendSync("get-system-info")
});
electron.ipcMain.handle("send-message", async (event, message) => {
  console.log("Received message from renderer:", message);
  return `Server received: ${message}`;
});
