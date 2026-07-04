/*
 * Общий SVG-рендерер грифа для экранов CAGED и "Боксы".
 * Рисует только: контуры ладов/струн, точки нот (цвет = роль), подписи.
 */
(function () {
  "use strict";

  var SVG_NS = "http://www.w3.org/2000/svg";
  var ROLE_CLASS = {
    majorTonic: "major",
    minorTonic: "minor",
    root: "major",
    third: "third",
    fifth: "fifth",
    other: "other"
  };
  var ROLE_LABEL = {
    root: "R",
    third: "3",
    fifth: "5"
  };

  function el(tag, attrs) {
    var node = document.createElementNS(SVG_NS, tag);
    for (var key in attrs) {
      if (Object.prototype.hasOwnProperty.call(attrs, key)) {
        node.setAttribute(key, attrs[key]);
      }
    }
    return node;
  }

  /**
   * @param {SVGSVGElement} svg
   * @param {Object} opts
   * @param {number} opts.strings - число струн (обычно 6)
   * @param {number} opts.fretStart - номер первого отображаемого лада (0 = от открытой струны)
   * @param {number} opts.fretCount - сколько ладов показать
   * @param {Array<{string:number, fret:number, role:string}>} opts.notes
   * @param {number[]} [opts.muted] - номера полностью не задействованных струн (крестик слева)
   * @param {string} [opts.title] - подпись (например "BOX 1 — Ионийский")
   */
  function render(svg, opts) {
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    var strings = opts.strings || 6;
    var fretStart = opts.fretStart || 0;
    var fretCount = opts.fretCount || 5;
    var notes = opts.notes || [];
    var muted = opts.muted || [];

    var marginLeft = 70;
    var marginRight = 40;
    var marginTop = 40;
    var marginBottom = 20;
    var width = 1000;
    var height = 420;

    var boardWidth = width - marginLeft - marginRight;
    var boardHeight = height - marginTop - marginBottom;
    var fretW = boardWidth / fretCount;
    var stringGap = boardHeight / (strings - 1);

    function xOfFret(relFret) {
      // relFret=0 -> nut/left edge of visible window, notes drawn mid-cell like a chord chart
      return marginLeft + (relFret - 0.5) * fretW;
    }
    function yOfString(stringNum) {
      return marginTop + (stringNum - 1) * stringGap;
    }

    // strings (horizontal lines)
    for (var s = 1; s <= strings; s++) {
      var y = yOfString(s);
      svg.appendChild(el("line", {
        x1: marginLeft, y1: y, x2: marginLeft + boardWidth, y2: y,
        stroke: "#cbd3e1", "stroke-width": s === 1 || s === strings ? 2 : 1.4
      }));
      var label = el("text", {
        x: marginLeft - 20, y: y + 5, fill: "#8b93a7", "font-size": 16, "text-anchor": "middle"
      });
      label.textContent = String(s);
      svg.appendChild(label);

      if (muted.indexOf(s) !== -1) {
        var xEl = el("text", {
          x: marginLeft - 45, y: y + 6, fill: "#8b93a7", "font-size": 16, "text-anchor": "middle"
        });
        xEl.textContent = "X";
        svg.appendChild(xEl);
      }
    }

    // frets (vertical lines)
    for (var f = 0; f <= fretCount; f++) {
      var x = marginLeft + f * fretW;
      var isNut = fretStart === 0 && f === 0;
      svg.appendChild(el("line", {
        x1: x, y1: marginTop, x2: x, y2: marginTop + boardHeight,
        stroke: "#cbd3e1", "stroke-width": isNut ? 5 : 1.4
      }));
    }

    // fret number labels under the board
    for (var fn = 1; fn <= fretCount; fn++) {
      var absFret = fretStart + fn;
      var fx = marginLeft + (fn - 0.5) * fretW;
      var flabel = el("text", {
        x: fx, y: marginTop + boardHeight + 22, fill: "#8b93a7", "font-size": 14, "text-anchor": "middle"
      });
      flabel.textContent = String(absFret);
      svg.appendChild(flabel);
    }

    if (opts.title) {
      var titleEl = el("text", {
        x: marginLeft, y: 22, fill: "#eef1f7", "font-size": 22, "font-weight": 700
      });
      titleEl.textContent = opts.title;
      svg.appendChild(titleEl);
    }

    var dotRadius = Math.min(fretW, stringGap) * 0.32;

    notes.forEach(function (note) {
      var relFret = note.fret - fretStart;
      if (relFret < 0 || relFret > fretCount) return;

      var isOpen = note.fret === 0;
      var cx = isOpen ? marginLeft - 24 : xOfFret(relFret);
      var cy = yOfString(note.string);
      var cls = ROLE_CLASS[note.role] || "other";

      if (isOpen) {
        // open string: draw an unfilled ring to the left of the nut
        svg.appendChild(el("circle", {
          cx: cx, cy: cy, r: dotRadius * 0.85, class: "note-ring " + cls,
          "stroke-width": 3
        }));
      } else {
        svg.appendChild(el("circle", {
          cx: cx, cy: cy, r: dotRadius, class: "note-dot " + cls
        }));
      }

      var label = ROLE_LABEL[note.role];
      if (label) {
        var t = el("text", {
          x: cx, y: cy + 5, fill: "#fff", "font-size": dotRadius * 1.05,
          "font-weight": 700, "text-anchor": "middle", "pointer-events": "none"
        });
        t.textContent = label;
        svg.appendChild(t);
      }
    });
  }

  window.Fretboard = { render: render };
})();
