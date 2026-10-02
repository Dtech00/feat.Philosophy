(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, p) => a + (b - a) * p;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const store = {
  get(k) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};

/* ---------- 폰트 카탈로그 (전부 SIL Open Font License 1.1) ---------- */
const GF = 'https://fonts.google.com/specimen/';
const FONTS = [
  { name: 'Pretendard', cat: '고딕', w: [100, 200, 300, 400, 500, 600, 700, 800, 900], local: true, by: '길형진', link: 'https://github.com/orioncactus/pretendard' },
  { name: 'Noto Sans KR', cat: '고딕', w: [100, 200, 300, 400, 500, 600, 700, 800, 900], q: 'wght@100..900', by: 'Google · Adobe' },
  { name: 'Gothic A1', cat: '고딕', w: [100, 200, 300, 400, 500, 600, 700, 800, 900], q: 'wght@100;200;300;400;500;600;700;800;900', by: 'HanYang I&C' },
  { name: 'IBM Plex Sans KR', cat: '고딕', w: [100, 200, 300, 400, 500, 600, 700], q: 'wght@100;200;300;400;500;600;700', by: 'IBM' },
  { name: 'Nanum Gothic', cat: '고딕', w: [400, 700, 800], q: 'wght@400;700;800', by: '네이버' },
  { name: 'Gowun Dodum', cat: '고딕', w: [400], by: '류양희' },
  { name: 'Noto Serif KR', cat: '명조', w: [200, 300, 400, 500, 600, 700, 800, 900], q: 'wght@200..900', by: 'Google · Adobe' },
  { name: 'Nanum Myeongjo', cat: '명조', w: [400, 700, 800], q: 'wght@400;700;800', by: '네이버' },
  { name: 'Gowun Batang', cat: '명조', w: [400, 700], q: 'wght@400;700', by: '류양희' },
  { name: 'Hahmlet', cat: '명조', w: [100, 200, 300, 400, 500, 600, 700, 800, 900], q: 'wght@100..900', by: 'Hypertype' },
  { name: 'Song Myung', cat: '명조', w: [400], by: 'JIKJI SOFT' },
  { name: 'Black Han Sans', cat: '제목', w: [400], by: 'Zess Type' },
  { name: 'Do Hyeon', cat: '제목', w: [400], by: '우아한형제들' },
  { name: 'Jua', cat: '제목', w: [400], by: '우아한형제들' },
  { name: 'Gugi', cat: '제목', w: [400], by: 'TAE System' },
  { name: 'Bagel Fat One', cat: '제목', w: [400], by: 'Kyungwon Kim' },
  { name: 'Gasoek One', cat: '제목', w: [400], by: 'Jiashuo Zhang' },
  { name: 'Orbit', cat: '제목', w: [400], by: 'Sooun Kim' },
  { name: 'Dongle', cat: '제목', w: [300, 400, 700], q: 'wght@300;400;700', by: 'Yanghee Ryu' },
  { name: 'Nanum Pen Script', cat: '손글씨', w: [400], by: '네이버' },
  { name: 'Nanum Brush Script', cat: '손글씨', w: [400], by: '네이버' },
  { name: 'Gaegu', cat: '손글씨', w: [300, 400, 700], q: 'wght@300;400;700', by: 'JIKJI SOFT' },
  { name: 'Hi Melody', cat: '손글씨', w: [400], by: 'YoonDesign' },
  { name: 'Gamja Flower', cat: '손글씨', w: [400], by: 'YoonDesign' },
  { name: 'Poor Story', cat: '손글씨', w: [400], by: 'Yoon Design' },
  { name: 'East Sea Dokdo', cat: '손글씨', w: [400], by: 'YoonDesign' },
  { name: 'Dokdo', cat: '손글씨', w: [400], by: 'FONTRIX' },
  { name: 'Single Day', cat: '개성', w: [400], by: 'DXKorea' },
  { name: 'Cute Font', cat: '개성', w: [400], by: 'TypoDesign Lab' },
  { name: 'Yeon Sung', cat: '개성', w: [400], by: 'Woowahan Brothers' },
  { name: 'Stylish', cat: '개성', w: [400], by: 'AsiaSoft' },
  { name: 'Diphylleia', cat: '개성', w: [400], by: 'Jiashuo Zhang' },
];
const FONT_CATS = ['전체', '고딕', '명조', '제목', '손글씨', '개성', '내 폰트'];
const fontInfo = n => FONTS.find(f => f.name === n) || { name: n, cat: '내 폰트', w: [100, 200, 300, 400, 500, 600, 700, 800, 900], custom: true };
const fontStack = n => `'${String(n).replace(/['"\\]/g, '')}','Pretendard','Apple SD Gothic Neo','Malgun Gothic',sans-serif`;
(function loadGoogleFonts() {
  const fam = FONTS.filter(f => !f.local).map(f => 'family=' + f.name.replace(/ /g, '+') + (f.q ? ':' + f.q : '')).join('&');
  $('#gfonts').href = 'https://fonts.googleapis.com/css2?' + fam + '&display=swap';
})();

/* ---------- 데이터 모델 ---------- */
const DEFAULT_STYLE = {
  font: 'Pretendard', size: 64, weight: 700, italic: false, underline: false, spacing: 0,
  color: '#FFFFFF', opacity: 100, outline: 4, outlineColor: '#000000',
  shadow: 2, shadowColor: '#000000', shadowOpacity: 60, glow: 0,
  box: false, boxColor: '#000000', boxOpacity: 70, boxPad: 14,
  align: 2, marginH: 80, marginV: 90, offX: 0, offY: 0, rotate: 0,
  hlColor: '#A0FFEC', karaokeColor: '#A0FFEC'
};
const DEFAULT_FX = { in: 'fade', inDur: 250, out: 'fade', outDur: 200, emph: 'none' };
const IN_FX = [
  ['none', '없음'], ['fade', '페이드'], ['pop', '팝 (튀어나오기)'], ['zoomOut', '줌 아웃 (크게→원래)'],
  ['slideUp', '아래에서 올라오기'], ['slideDown', '위에서 내려오기'], ['slideLeft', '오른쪽에서 들어오기'], ['slideRight', '왼쪽에서 들어오기'],
  ['blurIn', '블러 인 (초점 맞추기)'], ['typewriter', '타자기 (한 글자씩)'], ['charFade', '글자 순차 페이드']
];
const OUT_FX = [
  ['none', '없음'], ['fade', '페이드'], ['zoomIn', '커지며 사라짐'], ['shrink', '작아지며 사라짐'],
  ['blurOut', '블러 아웃'], ['slideDownOut', '아래로 빠지기'], ['slideUpOut', '위로 빠지기']
];
const EMPH_FX = [['none', '없음'], ['karaoke', '노래방 (색 채우기)']];
const SLIDE_IN = { slideUp: [0, 1], slideDown: [0, -1], slideLeft: [1, 0], slideRight: [-1, 0] };
const SLIDE_OUT = { slideDownOut: [0, 1], slideUpOut: [0, -1] };
const fxName = (list, k) => (list.find(x => x[0] === k) || [k, k])[1];

const PRESETS = [
  { name: '기본', style: {}, fx: {} },
  { name: '예능 노랑', style: { font: 'Black Han Sans', size: 84, weight: 400, color: '#FFE14D', outline: 7, outlineColor: '#151515', shadow: 4, shadowOpacity: 80, hlColor: '#FF5C5C' }, fx: { in: 'pop', inDur: 220, out: 'fade', outDur: 150 } },
  { name: '다큐 명조', style: { font: 'Noto Serif KR', size: 56, weight: 600, outline: 0, shadow: 3, shadowOpacity: 85, glow: 0 }, fx: { in: 'fade', inDur: 450, out: 'fade', outDur: 450 } },
  { name: '민트 네온', style: { font: 'Pretendard', size: 68, weight: 800, color: '#FFFFFF', outline: 3, outlineColor: '#A0FFEC', glow: 6, shadow: 0, hlColor: '#A0FFEC' }, fx: { in: 'blurIn', inDur: 400, out: 'blurOut', outDur: 250 } },
  { name: '박스 자막', style: { font: 'Pretendard', size: 52, weight: 600, outline: 0, shadow: 0, box: true, boxColor: '#000000', boxOpacity: 72, boxPad: 16 }, fx: { in: 'slideUp', inDur: 260, out: 'fade', outDur: 160 } },
  { name: '뉴스 하단', style: { font: 'Gothic A1', size: 50, weight: 700, outline: 0, shadow: 0, box: true, boxColor: '#0B3D91', boxOpacity: 92, boxPad: 18, align: 1, marginH: 90, marginV: 110 }, fx: { in: 'slideRight', inDur: 300, out: 'fade', outDur: 200 } },
  { name: '손글씨 감성', style: { font: 'Nanum Pen Script', size: 88, weight: 400, color: '#FFF4E2', outline: 3, outlineColor: '#3A2A1A', shadow: 2, shadowOpacity: 50 }, fx: { in: 'charFade', inDur: 700, out: 'fade', outDur: 300 } },
  { name: '노래방', style: { font: 'Do Hyeon', size: 74, weight: 400, color: '#FFFFFF', outline: 5, outlineColor: '#111111', karaokeColor: '#FF5C8A' }, fx: { in: 'fade', inDur: 150, out: 'fade', outDur: 150, emph: 'karaoke' } },
  { name: '타자기', style: { font: 'IBM Plex Sans KR', size: 50, weight: 500, outline: 0, shadow: 0, box: true, boxColor: '#111111', boxOpacity: 85, boxPad: 12 }, fx: { in: 'typewriter', inDur: 900, out: 'fade', outDur: 150 } },
  { name: '숏폼 중앙', style: { font: 'Pretendard', size: 96, weight: 900, outline: 8, outlineColor: '#000000', shadow: 0, align: 5, hlColor: '#FFE14D' }, fx: { in: 'pop', inDur: 200, out: 'none', outDur: 0 } },
];
const mkStyle = p => Object.assign({}, DEFAULT_STYLE, p || {});
const mkFx = p => Object.assign({}, DEFAULT_FX, p || {});
let uid = 1;
const mkLine = (start, end, text, style, fx) => ({ id: uid++, start, end, text, style: mkStyle(style), fx: mkFx(fx) });

