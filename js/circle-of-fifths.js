/*
 * Интерактивный квинтовый круг (см. reference/circle.png) — выбор тональности
 * для генератора аккордовых последовательностей. Сама транспонизация — в
 * js/theory.js (табличная, не отсюда).
 */
(function () {
  "use strict";

  var SVG_NS = "http://www.w3.org/2000/svg";

  function el(tag, attrs) {
    var node = document.createElementNS(SVG_NS, tag);
    for (var key in attrs) {
      if (Object.prototype.hasOwnProperty.call(attrs, key)) {
        node.setAttribute(key, attrs[key]);
      }
    }
    return node;
  }

  function wedgePath(cx, cy, rInner, rOuter, startDeg, endDeg) {
    var startOuter = polar(cx, cy, rOuter, startDeg);
    var endOuter = polar(cx, cy, rOuter, endDeg);
    var startInner = polar(cx, cy, rInner, endDeg);
    var endInner = polar(cx, cy, rInner, startDeg);
    return [
      "M", startOuter.x, startOuter.y,
      "A", rOuter, rOuter, 0, 0, 1, endOuter.x, endOuter.y,
      "L", startInner.x, startInner.y,
      "A", rInner, rInner, 0, 0, 0, endInner.x, endInner.y,
      "Z"
    ].join(" ");
  }

  function polar(cx, cy, r, deg) {
    var rad = ((deg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function render(svg, onSelect) {
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    var cx = 130, cy = 130;
    var rOuter = 125, rMid = 85, rInner = 45;
    var step = 30;

    Theory.CIRCLE_MAJOR.forEach(function (key, i) {
      var start = i * step - step / 2;
      var end = i * step + step / 2;
      var mid = i * step;

      var majorGroup = el("g", { class: "segment outer", "data-pc": key.pc, "data-mode": "major" });
      majorGroup.appendChild(el("path", { d: wedgePath(cx, cy, rMid, rOuter, start, end) }));
      var majorLabelPos = polar(cx, cy, (rMid + rOuter) / 2, mid);
      var majorLabel = el("text", { x: majorLabelPos.x, y: majorLabelPos.y, "font-weight": 700 });
      majorLabel.textContent = key.name;
      majorGroup.appendChild(majorLabel);
      majorGroup.addEventListener("click", function () {
        onSelect(key.pc, "major", key.flats);
      });
      svg.appendChild(majorGroup);

      var minorGroup = el("g", { class: "segment inner", "data-pc": Theory.pcOf(key.pc + 9), "data-mode": "minor" });
      minorGroup.appendChild(el("path", { d: wedgePath(cx, cy, rInner, rMid, start, end) }));
      var minorLabelPos = polar(cx, cy, (rInner + rMid) / 2, mid);
      var minorLabel = el("text", { x: minorLabelPos.x, y: minorLabelPos.y, "font-size": 11 });
      minorLabel.textContent = key.minorName;
      minorGroup.appendChild(minorLabel);
      minorGroup.addEventListener("click", function () {
        onSelect(Theory.pcOf(key.pc + 9), "minor", key.flats);
      });
      svg.appendChild(minorGroup);
    });
  }

  function setSelected(svg, pc, mode) {
    svg.querySelectorAll(".segment").forEach(function (seg) {
      var segPc = parseInt(seg.getAttribute("data-pc"), 10);
      var segMode = seg.getAttribute("data-mode");
      seg.classList.toggle("selected", segPc === pc && segMode === mode);
    });
  }

  window.CircleOfFifths = { render: render, setSelected: setSelected };
})();
