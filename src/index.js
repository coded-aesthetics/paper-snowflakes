import "./styles.css";
import SVG from "svg.js";
import "svg.draw.js";

const draw = new SVG("app");
const mirrored = new SVG("mirrored");

const shapes = [];
const shapesMirrored = [];

let index = 0;
let shape;

const lines = [[502, 500], [500, 520], [[502, 509], [500, 527]]];

const getDrawObject = () => {
  const color = document.getElementById("color").value;
  const option = {
    stroke: color,
    "stroke-width": 2,
    "fill-opacity": 0.1
  };

  return draw.polyline().attr(option);
};

const getDrawObjectMirrored = () => {
  const color = document.getElementById("color").value;
  const option = {
    stroke: "#" + Math.floor(Math.random() * 16777215).toString(16),
    fill: color,
    "stroke-width": 1,
    "fill-opacity": 0
  };

  return mirrored.polyline().attr(option);
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
  { x: Math.random() * 500 + 400, y: Math.random() * 500 + 400 },
  { x: Math.random() * 500 + 400, y: Math.random() * 500 + 400 }
];

const axes = [
  getRanddomAxis(),
  getRanddomAxis(),
  getRanddomAxis(),
  getRanddomAxis(),
  getRanddomAxis(),
  getRanddomAxis(),
  getRanddomAxis()
];

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
  const shape = getDrawObjectMirrored();
  shapes[index] = shape;
  shape.draw(event);
  const p = { x: event.clientX, y: event.clientY };
  mirrorPoint(true, p);
});
draw.on("mousemove", event => {
  if (shapes[index]) {
    shapes[index].draw("point", event);
    const p = { x: event.clientX, y: event.clientY };
    mirrorPoint(false, p);
  }
});
draw.on("mouseup", event => {
  if (shapes[index]) {
    shapes[index].draw("stop", event);
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

// This is custom extension of line, polyline, polygon which doesn't draw the circle on the line.
SVG.Element.prototype.draw.extend("line polyline polygon", {
  init: function(e) {
    // When we draw a polygon, we immediately need 2 points.
    // One start-point and one point at the mouse-position

    this.set = new SVG.Set();

    var p = this.startPoint,
      arr = [[p.x, p.y], [p.x, p.y]];

    this.el.plot(arr);
  },

  // The calc-function sets the position of the last point to the mouse-position (with offset ofc)
  calc: function(e) {
    var arr = this.el.array().valueOf();
    arr.pop();

    if (e) {
      var p = this.transformPoint(e.clientX, e.clientY);
      arr.push(this.snapToGrid([p.x, p.y]));
    }

    this.el.plot(arr);
  },

  point: function(e) {
    if (this.el.type.indexOf("poly") > -1) {
      // Add the new Point to the point-array
      var p = this.transformPoint(e.clientX, e.clientY),
        arr = this.el.array().valueOf();

      arr.push(this.snapToGrid([p.x, p.y]));

      this.el.plot(arr);

      // Fire the `drawpoint`-event, which holds the coords of the new Point
      this.el.fire("drawpoint", {
        event: e,
        p: { x: p.x, y: p.y },
        m: this.m
      });

      return;
    }

    // We are done, if the element is no polyline or polygon
    this.stop(e);
  },

  clean: function() {
    // Remove all circles
    this.set.each(function() {
      this.remove();
    });

    this.set.clear();

    delete this.set;
  }
});