const state = {
  canvas: { w: 1920, h: 1080 },
  lines: [],
  sel: new Set(),
  anchor: null,
  bg: 'sample',
  userPresets: store.get('subfx.presets') || [],
  tab: 'font',
  name: '자막',
};

function sampleLines() {
  uid = 1;
  const P = n => PRESETS.find(p => p.name === n);
  return [
    mkLine(800, 3200, '예시) 안녕하세요, 오늘은 *자막 효과*를 만들어 볼게요', null, { in: 'pop', inDur: 220 }),
    mkLine(3400, 5800, 'SRT를 불러오면 이렇게 한 줄씩 나와요', P('예능 노랑').style, P('예능 노랑').fx),
    mkLine(6000, 8600, '줄을 고르고 오른쪽 패널에서\n글꼴과 효과를 바꿔 보세요', P('박스 자막').style, P('박스 자막').fx),
    mkLine(8800, 11200, '미리보기에서 자막을 끌면 위치가 바뀝니다', P('민트 네온').style, P('민트 네온').fx),
    mkLine(11400, 14200, '다 됐으면 SRT 저장, 효과도 같이 들어가요', P('노래방').style, P('노래방').fx),
  ];
}

/* ---------- 히스토리 ---------- */
const hist = { stack: [], idx: -1, timer: 0 };
const snap = () => JSON.stringify({ canvas: state.canvas, lines: state.lines });
function commit(immediate) {
  clearTimeout(hist.timer);
  const go = () => {
    const s = snap();
    if (hist.stack[hist.idx] === s) return;
    hist.stack = hist.stack.slice(0, hist.idx + 1);
    hist.stack.push(s); if (hist.stack.length > 120) hist.stack.shift();
    hist.idx = hist.stack.length - 1;
    store.set('subfx.project', JSON.parse(s));
  };
  immediate ? go() : (hist.timer = setTimeout(go, 350));
}
function restore(s) {
  const o = JSON.parse(s);
  state.canvas = o.canvas; state.lines = o.lines;
  uid = Math.max(0, ...state.lines.map(l => l.id)) + 1;
  state.sel = new Set([...state.sel].filter(id => state.lines.some(l => l.id === id)));
  syncCanvasSel(); renderList(); renderInsp(); layout(); draw(true);
  store.set('subfx.project', o);
}
function undo() { if (hist.idx > 0) { hist.idx--; restore(hist.stack[hist.idx]); toast('되돌렸어요'); } }
function redo() { if (hist.idx < hist.stack.length - 1) { hist.idx++; restore(hist.stack[hist.idx]); } }

/* ---------- 시간 ---------- */
function fmtSrt(ms) {
  ms = Math.max(0, Math.round(ms));
  const h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, s = Math.floor(ms / 1000) % 60, x = ms % 1000;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(x).padStart(3, '0')}`;
}
function fmtAss(ms) {
  const cs = Math.max(0, Math.round(ms / 10));
  const h = Math.floor(cs / 360000), m = Math.floor(cs / 6000) % 60, s = Math.floor(cs / 100) % 60, c = cs % 100;
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(c).padStart(2, '0')}`;
}
const TRE = /(?:(\d+):)?(\d{1,2}):(\d{2})[,.](\d{1,3})/;
function parseTime(str) {
  const m = TRE.exec(String(str).trim()); if (!m) return null;
  return ((+(m[1] || 0)) * 3600 + (+m[2]) * 60 + (+m[3])) * 1000 + +m[4].padEnd(3, '0');
}

/* ---------- SRT 파싱 ---------- */
function parseSrt(txt) {
  txt = txt.replace(/^﻿/, '').replace(/\r\n?/g, '\n');
  const blocks = txt.split(/\n{2,}/);
  const out = [];
  const re = /(?:(\d+):)?(\d{1,2}):(\d{2})[,.](\d{1,3})\s*-->\s*(?:(\d+):)?(\d{1,2}):(\d{2})[,.](\d{1,3})/;
  for (const b of blocks) {
    const ls = b.split('\n');
    const i = ls.findIndex(l => re.test(l));
    if (i < 0) continue;
    const m = re.exec(ls[i]);
    const t = (h, mm, s, x) => ((+(h || 0)) * 3600 + (+mm) * 60 + (+s)) * 1000 + +String(x).padEnd(3, '0');
    const text = ls.slice(i + 1).join('\n')
      .replace(/\{\\[^}]*\}/g, '').replace(/<[^>]+>/g, '').replace(/\n+$/, '').trim();
    if (!text) continue;
    out.push({ start: t(m[1], m[2], m[3], m[4]), end: t(m[5], m[6], m[7], m[8]), text });
  }
  return out;
}

/* ---------- 텍스트 토큰 (*강조* 문법) ---------- */
function tokens(text) {
  const out = []; let hl = false;
  for (const c of Array.from(text)) {
    if (c === '*') { hl = !hl; continue; }
    if (c === '\n') { out.push({ nl: true }); continue; }
    out.push({ c, hl });
  }
  return out;
}
const plain = t => t.replace(/\*/g, '');

/* ---------- 효과 계산 (미리보기와 ASS가 같은 식을 씀) ---------- */
function effFx(l) {
  const d = Math.max(1, l.end - l.start);
  let { in: i, out: o, inDur, outDur, emph } = l.fx;
  if (i === 'none') inDur = 0;
  if (o === 'none') outDur = 0;
  if (SLIDE_IN[i] && SLIDE_OUT[o]) o = 'fade';
  const max = Math.max(0, d - 40);
  if (inDur + outDur > max) { const k = max / (inDur + outDur); inDur = Math.floor(inDur * k); outDur = Math.floor(outDur * k); }
  return { i, o, inDur, outDur, emph, d };
}
const fadeInOf = f => (['fade', 'zoomOut', 'blurIn'].includes(f.i) || SLIDE_IN[f.i]) ? f.inDur : f.i === 'pop' ? Math.min(f.inDur, 120) : 0;
const slideDist = (cv) => [Math.round(cv.w * 0.05), Math.round(cv.h * 0.055)];
function anchorXY(st, cv) {
  const a = st.align, col = (a - 1) % 3, row = a >= 7 ? 0 : a >= 4 ? 1 : 2;
  const x = col === 0 ? st.marginH : col === 1 ? cv.w / 2 : cv.w - st.marginH;
  const y = row === 0 ? st.marginV : row === 1 ? cv.h / 2 : cv.h - st.marginV;
  return [Math.round(x + st.offX), Math.round(y + st.offY), col, row];
}
function charTimes(f, n) {
  if (f.i === 'typewriter') return { at: i => (n ? i * f.inDur / n : 0), len: 1 };
  if (f.i === 'charFade') { const len = Math.min(220, f.inDur * 0.5); return { at: i => (n > 1 ? i * (f.inDur - len) / (n - 1) : 0), len }; }
  return null;
}
function karaokeTimes(f, n) {
  const ks = f.inDur, ke = Math.max(ks + 10, f.d - f.outDur);
  const totalCs = Math.max(n, Math.round((ke - ks) / 10));
  const per = []; let acc = 0;
  for (let i = 0; i < n; i++) { const v = Math.round(totalCs * (i + 1) / n) - acc; per.push(v); acc += v; }
  return { ks, per };
}
function frame(l, t) {
  const f = effFx(l), lt = t - l.start, st = l.style;
  if (lt < 0 || lt >= f.d) return null;
  const glow = st.box ? 0 : st.glow;
  const r = { op: 1, dx: 0, dy: 0, sc: 1, blur: glow, lt, f };
  const [SX, SY] = slideDist(state.canvas);
  if (lt < f.inDur) {
    const p = lt / f.inDur;
    const fi = fadeInOf(f); if (fi) r.op *= clamp(lt / fi, 0, 1);
    if (f.i === 'pop') r.sc = p < .65 ? lerp(.6, 1.08, p / .65) : lerp(1.08, 1, (p - .65) / .35);
    else if (f.i === 'zoomOut') r.sc = lerp(1.4, 1, Math.pow(p, .5));
    else if (SLIDE_IN[f.i]) { const [vx, vy] = SLIDE_IN[f.i]; r.dx = lerp(vx * SX, 0, p); r.dy = lerp(vy * SY, 0, p); }
    else if (f.i === 'blurIn') r.blur = lerp(16, glow, p);
  }
  const os = f.d - f.outDur;
  if (f.outDur && lt >= os) {
    const p = (lt - os) / f.outDur;
    r.op *= 1 - p;
    if (f.o === 'zoomIn') r.sc *= lerp(1, 1.3, p * p);
    else if (f.o === 'shrink') r.sc *= lerp(1, .6, p * p);
    else if (f.o === 'blurOut') r.blur = lerp(glow, 16, p);
    else if (SLIDE_OUT[f.o]) { const [vx, vy] = SLIDE_OUT[f.o]; r.dx = lerp(0, vx * SX, p); r.dy = lerp(0, vy * SY, p); }
  }
  return r;
}

