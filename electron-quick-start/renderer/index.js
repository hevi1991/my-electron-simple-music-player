const { ipcRenderer } = require("electron");
const { $, convertDuration } = require("./helper.js");

$("add-music-button").addEventListener("click", () => {
  ipcRenderer.send("add-music-window");
});

// HTMLAudioELement 控制播放
let musicAudio = new Audio();
// 播放列表
let allTracks;
// 当前播放的歌
let currentTrack;

/**渲染播放列表 */
const renderList = tracks => {
  const tracksList = $("tracks-list");
  if (tracks) {
    const tracksListHTML = tracks.reduce((html, track) => {
      html += `<li class="row music-track list-group-item d-flex justify-content-between align-items-center">
      <div class="col-10">
        <i class="fas fa-music mr-2 text-secondary"></i>
        <b>${track.fileName}</b>
      </div>
      <div class="col-2">
        <i class="fas fa-play mr-3" data-id="${track.id}"></i>
        <i class="fas fa-trash-alt" data-id="${track.id}"></i>
      </div>
    </li>`;
      return html;
    }, "");
    tracksList.innerHTML = `<ul class="list-group">${tracksListHTML}</ul>`;
  } else {
    const emptyTrackHTML = `<div class='alert alert-primary'>还没有添加任何音乐</div>`;
    tracksList.innerHTML = emptyTrackHTML;
  }
};

ipcRenderer.on("get-tracks", (event, tracks) => {
  allTracks = tracks;
  renderList(tracks);
});

/*
1. Audio对象处理播放
2. DOM dataset 和 data-* 属性获取
3. 事件冒泡和代理处理事件
*/
$("tracks-list").addEventListener("click", event => {
  event.preventDefault();
  const { dataset, classList } = event.target;
  const id = dataset && dataset.id;
  if (id) {
    if (classList.contains("fa-play")) {
      // 这里播放音乐
      if (currentTrack && currentTrack.id === id) {
        // 继续播放音乐
        musicAudio.play();
        classList.replace("fa-play", "fa-pause");
      } else {
        // 播放新的音乐
        currentTrack = allTracks.find(track => track.id === id);
        musicAudio.src = currentTrack.path;
        musicAudio.play();
        // 还原上一首的图标
        let resetIconEle = document.querySelector(".fa-pause");
        if (resetIconEle) {
          resetIconEle.classList.replace("fa-pause", "fa-play");
        }
        // 更改播放图标
        classList.replace("fa-play", "fa-pause");
      }
    } else if (classList.contains("fa-pause")) {
      // 暂停
      musicAudio.pause();
      classList.replace("fa-pause", "fa-play");
    } else if (classList.contains("fa-trash-alt")) {
      // 删除音乐，发送事件
      ipcRenderer.send("delete-track", id);
    }
  }
});

// 控制显示播放进度和控制
musicAudio.addEventListener("loadedmetadata", event => {
  // 媒体的元数据已经加载完毕，现在所有的属性包含了它们应有的有效信息。
  // 渲染播放状态
  renderPlayerHTML(currentTrack.fileName, musicAudio.duration);
});

musicAudio.addEventListener("timeupdate", event => {
  // 播放时间发生变化
  updateProgressHTML(musicAudio.currentTime, musicAudio.duration);
});

// 渲染播放状态
const renderPlayerHTML = (name, duration) => {
  const player = $("player-status");
  const html = `
  <div class="col font-weight-bold">正在播放：${name}</div>
  <div class="col"><span id="current-seeker">00:00</span> / ${convertDuration(
    duration
  )}</div>
  `;
  player.innerHTML = html;
};

const updateProgressHTML = (currentTime, duration) => {
  // 时分秒展示
  const seeker = $("current-seeker");
  seeker.innerHTML = convertDuration(currentTime);
  // 计算progress展示
  const progress = ~~((currentTime / duration) * 100);
  const bar = $("player-progress");
  bar.innerHTML = progress + "%";
  bar.style.width = progress + "%";
};
