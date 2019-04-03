var param = {
  style: 3,
  r: 0.5,
  color: "rgba(255,255,255,1)",
  offsetAngle: Math.PI / 2.05,
  waveArr: [],
  cX: 0.5,
  cY: 0.5,
  tX: 50,
  tY: 50,
  range: 1,
  len: 128,
  time: "",
  fps: 60,
  audioClock: 0
};

var w, h, minW;

var oClock = document.querySelector("#clock");
var tStyle = true;
var timeFormat = true;

function runClock() {
  param.audioClock = setInterval(animate, 1000 / param.fps);
  animate();
}
runClock();

function a(n) {
  return ("00" + n).slice(-2);
}

function formatAMPM(date = new Date()) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour "0" should be "12"
  minutes = minutes < 10 ? "0" + minutes : minutes;
  var strTime = hours + ":" + minutes + " " + ampm;
  return strTime;
}

function getTime(t, tt) {
  t = new Date();
  if (!timeFormat) tt = formatAMPM(t);
  if (timeFormat) tt = a(t.getHours()) + ":" + a(t.getMinutes());
  if (param.time !== tt) {
    oClock.innerHTML = tt;
    param.time = tt;
  }
}

var timeInterval;

function autoTime() {
  timeInterval = setInterval(getTime, 10);
  getTime();
}

var can = document.querySelector("#can");

function resize() {
  can.width = w = window.innerWidth;
  can.height = h = window.innerHeight;
  minW = Math.min(w, h);
  oClock.style.width = w + "px";
  oClock.style.height = oClock.style.lineHeight = h + "px";
}
resize();

oClock.style.fontSize = Math.floor(h / 300 * 20) + "px";
window.onresize = resize;
var buffer = [new Array(param.len)];
var ctx = can.getContext("2d");
ctx.strokeStyle = ctx.fillStyle = param.color;
ctx.lineWidth = 3;

param.waveArr = new Array(param.len + 1).join("0").split("");

function getCollor(v, a) {
  return "rgba(" + (v.split(" ").map(function (c) {
    return Math.round(c * 255);
  }).join(", ")) + "," + a + ")";
}

window.wallpaperPropertyListener = {
  applyUserProperties: function (properties) {

    if (properties.style) {
      param.style = properties.style.value;
    }
    if (properties.radius) {
      param.r = properties.radius.value / 100;
    }
    if (properties.range) {
      param.range = properties.range.value / 5;
    }
    if (properties.color) {
      oClock.style.color = ctx.strokeStyle = ctx.fillStyle = param.color = getCollor(properties.color.value, 1);
    }
    if (properties.timeFormat) {
      if (properties.timeFormat.value) {
        timeFormat = true;
      } else {
        timeFormat = false;
      }
    }
    if (properties.showTime) {
      oClock.style.display = properties.showTime.value ? "block" : "none";
      if (properties.showTime.value) {
        autoTime();
      } else {
        clearInterval(timeInterval);
      }
    }
    if (properties.tSize) {
      var s = properties.tSize.value;
      oClock.style.fontSize = Math.floor(h / 300 * s) + "px";
    }
    if (properties.tStyle) {
      tStyle = properties.tStyle.value;
      getTime();
    }
    if (properties.snow) {
      document.querySelector("#snow_container").style.display = properties.snow.value ? "block" : "none";
      snowStorm[properties.snow.value ? "resume" : "freeze"]();
    }
    if (properties.fps) {
      param.fps = properties.fps;
      clearInterval(param.audioClock);
      runClock();
    }
  }
};

snowStorm.start();

function createPointAdd(arr) {
  var a = [],
    i, deg, offset;

  arr = arr.concat(arr.splice(arr.length / 2, arr.length / 2).reverse()).reverse();

  for (var i = 0; i < param.len; i++) {
    param.waveArr[i] = Math.min(arr[i] * 0.8 + param.waveArr[i] * 0.3, 1.2);
  }
}

function createPointUse() {
  var a = [],
    i, deg, offset;

  for (var i = 0; i < param.len; i++) {
    deg = -Math.PI / 180 * (i) * (360 / param.len) + param.offsetAngle;
    offset = param.r * minW / 2 + param.waveArr[i] * param.range * 100 - 10;
    a.push({
      x: Math.cos(deg) * offset + param.cX * w,
      y: Math.sin(deg) * offset + param.cY * h
    });
  }

  buffer.splice(0, 0, a);
  if (buffer.length > 4) {
    buffer.splice(4, 1);
  }
}

function style1() {
  var collection = buffer[0];

  ctx.beginPath();
  ctx.moveTo(collection[0].x, collection[0].y);
  for (var i = 0; i < param.len; i++) {
    ctx.lineTo(collection[i].x, collection[i].y);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  for (var i = 0; i < param.len; i++) {
    ctx.moveTo(collection[i].x, collection[i].y);
    ctx.lineTo(param.cX * w, param.cY * h);
  }
  ctx.closePath();
  ctx.stroke();
}

function style2() {
  var collection = buffer[0];

  ctx.beginPath();
  for (var i = 0; i < param.len; i++) {
    ctx.moveTo(collection[i].x, collection[i].y);
    ctx.lineTo(param.cX * w, param.cY * h);
  }
  ctx.closePath();
  ctx.stroke();
}

function style3(isFill, bufferNum) {
  var arrT = buffer[bufferNum],
    len = arrT.length,
    prev = arrT[len - 1],
    now = arrT[0],
    next,
    centerNext;

  if (buffer.length < 1) {
    return;
  }

  centerNext = {
    x: (prev.x + now.x) / 2,
    y: (prev.y + now.y) / 2
  };

  ctx.beginPath();
  ctx.moveTo(centerNext.x, centerNext.y);


  for (var i = 0; i < len; i++) {
    now = arrT[i];
    next = arrT[(i === len - 1 ? -1 : i) + 1];

    centerNext = {
      x: (next.x + now.x) / 2,
      y: (next.y + now.y) / 2
    };

    ctx.quadraticCurveTo(now.x, now.y, centerNext.x, centerNext.y);
  }
  ctx.closePath();
  ctx.stroke();
  if (isFill) {
    ctx.fill();
  }
}
window.wallpaperRegisterAudioListener &&
  window.wallpaperRegisterAudioListener(createPointAdd);

function animate() {
  createPointUse();
  ctx.clearRect(0, 0, w, h);
  switch (param.style) {
    case 1:
      style1();
      break;
    case 2:
      style2();
      break;
    case 3:
      if (buffer.length > 1) {
        if (buffer.length > 2) {
          if (buffer.length > 3) {
            ctx.strokeStyle = ctx.fillStyle = "#40276f";
            style3(true, 3);
          }
          ctx.strokeStyle = ctx.fillStyle = "#6354be";
          style3(true, 2);
        }
        ctx.strokeStyle = ctx.fillStyle = "#ff4202";
        style3(true, 1);
        ctx.strokeStyle = ctx.fillStyle = param.color;
      }
      style3(true, 0);
      break;
    case 4:
      style3(false, 0);
      break;
  }
}