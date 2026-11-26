/* DREAM GUILD · 각자의 방 — 가구, 벽지, 바닥 (레벨로 해금) */
const ROOM_W = 440, ROOM_H = 240, WALL_H = 140;
const O = "#4E2E17"; // 외곽선
const r = (x, y, w, h, f, extra) => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + f + '"' + (extra || "") + "/>";
const ro = (x, y, w, h, f) => r(x, y, w, h, f, ' stroke="' + O + '" stroke-width="2"');
const c = (x, y, rr, f, extra) => '<circle cx="' + x + '" cy="' + y + '" r="' + rr + '" fill="' + f + '"' + (extra || "") + "/>";
const p = (d, f, extra) => '<path d="' + d + '" fill="' + f + '"' + (extra || "") + "/>";
const MEMBER_COLOR = { youngmin: "#5C6A40", seonhan: "#4F74C8", hyein: "#9B6FD1", siwon: "#D2603A", jina: "#E6E0D6", eunhwan: "#4F7A3A" };

/* place: floor(바닥에 놓는 가구) / wall(벽에 거는 장식) / rug(바닥 깔개, 맨 아래) */
const ITEMS = [
  /* ---- 공용 가구 ---- */
  { id: "bed", name: "침대", lv: 1, place: "floor", w: 120, h: 62, x: 18, y: 96,
    art: (m) => ro(2, 30, 116, 22, "#B98A55") + ro(2, 8, 12, 50, "#8A5A33") + ro(10, 22, 104, 14, "#FFF8EA") + ro(40, 20, 76, 18, MEMBER_COLOR[m] || "#7FB3E8") + ro(14, 14, 24, 12, "#FFFFFF") + r(6, 52, 6, 8, "#6E4424") + r(108, 52, 6, 8, "#6E4424") },
  { id: "desk", name: "편집 책상", lv: 1, place: "floor", w: 104, h: 76, x: 70, y: 90,
    art: () => ro(30, 4, 48, 32, "#2A3550") + r(34, 8, 40, 24, "#7FB3E8") + r(36, 12, 22, 3, "#FCE38A") + r(36, 18, 30, 3, "#F2A58C") + r(36, 24, 16, 3, "#BFE3A3") + r(50, 36, 8, 6, "#2A3550") + ro(2, 42, 100, 8, "#B98A55") + r(8, 50, 6, 24, "#8A5A33") + r(90, 50, 6, 24, "#8A5A33") + ro(64, 44, 22, 6, "#3B2A1E") },
  { id: "camera", name: "촬영 카메라", lv: 2, place: "floor", w: 44, h: 86, x: 88, y: 94,
    art: () => ro(8, 6, 26, 18, "#2A3550") + c(34, 15, 7, "#3B4A6A", ' stroke="' + O + '" stroke-width="2"') + c(34, 15, 3, "#7FB3E8") + r(12, 2, 8, 4, "#B8452F") + p("M21 24 L8 84 M21 24 L34 84 M21 24 L21 84", "none", ' stroke="' + O + '" stroke-width="3"') },
  { id: "rug", name: "동그란 러그", lv: 3, place: "rug", w: 150, h: 34, x: 50, y: 92,
    art: (m) => '<ellipse cx="75" cy="17" rx="73" ry="15" fill="#E9A06B" stroke="' + O + '" stroke-width="2"/><ellipse cx="75" cy="17" rx="54" ry="10" fill="#F7D58B"/><ellipse cx="75" cy="17" rx="30" ry="5" fill="' + (MEMBER_COLOR[m] || "#7FB3E8") + '"/>' },
  { id: "plant", name: "화분", lv: 4, place: "floor", w: 40, h: 64, x: 92, y: 92,
    art: () => p("M20 34 C4 30 2 12 12 6 C14 16 18 22 20 34 Z", "#4F9058", ' stroke="' + O + '" stroke-width="2"') + p("M20 34 C36 30 38 10 28 4 C26 16 22 22 20 34 Z", "#3E7A4A", ' stroke="' + O + '" stroke-width="2"') + p("M20 34 C16 22 18 8 20 2 C22 8 24 22 20 34Z", "#6FA45A") + ro(8, 34, 24, 28, "#C9733F") + r(8, 34, 24, 5, "#A85A2E") },
  { id: "shelf", name: "책장", lv: 6, place: "floor", w: 66, h: 98, x: 8, y: 66,
    art: () => ro(2, 2, 62, 94, "#8A5A33") + r(6, 6, 54, 26, "#5A3A20") + r(6, 36, 54, 26, "#5A3A20") + r(6, 66, 54, 26, "#5A3A20") +
      r(8, 10, 7, 22, "#E05A4F") + r(16, 14, 6, 18, "#4F74C8") + r(23, 10, 8, 22, "#F5C451") + r(33, 12, 6, 20, "#6FA45A") + r(41, 18, 16, 14, "#F4E9F0") +
      r(8, 42, 10, 20, "#9B6FD1") + r(19, 40, 6, 22, "#F2A58C") + r(27, 44, 7, 18, "#7FB3E8") + r(40, 46, 16, 16, "#C9733F") + r(8, 72, 22, 20, "#E3A63C") + r(34, 70, 6, 22, "#4F9058") + r(42, 74, 14, 18, "#E05A4F") },
  { id: "lamp", name: "스탠드 조명", lv: 7, place: "floor", w: 40, h: 92, x: 96, y: 76,
    art: () => '<ellipse cx="20" cy="22" rx="18" ry="16" fill="#FCE38A" opacity=".45"/>' + p("M6 26 L12 6 L28 6 L34 26 Z", "#F5C451", ' stroke="' + O + '" stroke-width="2"') + r(18, 26, 4, 58, "#3B2A1E") + ro(8, 84, 24, 6, "#3B2A1E") },
  { id: "clock", name: "벽시계", lv: 8, place: "wall", w: 36, h: 36, x: 50, y: 30,
    art: () => c(18, 18, 16, "#FFF8EA", ' stroke="' + O + '" stroke-width="3"') + p("M18 18 L18 8 M18 18 L25 21", "none", ' stroke="' + O + '" stroke-width="2.5" stroke-linecap="round"') + c(18, 18, 2, O) },
  { id: "frame", name: "풍경 액자", lv: 9, place: "wall", w: 62, h: 46, x: 74, y: 40,
    art: () => ro(2, 2, 58, 42, "#B98A55") + r(8, 8, 46, 30, "#BFE3FF") + p("M8 38 L22 20 L32 30 L40 22 L54 38 Z", "#6FA45A") + c(44, 15, 4, "#F5C451") },
  { id: "sofa", name: "소파", lv: 11, place: "floor", w: 120, h: 58, x: 40, y: 98,
    art: (m) => ro(10, 6, 100, 30, MEMBER_COLOR[m] || "#9B6FD1") + ro(2, 22, 18, 32, MEMBER_COLOR[m] || "#9B6FD1") + ro(100, 22, 18, 32, MEMBER_COLOR[m] || "#9B6FD1") + ro(18, 30, 84, 22, "#F4E3C3") + r(30, 34, 28, 14, "#FFF8EA") + r(62, 34, 28, 14, "#FFF8EA") + r(6, 54, 6, 4, O) + r(108, 54, 6, 4, O) },
  { id: "lights", name: "꼬마전구", lv: 12, place: "wall", w: 200, h: 30, x: 50, y: 12,
    art: () => p("M2 6 Q50 26 100 8 Q150 26 198 6", "none", ' stroke="' + O + '" stroke-width="2"') + [[14, 11, "#F5C451"], [38, 17, "#F2A58C"], [62, 17, "#BFE3A3"], [86, 12, "#7FB3E8"], [114, 12, "#F5C451"], [138, 17, "#F2A58C"], [162, 17, "#BFE3A3"], [186, 11, "#7FB3E8"]].map(([x, y, f]) => c(x, y + 4, 5, f, ' stroke="' + O + '" stroke-width="1.5"')).join("") },
  { id: "cat", name: "고양이", lv: 14, place: "floor", w: 46, h: 40, x: 62, y: 99,
    art: () => p("M6 38 Q4 18 16 16 L14 6 L22 14 L30 14 L38 6 L36 16 Q46 20 42 38 Z", "#E9A06B", ' stroke="' + O + '" stroke-width="2"') + c(20, 24, 2.2, O) + c(32, 24, 2.2, O) + p("M24 29 L26 31 L28 29", "none", ' stroke="' + O + '" stroke-width="1.5"') + p("M42 34 Q52 30 48 20", "none", ' stroke="#E9A06B" stroke-width="5" stroke-linecap="round"') },
  { id: "aquarium", name: "어항", lv: 16, place: "floor", w: 70, h: 64, x: 84, y: 84,
    art: () => ro(4, 4, 62, 38, "#BFE3FF") + r(6, 30, 58, 10, "#F7D58B") + p("M20 18 l8 -4 v8 z M20 18 c4 -5 10 -5 12 0 c-2 5 -8 5 -12 0", "#E07A2F") + p("M44 24 c3 -4 8 -4 10 0 c-2 4 -7 4 -10 0 l-5 -3 v6 z", "#F5C451") + ro(10, 42, 50, 20, "#8A5A33") },
  { id: "neon", name: "DREAM 네온사인", lv: 18, place: "wall", w: 110, h: 34, x: 50, y: 40,
    art: () => ro(2, 2, 106, 30, "#2A1E3F") + '<text x="55" y="23" text-anchor="middle" font-family="Galmuri11, monospace" font-size="16" font-weight="700" fill="#FF9AD5" stroke="#FFE3F4" stroke-width=".6">DREAM</text>' },

  /* ---- 직업별 특별 가구 (전직 레벨에 해금) ---- */
  /* ---- 선물로만 받는 가구 (진아 님의 「그림 선물」 스킬) ---- */
  { id: "giftpainting", gift: "jina", name: "진아의 선물 그림", lv: 1, place: "wall", w: 58, h: 48, x: 84, y: 44,
    art: () => ro(2, 2, 54, 44, "#C98A2A") + r(7, 7, 44, 34, "#FFF8EA") + c(20, 20, 7, "#F2A58C") + c(34, 26, 8, "#7FB3E8") + p("M8 40 Q22 28 50 38", "none", ' stroke="#6FA45A" stroke-width="4"') + '<text x="44" y="38" font-size="7" fill="#4E2E17" font-family="sans-serif">J</text>' },

  { id: "lectern", cls: "seonhan", name: "말씀 강대상", lv: 5, place: "floor", w: 50, h: 76, x: 84, y: 92,
    art: () => p("M4 14 L46 14 L40 26 L10 26 Z", "#8A5A33", ' stroke="' + O + '" stroke-width="2"') + ro(16, 26, 18, 48, "#B98A55") + ro(10, 6, 30, 10, "#FFF8EA") + r(24, 6, 2, 10, O) + p("M25 34 v18 M19 40 h12", "none", ' stroke="#E3A63C" stroke-width="3"') },
  { id: "stained", cls: "seonhan", name: "스테인드글라스", lv: 10, place: "wall", w: 56, h: 76, x: 26, y: 54,
    art: () => p("M4 74 V28 A24 24 0 0 1 52 28 V74 Z", "#2A3550", ' stroke="' + O + '" stroke-width="3"') + p("M8 70 V30 A20 20 0 0 1 28 10 V70Z", "#7FB3E8") + p("M28 10 A20 20 0 0 1 48 30 V70 H28Z", "#F2A58C") + r(8, 40, 40, 14, "#F5C451", ' opacity=".85"') + p("M28 18 v40 M18 30 h20", "none", ' stroke="#FFF8EA" stroke-width="3"') },
  { id: "organ", cls: "seonhan", name: "작은 오르간", lv: 15, place: "floor", w: 92, h: 72, x: 60, y: 90,
    art: () => ro(4, 4, 84, 38, "#8A5A33") + [12, 22, 32, 42, 52, 62, 72].map((x) => r(x, 8, 6, 30, "#E3C08A")).join("") + ro(0, 42, 92, 12, "#5A3A20") + r(4, 44, 84, 6, "#FFF8EA") + [10, 22, 34, 46, 58, 70, 82].map((x) => r(x, 44, 3, 4, O)).join("") + r(8, 54, 8, 16, "#5A3A20") + r(76, 54, 8, 16, "#5A3A20") },
  { id: "bell", cls: "seonhan", name: "축복의 종", lv: 20, place: "wall", w: 52, h: 60, x: 80, y: 40,
    art: () => r(24, 0, 4, 10, O) + p("M8 46 Q8 12 26 10 Q44 12 44 46 Z", "#E3A63C", ' stroke="' + O + '" stroke-width="2.5"') + ro(4, 44, 44, 6, "#C98A2A") + c(26, 54, 5, "#C98A2A", ' stroke="' + O + '" stroke-width="2"') + p("M16 26 Q20 18 26 17", "none", ' stroke="#FCE38A" stroke-width="3" stroke-linecap="round"') },

  { id: "ball", cls: "siwon", name: "축구공", lv: 5, place: "floor", w: 30, h: 30, x: 60, y: 99,
    art: () => c(15, 15, 13, "#FFFFFF", ' stroke="' + O + '" stroke-width="2"') + p("M15 9 l5 4 -2 6 h-6 l-2 -6 z", O) + p("M3 13 l4 1 M27 13 l-4 1 M9 26 l3 -5 M21 26 l-3 -5 M15 2 v5", "none", ' stroke="' + O + '" stroke-width="1.8"') },
  { id: "goal", cls: "siwon", name: "미니 골대", lv: 10, place: "floor", w: 110, h: 70, x: 80, y: 82,
    art: () => '<g stroke="#C9D3E6" stroke-width="1">' + [14, 26, 38, 50, 62, 74, 86, 98].map((x) => '<line x1="' + x + '" y1="6" x2="' + x + '" y2="66"/>').join("") + [16, 28, 40, 52].map((y) => '<line x1="6" y1="' + y + '" x2="104" y2="' + y + '"/>').join("") + "</g>" + p("M4 68 V4 H106 V68", "none", ' stroke="#FFFFFF" stroke-width="5"') + p("M4 68 V4 H106 V68", "none", ' stroke="' + O + '" stroke-width="1.5"') },
  { id: "trophy", cls: "siwon", name: "우승 트로피", lv: 15, place: "floor", w: 46, h: 64, x: 30, y: 82,
    art: () => p("M10 4 H36 V20 Q36 34 23 36 Q10 34 10 20 Z", "#F5C451", ' stroke="' + O + '" stroke-width="2"') + p("M10 8 H3 Q3 22 12 24 M36 8 H43 Q43 22 34 24", "none", ' stroke="' + O + '" stroke-width="2.5"') + r(20, 36, 6, 12, "#E3A63C") + ro(10, 48, 26, 8, "#8A5A33") + ro(6, 56, 34, 6, "#6E4424") },
  { id: "ballondor", cls: "siwon", name: "발롱도르", lv: 20, place: "floor", w: 48, h: 72, x: 46, y: 80,
    art: () => '<ellipse cx="24" cy="22" rx="22" ry="20" fill="#FCE38A" opacity=".5"/>' + c(24, 22, 16, "#F5C451", ' stroke="' + O + '" stroke-width="2"') + p("M24 8 v28 M10 18 h28 M12 28 h24", "none", ' stroke="#C98A2A" stroke-width="2"') + ro(16, 40, 16, 18, "#E3A63C") + ro(8, 58, 32, 10, "#2A3550") },

  { id: "backpack", cls: "youngmin", name: "군용 배낭", lv: 5, place: "floor", w: 44, h: 54, x: 90, y: 99,
    art: () => ro(6, 8, 32, 44, "#6E7D4C") + ro(10, 14, 24, 14, "#56633C") + ro(10, 34, 24, 14, "#56633C") + p("M14 8 Q22 0 30 8", "none", ' stroke="' + O + '" stroke-width="3"') + c(16, 20, 2, "#3D4A2A") + c(28, 40, 2.5, "#3D4A2A") },
  { id: "flag", cls: "youngmin", name: "부대 깃발", lv: 10, place: "floor", w: 50, h: 104, x: 88, y: 78,
    art: () => r(6, 4, 4, 96, "#CFD9EE", ' stroke="' + O + '" stroke-width="1"') + ro(10, 8, 38, 26, "#4F74C8") + p("M29 14 l3 6 h6 l-5 4 2 6 -6 -4 -6 4 2 -6 -5 -4 h6 z", "#F5C451") + ro(0, 98, 16, 6, "#3B2A1E") },
  { id: "map", cls: "youngmin", name: "작전 지도", lv: 15, place: "wall", w: 86, h: 58, x: 38, y: 50,
    art: () => ro(2, 2, 82, 54, "#E9D3A6") + p("M10 40 Q24 14 40 24 T76 14", "none", ' stroke="#4F9058" stroke-width="6" opacity=".7"') + p("M14 46 L34 32 L50 40 L70 22", "none", ' stroke="#B8452F" stroke-width="2.5" stroke-dasharray="5 3"') + p("M66 18 l8 8 M74 18 l-8 8", "none", ' stroke="#B8452F" stroke-width="3"') + c(14, 46, 3, "#4F74C8") },
  { id: "stars", cls: "youngmin", name: "별 넷 계급장 액자", lv: 20, place: "wall", w: 82, h: 42, x: 72, y: 34,
    art: () => ro(2, 2, 78, 38, "#2A3550") + [16, 32, 48, 64].map((x) => p("M" + x + " 11 l3 6 h6 l-5 4 2 6 -6 -4 -6 4 2 -6 -5 -4 h6 z", "#F5C451", ' stroke="#C98A2A" stroke-width="1"')).join("") },

  { id: "suitcase", cls: "eunhwan", name: "여행 가방", lv: 5, place: "floor", w: 46, h: 58, x: 92, y: 99,
    art: () => p("M16 10 V4 H30 V10", "none", ' stroke="' + O + '" stroke-width="3"') + ro(4, 10, 38, 40, "#E07A2F") + r(4, 22, 38, 4, "#B8452F") + r(4, 36, 38, 4, "#B8452F") + ro(10, 14, 12, 8, "#FFF8EA") + c(12, 53, 3, O) + c(34, 53, 3, O) },
  { id: "worldmap", cls: "eunhwan", name: "세계 지도", lv: 10, place: "wall", w: 96, h: 56, x: 40, y: 46,
    art: () => ro(2, 2, 92, 52, "#BFE3FF") + p("M10 16 q8 -6 16 0 q4 10 -4 16 q-8 4 -12 -4 z M34 12 q10 -4 16 4 q-2 8 -8 8 q-8 0 -8 -12 z M54 14 q18 -6 30 6 q-4 12 -16 10 q-14 -2 -14 -16 z M40 34 q6 0 6 8 q-4 8 -8 2 z M74 38 q8 -2 10 6 q-6 4 -10 -6 z", "#6FA45A") + c(30, 20, 3, "#E05A4F") + c(62, 20, 3, "#E05A4F") + p("M30 20 Q46 8 62 20", "none", ' stroke="#E05A4F" stroke-width="1.5" stroke-dasharray="3 2"') },
  { id: "globe", cls: "eunhwan", name: "지구본", lv: 15, place: "floor", w: 50, h: 72, x: 30, y: 84,
    art: () => c(25, 26, 20, "#7FB3E8", ' stroke="' + O + '" stroke-width="2"') + p("M14 18 q6 -6 12 0 q2 8 -6 10 q-6 -2 -6 -10z M30 30 q8 -2 10 6 q-6 8 -12 2z", "#6FA45A") + p("M5 26 A20 20 0 0 0 45 26", "none", ' stroke="#E3A63C" stroke-width="3"') + r(23, 46, 4, 14, "#8A5A33") + ro(12, 60, 26, 8, "#8A5A33") },
  { id: "balloon", cls: "eunhwan", name: "열기구 모빌", lv: 20, place: "wall", w: 56, h: 80, x: 80, y: 60,
    art: () => r(27, 0, 2, 8, O) + p("M28 8 C6 8 4 36 18 48 L38 48 C52 36 50 8 28 8 Z", "#F2A58C", ' stroke="' + O + '" stroke-width="2"') + p("M28 8 C20 20 20 40 24 48 M28 8 C36 20 36 40 32 48", "none", ' stroke="#E3A63C" stroke-width="3"') + p("M20 48 L22 62 M36 48 L34 62", "none", ' stroke="' + O + '" stroke-width="1.5"') + ro(20, 62, 16, 12, "#B98A55") },

  { id: "easel", cls: "jina", name: "이젤", lv: 5, place: "floor", w: 56, h: 96, x: 88, y: 92,
    art: () => p("M28 4 L8 94 M28 4 L48 94 M28 4 L28 94", "none", ' stroke="#B48A5C" stroke-width="4"') + ro(8, 12, 40, 34, "#FFFFFF") + c(20, 24, 5, "#E05A4F") + c(34, 30, 6, "#4F74C8") + p("M12 42 Q26 32 44 40", "none", ' stroke="#4F9058" stroke-width="4"') + r(6, 46, 44, 4, "#8A5A33") },
  { id: "palette", cls: "jina", name: "물감 테이블", lv: 10, place: "floor", w: 66, h: 56, x: 30, y: 98,
    art: () => ro(4, 22, 58, 8, "#B98A55") + r(10, 30, 5, 24, "#8A5A33") + r(51, 30, 5, 24, "#8A5A33") + p("M10 20 Q8 8 24 6 Q46 4 52 14 Q54 22 42 20 Q34 18 32 22 Z", "#F4E3C3", ' stroke="' + O + '" stroke-width="2"') + c(18, 12, 3, "#E05A4F") + c(28, 9, 3, "#F5C451") + c(38, 10, 3, "#4F74C8") + c(46, 14, 3, "#6FA45A") },
  { id: "gallery", cls: "jina", name: "작은 갤러리 벽", lv: 15, place: "wall", w: 120, h: 62, x: 44, y: 46,
    art: () => ro(2, 4, 40, 30, "#B98A55") + r(7, 9, 30, 20, "#F2B8CF") + ro(48, 2, 30, 40, "#2A3550") + r(53, 7, 20, 30, "#F5C451") + ro(84, 10, 34, 26, "#B98A55") + r(89, 15, 24, 16, "#BFE3A3") + ro(20, 40, 30, 20, "#8A5A33") + r(25, 45, 20, 10, "#7FB3E8") + ro(60, 46, 40, 14, "#B98A55") + r(65, 49, 30, 8, "#F2A58C") },
  { id: "masterpiece", cls: "jina", name: "거장의 대작", lv: 20, place: "wall", w: 104, h: 76, x: 70, y: 56,
    art: () => ro(2, 2, 100, 72, "#C98A2A") + r(8, 8, 88, 60, "#2A3550") + c(70, 24, 10, "#F5C451") + p("M8 68 L30 36 L46 52 L62 32 L96 68 Z", "#4F74C8") + p("M8 68 L24 50 L40 62 L56 46 L96 68 Z", "#6FA45A") + p("M14 18 Q24 10 34 18 Q44 26 54 16", "none", ' stroke="#F4E9F0" stroke-width="3" opacity=".8"') },

  { id: "mic", cls: "hyein", name: "마이크 스탠드", lv: 5, place: "floor", w: 36, h: 96, x: 90, y: 92,
    art: () => ro(10, 2, 16, 22, "#3B2A1E") + r(12, 4, 12, 18, "#8696BA") + r(16, 24, 4, 64, "#3B2A1E") + p("M4 94 L18 84 L32 94", "none", ' stroke="' + O + '" stroke-width="4"') },
  { id: "spotlight", cls: "hyein", name: "무대 조명", lv: 10, place: "wall", w: 70, h: 120, x: 70, y: 80,
    art: () => p("M22 22 L48 22 L70 118 L0 118 Z", "#FCE38A", ' opacity=".35"') + ro(20, 4, 30, 20, "#3B2A1E") + r(24, 18, 22, 6, "#F5C451") + r(33, 0, 4, 6, O) },
  { id: "curtain", cls: "hyein", name: "무대 커튼", lv: 15, place: "wall", w: 170, h: 92, x: 50, y: 64,
    art: () => ro(2, 2, 166, 14, "#8E2236") + p("M4 16 Q20 50 8 90 H46 Q34 50 58 16 Z", "#B8344A", ' stroke="' + O + '" stroke-width="2"') + p("M166 16 Q150 50 162 90 H124 Q136 50 112 16 Z", "#B8344A", ' stroke="' + O + '" stroke-width="2"') + [20, 44, 68, 92, 116, 140].map((x) => c(x + 6, 9, 3, "#FCE38A")).join("") },
  { id: "roses", cls: "hyein", name: "커튼콜 꽃다발", lv: 20, place: "floor", w: 48, h: 60, x: 34, y: 99,
    art: () => p("M14 58 L24 26 L34 58 Z", "#F4E3C3", ' stroke="' + O + '" stroke-width="2"') + c(16, 20, 8, "#E05A4F", ' stroke="' + O + '" stroke-width="1.5"') + c(32, 18, 8, "#F2A58C", ' stroke="' + O + '" stroke-width="1.5"') + c(24, 10, 8, "#E05A4F", ' stroke="' + O + '" stroke-width="1.5"') + p("M20 28 l-10 6 M28 28 l10 6", "none", ' stroke="#4F9058" stroke-width="3"') + r(18, 40, 12, 4, "#F5C451") }
];
const itemById = (id) => ITEMS.find((i) => i.id === id);

