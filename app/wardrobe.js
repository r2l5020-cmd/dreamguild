/* DREAM GUILD · 옷장과 옷가게 — 캐릭터 그림 위에 겹쳐 입는 도트 옷·장신구
   좌표: 1칸 = 캐릭터 그림의 4px. x=0이 몸 가운데, y=0이 그림 맨 위(머리카락 끝 ≈ 2, 눈 ≈ 17, 턱 ≈ 25, 손 ≈ 37, 발 ≈ 48).
   back 칸은 캐릭터 뒤에, 나머지는 앞에 그려요. */
const SLOTS = [
  { id: "hat", name: "모자" },
  { id: "face", name: "얼굴" },
  { id: "neck", name: "목" },
  { id: "back", name: "등" },
  { id: "hand", name: "손" },
];
const SPRITE_W = { youngmin: 104, seonhan: 104, hyein: 122, siwon: 95, jina: 124, eunhwan: 110 };

const OUTFITS = (function () {
  const OL = "#3b2a1e", G = "#f5c451", WH = "#fff4dc";
  const R = (x, y, w, h, c) => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + c + '"/>';
  const B = (x, y, w, h, c) => R(x, y, w, h, OL) + R(x + 1, y + 1, w - 2, h - 2, c);
  // 위에서부터 한 줄씩 너비가 바뀌는 도형(둥근 모자, 고깔, 풍선 등). cx가 가운데.
  function dome(cx, y, widths, c) {
    return widths.map((w, i) => {
      const x = cx - w / 2, last = i === widths.length - 1;
      return R(x, y + i, w, 1, OL) + (i > 0 && !last && w > 2 ? R(x + 1, y + i, w - 2, 1, c) : "");
    }).join("");
  }
  function wing(side, c, edge) {
    const ws = [5, 8, 10, 11, 11, 10, 9, 7, 5, 3];
    return ws.map((w, i) => {
      const x = side < 0 ? -8 - w : 8;
      return R(x, 24 + i, w, 1, OL) + R(side < 0 ? x + 1 : x, 24 + i, w - 1, 1, i % 3 === 2 ? edge : c);
    }).join("");
  }
  const heart = (x, y, c) => R(x, y, 1, 1, c) + R(x + 2, y, 1, 1, c) + R(x, y + 1, 3, 1, c) + R(x + 1, y + 2, 1, 1, c);

  return [
    /* 모자 */
    { id: "straw", slot: "hat", name: "밀짚모자", price: 60,
      art: () => B(-8, 0, 16, 7, "#e8c46a") + R(-7, 4, 14, 2, "#c4553e") + R(-6, 1, 4, 1, "#f7e3a3") + B(-15, 6, 30, 3, "#f0d27a") },
    { id: "beanie", slot: "hat", name: "파란 비니", price: 80,
      art: () => dome(0, 0, [12, 18, 22, 24, 24, 24, 24], "#4f86c6") + B(-13, 5, 26, 4, "#3a6aa3") + B(-2, -3, 4, 4, WH) },
    { id: "cap", slot: "hat", name: "빨간 야구모자", price: 90,
      art: () => dome(0, 0, [14, 20, 22, 22, 22, 22], "#e05a4f") + B(5, 4, 14, 3, "#b8453f") + R(-2, 2, 3, 2, "#fff") },
    { id: "catears", slot: "hat", name: "고양이 귀", price: 120,
      art: () => dome(-8, -2, [2, 4, 6, 8], "#f6e3bf") + R(-8, 0, 2, 1, "#f2b8cf") + dome(8, -2, [2, 4, 6, 8], "#f6e3bf") + R(7, 0, 2, 1, "#f2b8cf") },
    { id: "wizard", slot: "hat", name: "마법사 모자", price: 180,
      art: () => R(1, -8, 3, 1, OL) + dome(0, -7, [2, 4, 6, 8, 10, 12, 14, 16, 18], "#6f52b8") + R(-2, -3, 1, 1, G) + R(2, -1, 1, 1, G) + B(-15, 1, 30, 3, "#5b3f9a") },
    { id: "crown", slot: "hat", name: "황금 왕관", price: 300,
      art: () => B(-8, -2, 3, 4, G) + B(-2, -3, 4, 5, G) + B(5, -2, 3, 4, G) + B(-8, 1, 16, 5, G) + R(-6, 3, 2, 1, "#e05a4f") + R(-1, 3, 2, 1, "#4f9be0") + R(4, 3, 2, 1, "#8dbb5e") },
    /* 얼굴 */
    { id: "blush", slot: "face", name: "하트 볼터치", price: 30,
      art: () => heart(-11, 20, "#f27a9b") + heart(8, 20, "#f27a9b") },
    { id: "star", slot: "face", name: "반짝 별 스티커", price: 40,
      art: () => R(10, 18, 1, 1, G) + R(9, 19, 3, 1, G) + R(8, 20, 5, 1, G) + R(9, 21, 3, 1, G) + R(9, 22, 1, 1, G) + R(11, 22, 1, 1, G) },
    { id: "mustache", slot: "face", name: "멋쟁이 콧수염", price: 50,
      art: () => R(-4, 21, 8, 1, "#5a3a22") + R(-6, 22, 4, 1, "#5a3a22") + R(2, 22, 4, 1, "#5a3a22") + R(-7, 21, 1, 1, "#5a3a22") + R(6, 21, 1, 1, "#5a3a22") },
    { id: "shades", slot: "face", name: "선글라스", price: 70,
      art: () => B(-11, 15, 9, 5, "#2b2b3a") + B(2, 15, 9, 5, "#2b2b3a") + R(-2, 16, 4, 1, OL) + R(-10, 16, 2, 1, "#6b7a99") + R(3, 16, 2, 1, "#6b7a99") },
    /* 목 */
    { id: "bowtie", slot: "neck", name: "나비넥타이", price: 40,
      art: () => B(-5, 25, 4, 3, "#c4453f") + B(1, 25, 4, 3, "#c4453f") + B(-1, 25, 2, 3, "#a8342f") },
    { id: "scarf", slot: "neck", name: "줄무늬 목도리", price: 70,
      art: () => B(-10, 24, 20, 4, "#c4453f") + R(-6, 25, 2, 2, "#f2c26b") + R(2, 25, 2, 2, "#f2c26b") + B(3, 27, 4, 8, "#c4453f") + R(4, 31, 2, 1, "#f2c26b") + R(3, 35, 1, 1, "#f2c26b") + R(5, 35, 1, 1, "#f2c26b") },
    { id: "lei", slot: "neck", name: "꽃목걸이", price: 80,
      art: () => [-10, -7, -4, -1, 2, 5, 8].map((x, i) => B(x, 25 + (Math.abs(x + 1) < 5 ? 1 : 0), 3, 3, ["#f2b8cf", G, "#f27a9b", "#fff", "#f2b8cf", G, "#f27a9b"][i])).join("") },
    { id: "medal", slot: "neck", name: "금메달", price: 150,
      art: () => R(-4, 25, 2, 5, "#4f86c6") + R(2, 25, 2, 5, "#4f86c6") + R(-2, 29, 4, 1, "#4f86c6") + B(-2, 30, 4, 4, G) + R(-1, 31, 1, 1, WH) },
    /* 등 */
    { id: "tail", slot: "back", name: "여우 꼬리", price: 110,
      art: () => B(-17, 37, 9, 4, "#e3863c") + B(-19, 32, 5, 7, "#e3863c") + R(-18, 32, 3, 2, WH) },
    { id: "cape", slot: "back", name: "영웅 망토", price: 160,
      art: () => Array.from({ length: 20 }, (_, i) => { const w = 22 + 2 * Math.floor(i * 4 / 20), x = -w / 2, last = i === 19; return R(x, 26 + i, w, 1, OL) + (last ? "" : R(x + 1, 26 + i, w - 2, 1, i % 5 === 4 ? "#a8342f" : "#c4453f")); }).join("") },
    { id: "batwing", slot: "back", name: "박쥐 날개", price: 200,
      art: () => wing(-1, "#5b3f7a", "#46305f") + wing(1, "#5b3f7a", "#46305f") },
    { id: "angel", slot: "back", name: "천사 날개", price: 250,
      art: () => wing(-1, "#ffffff", "#dfe7ef") + wing(1, "#ffffff", "#dfe7ef") },
    /* 손 */
    { id: "coffee", slot: "hand", name: "아이스 커피", price: 50,
      art: () => R(12, 27, 1, 2, "#fff") + R(13, 25, 1, 2, "#fff") + B(9, 30, 7, 2, "#6e4424") + B(10, 31, 5, 7, WH) + R(11, 33, 3, 2, "#8a5a33") },
    { id: "bouquet", slot: "hand", name: "꽃다발", price: 70,
      art: () => B(8, 29, 4, 4, "#f2b8cf") + B(11, 28, 4, 4, G) + B(13, 31, 4, 3, "#e05a4f") + B(10, 33, 6, 5, WH) + R(12, 34, 2, 1, "#8dbb5e") },
    { id: "balloon", slot: "hand", name: "빨간 풍선", price: 60,
      art: () => R(14, 15, 1, 23, "#735c47") + dome(14, 5, [4, 6, 8, 8, 8, 8, 6, 4, 2], "#e05a4f") + R(12, 7, 1, 2, "#fff") },
    { id: "mic", slot: "hand", name: "무대 마이크", price: 90,
      art: () => B(11, 32, 3, 7, "#3b3f4a") + dome(12.5, 27, [3, 5, 5, 5, 5, 3], "#cfd8dc") },
    { id: "camcorder", slot: "hand", name: "홍보팀 캠코더", price: 140,
      art: () => B(9, 29, 4, 3, "#2b2b3a") + B(9, 31, 9, 6, "#3b3f4a") + B(17, 32, 3, 4, "#6b7a99") + R(18, 33, 1, 1, "#bfe3ff") + R(10, 33, 1, 1, "#e05a4f") },
  ];
})();
const outfitById = (id) => OUTFITS.find((o) => o.id === id);