/* ---------- 미리보기 렌더 ---------- */
const hexA = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; };
function textCss(st) {
  const o = st.opacity / 100;
  const css = [`font-family:${fontStack(st.font)}`, `font-size:${st.size}px`, `font-weight:${st.weight}`,
    `font-style:${st.italic ? 'italic' : 'normal'}`, `text-decoration:${st.underline ? 'underline' : 'none'}`,
    `letter-spacing:${st.spacing}px`, `color:${hexA(st.color, o)}`];
  const sh = [];
  if (!st.box) {
    if (st.outline > 0) css.push(`-webkit-text-stroke:${st.outline * 2}px ${hexA(st.outlineColor, o)}`);
    if (st.glow > 0) { sh.push(`0 0 ${st.glow * 1.5}px ${hexA(st.outlineColor, o)}`, `0 0 ${st.glow * 3}px ${hexA(st.outlineColor, o * .8)}`); }
    if (st.shadow > 0) sh.push(`${st.shadow}px ${st.shadow}px 0 ${hexA(st.shadowColor, o * st.shadowOpacity / 100)}`);
  }
  if (sh.length) css.push(`text-shadow:${sh.join(',')}`);
  return css.join(';');
}
function lineHtml(l, fr) {
  const st = l.style, f = fr.f, tk = tokens(l.text);
  const n = tk.filter(x => !x.nl).length;
  const ct = charTimes(f, n);
  const kara = f.emph === 'karaoke' ? karaokeTimes(f, n) : null;
  let karaAcc = kara ? kara.ks : 0;
  let i = 0, html = '';
  for (const t of tk) {
    if (t.nl) { html += '\n'; continue; }
    let s = '';
    if (kara) {
      const end = karaAcc + kara.per[i] * 10, mid = karaAcc + kara.per[i] * 5;
      karaAcc = end;
      s += `color:${hexA(fr.lt >= mid ? st.karaokeColor : st.color, st.opacity / 100)};`;
    } else if (t.hl) s += `color:${hexA(st.hlColor, st.opacity / 100)};`;
    if (ct) { const a = clamp((fr.lt - ct.at(i)) / ct.len, 0, 1); if (a < 1) s += `opacity:${a};`; }
    html += s ? `<span style="${s}">${esc(t.c)}</span>` : esc(t.c);
    i++;
  }
  if (st.box) {
    const bg = hexA(st.boxColor, st.boxOpacity / 100);
    html = `<span class="bx" style="background:${bg};padding:${st.boxPad * .35}px ${st.boxPad}px;">${html}</span>`;
  }
  return html;
}
const layer = $('#layer'), stage = $('#stage');
let scale = 1;
function layout() {
  const box = $('#stageBox'); const W = state.canvas.w, H = state.canvas.h;
  const narrow = window.innerWidth <= 960;
  const maxW = box.clientWidth, maxH = narrow ? window.innerHeight * .55 : Math.max(180, window.innerHeight * .5);
  scale = Math.min(maxW / W, maxH / H);
  stage.style.width = Math.round(W * scale) + 'px'; stage.style.height = Math.round(H * scale) + 'px';
  layer.style.width = W + 'px'; layer.style.height = H + 'px'; layer.style.transform = `scale(${scale})`;
  draw(true);
}
let lastKey = '';
function draw(force) {
  const t = now();
  const parts = [];
  if ($('#safeTog').checked) {
    const W = state.canvas.w, H = state.canvas.h;
    parts.push(`<div class="safe" style="left:${W * .05}px;top:${H * .05}px;width:${W * .9}px;height:${H * .9}px"></div>`,
      `<div class="safe" style="left:${W * .1}px;top:${H * .1}px;width:${W * .8}px;height:${H * .8}px;opacity:.6"></div>`);
  }
  for (const l of state.lines) {
    const fr = frame(l, t); if (!fr) continue;
    const st = l.style; const [x, y, col, row] = anchorXY(st, state.canvas);
    const tx = ['0%', '-50%', '-100%'][col], ty = ['0%', '-50%', '-100%'][row];
    const ta = ['left', 'center', 'right'][col];
    const extra = fr.blur - (st.box ? 0 : st.glow);
    const filter = extra > .05 ? `filter:blur(${extra * .9}px);` : '';
    const inner = `<div class="in" style="${textCss(st)};text-align:${ta};transform:translate(${tx},${ty});${filter}">${lineHtml(l, fr)}</div>`;
    parts.push(`<div class="sub${state.sel.has(l.id) ? ' sel' : ''}" data-id="${l.id}" style="opacity:${fr.op};transform:translate(${x + fr.dx}px,${y + fr.dy}px) rotate(${st.rotate}deg) scale(${fr.sc})">${inner}</div>`);
  }
  const html = parts.join('');
  if (force || html !== lastKey) { layer.innerHTML = html; lastKey = html; }
  updateTransport(t);
}

/* ---------- 재생 ---------- */
const video = $('#bgVideo');
let hasVideo = false, playing = false, clockT = 0, lastTs = 0;
const totalDur = () => Math.max(hasVideo && video.duration ? video.duration * 1000 : 0, ...state.lines.map(l => l.end), 1000) ;
function now() { return hasVideo ? video.currentTime * 1000 : clockT; }
function seek(ms) {
  ms = clamp(ms, 0, totalDur());
  if (hasVideo) video.currentTime = ms / 1000; else clockT = ms;
  draw();
}
function setPlaying(p) {
  playing = p;
  if (hasVideo) { p ? video.play().catch(() => {}) : video.pause(); }
  $('#bPlay').innerHTML = p ? '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6zm8 0h4v16h-4z"/></svg>' : '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4v16l13-8z"/></svg>';
  $('#bPlay').setAttribute('aria-label', p ? '일시정지' : '재생');
  lastTs = performance.now();
}
function loopLine() {
  if (!$('#loopSel').checked || !state.sel.size) return null;
  const ls = state.lines.filter(l => state.sel.has(l.id));
  return { start: Math.min(...ls.map(l => l.start)), end: Math.max(...ls.map(l => l.end)) };
}
function tick(ts) {
  if (playing) {
    const dt = ts - lastTs; lastTs = ts;
    const lp = loopLine();
    if (!hasVideo) {
      clockT += dt;
      if (lp && (clockT >= lp.end + 300 || clockT < lp.start - 200)) clockT = lp.start - 150;
      if (!lp && clockT >= totalDur()) { clockT = totalDur(); setPlaying(false); }
    } else if (lp && (video.currentTime * 1000 >= lp.end + 300)) video.currentTime = Math.max(0, lp.start - 150) / 1000;
    if (hasVideo && video.ended) setPlaying(false);
    draw();
    markActive();
  }
  requestAnimationFrame(tick);
}
let tcLast = '';
function updateTransport(t) {
  const d = totalDur();
  const s = `<b>${fmtSrt(t).replace(',', '.')}</b> / ${fmtSrt(d).slice(0, 8)}`;
  if (s !== tcLast) { $('#tc').innerHTML = s; tcLast = s; }
  if (!scrubbing) $('#scrub').value = Math.round(t / d * 1000);
}
let scrubbing = false;
$('#scrub').addEventListener('input', e => { scrubbing = true; seek(e.target.value / 1000 * totalDur()); markActive(); });
$('#scrub').addEventListener('change', () => { scrubbing = false; });
$('#bPlay').onclick = () => setPlaying(!playing);
let activeId = null;
function markActive() {
  const t = now();
  const a = state.lines.find(l => t >= l.start && t < l.end);
  const id = a ? a.id : null;
  if (id === activeId) return;
  $$('.row.active').forEach(r => r.classList.remove('active'));
  activeId = id;
  if (id != null) {
    const r = $(`.row[data-id="${id}"]`); if (r) { r.classList.add('active'); if (playing) r.scrollIntoView({ block: 'nearest' }); }
  }
}

