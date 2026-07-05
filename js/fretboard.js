/*
 * Полный гриф (0..17 лад) для экрана "Гриф" — единый SVG на весь диапазон,
 * с горизонтальным скроллом, поверх которого рисуются один или несколько
 * "силуэтов" (формы EDCAG или боксы), каждый — цветной бейдж + точки нот.
 * Геометрия и разметка перенесены из fretflow-fretboard-screen.html без
 * изменений (маркеры на 3/5/7/9/12/15/17, отступы, шрифты).
 *
 * Модуль ничего не знает про тональности/степени — вызывающий код
 * (js/fretboard-screen.js) уже транспонирует лады и решает цвет/подпись/
 * радиус каждой точки; здесь только геометрия и отрисовка.
 */
(function () {
  "use strict";

  var SVG_NS = "http://www.w3.org/2000/svg";

  var STRINGS = 6;
  var FRETS = 17;
  var MARGIN_L = 90;
  var MARGIN_R = 30;
  var FRET_CELL_PX = 60;
  var NECK_TOP = 88;
  var NECK_BOTTOM = 88 + 5 * 48;
  var TOTAL_W = MARGIN_L + MARGIN_R + FRETS * FRET_CELL_PX;
  var TOTAL_H = 460;

  var STRING_NAMES = ["e", "B", "G", "D", "A", "E"]; // string 1 (высокое e) .. string 6 (низкое E)

  function stringY(s) {
    return NECK_TOP + (s - 1) * ((NECK_BOTTOM - NECK_TOP) / (STRINGS - 1));
  }
  function fretLineX(n) {
    return MARGIN_L + n * FRET_CELL_PX;
  }
  function noteX(fret) {
    return fret === 0 ? MARGIN_L - 34 : fretLineX(fret - 1) + FRET_CELL_PX / 2;
  }

  function el(tag, attrs, text) {
    var node = document.createElementNS(SVG_NS, tag);
    for (var key in attrs) {
      if (Object.prototype.hasOwnProperty.call(attrs, key)) {
        node.setAttribute(key, attrs[key]);
      }
    }
    if (text !== undefined) node.textContent = text;
    return node;
  }

  /**
   * @param {SVGSVGElement} svg
   * @param {Object} opts
   * @param {Array<{label:string, color:string, notes:Array<{string:number, fret:number, color:string, label:string, radius:number}>}>} opts.groups
   */
  function renderNeck(svg, opts) {
    var groups = (opts && opts.groups) || [];

    svg.setAttribute("viewBox", "0 0 " + TOTAL_W + " " + TOTAL_H);
    svg.style.width = TOTAL_W + "px";
    svg.style.height = TOTAL_H + "px";
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    for (var s = 1; s <= STRINGS; s++) {
      var y = stringY(s);
      svg.appendChild(el("line", {
        x1: MARGIN_L - 34, y1: y, x2: fretLineX(FRETS), y2: y,
        stroke: "#C9C4B7", "stroke-width": 1.5
      }));
      svg.appendChild(el("text", {
        x: MARGIN_L - 56, y: y + 5, "font-family": "JetBrains Mono, monospace",
        "font-size": 14, fill: "#8C8678", "text-anchor": "middle"
      }, STRING_NAMES[s - 1]));
    }

    for (var f = 0; f <= FRETS; f++) {
      var x = fretLineX(f);
      var isNut = f === 0;
      svg.appendChild(el("line", {
        x1: x, y1: NECK_TOP, x2: x, y2: NECK_BOTTOM,
        stroke: isNut ? "#201E1A" : "#C9C4B7", "stroke-width": isNut ? 4 : 1.5
      }));
    }

    [3, 5, 7, 9, 15, 17].forEach(function (f) {
      svg.appendChild(el("circle", {
        cx: noteX(f), cy: (NECK_TOP + NECK_BOTTOM) / 2, r: 5, fill: "#DCD6C8"
      }));
    });
    (function () {
      var x = noteX(12);
      svg.appendChild(el("circle", { cx: x, cy: NECK_TOP + (NECK_BOTTOM - NECK_TOP) / 2 - 16, r: 5, fill: "#DCD6C8" }));
      svg.appendChild(el("circle", { cx: x, cy: NECK_TOP + (NECK_BOTTOM - NECK_TOP) / 2 + 16, r: 5, fill: "#DCD6C8" }));
    })();

    for (var fn = 1; fn <= FRETS; fn++) {
      svg.appendChild(el("text", {
        x: noteX(fn), y: NECK_BOTTOM + 28, "font-family": "JetBrains Mono, monospace",
        "font-size": 13, fill: "#8C8678", "text-anchor": "middle"
      }, String(fn)));
    }

    groups.forEach(function (group) {
      if (!group.notes.length) return;
      var frets = group.notes.map(function (n) { return n.fret; });
      var minF = Math.min.apply(null, frets), maxF = Math.max.apply(null, frets);
      var cx = (noteX(minF) + noteX(maxF)) / 2;
      var g = el("g", {});
      g.appendChild(el("rect", { x: cx - 16, y: NECK_TOP - 38, width: 32, height: 26, rx: 8, fill: group.color }));
      g.appendChild(el("text", {
        x: cx, y: NECK_TOP - 20, "font-family": "Inter, sans-serif", "font-weight": 800,
        "font-size": 14, fill: "#fff", "text-anchor": "middle"
      }, group.label));
      svg.appendChild(g);
    });

    groups.forEach(function (group) {
      group.notes.forEach(function (n) {
        var cx = noteX(n.fret), cy = stringY(n.string);
        var g = el("g", {});
        g.appendChild(el("circle", {
          cx: cx, cy: cy, r: n.radius, fill: n.color, stroke: "#fff", "stroke-width": 2.5
        }));
        if (n.label) {
          g.appendChild(el("text", {
            x: cx, y: cy + 5, "font-family": "JetBrains Mono, monospace", "font-weight": 700,
            "font-size": n.label.length > 1 ? 11 : 13, fill: n.textColor || "#fff", "text-anchor": "middle"
          }, n.label));
        }
        svg.appendChild(g);
      });
    });
  }

  window.Fretboard = { renderNeck: renderNeck };
})();