const WALLS = [
  { id: "cream", name: "크림", lv: 1, css: "#F6E7C8" },
  { id: "mint", name: "민트", lv: 3, css: "#CFE8D5" },
  { id: "sky", name: "하늘 줄무늬", lv: 6, css: "repeating-linear-gradient(90deg,#CFE3F7 0 18px,#BCD6F1 18px 36px)" },
  { id: "dots", name: "라벤더 땡땡이", lv: 9, css: "radial-gradient(#C9B6EA 3px,transparent 3.5px) 0 0/22px 22px,#E7DDF6" },
  { id: "night", name: "밤하늘", lv: 13, css: "radial-gradient(#FCE38A 1.5px,transparent 2px) 0 0/31px 27px,radial-gradient(#FFFFFF 1px,transparent 1.5px) 13px 9px/23px 29px,#26315A" },
  { id: "gold", name: "금빛 무늬", lv: 17, css: "repeating-linear-gradient(45deg,#F1D58A 0 10px,#E8C46A 10px 20px)" }
];
const FLOORS = [
  { id: "wood", name: "나무 마루", lv: 1, css: "repeating-linear-gradient(90deg,#C99A62 0 54px,#B98A55 54px 56px),#C99A62" },
  { id: "carpet", name: "초록 카펫", lv: 5, css: "radial-gradient(#7FAF6A 1px,transparent 1.5px) 0 0/8px 8px,#8CBA74" },
  { id: "tile", name: "체크 타일", lv: 10, css: "repeating-conic-gradient(#F4E9F0 0 25%,#D9C7D3 0 50%) 0 0/28px 28px" },
  { id: "marble", name: "대리석", lv: 15, css: "linear-gradient(115deg,transparent 40%,rgba(160,150,140,.25) 41%,transparent 43%),#EFEAE3" }
];

/* 이 사람이 쓸 수 있는 가구 */
function hasGift(memberId, from) { try { return (S.skills || []).some((l) => l.caster === from && l.skill === "gift" && l.target === memberId); } catch (e) { return false; } }
function itemsFor(memberId) { return ITEMS.filter((i) => (!i.cls || i.cls === memberId) && (!i.gift || hasGift(memberId, i.gift))); }
function defaultLayout() { return { wall: "cream", floor: "wood", items: [{ id: "bed", x: 18, y: 96 }, { id: "desk", x: 70, y: 90 }] }; }
function itemSvg(it, memberId) {
  return '<svg viewBox="0 0 ' + it.w + " " + it.h + '" width="' + it.w + '" height="' + it.h + '" shape-rendering="crispEdges" aria-hidden="true">' + it.art(memberId) + "</svg>";
}