/* ---------- 줄 목록 ---------- */
function chipsHtml(l) {
  const f = l.fx;
  const fx = [f.in !== 'none' ? fxName(IN_FX, f.in).split(' ')[0] : null, f.emph !== 'none' ? '노래방' : null, f.out !== 'none' ? fxName(OUT_FX, f.out).split(' ')[0] + ' 아웃' : null].filter(Boolean).join(' · ') || '효과 없음';
  return `<span class="chip">${esc(l.style.font)} ${l.style.size}</span><span class="chip fx">${esc(fx)}</span>`;
}
function rowHtml(l, idx) {
  const s = state.sel.has(l.id);
  return `<div class="row${s ? ' selected' : ''}${activeId === l.id ? ' active' : ''}" data-id="${l.id}">
    <input type="checkbox" ${s ? 'checked' : ''} aria-label="${idx + 1}번 줄 선택">
    <div class="num">${String(idx + 1).padStart(3, '0')}</div>
    <div class="times"><input data-t="start" value="${fmtSrt(l.start)}" aria-label="시작"><input data-t="end" value="${fmtSrt(l.end)}" aria-label="끝"></div>
    <textarea rows="1" spellcheck="false" aria-label="자막 내용">${esc(l.text)}</textarea>
    <div class="chips">${chipsHtml(l)}</div></div>`;
}
function renderList() {
  state.lines.sort((a, b) => a.start - b.start);
  $('#list').innerHTML = state.lines.map(rowHtml).join('') || '<div class="empty-insp">SRT 파일을 불러오거나 이 창에 끌어다 놓으세요.</div>';
  $$('#list textarea').forEach(autoGrow);
  updateCount();
}
function updateRow(id) {
  const l = state.lines.find(x => x.id === id), r = $(`.row[data-id="${id}"]`);
  if (!l || !r) return;
  r.classList.toggle('selected', state.sel.has(id));
  r.querySelector('input[type=checkbox]').checked = state.sel.has(id);
  r.querySelector('.chips').innerHTML = chipsHtml(l);
}
function updateCount() {
  $('#count').innerHTML = `<b>${state.lines.length}</b>줄 · 선택 <b>${state.sel.size}</b>`;
}
const autoGrow = ta => { ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 'px'; };
function select(id, mode) {
  const ids = state.lines.map(l => l.id);
  if (mode === 'range' && state.anchor != null) {
    const a = ids.indexOf(state.anchor), b = ids.indexOf(id);
    const [x, y] = a < b ? [a, b] : [b, a];
    state.sel = new Set(ids.slice(x, y + 1));
  } else if (mode === 'toggle') {
    state.sel.has(id) ? state.sel.delete(id) : state.sel.add(id); state.anchor = id;
  } else { state.sel = new Set([id]); state.anchor = id; }
  $$('.row').forEach(r => { const i = +r.dataset.id; r.classList.toggle('selected', state.sel.has(i)); r.querySelector('input[type=checkbox]').checked = state.sel.has(i); });
  updateCount(); renderInsp(); draw(true);
}
function previewLine(l) {
  const f = effFx(l);
  seek(l.start + Math.min(f.inDur + 60, f.d / 2));
}
$('#list').addEventListener('click', e => {
  const r = e.target.closest('.row'); if (!r) return;
  const id = +r.dataset.id;
  if (e.target.matches('input[type=checkbox]')) { select(id, e.shiftKey ? 'range' : 'toggle'); return; }
  if (e.target.matches('textarea,input')) { if (!state.sel.has(id) || state.sel.size > 1 && !e.shiftKey && !(e.metaKey || e.ctrlKey)) select(id, e.shiftKey ? 'range' : (e.metaKey || e.ctrlKey) ? 'toggle' : 'one'); previewLine(state.lines.find(l => l.id === id)); return; }
  select(id, e.shiftKey ? 'range' : (e.metaKey || e.ctrlKey) ? 'toggle' : 'one');
  previewLine(state.lines.find(l => l.id === id));
});
$('#list').addEventListener('input', e => {
  const r = e.target.closest('.row'); if (!r) return;
  const l = state.lines.find(x => x.id === +r.dataset.id);
  if (e.target.matches('textarea')) { l.text = e.target.value; autoGrow(e.target); draw(); commit(); }
});
$('#list').addEventListener('change', e => {
  const r = e.target.closest('.row'); if (!r || !e.target.dataset.t) return;
  const l = state.lines.find(x => x.id === +r.dataset.id);
  const v = parseTime(e.target.value);
  if (v == null) { e.target.value = fmtSrt(l[e.target.dataset.t]); toast('시간 형식은 00:00:01,000 처럼 써 주세요'); return; }
  l[e.target.dataset.t] = v;
  if (l.end <= l.start) l.end = l.start + 500;
  renderList(); draw(); commit(true);
});
$('#bSelAll').onclick = () => {
  if (state.sel.size === state.lines.length) state.sel.clear(); else state.sel = new Set(state.lines.map(l => l.id));
  $$('.row').forEach(r => { const i = +r.dataset.id; r.classList.toggle('selected', state.sel.has(i)); r.querySelector('input[type=checkbox]').checked = state.sel.has(i); });
  $('#bSelAll').textContent = state.sel.size === state.lines.length ? '선택 해제' : '전체 선택';
  updateCount(); renderInsp(); draw(true);
};
$('#bAdd').onclick = () => {
  const ref = state.lines.filter(l => state.sel.has(l.id)).pop() || state.lines[state.lines.length - 1];
  const start = ref ? ref.end + 100 : Math.round(now());
  const l = mkLine(start, start + 2000, '새 자막', ref ? ref.style : null, ref ? ref.fx : null);
  state.lines.push(l); state.sel = new Set([l.id]); state.anchor = l.id;
  renderList(); renderInsp(); previewLine(l); commit(true);
  const ta = $(`.row[data-id="${l.id}"] textarea`); if (ta) { ta.focus(); ta.select(); }
};
$('#bDel').onclick = () => {
  if (!state.sel.size) { toast('지울 줄을 먼저 선택하세요'); return; }
  const n = state.sel.size;
  state.lines = state.lines.filter(l => !state.sel.has(l.id)); state.sel.clear();
  renderList(); renderInsp(); draw(true); commit(true); toast(`${n}줄을 지웠어요. 되돌리기로 복구할 수 있어요`);
};
$('#bUndo').onclick = undo;

