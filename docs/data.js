/* DREAM GUILD 공통 데이터 (웹 마을과 같은 규칙) */
const CONFIG_DEFAULT = {
  SUPABASE_URL: "https://jkblamjcbdcdrnyofexh.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprYmxhbWpjYmRjZHJueW9mZXhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM5NDA0NTgsImV4cCI6MjEwOTUxNjQ1OH0.plBLvQo1ZwPfi0jA_mxGjj4epFBo7w69avPShof1lWM",
  TEAM_GOAL: 400
};
const XP = { S: 10, M: 30, L: 60 };
const NEED = (l) => 100 + 20 * (l - 1);
function levelInfo(xp) {
  let lv = 1, base = 0;
  while (lv < 20 && xp >= base + NEED(lv)) { base += NEED(lv); lv++; }
  const need = lv < 20 ? NEED(lv) : 0, into = lv < 20 ? xp - base : 0;
  return { lv, into, need, pct: lv < 20 ? Math.min(100, Math.round(into / need * 100)) : 100 };
}
const RANKS = ["이등병","일병","상병","병장","하사","중사","상사","원사","준위","소위","중위","대위","소령","중령","대령","준장","소장","중장","대장","대장 · 별 넷"];
const MEMBERS = [
  { id: "youngmin", name: "영민", cls: "군인", place: "영민의 부대", titles: [], skill: ["작전 완수", "L 퀘스트를 기한 안에 끝내면 +10 XP"],
    events: ["작전 브리핑 중 사단장님이 고개를 끄덕였어요.", "40km 행군 완주, 전우들이 박수를 쳐줬어요.", "새 계급장을 가슴에 달았어요."] },
  { id: "seonhan", name: "선한", cls: "목자의 길", place: "선한의 작은 교회", titles: ["신학생","전도사","담임목사","마을의 목자","백 년 교회의 원로"], skill: ["축복", "내가 레벨업하면 팀원 전체 +5 XP"],
    events: ["주일학교 아이가 설교 시간에 한 번도 안 졸았어요!", "새가족 환영 카드에 감사 편지가 돌아왔어요.", "성탄 예배 성가대가 화음을 완벽하게 맞췄어요."] },
  { id: "hyein", name: "혜인", cls: "뮤지컬배우", place: "혜인의 극장", titles: ["오디션 지원자","앙상블","조연","주연","레전드 디바"], skill: ["앙코르", "SNS 게시물 퀘스트를 4주 연속 완료하면 +20 XP"],
    events: ["커튼콜에서 객석 전체가 기립했어요!", "오디션 합격 문자가 왔어요.", "넘버 하이라이트 영상이 조회수 1만을 넘었어요."] },
  { id: "siwon", name: "시원", cls: "축구선수", place: "시원의 운동장", titles: ["동네 공차기 소년","조기축구회 에이스","K리그 데뷔","국가대표","발롱도르"], skill: ["어시스트", "내가 붙이는 응원 스티커는 XP 2배"],
    events: ["후반 추가시간, 프리킥이 골대 맞고 들어갔어요!", "조기축구회 단톡방에 MVP 투표가 올라왔어요.", "유니폼에 내 등번호가 새겨졌어요."] },
  { id: "jina", name: "진아", cls: "화가", place: "진아의 아틀리에", titles: ["스케치북 소녀","첫 그룹전","첫 개인전","미술관 초대전","거장"], skill: ["영감", "한 주에 S 퀘스트를 3개 이상 완료하면 +10 XP"],
    events: ["전시 방명록에 '위로받고 가요'라고 적혀 있었어요.", "첫 그림이 팔렸어요. 작은 액자였지만 큰 기쁨!", "미술 선생님이 내 그림 앞에서 한참 서 계셨어요."] },
  { id: "eunhwan", name: "은환", cls: "여행가이드", place: "은환의 여행사", titles: [], skill: ["여권 도장", "처음 해보는 종류의 퀘스트를 완료하면 도장 1개, +10 XP"],
    events: ["산책 코스 끝에서 할머니가 귤을 하나 쥐여주셨어요.", "제주 버스투어, 관광객들이 일정 끝나고 박수를 쳐줬어요!"] }
];
const byId = (id) => MEMBERS.find((m) => m.id === id);
const ROUTES = {
  explorer: { name: "탐험가 루트", desc: "아무도 가지 않은 길을 먼저 걸어요.", titles: ["오지 트레킹 가이드","세계 오지 탐험대장","지도에 없는 길을 여는 사람"], event: "히말라야 능선 위에서 일행 모두가 함께 일출을 봤어요." },
  leader: { name: "인솔자 루트", desc: "사람들을 이끌고 세계를 누벼요.", titles: ["해외 단체 인솔자","세계일주 투어 리더","전설의 여행 설계자"], event: "파리 공항에서 잃어버린 캐리어를 30분 만에 찾아냈어요." },
  story: { name: "이야기꾼 루트", desc: "목소리와 이야기로 여행을 전해요.", titles: ["오디오 가이드 내레이터","여행 다큐 진행자","길 위의 이야기꾼"], event: "내레이션한 여행 다큐 엔딩 크레딧에 내 이름이 올라갔어요!" },
  pilgrim: { name: "순례길 가이드", desc: "숨겨진 네 번째 길", titles: ["성지순례 인솔자","순례길의 동반자","바울의 길을 걷는 사람"], event: "순례길 끝에서 일행이 함께 찬양을 불렀어요." }
};
function titleOf(m, lv, route) {
  if (m.id === "youngmin") return RANKS[lv - 1];
  if (m.id === "eunhwan") {
    if (lv < 5) return "동네 산책 안내원";
    if (lv < 10 || !route) return "국내 투어 가이드";
    const r = ROUTES[route].titles;
    return lv < 15 ? r[0] : lv < 20 ? r[1] : r[2];
  }
  return m.titles[lv < 5 ? 0 : lv < 10 ? 1 : lv < 15 ? 2 : lv < 20 ? 3 : 4];
}
function nextStep(m, lv, route) {
  const now = titleOf(m, lv, route);
  for (let l = lv + 1; l <= 20; l++) {
    if (m.id === "eunhwan" && !route && l === 10) return { lv: 10, title: "2차 전직 · 세 갈래 길" };
    const t = titleOf(m, l, route);
    if (t !== now) return { lv: l, title: t };
  }
  return null;
}
function eventOf(m, lv, route) {
  if (m.id === "eunhwan" && route && lv >= 10) return ROUTES[route].event;
  return m.events[lv % m.events.length];
}

/* ---------- 날짜 ---------- */
function mondayOf(d) { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; }
function ymd(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function weekLabel(mon) {
  const th = addDays(mon, 3), sun = addDays(mon, 6);
  return { title: (th.getMonth() + 1) + "월 " + Math.ceil(th.getDate() / 7) + "주차", range: (mon.getMonth() + 1) + "." + mon.getDate() + " ~ " + (sun.getMonth() + 1) + "." + sun.getDate() };
}
const hhmm = (iso) => { const d = new Date(iso); return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); };

