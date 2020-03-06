const { ipcRenderer } = require("electron");
// 渲染进程
window.addEventListener("DOMContentLoaded", _ => {
  // 发送事件
  ipcRenderer.send("message", "Hello from renderer.");
  ipcRenderer.on("reply", (event, arg) => {
    document.getElementById("message").innerHTML = arg;
  });
});
