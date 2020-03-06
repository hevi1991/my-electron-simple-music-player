const { $ } = require("./helper.js");
const { ipcRenderer } = require("electron");
const path = require("path");
let musicFilesPath = [];

// 添加音乐
$("select-music-button").addEventListener("click", event => {
  ipcRenderer.send("open-music-file");
});

const renderListHTML = paths => {
  let musicList = $("music-list");
  const musicItemsHTML = paths.reduce(
    (html, musicPath) =>
      (html += `<li class="list-group-item">${path.basename(musicPath)}</li>`),
    ""
  );
  musicList.innerHTML = `<ul class="list-group">${musicItemsHTML}</ul>`;
};
ipcRenderer.on("selected-file", (event, filePaths) => {
  if (Array.isArray(filePaths)) {
    renderListHTML(filePaths);
    musicFilesPath = filePaths;
  }
});

// 导入音乐
$("import-music-button").addEventListener("click", _ => {
  ipcRenderer.send("add-tracks", musicFilesPath);
});
