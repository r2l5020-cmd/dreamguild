/* 홍보영상팀 마을 — 웹 버전 배경(하늘·언덕 위 집 6채, 마을 표지판, 나무, 구름).
   데스크톱 앱은 작업표시줄 위 투명 띠라서 그리지 않아요.
   모든 그림은 1칸 = 1픽셀 단위 SVG(crispEdges)라서 캐릭터 그림처럼 도트 느낌이 나요. */
(function () {
  if (!document.documentElement.classList.contains("web")) return;

  const O = "#3b2a1e", G = "#f5c451", W = "#fff4dc", GL = "#bfe3ff", WD = "#8a5a33", WD2 = "#6e4424";
  const r = (x, y, w, h, c, cls) => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + c + '"' + (cls ? ' class="' + cls + '"' : "") + "/>";
  const box = (x, y, w, h, c) => r(x, y, w, h, O) + r(x + 1, y + 1, w - 2, h - 2, c);
  // 박공지붕: 아랫줄(by)부터 한 줄 올라갈 때마다 양쪽이 2칸씩 줄어요. 2줄마다 어두운 기와 줄.
  function gable(x, by, w, c, dark) {
    let s = "", i = 0;
    for (let ww = w; ww > 0; ww -= 4, i++) {
      const xx = x + 2 * i, yy = by - i;
      s += r(xx, yy, ww, 1, O);
      if (i > 0 && ww > 4) s += r(xx + 2, yy, ww - 4, 1, i % 2 ? c : (dark || c));
    }
    return s;
  }
  // 도트 원: 테두리 1칸 + 안쪽 색
  function disc(cx, cy, rad, c) {
    let s = "";
    for (let y = -rad; y < rad; y++) for (let x = -rad; x < rad; x++) {
      const d = Math.hypot(x + 0.5, y + 0.5);
      if (d <= rad) s += r(cx + x, cy + y, 1, 1, d > rad - 1.2 ? O : c);
    }
    return s;
  }
  const win = (x, y, w, h) => box(x, y, w, h, GL) + r(x + 1, y + 1, 1, 1, "#fff") + r(x + Math.floor(w / 2), y + 1, 1, h - 2, WD) + r(x + 1, y + Math.floor(h / 2), w - 2, 1, WD);
  const svg = (w, h, body, cls) => '<svg class="' + cls + '" viewBox="0 0 ' + w + " " + h + '" style="--w:' + w + ";--h:" + h + '" shape-rendering="crispEdges" aria-hidden="true">' + body + "</svg>";

  const HOUSES = {
    // 영민의 부대 — 국방색 막사, 모래주머니, 깃발
    youngmin: () =>
      r(33, 4, 1, 36, O) + box(34, 4, 6, 5, "#4f7a2e") + r(36, 6, 2, 1, G) +
      box(2, 18, 30, 22, "#7d8b4f") + box(0, 15, 34, 4, "#5e6b3a") +
      r(5, 21, 4, 2, "#66733f") + r(20, 30, 5, 2, "#66733f") + r(4, 33, 4, 2, "#9aa56a") + r(26, 21, 3, 2, "#9aa56a") +
      box(11, 20, 12, 5, "#e8dcb0") + r(16, 22, 2, 1, "#4f7a2e") + r(14, 22, 1, 1, O) + r(19, 22, 1, 1, O) +
      box(13, 28, 8, 12, "#4e5a2e") + r(19, 34, 1, 1, G) +
      win(4, 25, 7, 5) + win(24, 25, 7, 5) +
      box(23, 36, 5, 4, "#d8c08a") + box(27, 36, 5, 4, "#d8c08a") + box(25, 33, 5, 4, "#d8c08a"),
    // 선한의 작은 교회 — 흰 벽, 붉은 지붕, 종탑과 십자가, 스테인드글라스
    seonhan: () =>
      gable(2, 21, 36, "#c4553e", "#a8432f") +
      box(4, 21, 32, 19, "#fbf4e6") +
      box(15, 12, 10, 14, "#fbf4e6") + gable(13, 11, 14, "#c4553e", "#a8432f") +
      r(18, 0, 4, 9, O) + r(16, 2, 8, 4, O) + r(19, 1, 2, 7, G) + r(17, 3, 6, 2, G) +
      box(18, 15, 4, 5, G) + r(19, 16, 2, 1, WD2) +
      box(7, 26, 5, 9, "#9ccbe8") + r(8, 27, 3, 2, "#e88a8a") + r(8, 31, 3, 2, G) +
      box(28, 26, 5, 9, "#9ccbe8") + r(29, 27, 3, 2, "#8dbb5e") + r(29, 31, 3, 2, "#e88a8a") +
      box(16, 30, 8, 10, WD) + r(17, 29, 6, 1, O) + r(20, 31, 1, 9, WD2) + r(18, 35, 1, 1, G) + r(22, 35, 1, 1, G),
    // 혜인의 극장 — 붉은 정면, 금빛 박공, 반짝이는 간판, 커튼 문
    hyein: () =>
      gable(0, 14, 40, "#e3a63c", "#c98d2f") + r(19, 8, 2, 2, W) +
      box(2, 14, 36, 26, "#b8453f") +
      box(5, 16, 30, 8, W) +
      [6, 9, 12, 15, 18, 21, 24, 27, 30, 33].map((x, i) => r(x, 17, 1, 1, G, "tw" + (i % 2)) + r(x, 22, 1, 1, G, "tw" + ((i + 1) % 2))).join("") +
      r(17, 18, 1, 3, O) + r(18, 18, 3, 1, O) + r(20, 18, 1, 3, O) + r(16, 20, 2, 1, O) + r(19, 20, 2, 1, O) +
      box(3, 25, 4, 15, "#f0d9a8") + box(33, 25, 4, 15, "#f0d9a8") +
      box(8, 28, 4, 6, "#f2b8cf") + box(28, 28, 4, 6, "#9ccbe8") +
      box(13, 27, 14, 13, "#7a1f2b") + r(15, 28, 1, 11, "#a83242") + r(18, 28, 1, 11, "#a83242") + r(21, 28, 1, 11, "#a83242") + r(24, 28, 1, 11, "#a83242") + r(14, 32, 12, 1, G),
    // 시원의 운동장 — 파란 클럽하우스, 골대, 공
    siwon: () =>
      r(12, 6, 1, 8, O) + r(13, 6, 4, 2, G) + r(13, 8, 2, 1, G) +
      gable(0, 20, 26, "#2f5f9a", "#28507f") +
      box(2, 20, 22, 20, "#4f86c6") + r(3, 27, 20, 2, "#fff") +
      win(4, 22, 6, 5) + win(16, 22, 6, 5) +
      box(9, 30, 8, 10, "#2f3f5a") + r(15, 35, 1, 1, G) +
      [29, 32, 35].map((x) => r(x, 27, 1, 13, "#cfd8dc")).join("") + [30, 33, 36].map((y) => r(27, y, 11, 1, "#cfd8dc")).join("") +
      r(25, 25, 15, 3, O) + r(25, 25, 3, 15, O) + r(37, 25, 3, 15, O) + r(26, 26, 13, 1, "#fff") + r(26, 26, 1, 14, "#fff") + r(38, 26, 1, 14, "#fff") +
      disc(32, 37, 3, "#fff") + r(31, 36, 2, 1, O) + r(30, 38, 1, 1, O) + r(33, 38, 1, 1, O),
    // 진아의 아틀리에 — 보라 지붕 오두막, 큰 창, 이젤 위 그림
    jina: () =>
      box(22, 9, 5, 9, "#b8453f") +
      gable(2, 20, 30, "#7a64b4", "#6a55a0") + r(13, 15, 7, 2, GL) + r(13, 15, 2, 1, "#fff") +
      box(4, 20, 26, 20, "#f6e3bf") +
      box(6, 23, 12, 9, WD) + r(7, 24, 10, 7, GL) + r(12, 24, 1, 7, WD) + r(7, 27, 10, 1, WD) + r(8, 25, 2, 1, "#fff") +
      box(6, 32, 12, 2, "#8dbb5e") + r(8, 32, 1, 1, "#f2b8cf") + r(12, 32, 1, 1, G) + r(15, 32, 1, 1, "#f2b8cf") +
      box(21, 28, 7, 12, "#4f7a6a") + r(26, 34, 1, 1, G) +
      r(32, 30, 1, 10, WD) + r(38, 30, 1, 10, WD) + r(35, 26, 1, 14, WD2) +
      box(31, 23, 9, 9, "#fff8ea") + r(32, 25, 3, 2, "#e05a4f") + r(35, 27, 3, 2, "#4f9be0") + r(33, 29, 4, 1, G) + r(36, 24, 2, 2, "#8dbb5e"),
    // 은환의 여행사 — 노란 가게, 줄무늬 차양, 지구본 간판, 여행 가방
    eunhwan: () =>
      r(19, 11, 2, 3, O) + disc(20, 7, 5, "#4f9be0") + r(17, 4, 3, 2, "#8dbb5e") + r(21, 7, 3, 2, "#8dbb5e") + r(18, 9, 2, 1, "#8dbb5e") +
      box(2, 16, 36, 24, "#f2c26b") + box(0, 13, 40, 4, "#c9853a") +
      r(2, 18, 36, 6, O) + [3, 9, 15, 21, 27, 33].map((x) => r(x, 19, 3, 4, "#e05a4f") + r(x + 3, 19, Math.min(3, 37 - x - 3), 4, W)).join("") +
      box(4, 26, 14, 10, WD) + r(5, 27, 12, 8, GL) + r(7, 30, 8, 1, "#fff") + r(11, 28, 2, 5, "#fff") + r(8, 29, 1, 3, "#fff") + r(5, 27, 2, 1, "#fff") +
      box(22, 26, 8, 14, WD2) + r(24, 28, 4, 5, GL) + r(28, 34, 1, 1, G) +
      r(33, 32, 4, 1, O) + r(33, 33, 1, 1, O) + r(36, 33, 1, 1, O) + box(32, 34, 6, 6, "#b8453f") + r(33, 36, 4, 1, G),
  };

  // 마을 옷가게 — 분홍 벽, 민트 차양, 쇼윈도의 원피스, 옷걸이 간판
  const SHOP = () =>
    r(18, 2, 4, 1, O) + r(19, 3, 2, 2, O) + r(14, 5, 12, 1, O) + r(13, 6, 2, 1, O) + r(25, 6, 2, 1, O) + r(12, 7, 16, 1, O) +
    box(2, 13, 36, 27, "#f6c1cf") + box(0, 9, 40, 5, "#e88aa6") + r(3, 10, 34, 1, "#f2a9bf") +
    r(2, 14, 36, 4, O) + [3, 9, 15, 21, 27, 33].map((x) => r(x, 15, 3, 3, "#7fcfbf") + r(x + 3, 15, Math.min(3, 37 - x - 3), 3, W)).join("") +
    [3, 9, 15, 21, 27, 33].map((x) => r(x, 18, 3, 1, "#7fcfbf")).join("") +
    box(4, 21, 16, 15, WD) + r(5, 22, 14, 13, "#e8f4fb") + r(6, 23, 2, 1, "#fff") +
    r(11, 23, 2, 2, "#f6e3bf") + r(11, 25, 2, 1, O) + r(10, 26, 4, 3, "#e05a4f") + r(9, 29, 6, 3, "#e05a4f") + r(8, 32, 8, 2, "#c4453f") + r(10, 28, 4, 1, G) + r(11, 34, 2, 1, O) +
    box(23, 24, 10, 16, "#4f7a6a") + r(25, 26, 6, 6, GL) + r(30, 33, 1, 1, G) +
    box(22, 20, 12, 3, W) + r(24, 21, 2, 1, "#e88aa6") + r(27, 21, 2, 1, "#7fcfbf") + r(30, 21, 2, 1, "#e88aa6") +
    box(34, 33, 4, 7, "#8dbb5e") + r(35, 31, 2, 2, "#f2b8cf");

  const tree = (k) => k % 2
    ? svg(16, 26, r(6, 20, 4, 6, O) + r(7, 20, 2, 6, WD) + gable(0, 21, 16, "#4f8a3e", "#5f9a48") + gable(1, 16, 14, "#4f8a3e", "#5f9a48") + gable(2, 11, 12, "#4f8a3e", "#5f9a48") + gable(4, 6, 8, "#4f8a3e", "#5f9a48"), "vtree")
    : svg(16, 26, r(6, 16, 4, 10, O) + r(7, 16, 2, 10, WD) + disc(8, 9, 7, "#6fa34f") + r(4, 5, 3, 2, "#8dc46a") + r(10, 9, 2, 2, "#5b8f40") + r(5, 11, 1, 1, "#f2b8cf") + r(11, 5, 1, 1, "#f2b8cf"), "vtree");
  const cloud = () => svg(26, 9, r(6, 0, 10, 1, "#fff") + r(3, 1, 16, 2, "#fff") + r(0, 3, 26, 3, "#fff") + r(18, 2, 6, 1, "#fff") + r(1, 6, 24, 2, "#e3eef8") + r(4, 8, 18, 1, "#d2e2f2"), "vcloud");

  const v = document.createElement("div");
  v.id = "village";
  let html = '<div class="vsky" aria-hidden="true">' + [0, 1, 2, 3].map((i) => '<i class="c' + i + '">' + cloud() + "</i>").join("") + '</div><div class="vhill" aria-hidden="true"></div>';
  html += '<div class="vrow"><div class="vcol"><div class="vroul"></div><div class="vsign" aria-hidden="true"><b>홍보영상팀 마을</b><span>DREAM GUILD</span></div></div>' +
    '<div class="vhouse" data-shop="1" role="button" tabindex="0" aria-label="마을 옷가게 들어가기" title="마을 옷가게"><span class="vlabel">마을 옷가게</span>' + svg(40, 40, SHOP(), "vart") + "</div>" + tree(0);
  MEMBERS.forEach((m, i) => {
    const draw = HOUSES[m.id];
    if (!draw) return;
    html += '<div class="vcol"><div class="vboard" data-board="' + m.id + '"></div><div class="vhouse" data-house="' + m.id + '" role="button" tabindex="0" aria-label="' + m.place + ' 방 구경하기" title="' + m.place + ' — 방 구경하기"><span class="vlabel">' + m.place + "</span>" + svg(40, 40, draw(), "vart") + "</div></div>";
    if (i % 2 === 1 && i < MEMBERS.length - 1) html += tree((i + 1) / 2);
  });
  html += tree(1) + "</div>";
  v.innerHTML = html;
  document.body.insertBefore(v, document.body.firstChild);
  if (typeof paintBoards === "function") paintBoards();
  if (typeof buildRoulette === "function") buildRoulette();
})();
