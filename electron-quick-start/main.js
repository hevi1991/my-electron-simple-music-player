// Electron 事件驱动
// 主进程
const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const DataStore = require("./renderer/MusicDataStore.js");
const myStore = new DataStore({ name: "Music Data" });

app.allowRendererProcessReuse = false;

class AppWindow extends BrowserWindow {
  constructor(fileLocation, config = {}) {
    const basicConfig = {
      width: 800,
      height: 600,
      show: false,
      webPreferences: {
        nodeIntegration: true
      }
    };
    const finalConfig = { ...basicConfig, ...config };
    super(finalConfig);
    this.loadFile(fileLocation);
    this.once("ready-to-show", _ => {
      this.show();
    });
  }
}

app.on("ready", () => {
  const mainWindow = new AppWindow("./renderer/index.html");
  // 当主页面渲染完成后，发送【取得歌单】渲染事件
  mainWindow.webContents.on("did-finish-load", _ => {
    mainWindow.send("get-tracks", myStore.getTracks());
  });
  // ipcMain 接收 ipcRenderer 的事件传递
  ipcMain.on("add-music-window", (event, arg) => {
    const addWindow = new AppWindow("./renderer/add.html", {
      width: 500,
      height: 500,
      parent: mainWindow
    });
  });
  ipcMain.on("open-music-file", event => {
    dialog
      .showOpenDialog({
        properties: ["openFile", "multiSelections"],
        filters: [{ name: "Music", extensions: ["mp3"] }]
      })
      .then(({ canceled, filePaths, bookmarks }) => {
        if (!canceled) {
          event.sender.send("selected-file", filePaths);
        }
      })
      .catch(err => {
        console.error(err);
      });
  });
  ipcMain.on("add-tracks", (event, filePaths) => {
    const updatedTracks = myStore.addTracks(filePaths).getTracks();
    // 发送【取得歌单】事件
    mainWindow.send("get-tracks", updatedTracks);
  });
  ipcMain.on("delete-track", (event, id) => {
    const updatedTracks = myStore.deleteTrack(id).getTracks();
    mainWindow.send("get-tracks", updatedTracks);
  });
});
