import "./styles.css";
import SVG from "svg.js";

const draw = new SVG("app");

var shapesMirrored = [];
let viewPortWidth = document.documentElement.clientWidth - 13;
let viewPortHeight = document.documentElement.clientHeight - 13;

let index = 0;

const getRandomColor = () => {
  let c = Math.floor(Math.random() * 16777215).toString(16);
  while (c.length < 6) c = "0" + c;
  return "#" + c;
};

let col = getRandomColor();

const getDrawObject = () => {
  const option = {
    stroke: col,
    "stroke-width": 2,
    "fill-opacity": 0.1
  };

  return draw.polyline().attr(option);
};

const startPolyLine = (el, p) => {
  let arr = [[p.x, p.y], [p.x, p.y]];

  el.plot(arr);
};

const continuePolyline = (el, p) => {
  var arr = el.array().valueOf();

  arr.push([p.x, p.y]);
  el.clear();
  el.plot(arr);
};

let getRanddomAxis = () => [
  {
    x: Math.random() * 500 + viewPortWidth / 2 - 250,
    y: Math.random() * 500 + viewPortHeight / 2 - 250
  },
  {
    x: Math.random() * 500 + viewPortWidth / 2 - 250,
    y: Math.random() * 500 + viewPortHeight / 2 - 250
  }
];

let axes;

const initAxes = () => {
  axes = [
    getRanddomAxis(),
    getRanddomAxis(),
    getRanddomAxis(),
    getRanddomAxis(),
    getRanddomAxis(),
    getRanddomAxis(),
    getRanddomAxis()
  ];
};

initAxes();

const mirrorPoint = (isStart, p) => {
  let ps = [p];
  for (const axis of axes) {
    ps = mirrorMulti(ps, axis);
  }
  if (isStart) {
    shapesMirrored[index] = ps.map(getDrawObject);
    shapesMirrored[index].forEach((x, idx) => startPolyLine(x, ps[idx]));
  } else {
    shapesMirrored[index].forEach((x, idx) => continuePolyline(x, ps[idx]));
  }
};

draw.on("mousedown", event => {
  const p = { x: event.clientX, y: event.clientY };
  mirrorPoint(true, p);
});
draw.on("mousemove", event => {
  if (shapesMirrored[index]) {
    const p = { x: event.clientX, y: event.clientY };
    mirrorPoint(false, p);
  }
});
draw.on("mouseup", event => {
  if (shapesMirrored[index]) {
    index++;
  }
});

function mirrorMulti(Qs, axis) {
  let qsMirrored = Qs.map(x => mirror(x, axis));
  return qsMirrored.concat(Qs);
}

function mirror(Q, [P, R]) {
  let [vx, vy] = [R.x - P.x, R.y - P.y];
  let [x, y] = [P.x - Q.x, P.y - Q.y];
  let r = 1 / (vx * vx + vy * vy);
  return {
    x: Q.x + 2 * (x - x * vx * vx * r - y * vx * vy * r),
    y: Q.y + 2 * (y - y * vy * vy * r - x * vx * vy * r)
  };
}

document.addEventListener("keydown", logKey);

function clear() {
  draw.clear();
  shapesMirrored.splice(0, shapesMirrored.length);
  col = getRandomColor();
  initAxes();
}

function logKey(e) {
  if (e.code === "Space") {
    clear();
  }
}

const drawTang = () => {
  draw.clear();

  draw.size(viewPortWidth, viewPortHeight);
};

drawTang();

window.onresize = function(event) {
  viewPortWidth = document.documentElement.clientWidth - 13;
  viewPortHeight = document.documentElement.clientHeight - 13;
  drawTang();
};