/* 옷장 기록은 각자의 방 layout.closet에 함께 저장해요: { owned: [...], wear: { hat: "straw", ... } } */
function closetOf(id) {
  const L = (typeof S !== "undefined" && S.rooms && S.rooms[id]) || null;
  const c = (L && L.closet) || {};
  const owned = (c.owned || []).filter((x) => outfitById(x));
  const wear = {};
  Object.keys(c.wear || {}).forEach((k) => { const o = outfitById(c.wear[k]); if (o && o.slot === k && owned.includes(o.id)) wear[k] = o.id; });
  return { owned, wear };
}

/* 캐릭터 그림 + 옷 (back은 뒤, 나머지는 앞) */
function outfitSvg(memberId, wear, layer) {
  const w = SPRITE_W[memberId] || 104;
  const art = SLOTS.filter((s) => (layer === "back") === (s.id === "back")).map((s) => { const o = wear && wear[s.id] && outfitById(wear[s.id]); return o ? o.art() : ""; }).join("");
  if (!art) return "";
  return '<svg viewBox="' + (-w / 2) + ' 0 ' + w + ' 200" preserveAspectRatio="none" shape-rendering="crispEdges" aria-hidden="true"><g transform="scale(4)">' + art + "</g></svg>";
}
function avatarHTML(memberId, wear, cls, extra) {
  return '<span class="av ' + (cls || "") + '"' + (extra || "") + '><span class="ol back">' + outfitSvg(memberId, wear, "back") + '</span><img class="spr" alt="" src="assets/' + memberId + '.png"><span class="ol front">' + outfitSvg(memberId, wear, "front") + "</span></span>";
}
/* 옷가게 진열용 작은 그림 */
function outfitIcon(o) {
  const art = o.art(); let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  art.replace(/x="([-\d.]+)" y="([-\d.]+)" width="([\d.]+)" height="([\d.]+)"/g, (_, x, y, w, h) => { x = +x; y = +y; x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x + +w); y1 = Math.max(y1, y + +h); });
  const pad = 1, box = (x0 - pad) + " " + (y0 - pad) + " " + (x1 - x0 + pad * 2) + " " + (y1 - y0 + pad * 2);
  return '<svg viewBox="' + box + '" shape-rendering="crispEdges" aria-hidden="true">' + art + "</svg>";
}
