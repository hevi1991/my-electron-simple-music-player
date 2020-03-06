exports.$ = id => {
  return document.getElementById(id);
};

exports.convertDuration = time => {
  // 计算分钟
  let minutes = ~~(time / 60);
  minutes = minutes < 10 ? `0${minutes}` : minutes;
  // 计算秒
  let seconds = ~~(time % 60);
  seconds = seconds < 10 ? `0${seconds}` : seconds;
  return `${minutes}:${seconds}`;
};
