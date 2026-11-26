/* DREAM GUILD · 옷장과 옷가게 — 캐릭터 그림 위에 겹쳐 입는 옷·장신구 (곡선 벡터)
   좌표: 캐릭터 그림의 픽셀 그대로(키 200). x=0이 몸 가운데, y=0이 머리카락 끝.
   잰 윤곽: 머리 가장 넓은 곳 ±47~52(y≈40) · 모자 띠 y≈26 · 눈 y≈70 · 입 y≈84 · 목 y≈90(±26) · 어깨 y≈108(±40) · 오른손(화면 오른쪽) ≈ (41, 146)
   back 칸은 캐릭터 뒤에, 나머지는 앞에 그려요. */
const SLOTS = [
  { id: "hat", name: "모자" },
  { id: "face", name: "얼굴" },
  { id: "neck", name: "목" },
  { id: "back", name: "등" },
  { id: "hand", name: "손" },
];
const SPRITE_W = { youngmin: 104, seonhan: 104, hyein: 122, siwon: 95, jina: 124, eunhwan: 110 };
/* 머리 너비에 맞춰 모자 가로 크기를 조절해요 (머리 반폭 / 47) */
const HEAD_K = { youngmin: 1, seonhan: 0.99, hyein: 1.02, siwon: 0.96, jina: 1.01, eunhwan: 1.06 };

