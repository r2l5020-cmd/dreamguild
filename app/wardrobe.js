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
  function wing(side, c, edge, rows) {
    const ws = [5, 8, 10, 11, 11, 10, 9, 7, 5, 3];
    return ws.map((w, i) => {
      const x = side < 0 ? -8 - w : 8;
      return R(x, 24 + i, w, 1, OL) + R(side < 0 ? x + 1 : x, 24 + i, w - 1, 1, rows ? rows[i % rows.length] : i % 3 === 2 ? edge : c);
    }).join("");
  }
  // 망토: 어깨(26줄)부터 아래로 넓어져요
  function cape(w0, w1, len, c, c2, trim) {
    return Array.from({ length: len }, (_, i) => {
      const w = w0 + 2 * Math.floor(i * (w1 - w0) / 2 / len), x = -w / 2, last = i === len - 1;
      return R(x, 26 + i, w, 1, OL) + (last ? "" : R(x + 1, 26 + i, w - 2, 1, i % 5 === 4 ? c2 : c) + (trim ? R(x + 1, 26 + i, 1, 1, trim) + R(x + w - 2, 26 + i, 1, 1, trim) : ""));
    }).join("") + (trim ? R(-w1 / 2 + 1, 26 + len - 2, w1 - 2, 1, trim) : "");
  }
  // 손에 든 막대(지팡이, 붓, 깃대)
  const pole = (x, y0, y1, c) => R(x - 1, y0, 3, y1 - y0, OL) + R(x, y0, 1, y1 - y0, c);
  // 베레모(기울어진 납작 모자)
  const beret = (c, c2) => dome(1, 0, [14, 20, 24, 26], c) + B(-15, 2, 8, 3, c) + R(-12, 3, 24, 1, c2) + R(0, -2, 1, 2, OL);
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
    { id: "crown", slot: "hat", name: "황금 왕관", price: 300, lv: 5,
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
    /* 레벨이 오르면 살 수 있는 멋진 옷 (모두) */
    { id: "starcape", slot: "back", name: "별빛 망토", price: 300, lv: 6,
      art: () => cape(22, 30, 21, "#2f3f7a", "#26346a", G) + R(-6, 32, 1, 1, G) + R(4, 36, 1, 1, G) + R(-3, 40, 1, 1, "#fff") + R(7, 42, 1, 1, G) + R(-9, 38, 1, 1, "#fff") },
    { id: "rainbow", slot: "back", name: "무지개 날개", price: 420, lv: 10,
      art: () => { const rb = ["#e05a4f", "#f2a03a", "#f5c451", "#8dbb5e", "#4f9be0", "#7a64b4"]; return wing(-1, 0, 0, rb) + wing(1, 0, 0, rb); } },
    { id: "jewelcrown", slot: "hat", name: "보석 왕관", price: 600, lv: 15,
      art: () => B(-10, -4, 4, 6, G) + B(-5, -6, 4, 8, G) + B(1, -6, 4, 8, G) + B(6, -4, 4, 6, G) + B(-10, 1, 20, 6, G) + R(-9, 5, 18, 1, "#c98d2f") +
        R(-8, -3, 2, 2, "#e05a4f") + R(-3, -5, 2, 2, "#4f9be0") + R(2, -5, 2, 2, "#8dbb5e") + R(7, -3, 2, 2, "#f27a9b") + B(-2, 2, 4, 3, "#bfe3ff") + R(-1, 3, 1, 1, "#fff") },

    /* ===== 직업 옷 (그 사람만 살 수 있어요) ===== */
    /* 영민 · 군인 */
    { id: "ym_beret", cls: "youngmin", slot: "hat", name: "군 베레모", price: 90,
      art: () => beret("#4f5a2e", "#3b4422") + B(-7, 0, 3, 3, G) },
    { id: "ym_tags", cls: "youngmin", slot: "neck", name: "군번줄", price: 60,
      art: () => [[-5, 25], [-4, 26], [-3, 27], [-2, 28], [4, 25], [3, 26], [2, 27], [1, 28]].map(([x, y]) => R(x, y, 1, 1, "#cfd8dc")).join("") + B(-2, 29, 4, 5, "#cfd8dc") + R(-1, 31, 2, 1, "#8a96a3") },
    { id: "ym_radio", cls: "youngmin", slot: "hand", name: "무전기", price: 120, lv: 3,
      art: () => R(13, 23, 1, 6, OL) + B(10, 28, 6, 10, "#4f5a2e") + R(11, 30, 4, 1, "#3b4422") + R(11, 32, 4, 1, "#3b4422") + R(11, 35, 1, 1, "#8dbb5e") + R(13, 35, 2, 1, "#e05a4f") },
    { id: "ym_helmet", cls: "youngmin", slot: "hat", name: "전투 철모", price: 220, lv: 6,
      art: () => dome(0, -1, [14, 20, 24, 26, 26, 26], "#5e6b3a") + B(-14, 4, 28, 3, "#4a5530") + R(-6, 1, 1, 1, "#7d8b4f") + R(2, 0, 1, 1, "#7d8b4f") + R(6, 2, 1, 1, "#7d8b4f") + R(-2, 2, 2, 1, "#46512b") },
    { id: "ym_medals", cls: "youngmin", slot: "neck", name: "무공 훈장", price: 300, lv: 10,
      art: () => B(-9, 28, 4, 3, "#c4453f") + B(-5, 28, 4, 3, "#4f86c6") + B(-1, 28, 4, 3, G) + B(-8, 31, 3, 3, G) + B(-4, 31, 3, 3, "#cfd8dc") + B(0, 31, 3, 3, G) },
    { id: "ym_general", cls: "youngmin", slot: "hat", name: "장군 모자", price: 500, lv: 15,
      art: () => dome(0, -2, [18, 24, 26, 26, 26], "#3b4422") + B(-13, 2, 26, 3, "#2b3018") + R(-12, 3, 24, 1, G) + B(-10, 5, 20, 2, "#1d2010") + B(-4, -1, 3, 3, G) + B(1, -1, 3, 3, G) },
    /* 선한 · 목자의 길 */
    { id: "sh_bible", cls: "seonhan", slot: "hand", name: "성경책", price: 80,
      art: () => B(9, 30, 8, 8, "#5a3a22") + R(12, 31, 1, 5, G) + R(11, 32, 3, 1, G) + R(16, 31, 1, 6, WH) },
    { id: "sh_staff", cls: "seonhan", slot: "hand", name: "목자의 지팡이", price: 120,
      art: () => pole(14, 12, 41, "#a87444") + R(13, 7, 8, 3, OL) + R(14, 8, 6, 1, "#a87444") + R(18, 7, 3, 8, OL) + R(19, 8, 1, 6, "#a87444") + R(17, 14, 2, 2, OL) },
    { id: "sh_lamb", cls: "seonhan", slot: "hand", name: "아기 양", price: 160, lv: 3,
      art: () => dome(13, 29, [6, 10, 12, 12, 12, 10, 6], WH) + B(16, 28, 5, 5, "#3b3f4a") + R(17, 30, 1, 1, "#fff") + R(9, 35, 2, 3, OL) + R(14, 35, 2, 3, OL) },
    { id: "sh_collar", cls: "seonhan", slot: "neck", name: "목사님 칼라", price: 150, lv: 5,
      art: () => B(-7, 24, 14, 3, "#2b2b3a") + B(-1, 24, 3, 3, "#fff") },
    { id: "sh_stole", cls: "seonhan", slot: "neck", name: "자주색 영대", price: 250, lv: 8,
      art: () => B(-7, 25, 4, 16, "#7a4ab0") + B(3, 25, 4, 16, "#7a4ab0") + R(-6, 30, 2, 1, G) + R(-5.5, 29, 1, 3, G) + R(4, 30, 2, 1, G) + R(4.5, 29, 1, 3, G) + R(-6, 39, 2, 1, G) + R(4, 39, 2, 1, G) },
    { id: "sh_halo", cls: "seonhan", slot: "hat", name: "빛나는 후광", price: 420, lv: 12,
      art: () => R(-8, -5, 16, 1, OL) + R(-10, -4, 2, 1, OL) + R(8, -4, 2, 1, OL) + R(-8, -3, 16, 1, OL) + R(-8, -4, 16, 1, "#fff2a8") + R(-9, -4, 1, 1, G) + R(8, -4, 1, 1, G) + R(-6, -5, 4, 1, G) + R(2, -3, 4, 1, G) },
    /* 혜인 · 뮤지컬배우 */
    { id: "hy_pin", cls: "hyein", slot: "hat", name: "꽃 머리핀", price: 70,
      art: () => B(-13, 5, 5, 5, "#f2b8cf") + R(-12, 6, 3, 3, G) + B(-10, 2, 4, 4, "#f27a9b") + R(-9, 3, 2, 2, "#fff4dc") },
    { id: "hy_rose", cls: "hyein", slot: "hand", name: "빨간 장미", price: 60,
      art: () => R(12, 30, 1, 9, "#4f7a2e") + R(13, 33, 2, 1, "#4f7a2e") + R(10, 35, 2, 1, "#4f7a2e") + B(10, 26, 5, 5, "#e05a4f") + R(12, 27, 1, 2, "#a8342f") },
    { id: "hy_headset", cls: "hyein", slot: "face", name: "무대 헤드셋", price: 120, lv: 3,
      art: () => B(-13, 15, 3, 5, "#3b3f4a") + R(-11, 20, 1, 2, OL) + R(-10, 22, 5, 1, OL) + B(-6, 21, 3, 3, "#3b3f4a") },
    { id: "hy_boa", cls: "hyein", slot: "neck", name: "깃털 보아", price: 180, lv: 5,
      art: () => [-12, -9, -6, -3, 0, 3, 6, 9].map((x, i) => B(x, 24 + (i % 2), 4, 4, i % 2 ? "#f9a8c4" : "#f27a9b")).join("") + B(-13, 28, 4, 7, "#f27a9b") + B(9, 28, 4, 7, "#f9a8c4") },
    { id: "hy_tiara", cls: "hyein", slot: "hat", name: "별빛 티아라", price: 320, lv: 10,
      art: () => R(-8, 3, 16, 2, OL) + R(-7, 3, 14, 1, "#e3eef8") + B(-6, 0, 3, 4, "#e3eef8") + B(3, 0, 3, 4, "#e3eef8") + B(-2, -3, 4, 7, "#e3eef8") + R(-1, -1, 2, 2, "#4f9be0") + R(-5, 1, 1, 1, "#f27a9b") + R(4, 1, 1, 1, "#f27a9b") + R(-1, -4, 2, 1, "#fff") },
    { id: "hy_velvet", cls: "hyein", slot: "back", name: "벨벳 무대 망토", price: 480, lv: 15,
      art: () => cape(24, 36, 22, "#7a1f2b", "#661a24", G) },
    /* 시원 · 축구선수 */
    { id: "sw_band", cls: "siwon", slot: "hat", name: "땀 머리띠", price: 50,
      art: () => B(-12, 7, 24, 4, "#fff") + R(-11, 8, 22, 1, "#4f86c6") + B(9, 9, 3, 5, "#fff") },
    { id: "sw_whistle", cls: "siwon", slot: "neck", name: "호루라기", price: 60,
      art: () => R(-4, 25, 1, 4, "#e05a4f") + R(3, 25, 1, 4, "#e05a4f") + R(-3, 29, 6, 1, "#e05a4f") + B(-2, 30, 6, 3, "#cfd8dc") + R(3, 31, 2, 1, OL) },
    { id: "sw_ball", cls: "siwon", slot: "hand", name: "축구공", price: 70,
      art: () => dome(13.5, 31, [3, 5, 7, 7, 7, 5, 3], "#fff") + R(13, 33, 2, 2, OL) + R(11, 32, 1, 1, OL) + R(16, 34, 1, 1, OL) },
    { id: "sw_muffler", cls: "siwon", slot: "neck", name: "국가대표 머플러", price: 160, lv: 5,
      art: () => B(-10, 24, 20, 4, "#e05a4f") + R(-8, 25, 2, 2, "#fff") + R(-2, 25, 2, 2, "#2f5f9a") + R(4, 25, 2, 2, "#fff") + B(-8, 27, 4, 9, "#e05a4f") + B(4, 27, 4, 9, "#e05a4f") + R(-7, 31, 2, 1, "#fff") + R(5, 31, 2, 1, "#fff") },
    { id: "sw_trophy", cls: "siwon", slot: "hand", name: "우승 트로피", price: 350, lv: 10,
      art: () => R(8, 26, 2, 4, OL) + R(16, 26, 2, 4, OL) + B(9, 24, 8, 7, G) + R(11, 25, 1, 4, "#fff2a8") + R(12, 31, 2, 3, G) + B(10, 34, 6, 4, "#8a5a33") },
    { id: "sw_ballon", cls: "siwon", slot: "hand", name: "발롱도르", price: 550, lv: 15,
      art: () => dome(13, 22, [4, 6, 8, 8, 8, 8, 6, 4], G) + R(11, 24, 2, 2, "#fff2a8") + R(12, 30, 2, 2, G) + B(9, 32, 8, 6, "#3b2a1e") + R(10, 34, 6, 1, G) },
    /* 진아 · 화가 */
    { id: "jn_beret", cls: "jina", slot: "hat", name: "화가 베레모", price: 80,
      art: () => beret("#c4453f", "#a8342f") },
    { id: "jn_palette", cls: "jina", slot: "hand", name: "물감 팔레트", price: 90,
      art: () => B(8, 30, 11, 8, "#d8a86a") + R(10, 32, 2, 1, "#e05a4f") + R(13, 31, 2, 1, G) + R(16, 32, 1, 2, "#4f9be0") + R(15, 35, 2, 1, "#8dbb5e") + R(10, 35, 1, 1, "#a87444") },
    { id: "jn_brush", cls: "jina", slot: "hand", name: "큰 붓", price: 80, lv: 3,
      art: () => pole(14, 24, 40, "#8a5a33") + R(13, 21, 3, 3, "#cfd8dc") + B(12, 16, 5, 6, "#e05a4f") + R(14, 15, 1, 1, OL) },
    { id: "jn_scarf", cls: "jina", slot: "neck", name: "물감 묻은 스카프", price: 140, lv: 5,
      art: () => B(-10, 24, 20, 4, WH) + R(-7, 25, 2, 1, "#e05a4f") + R(-2, 26, 2, 1, "#4f9be0") + R(4, 25, 2, 1, G) + B(3, 27, 4, 8, WH) + R(4, 30, 2, 1, "#8dbb5e") + R(4, 33, 1, 1, "#f27a9b") },
    { id: "jn_goldbrush", cls: "jina", slot: "hand", name: "황금 붓", price: 320, lv: 10,
      art: () => pole(14, 24, 40, G) + R(13, 21, 3, 3, "#fff2a8") + B(12, 15, 5, 7, "#7a64b4") + R(13, 16, 3, 1, "#e05a4f") + R(13, 18, 3, 1, G) + R(13, 20, 3, 1, "#4f9be0") },
    { id: "jn_wings", cls: "jina", slot: "back", name: "물감 날개", price: 500, lv: 15,
      art: () => { const pc = ["#f27a9b", "#f5c451", "#8dbb5e", "#4f9be0", "#b48be0"]; return wing(-1, 0, 0, pc) + wing(1, 0, 0, pc.slice().reverse()); } },
    /* 은환 · 여행가이드 */
    { id: "eh_passport", cls: "eunhwan", slot: "hand", name: "여권", price: 50,
      art: () => B(10, 31, 7, 8, "#2f4f8a") + B(12, 33, 3, 3, G) },
    { id: "eh_flag", cls: "eunhwan", slot: "hand", name: "가이드 깃발", price: 90,
      art: () => pole(14, 9, 40, "#735c47") + B(15, 9, 9, 7, "#e05a4f") + R(17, 11, 4, 1, WH) + R(17, 13, 3, 1, WH) },
    { id: "eh_cam", cls: "eunhwan", slot: "neck", name: "목걸이 카메라", price: 100,
      art: () => R(-6, 25, 1, 4, OL) + R(5, 25, 1, 4, OL) + B(-5, 28, 10, 6, "#3b3f4a") + B(-2, 29, 4, 4, "#6b7a99") + R(-1, 30, 1, 1, "#bfe3ff") + R(3, 29, 1, 1, "#fff") },
    { id: "eh_safari", cls: "eunhwan", slot: "hat", name: "사파리 모자", price: 140, lv: 3,
      art: () => dome(0, 0, [14, 18, 20, 20, 20], "#d8c08a") + R(-9, 3, 18, 1, "#8a5a33") + B(-15, 5, 30, 3, "#c9ad74") },
    { id: "eh_pack", cls: "eunhwan", slot: "back", name: "여행 배낭", price: 180, lv: 5,
      art: () => B(-13, 19, 26, 5, "#4f86c6") + B(-12, 23, 24, 18, "#e3863c") + R(-11, 24, 22, 2, "#c9853a") + B(-4, 30, 8, 5, "#c9853a") },
    { id: "eh_mapcape", cls: "eunhwan", slot: "back", name: "세계지도 망토", price: 420, lv: 12,
      art: () => cape(22, 32, 21, "#4f9be0", "#4590d2", "#c9853a") + R(-8, 30, 4, 3, "#8dbb5e") + R(2, 33, 5, 4, "#8dbb5e") + R(-5, 39, 3, 2, "#8dbb5e") + R(6, 41, 2, 2, "#8dbb5e") },
    { id: "eh_globe", cls: "eunhwan", slot: "hand", name: "황금 지구본", price: 500, lv: 15,
      art: () => dome(13, 22, [4, 6, 8, 8, 8, 8, 6, 4], "#4f9be0") + R(11, 24, 2, 2, "#8dbb5e") + R(14, 26, 3, 2, "#8dbb5e") + R(16, 22, 1, 6, G) + R(12, 30, 2, 3, G) + B(9, 33, 8, 3, G) },
  ];
})();
const outfitById = (id) => OUTFITS.find((o) => o.id === id);

/* 옷장 기록은 각자의 방 layout.closet에 함께 저장해요: { owned: [...], wear: { hat: "straw", ... } } */
function closetOf(id) {
  const L = (typeof S !== "undefined" && S.rooms && S.rooms[id]) || null;
  const c = (L && L.closet) || {};
  const owned = (c.owned || []).filter((x) => { const o = outfitById(x); return o && (!o.cls || o.cls === id); });
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