/* ---------- 속성 패널 ---------- */
const TABS = [['font', '글꼴'], ['color', '색·외곽선'], ['pos', '위치'], ['fx', '효과'], ['preset', '프리셋']];
function selLines() { return state.lines.filter(l => state.sel.has(l.id)); }
function rangeField(g, k, label, min, max, step, v, unit) {
  return `<div class="f"><label for="r_${k}">${label}</label><input type="range" id="r_${k}" data-g="${g}" data-k="${k}" min="${min}" max="${max}" step="${step || 1}" value="${v}"><input class="n" type="number" data-g="${g}" data-k="${k}" min="${min}" max="${max}" step="${step || 1}" value="${v}" aria-label="${label} 값${unit ? ' (' + unit + ')' : ''}"></div>`;
}
function colorField(k, label, v) {
  return `<div class="f c2"><label>${label}</label><div class="colorbox"><input type="color" data-g="style" data-k="${k}" value="${v.toLowerCase()}" aria-label="${label}"><input type="text" data-g="style" data-k="${k}" data-hex="1" value="${v.toUpperCase()}" maxlength="7" aria-label="${label} 코드"></div></div>`;
}
function selectField(g, k, label, opts, v) {
  return `<div class="f c2"><label for="s_${k}">${label}</label><select id="s_${k}" data-g="${g}" data-k="${k}">${opts.map(([a, b]) => `<option value="${a}"${String(a) === String(v) ? ' selected' : ''}>${esc(b)}</option>`).join('')}</select></div>`;
}
function renderInsp() {
  const ls = selLines(), el = $('#insp');
  const head = `<div class="insp-head"><h2>${ls.length ? (ls.length === 1 ? `${state.lines.indexOf(ls[0]) + 1}번 줄 편집` : `${ls.length}줄 한꺼번에 편집`) : '줄을 선택하세요'}</h2>
    <p>${ls.length > 1 ? '바꾸는 항목만 선택한 모든 줄에 적용돼요.' : ls.length ? 'Shift·Ctrl 클릭으로 여러 줄을 함께 고를 수 있어요.' : '왼쪽 목록에서 자막 줄을 클릭하세요.'}</p>
    <div class="tabs" role="tablist">${TABS.map(([k, n]) => `<button role="tab" data-tab="${k}" aria-selected="${state.tab === k}">${n}</button>`).join('')}</div></div>`;
  if (!ls.length) { el.innerHTML = head + `<div class="empty-insp">선택한 줄이 없어요. 목록에서 한 줄을 고르거나 <b>전체 선택</b>을 누르면 모든 줄에 같은 스타일을 입힐 수 있어요.</div>`; bindTabs(); return; }
  const st = ls[0].style, fx = ls[0].fx;
  let body = '';
  if (state.tab === 'font') {
    const fi = fontInfo(st.font);
    body = `<div class="grp"><h3>글꼴</h3>
      <button class="fontbtn" id="bFont" style="font-family:${fontStack(st.font)};font-weight:${st.weight}">${esc(st.font)} <small>${esc(fi.cat)} · 바꾸기</small></button>
      ${selectField('style', 'weight', '굵기', fi.w.map(w => [w, ({ 100: 'Thin 100', 200: 'ExtraLight 200', 300: 'Light 300', 400: 'Regular 400', 500: 'Medium 500', 600: 'SemiBold 600', 700: 'Bold 700', 800: 'ExtraBold 800', 900: 'Black 900' })[w]]), fi.w.includes(+st.weight) ? st.weight : fi.w[0])}
      ${rangeField('style', 'size', '크기', 16, 220, 1, st.size, 'px')}
      ${rangeField('style', 'spacing', '자간', -10, 40, 1, st.spacing, 'px')}
      <div class="chk"><label><input type="checkbox" data-g="style" data-k="italic" ${st.italic ? 'checked' : ''}>기울임</label><label><input type="checkbox" data-g="style" data-k="underline" ${st.underline ? 'checked' : ''}>밑줄</label></div></div>
      <div class="grp"><h3>강조 표시</h3><p class="hint">자막 글에서 <code>*이렇게*</code> 별표로 감싼 부분만 다른 색으로 나와요.</p>${colorField('hlColor', '강조 색', st.hlColor)}</div>`;
  } else if (state.tab === 'color') {
    body = `<div class="grp"><h3>글자</h3>${colorField('color', '글자 색', st.color)}${rangeField('style', 'opacity', '불투명도', 0, 100, 1, st.opacity, '%')}</div>
      <div class="grp"><h3>외곽선</h3>${rangeField('style', 'outline', '두께', 0, 20, .5, st.outline, 'px')}${colorField('outlineColor', '색', st.outlineColor)}${rangeField('style', 'glow', '번짐 (글로우)', 0, 20, 1, st.glow, 'px')}<p class="hint">번짐은 외곽선을 흐리게 퍼뜨려 네온처럼 보이게 해요. 외곽선 두께가 있어야 잘 보여요.</p></div>
      <div class="grp"><h3>그림자</h3>${rangeField('style', 'shadow', '거리', 0, 20, .5, st.shadow, 'px')}${colorField('shadowColor', '색', st.shadowColor)}${rangeField('style', 'shadowOpacity', '불투명도', 0, 100, 1, st.shadowOpacity, '%')}</div>
      <div class="grp"><h3>배경 박스</h3><div class="chk"><label><input type="checkbox" data-g="style" data-k="box" ${st.box ? 'checked' : ''}>글자 뒤에 박스 깔기</label></div>
      ${colorField('boxColor', '박스 색', st.boxColor)}${rangeField('style', 'boxOpacity', '불투명도', 0, 100, 1, st.boxOpacity, '%')}${rangeField('style', 'boxPad', '여백', 0, 60, 1, st.boxPad, 'px')}
      <p class="hint">박스를 켜면 외곽선·그림자·번짐은 꺼져요. ASS 형식에서 박스와 외곽선을 한 줄에 같이 쓸 수 없어서 미리보기도 똑같이 맞췄어요.</p></div>`;
  } else if (state.tab === 'pos') {
    body = `<div class="grp"><h3>기준 위치</h3><div style="display:flex;gap:14px;align-items:center"><div class="align-grid" role="group" aria-label="정렬">${[7, 8, 9, 4, 5, 6, 1, 2, 3].map(a => `<button data-align="${a}" aria-pressed="${st.align === a}" aria-label="${['', '왼쪽 아래', '가운데 아래', '오른쪽 아래', '왼쪽 가운데', '정중앙', '오른쪽 가운데', '왼쪽 위', '가운데 위', '오른쪽 위'][a]}"><i></i></button>`).join('')}</div><p class="hint">점을 눌러 화면의 어느 쪽에 붙일지 고르세요. 미리보기에서 자막을 끌어도 돼요.</p></div></div>
      <div class="grp"><h3>여백과 미세 조정</h3>${rangeField('style', 'marginH', '좌우 여백', 0, 600, 1, st.marginH, 'px')}${rangeField('style', 'marginV', '위아래 여백', 0, 600, 1, st.marginV, 'px')}
      ${rangeField('style', 'offX', '가로 이동', -1000, 1000, 1, st.offX, 'px')}${rangeField('style', 'offY', '세로 이동', -1000, 1000, 1, st.offY, 'px')}${rangeField('style', 'rotate', '회전', -45, 45, 1, st.rotate, '°')}
      <div class="sticky-actions"><button class="btn sm" id="bResetPos">이동·회전 초기화</button></div></div>`;
  } else if (state.tab === 'fx') {
    body = `<div class="grp"><h3>나타날 때</h3>${selectField('fx', 'in', '효과', IN_FX, fx.in)}${rangeField('fx', 'inDur', '길이', 0, 2000, 10, fx.inDur, 'ms')}</div>
      <div class="grp"><h3>사라질 때</h3>${selectField('fx', 'out', '효과', OUT_FX, fx.out)}${rangeField('fx', 'outDur', '길이', 0, 2000, 10, fx.outDur, 'ms')}</div>
      <div class="grp"><h3>보이는 동안</h3>${selectField('fx', 'emph', '강조', EMPH_FX, fx.emph)}${colorField('karaokeColor', '채울 색', st.karaokeColor)}<p class="hint">노래방은 줄이 떠 있는 동안 글자를 앞에서부터 채워요. 효과 길이가 자막 길이보다 길면 자동으로 줄여요. 슬라이드로 들어오고 슬라이드로 나가는 조합은 ASS가 한 줄에 이동을 한 번만 지원해서 나갈 때는 페이드로 바뀌어요.</p></div>
      <div class="sticky-actions"><button class="btn sm" id="bReplay">▶ 이 줄 효과 다시 보기</button></div>`;
  } else {
    const all = PRESETS.map((p, i) => ({ ...p, i, user: false })).concat(state.userPresets.map((p, i) => ({ ...p, i, user: true })));
    body = `<div class="grp"><h3>프리셋</h3><p class="hint">누르면 선택한 줄에 글꼴·색·위치·효과가 한 번에 들어가요.</p><div class="presets">${all.map(p => {
      const s = mkStyle(p.style);
      const pvs = textCss(Object.assign({}, s, { size: 22, spacing: s.spacing * 22 / s.size, outline: Math.min(2, s.outline * 22 / s.size), shadow: Math.min(2, s.shadow * 22 / s.size), glow: s.glow * 22 / s.size }));
      const bx = s.box ? `background:${hexA(s.boxColor, s.boxOpacity / 100)};padding:2px 8px;` : '';
      return `<button class="preset" data-preset="${p.user ? 'u' : 'b'}${p.i}"><span class="pv"><span style="${pvs};${bx}">가나다 Abc</span></span><span class="nm">${esc(p.name)}</span>${p.user ? `<span class="del" data-delpreset="${p.i}" role="button" aria-label="${esc(p.name)} 삭제">×</span>` : ''}</button>`;
    }).join('')}</div></div>
      <div class="grp"><h3>내 프리셋</h3><div class="sticky-actions"><input type="text" id="presetName" placeholder="프리셋 이름" style="flex:1;min-width:0;height:30px;border:1px solid var(--line);background:var(--panel-2);border-radius:6px;padding:0 8px;font-size:13px"><button class="btn sm" id="bSavePreset">현재 줄 스타일 저장</button></div><p class="hint">저장한 프리셋은 이 브라우저에 남고, 프로젝트 파일에도 같이 저장돼요.</p></div>`;
  }
  const foot = `<div class="grp"><h3>일괄 적용</h3><div class="sticky-actions"><button class="btn sm" id="bApplyAll">이 줄 스타일을 모든 줄에</button></div></div>`;
  el.innerHTML = head + `<div class="pane" role="tabpanel">${body}${foot}</div>`;
  bindTabs();
}
function bindTabs() { $$('#insp [data-tab]').forEach(b => b.onclick = () => { state.tab = b.dataset.tab; renderInsp(); }); }
function setProp(g, k, v) {
  for (const l of selLines()) l[g][k] = v;
  selLines().forEach(l => updateRow(l.id));
  draw(true); commit();
}
const NUM_KEYS = new Set(['size', 'weight', 'spacing', 'opacity', 'outline', 'shadow', 'shadowOpacity', 'glow', 'boxOpacity', 'boxPad', 'marginH', 'marginV', 'offX', 'offY', 'rotate', 'inDur', 'outDur']);
$('#insp').addEventListener('input', e => {
  const t = e.target, g = t.dataset.g, k = t.dataset.k; if (!g || !k) return;
  let v;
  if (t.type === 'checkbox') v = t.checked;
  else if (t.dataset.hex) { if (!/^#[0-9a-fA-F]{6}$/.test(t.value)) return; v = t.value.toUpperCase(); }
  else if (t.type === 'color') v = t.value.toUpperCase();
  else if (NUM_KEYS.has(k)) { v = parseFloat(t.value); if (isNaN(v)) return; }
  else v = t.value;
  // 짝이 되는 입력(슬라이더↔숫자, 색↔코드) 동기화
  $$(`#insp [data-g="${g}"][data-k="${k}"]`).forEach(o => { if (o !== t && o.type !== 'checkbox') o.value = (o.type === 'color') ? String(v).toLowerCase() : v; });
  setProp(g, k, v);
  if (g === 'fx' && (k === 'in' || k === 'out' || k === 'emph')) { const l = selLines()[0]; if (l) { seek(l.start); if (!playing) setPlaying(true); } }
});
$('#insp').addEventListener('change', e => { if (e.target.dataset.g) commit(true); });
$('#insp').addEventListener('click', e => {
  const t = e.target;
  const al = t.closest('[data-align]');
  if (al) { const a = +al.dataset.align; for (const l of selLines()) { l.style.align = a; l.style.offX = 0; l.style.offY = 0; } renderInsp(); draw(true); commit(true); return; }
  if (t.closest('#bFont')) { openFontPicker(); return; }
  if (t.closest('#bResetPos')) { for (const l of selLines()) { l.style.offX = 0; l.style.offY = 0; l.style.rotate = 0; } renderInsp(); draw(true); commit(true); return; }
  if (t.closest('#bReplay')) { const l = selLines()[0]; $('#loopSel').checked = true; seek(l.start - 150); setPlaying(true); return; }
  if (t.closest('#bApplyAll')) {
    const src = selLines()[0];
    for (const l of state.lines) { l.style = mkStyle(src.style); l.fx = mkFx(src.fx); if (l !== src) { l.style.offX = src.style.offX; l.style.offY = src.style.offY; } }
    renderList(); draw(true); commit(true); toast(`${state.lines.length}줄 모두에 적용했어요`); return;
  }
  const dp = t.closest('[data-delpreset]');
  if (dp) { e.stopPropagation(); state.userPresets.splice(+dp.dataset.delpreset, 1); store.set('subfx.presets', state.userPresets); renderInsp(); return; }
  const pr = t.closest('[data-preset]');
  if (pr) {
    const id = pr.dataset.preset, p = id[0] === 'b' ? PRESETS[+id.slice(1)] : state.userPresets[+id.slice(1)];
    for (const l of selLines()) { l.style = mkStyle(p.style); l.fx = mkFx(p.fx); l.style.offX = 0; l.style.offY = 0; }
    selLines().forEach(l => updateRow(l.id)); draw(true); commit(true);
    const l = selLines()[0]; seek(l.start); if (!playing) setPlaying(true);
    toast(`'${p.name}' 적용`); return;
  }
  if (t.closest('#bSavePreset')) {
    const src = selLines()[0]; const name = ($('#presetName').value || '').trim() || `내 스타일 ${state.userPresets.length + 1}`;
    const s = { ...src.style }; delete s.offX; delete s.offY;
    state.userPresets.push({ name, style: s, fx: { ...src.fx } }); store.set('subfx.presets', state.userPresets);
    renderInsp(); toast(`'${name}' 저장`);
  }
});

/* ---------- 미리보기에서 끌어서 위치 ---------- */
let drag = null;
stage.addEventListener('pointerdown', e => {
  const s = e.target.closest('.sub'); if (!s) return;
  const id = +s.dataset.id;
  if (!state.sel.has(id)) select(id, 'one');
  const ls = selLines();
  drag = { x: e.clientX, y: e.clientY, base: ls.map(l => [l, l.style.offX, l.style.offY]) };
  stage.setPointerCapture(e.pointerId); s.classList.add('dragging');
  e.preventDefault();
});
stage.addEventListener('pointermove', e => {
  if (!drag) return;
  const dx = (e.clientX - drag.x) / scale, dy = (e.clientY - drag.y) / scale;
  for (const [l, ox, oy] of drag.base) { l.style.offX = Math.round(ox + dx); l.style.offY = Math.round(oy + dy); }
  draw(true);
});
const endDrag = () => { if (!drag) return; drag = null; commit(true); if (state.tab === 'pos') renderInsp(); };
stage.addEventListener('pointerup', endDrag); stage.addEventListener('pointercancel', endDrag);

/* ---------- 폰트 선택 창 ---------- */
let customFonts = [];
function openFontPicker() {
  const cur = selLines()[0]?.style.font;
  const sample = (selLines()[0] ? plain(selLines()[0].text).split('\n')[0] : '') || '자막의 첫인상은 글꼴';
  let cat = '전체', q = '';
  const all = () => FONTS.concat(customFonts.map(n => fontInfo(n)));
  const root = $('#modalRoot');
  root.innerHTML = `<div class="modal" id="fm"><div class="dlg" role="dialog" aria-label="글꼴 고르기">
    <header><h2>글꼴 고르기</h2><button class="btn sm" id="fmAdd">내 폰트 파일 추가</button><button class="btn sm ghost" id="fmClose">닫기</button></header>
    <div class="filters">${FONT_CATS.map(c => `<button data-cat="${c}" aria-pressed="${c === cat}">${c}</button>`).join('')}<input type="text" id="fmQ" placeholder="이름으로 찾기"></div>
    <div class="body"><div class="fgrid" id="fmGrid"></div></div>
    <footer>기본 제공 ${FONTS.length}종은 모두 SIL 오픈 폰트 라이선스(OFL 1.1)라 유튜브·상업 영상에 무료로 쓸 수 있고, 폰트 파일 자체만 따로 파는 것은 금지예요. 영상에 입히려면(ASS 렌더) 같은 폰트가 컴퓨터에 설치돼 있어야 해서 각 카드의 <b>받기</b> 링크를 남겨 뒀어요.</footer></div></div>`;
  const grid = $('#fmGrid');
  const paint = () => {
    const list = all().filter(f => (cat === '전체' || f.cat === cat) && (!q || f.name.toLowerCase().includes(q.toLowerCase())));
    grid.innerHTML = list.map(f => `<button class="fitem${f.name === cur ? ' on' : ''}" data-font="${esc(f.name)}">
      <span class="sample" style="font-family:${fontStack(f.name)};font-weight:${f.w.includes(700) ? 700 : f.w[0]}">${esc(sample)}</span>
      <span class="meta"><b>${esc(f.name)}</b><span>${esc(f.cat)}</span><span class="lic">${f.custom ? '내 파일' : 'OFL'}</span></span>
      ${f.custom ? '' : `<span class="meta"><span>${esc(f.by)} · ${f.w.length > 1 ? f.w.length + '가지 굵기' : '단일 굵기'}</span><a href="${f.link || GF + f.name.replace(/ /g, '+')}" target="_blank" rel="noopener">받기 ↗</a></span>`}</button>`).join('') || '<p class="hint">찾는 글꼴이 없어요.</p>';
  };
  paint();
  const close = () => { root.innerHTML = ''; };
  $('#fmClose').onclick = close;
  $('#fm').addEventListener('click', e => {
    if (e.target.id === 'fm') return close();
    if (e.target.closest('a')) return;
    const c = e.target.closest('[data-cat]'); if (c) { cat = c.dataset.cat; $$('[data-cat]').forEach(b => b.setAttribute('aria-pressed', b === c)); paint(); return; }
    const f = e.target.closest('[data-font]');
    if (f) {
      const fi = fontInfo(f.dataset.font);
      for (const l of selLines()) { l.style.font = fi.name; if (!fi.w.includes(+l.style.weight)) l.style.weight = fi.w.reduce((a, b) => Math.abs(b - l.style.weight) < Math.abs(a - l.style.weight) ? b : a); updateRow(l.id); }
      close(); renderInsp(); draw(true); commit(true);
    }
  });
  $('#fmQ').addEventListener('input', e => { q = e.target.value; paint(); });
  $('#fmAdd').onclick = () => $('#fileFont').click();
  document.addEventListener('keydown', function k(e) { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', k); } });
}
$('#fileFont').addEventListener('change', async e => {
  const file = e.target.files[0]; if (!file) return;
  const name = file.name.replace(/\.(ttf|otf|woff2?)$/i, '');
  try {
    const ff = new FontFace(name, await file.arrayBuffer()); await ff.load(); document.fonts.add(ff);
    if (!customFonts.includes(name)) customFonts.push(name);
    toast(`'${name}' 추가. ASS에는 이 이름으로 들어가니 설치된 폰트 이름과 같은지 확인하세요`);
    if ($('#fm')) openFontPicker();
  } catch { toast('이 파일은 폰트로 읽을 수 없어요'); }
  e.target.value = '';
});

/* ---------- 내보내기 ---------- */
const metricCache = {};
async function fontRatio(st) {
  const key = st.font + '|' + st.weight;
  if (metricCache[key]) return metricCache[key];
  try { await document.fonts.load(`${st.weight} 100px ${fontStack(st.font)}`, '가A'); } catch {}
  const c = document.createElement('canvas').getContext('2d');
  c.font = `${st.weight} 100px ${fontStack(st.font)}`;
  const m = c.measureText('가Ag');
  let r = (m.fontBoundingBoxAscent && m.fontBoundingBoxDescent) ? (m.fontBoundingBoxAscent + m.fontBoundingBoxDescent) / 100 : 1.2;
  if (!(r > .8 && r < 2)) r = 1.2;
  return (metricCache[key] = r);
}
const assCol = (hex, opacity) => { const a = Math.round((1 - clamp(opacity, 0, 1)) * 255); return '&H' + [a, parseInt(hex.slice(5, 7), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(1, 3), 16)].map(x => x.toString(16).toUpperCase().padStart(2, '0')).join('') + '&'; };
const assC = hex => '&H' + hex.slice(5, 7) + hex.slice(3, 5) + hex.slice(1, 3) + '&';
const assA = op => '&H' + Math.round((1 - clamp(op, 0, 1)) * 255).toString(16).toUpperCase().padStart(2, '0') + '&';
const assEscape = c => c === '{' ? '(' : c === '}' ? ')' : c === '\\' ? '＼' : c;

async function buildAss() {
  const cv = state.canvas, styles = new Map(), events = [];
  for (const l of [...state.lines].sort((a, b) => a.start - b.start)) {
    const st = l.style, f = effFx(l), o = st.opacity / 100;
    const kara = f.emph === 'karaoke';
    const fs = Math.round(st.size * await fontRatio(st));
    const prim = assCol(kara ? st.karaokeColor : st.color, o), sec = assCol(st.color, o);
    const outC = st.box ? assCol(st.boxColor, st.boxOpacity / 100) : assCol(st.outlineColor, o);
    const backC = st.box ? assCol(st.boxColor, st.boxOpacity / 100) : assCol(st.shadowColor, o * st.shadowOpacity / 100);
    const def = [st.font.replace(/,/g, ' '), fs, prim, sec, outC, backC, st.weight >= 600 ? -1 : 0, st.italic ? -1 : 0, st.underline ? -1 : 0, 0, 100, 100, st.spacing, -st.rotate,
      st.box ? 3 : 1, st.box ? st.boxPad : st.outline, st.box ? 0 : st.shadow, st.align, 0, 0, 0, 1].join(',');
    if (!styles.has(def)) styles.set(def, 'S' + (styles.size + 1));
    const sname = styles.get(def);

    const [x, y] = anchorXY(st, cv); const [SX, SY] = slideDist(cv);
    const tg = [];
    if (SLIDE_IN[f.i] && f.inDur) { const [vx, vy] = SLIDE_IN[f.i]; tg.push(`\\move(${x + vx * SX},${y + vy * SY},${x},${y},0,${f.inDur})`); }
    else if (SLIDE_OUT[f.o] && f.outDur) { const [vx, vy] = SLIDE_OUT[f.o]; tg.push(`\\move(${x},${y},${x + vx * SX},${y + vy * SY},${f.d - f.outDur},${f.d})`); }
    else tg.push(`\\pos(${x},${y})`);
    if (![400, 700].includes(+st.weight)) tg.push(`\\b${st.weight}`);
    const fi = fadeInOf(f), fo = f.outDur;
    if (fi || fo) tg.push(`\\fad(${fi},${fo})`);
    const g = st.box ? 0 : st.glow;
    if (f.i === 'blurIn' && f.inDur) tg.push(`\\blur16\\t(0,${f.inDur},\\blur${g})`); else if (g) tg.push(`\\blur${g}`);
    if (f.o === 'blurOut' && f.outDur) tg.push(`\\t(${f.d - f.outDur},${f.d},\\blur16)`);
    if (f.i === 'pop' && f.inDur) { const a = Math.round(f.inDur * .65); tg.push(`\\fscx60\\fscy60\\t(0,${a},\\fscx108\\fscy108)\\t(${a},${f.inDur},\\fscx100\\fscy100)`); }
    if (f.i === 'zoomOut' && f.inDur) tg.push(`\\fscx140\\fscy140\\t(0,${f.inDur},0.5,\\fscx100\\fscy100)`);
    if (f.o === 'zoomIn' && f.outDur) tg.push(`\\t(${f.d - f.outDur},${f.d},2,\\fscx130\\fscy130)`);
    if (f.o === 'shrink' && f.outDur) tg.push(`\\t(${f.d - f.outDur},${f.d},2,\\fscx60\\fscy60)`);

    const tk = tokens(l.text), n = tk.filter(t => !t.nl).length;
    const ct = f.inDur ? charTimes(f, n) : null;
    const kt = kara ? karaokeTimes(f, n) : null;
    const baseC = assC(st.color), hlC = assC(st.hlColor);
    const a1 = assA(o), a3 = st.box ? assA(st.boxOpacity / 100) : assA(o), a4 = st.box ? assA(st.boxOpacity / 100) : assA(o * st.shadowOpacity / 100);
    let body = kt && kt.ks >= 10 ? `{\\k${Math.round(kt.ks / 10)}}` : '';
    let curHl = false, i = 0;
    for (const t of tk) {
      if (t.nl) { body += '\\N'; continue; }
      let ov = '';
      if (!kara && t.hl !== curHl) { ov += `\\1c${t.hl ? hlC : baseC}`; curHl = t.hl; }
      if (ct) { const at = Math.round(ct.at(i)), en = Math.round(at + ct.len); ov += `\\1a&HFF&\\3a&HFF&\\4a&HFF&\\t(${at},${en},\\1a${a1}\\3a${a3}\\4a${a4})`; }
      if (kt) ov += `\\kf${kt.per[i]}`;
      body += (ov ? `{${ov}}` : '') + assEscape(t.c);
      i++;
    }
    events.push(`Dialogue: 0,${fmtAss(l.start)},${fmtAss(l.end)},${sname},,0,0,0,,{${tg.join('')}}${body}`);
  }
  return `[Script Info]
; 자막 이펙터로 만든 파일
Title: ${state.name}
ScriptType: v4.00+
PlayResX: ${cv.w}
PlayResY: ${cv.h}
WrapStyle: 2
ScaledBorderAndShadow: yes
YCbCr Matrix: TV.709

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
${[...styles].map(([d, n]) => `Style: ${n},${d}`).join('\n')}

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
${events.join('\n')}
`;
}
/* ---------- 효과 담은 SRT ----------
 * 보이는 자막 줄은 그대로 두고, 맨 끝에 99시간 지점의 숨은 줄 하나에 효과 정보를 압축해 넣는다.
 * 영상 길이를 넘는 시간이라 다른 프로그램에서는 화면에 나오지 않고, 이 앱으로 다시 열면 그대로 복원된다. */
const FX_TAG = 'SUBFX1:', FX_TAG_RAW = 'SUBFX0:';
const b64 = u8 => { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); };
const unb64 = str => Uint8Array.from(atob(str), c => c.charCodeAt(0));
async function streamBytes(u8, Kind, mode) { const st = new Blob([u8]).stream().pipeThrough(new Kind(mode)); return new Uint8Array(await new Response(st).arrayBuffer()); }
function diff(obj, base) { const o = {}; for (const k in obj) if (obj[k] !== base[k]) o[k] = obj[k]; return o; }
async function encodeFx(lines) {
  const data = { v: 1, name: state.name, canvas: state.canvas, lines: lines.map(l => {
    const o = { s: diff(l.style, DEFAULT_STYLE), f: diff(l.fx, DEFAULT_FX) };
    if (l.text !== plain(l.text)) o.t = l.text;
    return o;
  }) };
  const raw = new TextEncoder().encode(JSON.stringify(data));
  if (typeof CompressionStream === 'function') { try { return FX_TAG + b64(await streamBytes(raw, CompressionStream, 'gzip')); } catch {} }
  return FX_TAG_RAW + b64(raw);
}
async function decodeFx(str) {
  str = str.replace(/\s+/g, '');
  const gz = str.startsWith(FX_TAG), body = str.slice(FX_TAG.length);
  let bytes = unb64(body);
  if (gz) bytes = await streamBytes(bytes, DecompressionStream, 'gzip');
  return JSON.parse(new TextDecoder().decode(bytes));
}
async function buildFxSrt(withTags) {
  const lines = [...state.lines].sort((a, b) => a.start - b.start);
  const body = buildSrt(!withTags);
  return body + `\n${lines.length + 1}\n99:00:00,000 --> 99:00:01,000\n${await encodeFx(lines)}\n`;
}
function buildSrt(plainOnly) {
  return [...state.lines].sort((a, b) => a.start - b.start).map((l, i) => {
    const st = l.style; let txt;
    if (plainOnly) txt = plain(l.text);
    else {
      txt = ''; let hl = false;
      for (const c of Array.from(l.text)) {
        if (c === '*') { hl = !hl; txt += hl ? `<font color="${st.hlColor}">` : '</font>'; continue; }
        txt += c === '<' ? '‹' : c === '>' ? '›' : c;
      }
      if (hl) txt += '</font>';
      txt = txt.replace(/<font color="[^"]+"><\/font>/g, '');
      if (st.underline) txt = `<u>${txt}</u>`;
      if (st.italic) txt = `<i>${txt}</i>`;
      if (st.weight >= 600) txt = `<b>${txt}</b>`;
      txt = `<font face="${st.font}" color="${st.color}">${txt}</font>`;
      if (st.align !== 2) txt = `{\\an${st.align}}` + txt;
    }
    return `${i + 1}\n${fmtSrt(l.start)} --> ${fmtSrt(l.end)}\n${txt}\n`;
  }).join('\n');
}
const buildProject = () => JSON.stringify({ app: 'subtitle-fx', version: 1, name: state.name, canvas: state.canvas, presets: state.userPresets, lines: state.lines }, null, 2);

async function saveFile(name, text) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  let dl = null;
  try { dl = window.claude && window.claude.use ? await window.claude.use('downloads') : null; } catch { dl = null; }
  if (dl) {
    try { await dl.save({ filename: name, data: text }); toast(`${name} 저장`); return; }
    catch (err) {
      if (err && err.code === 'rejected_extension') {
        try { await dl.save({ filename: name + '.txt', data: text }); toast(`이 화면에서는 .txt로만 저장돼요. 파일 이름 끝의 .txt를 지우면 ${name}이 돼요`, 6000); return; }
        catch (e2) { if (e2 && e2.code === 'declined') return; }
      } else if (err && err.code === 'declined') return;
    }
  }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  toast(`${name} 저장`);
}
async function copyText(text) {
  try { await navigator.clipboard.writeText(text); toast('복사했어요'); }
  catch { const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); toast('복사했어요'); } catch { toast('복사하지 못했어요'); } ta.remove(); }
}
function openExport() {
  const base = (state.name || '자막').replace(/[\\/:*?"<>|]/g, '_');
  const fontsUsed = [...new Set(state.lines.map(l => l.style.font))];
  $('#modalRoot').innerHTML = `<div class="modal" id="em"><div class="dlg" role="dialog" aria-label="내보내기">
    <header><h2>저장하기</h2><input type="text" id="expName" value="${esc(base)}" aria-label="파일 이름" style="height:30px;border:1px solid var(--line);background:var(--panel-2);border-radius:6px;padding:0 8px;width:160px"><button class="btn sm ghost" id="emClose">닫기</button></header>
    <div></div>
    <div class="body"><div class="exp">
      <div class="ecard"><h3>SRT <span class="tag">기본</span></h3><ul><li>자막 글자와 시간은 보통 SRT 그대로</li><li>효과 정보는 파일 맨 끝 숨은 줄에 들어가서, 이 앱으로 다시 열면 그대로 복원돼요</li><li>다른 프로그램에선 효과 없이 글자만 보여요</li></ul><label class="toggle"><input type="checkbox" id="srtTags" ${store.get('subfx.srtTags') ? 'checked' : ''}>다른 플레이어용 색·굵기·위치 태그도 넣기</label><div class="row-b"><button class="btn sm primary" data-exp="fxsrt">.srt 저장</button><button class="btn sm" data-copy="fxsrt">복사</button></div></div>
      <div class="ecard"><h3>ASS</h3><ul><li>효과가 실제로 보이는 자막 형식</li><li>VLC·mpv·팟플레이어에서 재생, Aegisub·ffmpeg로 영상에 입히기</li><li>캡컷·프리미어·유튜브는 효과를 읽지 못해요</li></ul><div class="row-b"><button class="btn sm" data-exp="ass">.ass 저장</button><button class="btn sm" data-copy="ass">복사</button></div></div>
      <div class="ecard"><h3>프로젝트 파일</h3><ul><li>지금 상태를 그대로 저장 (JSON)</li><li>나중에 <b>프로젝트 열기</b>로 이어서 편집</li><li>내 프리셋도 같이 들어가요</li></ul><div class="row-b"><button class="btn sm" data-exp="json">.json 저장</button></div></div>
    </div>
    <div class="notes">
      <div><b style="color:var(--fg)">이 자막에 쓰인 글꼴:</b> ${fontsUsed.map(esc).join(', ')}. ASS는 글꼴을 파일 안에 넣지 않아서, 재생하거나 입히는 컴퓨터에 같은 글꼴이 설치돼 있어야 해요.</div>
      <div><b style="color:var(--fg)">영상에 입히기 (ffmpeg):</b> 글꼴 파일을 <code>fonts</code> 폴더에 모아 두고</div>
      <pre>ffmpeg -i 원본.mp4 -vf "ass=${esc(base)}.ass:fontsdir=./fonts" -c:a copy 결과.mp4</pre>
      <div>유튜브 자막 트랙(SRT 업로드)은 효과를 지원하지 않아요. 효과를 살리려면 위처럼 영상에 입혀서 올려야 해요.</div>
    </div></div></div></div>`;
  const close = () => { $('#modalRoot').innerHTML = ''; };
  $('#emClose').onclick = close;
  $('#em').addEventListener('click', async e => {
    if (e.target.id === 'em') return close();
    const nm = ($('#expName').value || '자막').trim(); state.name = nm;
    const ex = e.target.closest('[data-exp]'), cp = e.target.closest('[data-copy]');
    const kind = ex ? ex.dataset.exp : cp ? cp.dataset.copy : null; if (!kind) return;
    const tags = $('#srtTags').checked; store.set('subfx.srtTags', tags);
    const text = kind === 'ass' ? await buildAss() : kind === 'fxsrt' ? await buildFxSrt(tags) : buildProject();
    const ext = kind === 'fxsrt' ? 'srt' : kind;
    if (ex) saveFile(`${nm}.${ext}`, text); else copyText(text);
  });
}
$('#bExport').onclick = async () => {
  if (!state.lines.length) return toast('저장할 자막이 없어요');
  const nm = (state.name || '자막').replace(/[\\/:*?"<>|]/g, '_');
  saveFile(`${nm}.srt`, await buildFxSrt(!!store.get('subfx.srtTags')));
};
$('#bMore').onclick = () => { if (!state.lines.length) return toast('저장할 자막이 없어요'); openExport(); };

/* ---------- 불러오기 ---------- */
async function loadSrtText(txt, name) {
  let rows = parseSrt(txt);
  const di = rows.findIndex(r => r.text.startsWith(FX_TAG) || r.text.startsWith(FX_TAG_RAW));
  if (di >= 0) {
    const cue = rows[di]; rows = rows.filter((_, i) => i !== di);
    try { const data = await decodeFx(cue.text); if (rows.length) return restoreFx(rows, data, name); }
    catch { toast('효과 정보를 읽지 못해 글자만 불러왔어요'); }
  }
  if (!rows.length) { toast('자막 줄을 찾지 못했어요. SRT 형식인지 확인하세요'); return; }
  const ref = selLines()[0] || null;
  uid = 1;
  state.lines = rows.map(r => mkLine(r.start, r.end, r.text, ref ? ref.style : null, ref ? ref.fx : null));
  state.lines.forEach(l => { l.style.offX = 0; l.style.offY = 0; });
  state.sel = new Set(); state.anchor = null;
  if (name) state.name = name.replace(/\.(srt|vtt|txt)$/i, '');
  renderList(); renderInsp(); seek(0); commit(true);
  toast(`${rows.length}줄을 불러왔어요`);
}
function restoreFx(rows, data, name) {
  const same = data.lines.length === rows.length;
  uid = 1;
  if (data.canvas && data.canvas.w) state.canvas = data.canvas;
  state.lines = rows.map((r, i) => {
    const d = same ? data.lines[i] : null;
    const text = d && d.t && plain(d.t) === r.text ? d.t : r.text;
    return mkLine(r.start, r.end, text, d ? d.s : null, d ? d.f : null);
  });
  state.sel = new Set(); state.anchor = null;
  state.name = data.name || (name ? name.replace(/\.(srt|vtt|txt)$/i, '') : state.name);
  syncCanvasSel(); renderList(); renderInsp(); layout(); seek(0); commit(true);
  toast(same ? `${rows.length}줄을 효과까지 그대로 불러왔어요` : `줄 수가 바뀌어서 글자와 시간만 불러왔어요 (${rows.length}줄)`, same ? 2400 : 5000);
}
function loadProject(txt) {
  try {
    const o = JSON.parse(txt);
    if (!Array.isArray(o.lines)) throw 0;
    state.canvas = o.canvas || { w: 1920, h: 1080 };
    state.lines = o.lines.map(l => ({ id: 0, start: +l.start, end: +l.end, text: String(l.text), style: mkStyle(l.style), fx: mkFx(l.fx) }));
    uid = 1; state.lines.forEach(l => l.id = uid++);
    if (Array.isArray(o.presets)) { for (const p of o.presets) if (!state.userPresets.some(u => u.name === p.name)) state.userPresets.push(p); store.set('subfx.presets', state.userPresets); }
    state.name = o.name || state.name; state.sel = new Set();
    syncCanvasSel(); renderList(); renderInsp(); layout(); seek(0); commit(true);
    toast('프로젝트를 열었어요');
  } catch { toast('프로젝트 파일을 읽지 못했어요'); }
}
const readFile = f => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsText(f, 'utf-8'); });
async function readSrtFile(f) {
  let txt = await readFile(f);
  if (txt.includes('\uFFFD')) { // UTF-8이 아니면 EUC-KR(CP949)로 다시 시도
    try { const buf = await f.arrayBuffer(); txt = new TextDecoder('euc-kr').decode(buf); } catch {}
  }
  return txt;
}
$('#bOpenSrt').onclick = () => $('#fileSrt').click();
$('#bOpenProj').onclick = () => $('#fileProj').click();
$('#bOpenBg').onclick = () => $('#fileBg').click();
$('#fileSrt').addEventListener('change', async e => { const f = e.target.files[0]; if (f) loadSrtText(await readSrtFile(f), f.name); e.target.value = ''; });
$('#fileProj').addEventListener('change', async e => { const f = e.target.files[0]; if (f) loadProject(await readFile(f)); e.target.value = ''; });
function setBgMedia(f) {
  const url = URL.createObjectURL(f);
  const opt = $('#bgSel option[value=media]'); opt.disabled = false;
  if (f.type.startsWith('video')) {
    $('#bgImg').hidden = true; video.hidden = false; video.src = url; hasVideo = true; video.muted = false;
    video.onloadedmetadata = () => {
      const w = video.videoWidth, h = video.videoHeight;
      const match = [...$('#canvasSel').options].find(o => o.value === `${w}x${h}`);
      if (match && (w !== state.canvas.w || h !== state.canvas.h)) { state.canvas = { w, h }; syncCanvasSel(); layout(); }
      video.currentTime = clockT / 1000; draw(true);
    };
  } else { video.hidden = true; video.removeAttribute('src'); hasVideo = false; $('#bgImg').src = url; $('#bgImg').hidden = false; }
  state.bg = 'media'; $('#bgSel').value = 'media'; applyBg();
  toast('배경을 바꿨어요. 파일은 이 브라우저 안에서만 쓰여요');
}
$('#fileBg').addEventListener('change', e => { const f = e.target.files[0]; if (f) setBgMedia(f); e.target.value = ''; });
function applyBg() {
  const v = $('#bgSel').value; state.bg = v;
  const fill = $('#bgFill');
  fill.className = 'bg ' + (v === 'media' ? '' : 'bg-' + v);
  fill.hidden = v === 'media';
  const media = v === 'media';
  if (!media) { if (hasVideo) { clockT = video.currentTime * 1000; video.pause(); } video.hidden = true; $('#bgImg').hidden = true; hasVideo = false; }
  else { if (video.src) { video.hidden = false; hasVideo = true; video.currentTime = clockT / 1000; } else if ($('#bgImg').src) $('#bgImg').hidden = false; }
  draw(true);
}
$('#bgSel').addEventListener('change', applyBg);
function syncCanvasSel() {
  const v = `${state.canvas.w}x${state.canvas.h}`, s = $('#canvasSel');
  if (![...s.options].some(o => o.value === v)) s.add(new Option(`${state.canvas.w}×${state.canvas.h}`, v));
  s.value = v;
}
$('#canvasSel').addEventListener('change', e => {
  const [w, h] = e.target.value.split('x').map(Number);
  const k = h / state.canvas.h;
  if (Math.abs(k - 1) > .01) for (const l of state.lines) { const s = l.style; for (const key of ['size', 'outline', 'shadow', 'glow', 'boxPad', 'marginH', 'marginV', 'offX', 'offY', 'spacing']) s[key] = Math.round(s[key] * (key === 'outline' || key === 'shadow' ? k * 2 : k)) / (key === 'outline' || key === 'shadow' ? 2 : 1); }
  state.canvas = { w, h };
  layout(); renderList(); renderInsp(); commit(true);
});
$('#safeTog').addEventListener('change', () => draw(true));

// 끌어다 놓기
let dragDepth = 0, dropEl = null;
window.addEventListener('dragenter', e => { if (![...(e.dataTransfer?.types || [])].includes('Files')) return; dragDepth++; if (!dropEl) { dropEl = document.createElement('div'); dropEl.className = 'drop'; dropEl.textContent = 'SRT, 프로젝트, 영상, 이미지를 놓으세요'; document.body.appendChild(dropEl); } });
window.addEventListener('dragleave', () => { if (--dragDepth <= 0) { dragDepth = 0; dropEl?.remove(); dropEl = null; } });
window.addEventListener('dragover', e => e.preventDefault());
window.addEventListener('drop', async e => {
  e.preventDefault(); dragDepth = 0; dropEl?.remove(); dropEl = null;
  for (const f of e.dataTransfer.files) {
    if (/\.(srt|vtt)$/i.test(f.name)) loadSrtText(await readSrtFile(f), f.name);
    else if (/\.json$/i.test(f.name)) loadProject(await readFile(f));
    else if (/^(video|image)\//.test(f.type)) setBgMedia(f);
    else if (/\.(ttf|otf|woff2?)$/i.test(f.name)) { const dt = new DataTransfer(); dt.items.add(f); $('#fileFont').files = dt.files; $('#fileFont').dispatchEvent(new Event('change')); }
  }
});

/* ---------- 키보드 ---------- */
document.addEventListener('keydown', e => {
  const typing = e.target.matches('input[type=text],input[type=number],textarea,select');
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !typing) { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
  if (typing || $('#modalRoot').children.length) return;
  if (e.code === 'Space') { e.preventDefault(); setPlaying(!playing); }
  else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    const ids = state.lines.map(l => l.id); let i = ids.indexOf(state.anchor);
    i = clamp(i + (e.key === 'ArrowDown' ? 1 : -1), 0, ids.length - 1);
    select(ids[i], e.shiftKey ? 'range' : 'one'); const l = state.lines[i]; previewLine(l);
    $(`.row[data-id="${l.id}"]`)?.scrollIntoView({ block: 'nearest' });
  } else if (e.key === 'Delete' || e.key === 'Backspace') { if (state.sel.size) $('#bDel').click(); }
});

/* ---------- 토스트 ---------- */
let toastT = 0;
function toast(msg, ms) {
  let t = $('.toast'); if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
  t.textContent = msg; clearTimeout(toastT); toastT = setTimeout(() => t.remove(), ms || 2400);
}

/* ---------- 시작 ---------- */
const saved = store.get('subfx.project');
if (saved && Array.isArray(saved.lines) && saved.lines.length) {
  state.canvas = saved.canvas || state.canvas;
  state.lines = saved.lines.map(l => ({ ...l, style: mkStyle(l.style), fx: mkFx(l.fx) }));
  uid = Math.max(0, ...state.lines.map(l => l.id)) + 1;
} else state.lines = sampleLines();
state.sel = new Set([state.lines[0].id]); state.anchor = state.lines[0].id;
syncCanvasSel(); renderList(); renderInsp();
new ResizeObserver(layout).observe($('#stageBox'));
window.addEventListener('resize', layout);
layout(); commit(true);
previewLine(state.lines[0]);
document.fonts && document.fonts.ready.then(() => draw(true));
requestAnimationFrame(t => { lastTs = t; requestAnimationFrame(tick); });

// 테스트용 훅
window.__subfx = { state, buildAss, buildSrt, buildFxSrt, buildProject, parseSrt, loadSrtText, frame, seek, draw };
})();
