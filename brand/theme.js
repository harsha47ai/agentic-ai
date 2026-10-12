// "learn with harsha" slide theme for pptxgenjs — from the Video Call Kit design.
// White content slides, black title/closing slides. Geist + IBM Plex Mono, orange FF5700.
const path = require("path");
const fs = require("fs");

const ORANGE = "FF5700", ORANGE_DK = "FF7A33", INK = "1C1C1C", WHITE = "FFFFFF", BLACK = "111111",
      GREY = "6B7280", GREY2 = "919191", GREY_DK = "A3A3A3", LINE = "E5E5E5", LINE_DK = "2A2A2A",
      SQ = "EDEDEB", SQ_DK = "222222", TINT = "F7F7F5", TINT_DK = "1A1A1A", CODE_BG = "111111";
const SANS = "Geist", MONO = "IBM Plex Mono";
const gridW = "image/png;base64," + fs.readFileSync(path.join(__dirname, "grid-white.png")).toString("base64");
const gridB = "image/png;base64," + fs.readFileSync(path.join(__dirname, "grid-black.png")).toString("base64");

function make(pres) {
  pres.layout = "LAYOUT_16x9"; // 10 x 5.625 in
  const T = {};

  // wordmark: "learn with harsha" + orange square
  T.wordmark = (s, x, y, size, dark) => {
    s.addText([{ text: "learn  with  ", options: { color: dark ? WHITE : INK } }, { text: "harsha", options: { color: ORANGE } },
               { text: "  \u25A0", options: { color: ORANGE, fontSize: Math.round(size * 0.4) } }],
      { x, y, w: 9, h: size / 72 * 1.4, fontFace: SANS, fontSize: size, bold: true, charSpacing: 1, isTextBox: true, margin: 0, valign: "middle" });
  };

  T.squares = (s, x, y, cell, gap, dark) => { // 3x3 motif, centre-left orange like the kit
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
      const on = r === 1 && c === 1;
      s.addShape(pres.shapes.RECTANGLE, { x: x + c * (cell + gap), y: y + r * (cell + gap), w: cell, h: cell, fill: { color: on ? ORANGE : (dark ? SQ_DK : SQ) } });
    }
  };

  T.kicker = (s, text, x, y, dark) => {
    s.addShape(pres.shapes.RECTANGLE, { x, y: y + 0.11, w: 0.1, h: 0.1, fill: { color: ORANGE } });
    s.addText(text.toUpperCase(), { x: x + 0.18, y, w: 7, h: 0.32, fontFace: MONO, fontSize: 10, charSpacing: 4, color: dark ? ORANGE_DK : ORANGE, isTextBox: true, margin: 0, valign: "middle" });
  };

  T.footer = (s, left, dark) => {
    s.addText(left, { x: 0.5, y: 5.2, w: 6.5, h: 0.25, fontFace: MONO, fontSize: 8, charSpacing: 1, color: dark ? "8A8A8A" : GREY2, isTextBox: true, margin: 0, valign: "middle" });
    s.addText("arthashastra.ai", { x: 7.5, y: 5.2, w: 2, h: 0.25, fontFace: MONO, fontSize: 8, charSpacing: 1, color: dark ? "8A8A8A" : GREY2, align: "right", isTextBox: true, margin: 0, valign: "middle" });
  };

  // ---- slide types ----
  T.dark = (notes) => {
    const s = pres.addSlide();
    s.background = { data: gridB };
    if (notes) s.addNotes(notes);
    return s;
  };
  T.light = (notes, kicker, title, footer) => {
    const s = pres.addSlide();
    s.background = { data: gridW };
    if (notes) s.addNotes(notes);
    T.wordmark(s, 0.5, 0.3, 14, false);
    if (kicker) T.kicker(s, kicker, 0.5, 0.88, false);
    if (title) s.addText(title, { x: 0.5, y: 1.18, w: 9, h: 0.7, fontFace: SANS, fontSize: title.length > 38 ? 23 : 28, bold: true, charSpacing: -1, color: INK, isTextBox: true, margin: 0, valign: "middle" });
    T.footer(s, footer || "Arthashastra Learning · The Agentic Enterprise", false);
    return s;
  };
  T.cover = (ep, title, subtitle, notes) => {
    const s = T.dark(notes);
    T.squares(s, 7.55, 0.5, 0.3, 0.07, true);
    T.kicker(s, `Episode ${ep}`, 0.6, 0.6, true);
    T.wordmark(s, 0.6, 1.15, 44, true);
    s.addText(title, { x: 0.6, y: 2.4, w: 8.4, h: 1.5, fontFace: SANS, fontSize: 30, bold: true, charSpacing: -1, color: WHITE, isTextBox: true, margin: 0, valign: "top", lineSpacingMultiple: 1.05 });
    s.addShape(pres.shapes.LINE, { x: 0.6, y: 4.3, w: 8.8, h: 0, line: { color: LINE_DK, width: 0.75 } });
    s.addText("Harsha Pasumarthi", { x: 0.6, y: 4.45, w: 5, h: 0.3, fontFace: SANS, fontSize: 14, bold: true, color: WHITE, isTextBox: true, margin: 0 });
    s.addText(subtitle || "Founder & CEO, Arthashastra Intelligence", { x: 0.6, y: 4.75, w: 6, h: 0.3, fontFace: SANS, fontSize: 11, color: GREY_DK, isTextBox: true, margin: 0 });
    s.addText("arthashastra.ai", { x: 7.4, y: 4.75, w: 2, h: 0.3, fontFace: MONO, fontSize: 9, charSpacing: 1, color: "8A8A8A", align: "right", isTextBox: true, margin: 0 });
    return s;
  };
  T.closing = (title, lines, nextText, notes) => {
    const s = T.dark(notes);
    T.wordmark(s, 0.6, 0.42, 18, true);
    T.squares(s, 7.55, 0.5, 0.3, 0.07, true);
    s.addText(title, { x: 0.6, y: 1.2, w: 8.8, h: 0.6, fontFace: SANS, fontSize: 28, bold: true, charSpacing: -1, color: WHITE, isTextBox: true, margin: 0, valign: "middle" });
    lines.forEach(([h, d], i) => {
      const y = 1.95 + i * 0.6;
      s.addText(h, { x: 0.6, y, w: 2.2, h: 0.5, fontFace: MONO, fontSize: 11, charSpacing: 2, color: ORANGE_DK, isTextBox: true, margin: 0, valign: "middle" });
      s.addText(d, { x: 2.8, y, w: 6.6, h: 0.5, fontFace: SANS, fontSize: 14, color: WHITE, isTextBox: true, margin: 0, valign: "middle" });
    });
    s.addShape(pres.shapes.LINE, { x: 0.6, y: 4.3, w: 8.8, h: 0, line: { color: LINE_DK, width: 0.75 } });
    s.addText([{ text: "NEXT  ", options: { fontFace: MONO, fontSize: 9, charSpacing: 3, color: ORANGE_DK } }, { text: nextText, options: { fontFace: SANS, fontSize: 12, color: WHITE } }],
      { x: 0.6, y: 4.38, w: 8.8, h: 0.5, isTextBox: true, margin: 0, valign: "middle" });
    s.addText("github.com/harsha47ai/agentic-ai  ·  one episode a week", { x: 0.6, y: 4.95, w: 8.8, h: 0.3, fontFace: MONO, fontSize: 9, charSpacing: 1, color: "8A8A8A", isTextBox: true, margin: 0 });
    return s;
  };

  // ---- content helpers (light slides) ----
  T.card = (s, x, y, w, h, tint) => s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: tint ? TINT : WHITE }, line: { color: LINE, width: 0.75 } });
  T.num = (s, n, x, y, d = 0.36) => {
    s.addShape(pres.shapes.RECTANGLE, { x, y, w: d, h: d, fill: { color: ORANGE } });
    s.addText(String(n), { x, y, w: d, h: d, fontFace: MONO, fontSize: 11, bold: true, color: WHITE, align: "center", valign: "middle", isTextBox: true, margin: 0 });
  };
  T.h = (s, text, x, y, w, h, size = 15) => s.addText(text, { x, y, w, h, fontFace: SANS, fontSize: size, bold: true, charSpacing: -0.5, color: INK, isTextBox: true, margin: 0, valign: "top" });
  T.p = (s, text, x, y, w, h, size = 11, color = GREY) => s.addText(text, { x, y, w, h, fontFace: SANS, fontSize: size, color, isTextBox: true, margin: 0, valign: "top" });
  T.mono = (s, text, x, y, w, h, size = 10, color = INK) => s.addText(text, { x, y, w, h, fontFace: MONO, fontSize: size, color, isTextBox: true, margin: 0, valign: "top" });
  T.code = (s, lines, x, y, w, h, size = 10) => {
    s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: CODE_BG } });
    s.addText(lines.map((l, i) => ({ text: typeof l === "string" ? l : l.t, options: { breakLine: i < lines.length - 1, color: typeof l === "string" ? "E6E6E6" : l.c } })),
      { x: x + 0.2, y: y + 0.15, w: w - 0.4, h: h - 0.3, fontFace: MONO, fontSize: size, isTextBox: true, margin: 0, valign: "top" });
  };
  T.box = (s, text, x, y, w, h, color = INK, fill = WHITE, size = 11) => {
    s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: fill }, line: { color: color === ORANGE ? ORANGE : LINE, width: color === ORANGE ? 1.25 : 0.75 } });
    s.addText(text, { x, y, w, h, fontFace: SANS, fontSize: size, bold: true, color, align: "center", valign: "middle", isTextBox: true, margin: 0.05 });
  };
  T.arrow = (s, x, y, w, color = GREY2) => s.addShape(pres.shapes.LINE, { x, y, w, h: 0, line: { color, width: 1.25, endArrowType: "triangle" } });
  T.callout = (s, label, text, x, y, w, h) => {
    T.card(s, x, y, w, h, true);
    s.addText([{ text: label + "  ", options: { fontFace: MONO, fontSize: 9, charSpacing: 2, color: ORANGE } }, { text, options: { fontFace: SANS, fontSize: 11.5, color: INK } }],
      { x: x + 0.25, y, w: w - 0.5, h, isTextBox: true, margin: 0, valign: "middle" });
  };
  T.C = { ORANGE, INK, GREY, GREY2, LINE, WHITE, TINT, SANS, MONO, RED: "D14343", TEAL: "0E7C7B" };
  return T;
}
module.exports = { make };