const OUTFITS = (function () {
  const OL = "#3b2a1e", G = "#f5c451", WH = "#fff4dc";
  const ns = ""; // 선 굵기는 캐릭터 그림과 함께 줄어들어요 (그림 테두리와 비슷한 3px)
  const P = (d, f, w) => '<path d="' + d + '" fill="' + f + '" stroke="' + OL + '" stroke-width="' + (w || 3) + '" stroke-linejoin="round" stroke-linecap="round"' + ns + "/>";
  const F = (d, f, op) => '<path d="' + d + '" fill="' + f + '"' + (op != null ? ' opacity="' + op + '"' : "") + "/>";
  const L = (d, c, w, extra) => '<path d="' + d + '" fill="none" stroke="' + c + '" stroke-width="' + (w || 2) + '" stroke-linecap="round" stroke-linejoin="round"' + ns + (extra || "") + "/>";
  const T = (d, c, w) => L(d, OL, w + 3) + L(d, c, w); // 테두리 있는 굵은 선 (지팡이, 깃대)
  const C = (x, y, r, f) => '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + f + '" stroke="' + OL + '" stroke-width="2.5"' + ns + "/>";
  const Cf = (x, y, r, f, op) => '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + f + '"' + (op != null ? ' opacity="' + op + '"' : "") + "/>";
  const E = (x, y, rx, ry, f) => '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="' + f + '" stroke="' + OL + '" stroke-width="3"' + ns + "/>";
  const RR = (x, y, w, h, r, f) => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + r + '" fill="' + f + '" stroke="' + OL + '" stroke-width="2.5"' + ns + "/>";
  const shine = (d) => F(d, "#fff", 0.5);
  const mir = (s) => '<g transform="scale(-1,1)">' + s + "</g>";
  const star = (cx, cy, r, f, stroke) => { let d = ""; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; d += (i ? "L" : "M") + (cx + rr * Math.cos(a)).toFixed(1) + "," + (cy + rr * Math.sin(a)).toFixed(1); } return stroke === false ? F(d + "Z", f) : P(d + "Z", f, 2); };
  const heart = (x, y, s, f) => F("M" + x + "," + (y + s) + " C" + (x - s * 1.7) + "," + (y - s * 0.1) + " " + (x - s * 0.7) + "," + (y - s * 1.4) + " " + x + "," + (y - s * 0.45) + " C" + (x + s * 0.7) + "," + (y - s * 1.4) + " " + (x + s * 1.7) + "," + (y - s * 0.1) + " " + x + "," + (y + s) + "Z", f, 0.9);
  /* 망토 (어깨에서 아래로 퍼져요) */
  const CAPE = "M-34,96 Q-45,140 -55,188 Q0,198 55,188 Q45,140 34,96 Q0,106 -34,96Z";
  const CAPE_W = "M-38,94 Q-52,140 -64,192 Q0,203 64,192 Q52,140 38,94 Q0,104 -38,94Z";
  /* 날개 (어깨 뒤에서 바깥으로) — 여러 겹을 줄여 그리면 무지개 */
  const WING = "M0,0 C-30,-38 -74,-32 -72,4 C-71,20 -58,27 -47,24 C-53,37 -41,47 -29,41 C-31,53 -18,57 -8,46 Z";
  const wingAt = (k, f, stroke) => '<g transform="translate(-26,106) scale(' + k + ')">' + (stroke ? P(WING, f) : F(WING, f)) + "</g>";
  const wings = (cols, feather) => { const one = cols.map((c, i) => wingAt(1 - i * 0.16, c, i === 0)).join("") + (feather ? '<g transform="translate(-26,106)">' + L("M-14,8 Q-34,0 -52,6", feather, 1.5) + L("M-12,20 Q-28,18 -40,26", feather, 1.5) + L("M-10,30 Q-20,32 -26,38", feather, 1.5) + "</g>" : ""); return one + mir(one); };
  /* 목에 두르는 목도리 */
  const SCARF = "M-30,88 Q0,104 30,88 L34,100 Q0,120 -34,100 Z";
  /* 베레모 */
  const beret = (c, c2) => P("M-52,26 C-60,2 -24,-10 8,-6 C40,-2 58,12 48,28 Q0,34 -52,26 Z", c) + P("M-50,21 Q0,29 48,21 L48,29 Q0,37 -50,29 Z", c2) + shine("M-30,4 Q-14,-4 4,-3 Q-12,2 -26,10Z");
  /* 손에 든 붓 */
  const brush = (shaft, tip, stripes) => T("M46,168 L46,100", shaft, 3.5) + RR(42.5, 91, 7, 11, 2, "#cfd8dc") + P("M43,92 Q39,80 46,68 Q53,80 49,92 Z", tip) + (stripes || "");

  return [
    /* ===== 모자 ===== */
    { id: "straw", slot: "hat", name: "밀짚모자", price: 60,
      art: () => E(0, 27, 66, 10, "#eccb72") + P("M-30,28 C-33,-8 33,-8 30,28 Z", "#e8c46a") + L("M-25,8 Q0,3 25,8", "#c9a24c", 1.5) + P("M-31,16 Q0,22 31,16 L31,25 Q0,31 -31,25 Z", "#c4553e") + shine("M-20,6 Q-14,-1 -5,-2 Q-13,4 -16,12Z") },
    { id: "beanie", slot: "hat", name: "파란 비니", price: 80,
      art: () => P("M-49,32 C-52,-14 52,-14 49,32 Z", "#4f86c6") + [-30, -15, 0, 15, 30].map((x) => L("M" + x + ",-2 Q" + (x * 1.15) + ",12 " + (x * 1.2) + ",24", "#3f72ad", 1.5)).join("") + P("M-52,22 Q0,32 52,22 L52,36 Q0,46 -52,36 Z", "#3a6aa3") + C(0, -7, 9, WH) + shine("M-30,0 Q-20,-8 -8,-9 Q-20,-2 -26,8Z") },
    { id: "cap", slot: "hat", name: "빨간 야구모자", price: 90,
      art: () => P("M-47,28 C-48,-8 48,-8 47,28 Q0,34 -47,28 Z", "#e05a4f") + L("M0,-5 Q0,12 0,31", "#b8453f", 2) + P("M6,24 Q44,15 74,30 Q44,41 4,34 Z", "#b8453f") + C(0, -5, 3.5, "#b8453f") + Cf(-18, 14, 5.5, "#fff") + shine("M-34,6 Q-26,-4 -12,-5 Q-26,2 -30,14Z") },
    { id: "catears", slot: "hat", name: "고양이 귀", price: 120,
      art: () => { const e = P("M-44,22 C-50,-6 -44,-20 -31,-22 C-24,-10 -20,0 -15,12 Z", "#f6e3bf") + F("M-39,13 C-42,-1 -38,-12 -32,-14 C-28,-6 -26,1 -23,9 Z", "#f2b8cf"); return e + mir(e); } },
    { id: "wizard", slot: "hat", name: "마법사 모자", price: 180,
      art: () => E(0, 26, 62, 10, "#5b3f9a") + P("M-34,26 C-26,0 -10,-24 8,-46 C16,-56 30,-52 36,-44 C24,-44 18,-36 16,-24 C22,-4 30,12 34,26 Z", "#6f52b8") + P("M-33,17 Q0,23 33,17 L34,26 Q0,32 -34,26 Z", G) + star(-9, -2, 5, G) + star(11, -18, 4, G) + Cf(-2, -26, 2, "#fff") },
    { id: "crown", slot: "hat", name: "황금 왕관", price: 300, lv: 5,
      art: () => P("M-30,24 L-36,-6 L-18,8 L0,-16 L18,8 L36,-6 L30,24 Q0,30 -30,24 Z", G) + C(-36, -8, 4, G) + C(0, -18, 4.5, G) + C(36, -8, 4, G) + C(-16, 16, 4, "#e05a4f") + C(0, 14, 4.5, "#4f9be0") + C(16, 16, 4, "#8dbb5e") + shine("M-27,19 L-31,2 L-22,10Z") },
    { id: "jewelcrown", slot: "hat", name: "보석 왕관", price: 600, lv: 15,
      art: () => P("M-40,26 L-44,-10 Q-34,2 -24,-6 L-14,-22 Q-6,-6 0,-26 Q6,-6 14,-22 L24,-6 Q34,2 44,-10 L40,26 Q0,34 -40,26 Z", G) + P("M-41,14 Q0,22 41,14 L40,26 Q0,34 -40,26 Z", "#c98d2f") +
        C(-44, -12, 4, "#e05a4f") + C(-14, -24, 4, "#4f9be0") + C(0, -29, 5, "#f27a9b") + C(14, -24, 4, "#8dbb5e") + C(44, -12, 4, "#7a64b4") + P("M0,0 L9,9 L0,20 L-9,9 Z", "#bfe3ff", 2) + Cf(-2, 7, 2, "#fff") + C(-24, 21, 3, "#e05a4f") + C(24, 21, 3, "#4f9be0") + shine("M-36,18 L-39,-2 L-30,8Z") },
    /* ===== 얼굴 ===== */
    { id: "blush", slot: "face", name: "하트 볼터치", price: 30,
      art: () => heart(-30, 82, 6, "#f27a9b") + heart(30, 82, 6, "#f27a9b") },
    { id: "star", slot: "face", name: "반짝 별 스티커", price: 40,
      art: () => star(34, 72, 8, G) + Cf(44, 62, 2, "#fff") },
    { id: "mustache", slot: "face", name: "멋쟁이 콧수염", price: 50,
      art: () => P("M0,80 C-6,77 -16,76 -24,83 C-27,86 -24,89 -21,86 C-14,84 -6,86 0,83 C6,86 14,84 21,86 C24,89 27,86 24,83 C16,76 6,77 0,80 Z", "#5a3a22", 2) },
    { id: "shades", slot: "face", name: "선글라스", price: 70,
      art: () => { const lens = P("M-43,62 Q-43,58 -39,58 L-11,58 Q-6,58 -6,62 L-7,72 Q-8,80 -16,80 L-33,80 Q-41,80 -42,72 Z", "#2b2b3a") + L("M-43,61 L-52,59", OL, 3) + shine("M-38,62 L-30,62 L-36,70Z"); return lens + mir(lens) + L("M-6,63 Q0,60 6,63", OL, 3); } },
    /* ===== 목 ===== */
    { id: "bowtie", slot: "neck", name: "나비넥타이", price: 40,
      art: () => { const w = P("M0,98 C-8,88 -18,88 -20,92 C-22,98 -22,102 -20,106 C-18,110 -8,110 0,100 Z", "#c4453f"); return w + mir(w) + RR(-5, 92, 10, 12, 4, "#a8342f") + shine("M-17,94 Q-12,92 -8,95 Q-13,96 -16,100Z"); } },
    { id: "scarf", slot: "neck", name: "줄무늬 목도리", price: 70,
      art: () => P(SCARF, "#c4453f") + F("M-24,95 Q-22,101 -21,107 L-15,108 Q-16,102 -18,96Z", "#f2c26b") + F("M18,96 Q16,102 15,108 L21,107 Q22,101 24,95Z", "#f2c26b") + P("M8,104 Q14,124 10,146 L24,146 Q26,122 22,102 Z", "#c4453f") + F("M11,126 L24,126 L24,132 L11,132Z", "#f2c26b") + L("M12,147 L11,153 M16,147 L16,153 M20,147 L21,153", "#c4453f", 2) },
    { id: "lei", slot: "neck", name: "꽃목걸이", price: 80,
      art: () => [-30, -20, -10, 0, 10, 20, 30].map((x, i) => C(x, 94 + x * x / 60, 6.5, ["#f2b8cf", G, "#f27a9b", "#fff", "#f2b8cf", G, "#f27a9b"][i]) + Cf(x, 94 + x * x / 60, 2.5, i % 2 ? "#e3863c" : "#fff4dc")).join("") },
    { id: "medal", slot: "neck", name: "금메달", price: 150,
      art: () => P("M-16,90 L-5,126 L5,126 L16,90 L8,90 L0,114 L-8,90 Z", "#4f86c6", 2.5) + C(0, 134, 10, G) + star(0, 134, 5, "#fff2a8", false) },
    /* ===== 등 ===== */
    { id: "tail", slot: "back", name: "여우 꼬리", price: 110,
      art: () => P("M-26,152 C-58,158 -86,136 -80,100 C-72,108 -64,124 -42,132 Z", "#e3863c") + F("M-80,100 C-85,113 -80,120 -72,119 C-73,110 -76,104 -80,100Z", WH) + shine("M-60,140 Q-70,132 -72,120 Q-64,130 -56,134Z") },
    { id: "cape", slot: "back", name: "영웅 망토", price: 160,
      art: () => P(CAPE, "#c4453f") + L("M-22,110 Q-28,150 -32,188", "#a8342f", 2) + L("M22,110 Q28,150 32,188", "#a8342f", 2) },
    { id: "batwing", slot: "back", name: "박쥐 날개", price: 200,
      art: () => { const w = P("M-28,106 C-56,74 -96,78 -106,96 Q-94,100 -92,114 Q-80,110 -76,126 Q-64,118 -56,136 Q-46,124 -32,132 Z", "#5b3f7a") + L("M-36,112 L-92,102 M-40,118 L-76,124 M-38,124 L-56,134", "#46305f", 1.5); return w + mir(w); } },
    { id: "angel", slot: "back", name: "천사 날개", price: 250,
      art: () => wings(["#ffffff"], "#c9d6e3") },
    /* ===== 손 ===== */
    { id: "coffee", slot: "hand", name: "아이스 커피", price: 50,
      art: () => T("M44,118 L49,100", "#e05a4f", 2.5) + P("M30,122 L52,122 L48,158 L34,158 Z", "#eef6fb") + F("M32,132 L50,132 L48,156 L34,156Z", "#8a5a33", 0.9) + RR(28, 116, 26, 7, 3, "#6e4424") + F("M33,138 L49,138 L48.5,146 L33.5,146Z", "#c9853a") + shine("M35,126 L38,126 L37,150 L35.5,150Z") },
    { id: "bouquet", slot: "hand", name: "꽃다발", price: 70,
      art: () => P("M30,128 Q24,118 32,114 Q36,124 34,132Z", "#6fa34f", 2) + C(33, 126, 7, "#f2b8cf") + C(45, 120, 7, G) + C(53, 130, 7, "#e05a4f") + C(41, 132, 6, "#fff") + P("M27,134 L57,134 L46,166 L38,166 Z", WH) + P("M37,150 L47,150 L45,156 L39,156Z", "#f27a9b", 2) },
    { id: "balloon", slot: "hand", name: "빨간 풍선", price: 60,
      art: () => L("M42,146 Q53,112 46,74", "#735c47", 1.5) + P("M46,74 C30,72 27,52 31,41 C35,28 57,28 61,41 C65,53 61,72 46,74 Z", "#e05a4f") + P("M44,74 L48,74 L46,78Z", "#b8453f", 1.5) + '<ellipse cx="38" cy="44" rx="4" ry="7" fill="#fff" opacity=".55" transform="rotate(-20 38 44)"/>' },
    { id: "mic", slot: "hand", name: "무대 마이크", price: 90,
      art: () => RR(37, 126, 9, 34, 4, "#3b3f4a") + C(41.5, 119, 9.5, "#cfd8dc") + L("M34,116 Q41.5,112 49,116 M33,121 Q41.5,117 50,121", "#8a96a3", 1.2) + Cf(38, 115, 2, "#fff") },
    { id: "camcorder", slot: "hand", name: "홍보팀 캠코더", price: 140,
      art: () => RR(26, 119, 14, 10, 3, "#2b2b3a") + RR(24, 127, 36, 24, 6, "#3b3f4a") + RR(58, 130, 12, 18, 4, "#6b7a99") + Cf(64, 139, 4, "#bfe3ff") + Cf(31, 135, 2.5, "#e05a4f") + L("M30,144 L50,144", "#2b2b3a", 2) },
    /* ===== 레벨이 오르면 살 수 있는 멋진 옷 (모두) ===== */
    { id: "starcape", slot: "back", name: "별빛 망토", price: 300, lv: 6,
      art: () => P(CAPE, "#2f3f7a") + L("M-51,184 Q0,194 51,184", G, 2.5) + star(-30, 150, 5, G) + star(34, 170, 4, G) + star(-40, 180, 3.5, "#fff") + star(42, 130, 3.5, "#fff") },
    { id: "rainbow", slot: "back", name: "무지개 날개", price: 420, lv: 10,
      art: () => wings(["#e05a4f", "#f2a03a", "#f5c451", "#8dbb5e", "#4f9be0", "#7a64b4"]) },

    /* ===== 직업 옷 (그 사람만 살 수 있어요) ===== */
    /* 영민 · 군인 */
    { id: "ym_beret", cls: "youngmin", slot: "hat", name: "군 베레모", price: 90,
      art: () => beret("#4f5a2e", "#3b4422") + C(-28, 13, 6, G) + star(-28, 13, 3, "#8a6a12", false) },
    { id: "ym_tags", cls: "youngmin", slot: "neck", name: "군번줄", price: 60,
      art: () => L("M-22,90 Q-8,116 0,120 Q8,116 22,90", "#cfd8dc", 2.5, ' stroke-dasharray="2 2.5"') + RR(-7, 118, 14, 18, 4, "#cfd8dc") + L("M-3,124 L3,124 M-3,128 L3,128", "#8a96a3", 1.5) },
    { id: "ym_radio", cls: "youngmin", slot: "hand", name: "무전기", price: 120, lv: 3,
      art: () => L("M46,118 L46,94", OL, 3) + Cf(46, 93, 2.5, OL) + RR(32, 116, 20, 38, 5, "#4f5a2e") + L("M36,124 L48,124 M36,129 L48,129 M36,134 L48,134", "#3b4422", 2) + Cf(37, 146, 2.2, "#8dbb5e") + Cf(44, 146, 2.2, "#e05a4f") },
    { id: "ym_helmet", cls: "youngmin", slot: "hat", name: "전투 철모", price: 220, lv: 6,
      art: () => P("M-54,34 C-58,-14 58,-14 54,34 Q0,26 -54,34 Z", "#5e6b3a") + P("M-58,30 Q0,22 58,30 L58,38 Q0,30 -58,38 Z", "#4a5530") + L("M-30,0 L-10,24 M-10,-6 L14,24 M14,-6 L34,20 M-36,16 L36,-4", "#46512b", 1.5) + shine("M-36,4 Q-26,-8 -10,-9 Q-26,0 -32,12Z") },
    { id: "ym_medals", cls: "youngmin", slot: "neck", name: "무공 훈장", price: 300, lv: 10,
      art: () => RR(-37, 111, 10, 7, 1.5, "#c4453f") + RR(-26, 111, 10, 7, 1.5, "#4f86c6") + RR(-15, 111, 10, 7, 1.5, G) + L("M-32,118 L-32,121 M-21,118 L-21,121 M-10,118 L-10,121", OL, 1.5) + C(-32, 126, 5, G) + C(-21, 126, 5, "#cfd8dc") + C(-10, 126, 5, G) + star(-32, 126, 2.5, "#fff2a8", false) },
    { id: "ym_general", cls: "youngmin", slot: "hat", name: "장군 모자", price: 500, lv: 15,
      art: () => P("M-48,22 C-54,-12 54,-12 48,22 Z", "#3b4422") + P("M-48,13 Q0,21 48,13 L48,25 Q0,33 -48,25 Z", "#2b3018") + L("M-46,19 Q0,27 46,19", G, 2.5) + P("M-40,26 Q0,46 40,26 Q0,36 -40,26 Z", "#1d2010") + star(0, 3, 9, G) + L("M-16,8 Q-12,0 -10,-2 M16,8 Q12,0 10,-2", G, 2) },
    /* 선한 · 목자의 길 */
    { id: "sh_bible", cls: "seonhan", slot: "hand", name: "성경책", price: 80,
      art: () => RR(26, 128, 30, 26, 3, "#5a3a22") + F("M53,130 L55,130 L55,152 L53,152Z", WH) + L("M40,133 L40,149 M34,138 L46,138", G, 2.5) },
    { id: "sh_staff", cls: "seonhan", slot: "hand", name: "목자의 지팡이", price: 120,
      art: () => T("M48,176 L48,46 C48,19 75,19 75,40 C75,50 67,52 65,46", "#a87444", 5) + L("M46,60 L46,150", "#c99a64", 1.2) },
    { id: "sh_lamb", cls: "seonhan", slot: "hand", name: "아기 양", price: 160, lv: 3,
      art: () => { const pts = [[30, 140, 9], [40, 133, 10], [51, 140, 9], [40, 146, 10], [30, 148, 8], [51, 148, 8]]; return RR(32, 152, 5, 10, 2, "#3b3f4a") + RR(46, 152, 5, 10, 2, "#3b3f4a") + pts.map(([x, y, r]) => C(x, y, r, "#fff")).join("") + pts.map(([x, y, r]) => Cf(x, y, r - 1.6, "#fff")).join("") + E(59, 133, 7, 8, "#3b3f4a") + P("M54,128 Q48,124 50,130Z", "#3b3f4a", 2) + Cf(61, 131, 1.6, "#fff"); } },
    { id: "sh_collar", cls: "seonhan", slot: "neck", name: "목사님 칼라", price: 150, lv: 5,
      art: () => P("M-27,90 Q0,104 27,90 L28,99 Q0,114 -28,99 Z", "#2b2b3a") + RR(-6, 97, 12, 10, 2, "#fff") },
    { id: "sh_stole", cls: "seonhan", slot: "neck", name: "자주색 영대", price: 250, lv: 8,
      art: () => { const s = P("M-27,92 Q-19,98 -12,100 L-10,162 L-25,162 Q-27,130 -27,92 Z", "#7a4ab0") + L("M-18,136 L-18,148 M-23,141 L-13,141", G, 2.5) + L("M-24,162 L-24,167 M-17.5,162 L-17.5,167 M-11,162 L-11,167", G, 1.5); return s + mir(s); } },
    { id: "sh_halo", cls: "seonhan", slot: "hat", name: "빛나는 후광", price: 420, lv: 12,
      art: () => '<ellipse cx="0" cy="-12" rx="42" ry="12" fill="' + G + '" opacity=".22"/><ellipse cx="0" cy="-12" rx="34" ry="8" fill="none" stroke="' + OL + '" stroke-width="7"' + ns + '/><ellipse cx="0" cy="-12" rx="34" ry="8" fill="none" stroke="' + G + '" stroke-width="4"' + ns + '/><ellipse cx="0" cy="-13" rx="33" ry="7" fill="none" stroke="#fff2a8" stroke-width="1.2"' + ns + "/>" },
    /* 혜인 · 뮤지컬배우 */
    { id: "hy_pin", cls: "hyein", slot: "hat", name: "꽃 머리핀", price: 70,
      art: () => { const fl = (x, y, r, c) => [0, 72, 144, 216, 288].map((a) => C((x + r * Math.cos(a * Math.PI / 180)).toFixed(1), (y + r * Math.sin(a * Math.PI / 180)).toFixed(1), r * 0.9, c)).join("") + C(x, y, r * 0.55, G); return fl(-36, 26, 6, "#f2b8cf") + fl(-24, 13, 4.2, "#f27a9b"); } },
    { id: "hy_rose", cls: "hyein", slot: "hand", name: "빨간 장미", price: 60,
      art: () => T("M42,166 Q39,148 42,128", "#4f7a2e", 2.5) + P("M41,150 Q51,143 55,148 Q48,155 41,150 Z", "#6fa34f", 2) + C(42, 121, 9.5, "#e05a4f") + L("M42,121 m-3,0 a3,3 0 1 1 3,3 a5.5,5.5 0 1 1 -6,-6", "#a8342f", 1.5) },
    { id: "hy_headset", cls: "hyein", slot: "face", name: "무대 헤드셋", price: 120, lv: 3,
      art: () => T("M-46,76 Q-40,92 -15,92", "#3b3f4a", 2.5) + C(-48, 70, 7.5, "#3b3f4a") + E(-12, 92, 5, 4, "#3b3f4a") },
    { id: "hy_boa", cls: "hyein", slot: "neck", name: "깃털 보아", price: 180, lv: 5,
      art: () => { const pts = []; for (let x = -36; x <= 36; x += 8) pts.push([x, 94 + x * x / 70]); for (let y = 118; y <= 154; y += 9) { pts.push([-38, y]); pts.push([38, y]); } return pts.map(([x, y], i) => C(x, y, 8, i % 2 ? "#f9a8c4" : "#f27a9b")).join("") + pts.map(([x, y], i) => Cf(x, y, 6.2, i % 2 ? "#f9a8c4" : "#f27a9b")).join(""); } },
    { id: "hy_tiara", cls: "hyein", slot: "hat", name: "별빛 티아라", price: 320, lv: 10,
      art: () => P("M-32,22 Q-30,10 -22,10 L-16,0 L-10,10 L0,-14 L10,10 L16,0 L22,10 Q30,10 32,22 Q0,16 -32,22 Z", "#e3eef8") + C(0, -1, 4.5, "#4f9be0") + C(-16, 7, 3, "#f27a9b") + C(16, 7, 3, "#f27a9b") + star(26, -6, 4, "#fff", false) + star(-28, -4, 3, "#fff", false) },
    { id: "hy_velvet", cls: "hyein", slot: "back", name: "벨벳 무대 망토", price: 480, lv: 15,
      art: () => P(CAPE_W, "#7a1f2b") + L("M-60,188 Q0,198 60,188", G, 3) + L("M-36,98 Q-49,140 -60,188 M36,98 Q49,140 60,188", G, 2) + L("M-18,112 Q-24,150 -28,192 M18,112 Q24,150 28,192", "#661a24", 2) },
    /* 시원 · 축구선수 */
    { id: "sw_band", cls: "siwon", slot: "hat", name: "땀 머리띠", price: 50,
      art: () => P("M-48,26 Q0,36 48,26 L48,38 Q0,48 -48,38 Z", "#fff") + F("M-48,30 Q0,40 48,30 L48,33.5 Q0,43.5 -48,33.5Z", "#4f86c6") + P("M46,30 Q60,36 62,50 L54,52 Q52,42 44,38 Z", "#fff", 2.5) },
    { id: "sw_whistle", cls: "siwon", slot: "neck", name: "호루라기", price: 60,
      art: () => L("M-18,90 Q-8,112 0,116 Q8,112 18,90", "#e05a4f", 2.5) + P("M-8,114 L10,114 Q16,114 16,120 Q16,126 10,126 L-2,126 Q-8,126 -8,120 Z", "#cfd8dc", 2.5) + Cf(10, 120, 2.5, "#8a96a3") },
    { id: "sw_ball", cls: "siwon", slot: "hand", name: "축구공", price: 70,
      art: () => C(44, 146, 13, "#fff") + P("M44,140 L49,144 L47,150 L41,150 L39,144 Z", OL, 1) + L("M44,140 L44,134 M49,144 L56,142 M47,150 L51,156 M41,150 L37,156 M39,144 L32,142", OL, 1.5) },
    { id: "sw_muffler", cls: "siwon", slot: "neck", name: "국가대표 머플러", price: 160, lv: 5,
      art: () => P("M-26,100 Q-30,124 -26,150 L-13,150 Q-15,124 -13,104 Z", "#e05a4f") + P("M13,104 Q15,124 13,150 L26,150 Q30,124 26,100 Z", "#e05a4f") + P(SCARF, "#e05a4f") + F("M-30,93 Q0,108 30,93 L31,97 Q0,113 -31,97Z", "#fff") + F("M-27,128 L-14,128 L-14,134 L-27,134Z", "#2f5f9a") + F("M14,128 L27,128 L27,134 L14,134Z", "#2f5f9a") },
    { id: "sw_trophy", cls: "siwon", slot: "hand", name: "우승 트로피", price: 350, lv: 10,
      art: () => T("M28,108 Q17,108 19,118 Q21,125 30,124", G, 3) + T("M56,108 Q67,108 65,118 Q63,125 54,124", G, 3) + P("M28,104 L56,104 Q56,128 42,132 Q28,128 28,104 Z", G) + RR(38, 131, 8, 11, 2, G) + RR(30, 141, 24, 13, 3, "#8a5a33") + shine("M32,108 L36,108 Q36,122 40,126 Q32,122 32,108Z") },
    { id: "sw_ballon", cls: "siwon", slot: "hand", name: "발롱도르", price: 550, lv: 15,
      art: () => RR(30, 138, 24, 18, 3, "#3b2a1e") + F("M33,144 L51,144 L51,149 L33,149Z", G) + C(42, 120, 15, G) + L("M30,112 Q42,118 54,112 M28,124 Q42,130 56,124 M42,105 Q36,120 42,135", "#c98d2f", 1.5) + shine("M33,112 Q36,106 42,105 Q36,110 35,117Z") },
    /* 진아 · 화가 */
    { id: "jn_beret", cls: "jina", slot: "hat", name: "화가 베레모", price: 80,
      art: () => beret("#c4453f", "#a8342f") + T("M4,-5 Q6,-12 2,-15", "#a8342f", 2) },
    { id: "jn_palette", cls: "jina", slot: "hand", name: "물감 팔레트", price: 90,
      art: () => P("M26,136 C24,122 40,116 54,120 C66,124 66,140 58,146 C52,150 50,144 44,148 C36,156 28,150 26,136 Z", "#d8a86a") + C(36, 127, 3.5, "#e05a4f") + C(46, 124, 3.5, G) + C(55, 129, 3.5, "#4f9be0") + C(56, 139, 3.5, "#8dbb5e") + C(32, 139, 3.5, "#fff") + C(44, 140, 3, "#b98a55") },
    { id: "jn_brush", cls: "jina", slot: "hand", name: "큰 붓", price: 80, lv: 3,
      art: () => brush("#8a5a33", "#e05a4f") },
    { id: "jn_scarf", cls: "jina", slot: "neck", name: "물감 묻은 스카프", price: 140, lv: 5,
      art: () => P(SCARF, WH) + Cf(-20, 97, 3.5, "#e05a4f") + Cf(-4, 104, 3, "#4f9be0") + Cf(14, 99, 3.5, G) + P("M8,104 Q14,124 10,146 L24,146 Q26,122 22,102 Z", WH) + Cf(17, 122, 3, "#8dbb5e") + Cf(15, 138, 2.5, "#f27a9b") },
    { id: "jn_goldbrush", cls: "jina", slot: "hand", name: "황금 붓", price: 320, lv: 10,
      art: () => brush(G, "#7a64b4", F("M43.6,88 L48.4,88 L48.2,85 L43.8,85Z", G) + F("M43,82 Q46,79 49,82 L48.6,84 Q46,82 43.4,84Z", "#e05a4f") + F("M44.5,76 Q46,73 47.5,76 L47.5,79 Q46,77 44.5,79Z", "#4f9be0")) },
    { id: "jn_wings", cls: "jina", slot: "back", name: "물감 날개", price: 500, lv: 15,
      art: () => wings(["#f27a9b", "#f5c451", "#8dbb5e", "#4f9be0", "#b48be0"]) },
    /* 은환 · 여행가이드 */
    { id: "eh_passport", cls: "eunhwan", slot: "hand", name: "여권", price: 50,
      art: () => RR(30, 130, 22, 28, 3, "#2f4f8a") + '<circle cx="41" cy="141" r="5" fill="none" stroke="' + G + '" stroke-width="1.6"/>' + L("M36,141 L46,141 M41,136 Q38,141 41,146 Q44,141 41,136", G, 1) + L("M35,151 L47,151", G, 1.5) },
    { id: "eh_flag", cls: "eunhwan", slot: "hand", name: "가이드 깃발", price: 90,
      art: () => T("M46,170 L46,40", "#735c47", 3) + P("M47,40 Q60,35 72,42 Q84,49 92,42 L92,66 Q84,73 72,66 Q60,59 47,64 Z", "#e05a4f") + star(68, 53, 7, "#fff", false) + Cf(46, 38, 3.5, G) },
    { id: "eh_cam", cls: "eunhwan", slot: "neck", name: "목걸이 카메라", price: 100,
      art: () => L("M-24,90 Q-21,104 -16,114 M24,90 Q21,104 16,114", OL, 3) + RR(-20, 112, 40, 26, 6, "#3b3f4a") + C(0, 125, 8.5, "#6b7a99") + Cf(0, 125, 4, "#bfe3ff") + Cf(-2, 123, 1.5, "#fff") + RR(9, 107, 9, 6, 1.5, "#2b2b3a") + Cf(-13, 118, 2, "#e05a4f") },
    { id: "eh_safari", cls: "eunhwan", slot: "hat", name: "사파리 모자", price: 140, lv: 3,
      art: () => E(0, 28, 68, 11, "#c9ad74") + P("M-36,30 C-40,-4 40,-4 36,30 Z", "#d8c08a") + P("M-37,18 Q0,24 37,18 L37,26 Q0,32 -37,26 Z", "#8a5a33") + shine("M-24,8 Q-16,0 -6,-1 Q-16,5 -20,14Z") },
    { id: "eh_pack", cls: "eunhwan", slot: "back", name: "여행 배낭", price: 180, lv: 5,
      art: () => RR(-40, 92, 80, 72, 16, "#e3863c") + P("M-36,100 Q0,92 36,100 L36,120 Q0,128 -36,120 Z", "#c9853a") + RR(-46, 80, 92, 18, 9, "#4f86c6") + L("M-30,82 L-30,96 M30,82 L30,96", "#2f5f9a", 2) },
    { id: "eh_mapcape", cls: "eunhwan", slot: "back", name: "세계지도 망토", price: 420, lv: 12,
      art: () => P(CAPE, "#4f9be0") + F("M-38,128 Q-28,120 -20,130 Q-24,142 -36,140Z", "#8dbb5e") + F("M24,140 Q36,134 44,146 Q40,160 28,156Z", "#8dbb5e") + F("M-30,166 Q-22,160 -16,168 Q-22,176 -30,174Z", "#8dbb5e") + L("M-51,184 Q0,194 51,184", "#c9853a", 2.5) },
    { id: "eh_globe", cls: "eunhwan", slot: "hand", name: "황금 지구본", price: 500, lv: 15,
      art: () => C(42, 118, 16, "#4f9be0") + F("M32,108 Q40,104 44,110 Q40,118 33,116Z", "#8dbb5e") + F("M44,120 Q52,116 55,124 Q50,132 44,128Z", "#8dbb5e") + L("M42,98 A20,20 0 0 1 42,138", G, 3) + RR(39, 136, 6, 8, 2, G) + RR(28, 143, 28, 8, 3, G) + shine("M32,112 Q34,104 40,103 Q35,107 34,113Z") },
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

/* 캐릭터 그림 + 옷 (back은 뒤, 나머지는 앞). 모자는 머리 너비에 맞춰 가로로 늘이거나 줄여요. */
function outfitSvg(memberId, wear, layer) {
  const w = SPRITE_W[memberId] || 104, k = HEAD_K[memberId] || 1;
  const art = SLOTS.filter((s) => (layer === "back") === (s.id === "back")).map((s) => {
    const o = wear && wear[s.id] && outfitById(wear[s.id]); if (!o) return "";
    return s.id === "hat" && k !== 1 ? '<g transform="scale(' + k + ',1)">' + o.art() + "</g>" : o.art();
  }).join("");
  if (!art) return "";
  return '<svg viewBox="' + (-w / 2) + ' 0 ' + w + ' 200" preserveAspectRatio="none" aria-hidden="true">' + art + "</svg>";
}
function avatarHTML(memberId, wear, cls, extra) {
  return '<span class="av ' + (cls || "") + '"' + (extra || "") + '><span class="ol back">' + outfitSvg(memberId, wear, "back") + '</span><img class="spr" alt="" src="assets/' + memberId + '.png"><span class="ol front">' + outfitSvg(memberId, wear, "front") + "</span></span>";
}
/* 옷가게 진열용 작은 그림 — 그림 크기를 한 번 재서 꼭 맞게 보여 줘요 */
let _measure = null;
function outfitIcon(o) {
  if (!o._box) {
    try {
      if (!_measure) { _measure = document.createElementNS("http://www.w3.org/2000/svg", "svg"); _measure.setAttribute("style", "position:absolute;left:-9999px;top:0;width:10px;height:10px;visibility:hidden"); document.body.appendChild(_measure); }
      _measure.innerHTML = "<g>" + o.art() + "</g>";
      const b = _measure.firstChild.getBBox(), pad = 4;
      o._box = (b.x - pad).toFixed(1) + " " + (b.y - pad).toFixed(1) + " " + (b.width + pad * 2).toFixed(1) + " " + (b.height + pad * 2).toFixed(1);
    } catch (e) { o._box = "-80 -60 160 260"; }
  }
  return '<svg viewBox="' + o._box + '" aria-hidden="true">' + o.art() + "</svg>";
}
