/* DREAM GUILD · HP / MP / 고유 스킬 / 고유 효과
   - HP: 평일 아침 9시에 가득 차서 저녁 6시까지 시간이 지나며 천천히 닳아요(최대치의 10%까지).
         동료의 회복 스킬을 받으면 다시 차요. 낮아져도 불이익은 없고, 서로 챙기는 신호예요.
   - MP: 이번 주에 할 일을 끝내며 모으는 힘. 스킬을 쓸 때 써요. 월요일에 새로 시작해요.
   - 스킬은 HP·MP에만 영향을 줘요. 경험치(XP)와 레벨은 할 일로만 올라요. */
const MP_GAIN = { S: 5, M: 10, L: 20 };
const STAT_BONUS = { // 직업별 성장 보정
  youngmin: { hp: 1.2, mp: 1.0 }, siwon: { hp: 1.1, mp: 1.0 }, seonhan: { hp: 1.0, mp: 1.2 },
  jina: { hp: 1.0, mp: 1.2 }, hyein: { hp: 1.0, mp: 1.1 }, eunhwan: { hp: 1.1, mp: 1.1 }
};
const maxHP = (id, lv) => Math.round((100 + 10 * (lv - 1)) * (STAT_BONUS[id] || { hp: 1 }).hp);
const maxMP = (id, lv) => Math.round((50 + 5 * (lv - 1)) * (STAT_BONUS[id] || { mp: 1 }).mp);

/* target: one(동료 1명) / team(팀 전체) / self(나) · hp: 오늘 추가 체력 · mp: MP 선물 */
const SKILLS = {
  seonhan: [
    { id: "bless", name: "축복", lv: 1, cost: 20, target: "one", hp: 30, icon: "✨", desc: "동료 1명 HP +30 회복" },
    { id: "pray", name: "함께 기도", lv: 10, cost: 40, target: "team", hp: 15, icon: "🕊", desc: "팀 전체 HP +15 회복" }
  ],
  siwon: [
    { id: "assist", name: "어시스트", lv: 1, cost: 15, target: "one", mp: 10, icon: "⚽", desc: "동료 1명에게 MP +10 패스" },
    { id: "halftime", name: "하프타임", lv: 10, cost: 35, target: "team", hp: 10, icon: "🥤", desc: "팀 전체 HP +10 회복" }
  ],
  youngmin: [
    { id: "operation", name: "작전 개시", lv: 1, cost: 15, target: "self", hp: 25, icon: "🎖", desc: "내 HP +25 회복 (전투 태세)" },
    { id: "supply", name: "보급", lv: 10, cost: 30, target: "one", mp: 20, icon: "📦", desc: "동료 1명에게 MP +20 보급품" }
  ],
  eunhwan: [
    { id: "guide", name: "길 안내", lv: 1, cost: 15, target: "one", hp: 15, mp: 5, icon: "🧭", desc: "동료 1명 HP +15 회복, MP +5" },
    { id: "tour", name: "단체 여행", lv: 10, cost: 40, target: "team", mp: 8, icon: "🚌", desc: "팀 전체 MP +8" }
  ],
  jina: [
    { id: "gift", name: "그림 선물", lv: 1, cost: 20, target: "one", hp: 20, icon: "🖼", desc: "동료 방에 내 그림 액자를 선물하고 HP +20 회복" },
    { id: "brush", name: "영감의 붓", lv: 10, cost: 30, target: "one", mp: 15, icon: "🖌", desc: "동료 1명에게 MP +15" }
  ],
  hyein: [
    { id: "cheer", name: "응원가", lv: 1, cost: 20, target: "team", hp: 10, icon: "🎵", desc: "팀 전체 HP +10 회복" },
    { id: "encore", name: "앙코르", lv: 10, cost: 35, target: "one", hp: 40, icon: "🎭", desc: "동료 1명 HP +40 회복" }
  ]
};
const PASSIVES = {
  seonhan: { name: "목자의 마음", desc: "내가 주는 HP 회복이 1.5배가 돼요." },
  siwon: { name: "팀플레이", desc: "같은 날 다른 동료도 할 일을 끝냈다면, 내가 끝낼 때 MP +5." },
  youngmin: { name: "규율", desc: "월요일에 그 주 할 일을 3개 이상 적어 두면 MP +20." },
  eunhwan: { name: "여권 도장", desc: "한 주에 S·M·L 크기를 모두 한 번씩 끝내면 MP +20." },
  jina: { name: "영감", desc: "한 주에 S 할 일을 3개 끝내면 MP +15." },
  hyein: { name: "커튼콜", desc: "금요일에 끝낸 일은 MP를 두 배로 받아요." }
};
const skillOf = (member, sid) => (SKILLS[member] || []).find((s) => s.id === sid);
const dayOf = (iso) => ymd(new Date(iso));

/* 스킬 기록 하나가 누구에게 무엇을 주는지 */
function skillEffects(log) {
  const s = skillOf(log.caster, log.skill); if (!s) return [];
  const targets = s.target === "team" ? MEMBERS.map((m) => m.id) : s.target === "self" ? [log.caster] : [log.target];
  const hpMul = log.caster === "seonhan" ? 1.5 : 1;
  return targets.filter(Boolean).map((t) => ({ to: t, hp: s.hp ? Math.round(s.hp * hpMul) : 0, mp: s.mp || 0 }));
}

/* 오늘의 HP: 9시부터 18시까지 닳고, 회복 스킬로 다시 차요 */
const HP_START = 9, HP_END = 18, HP_FLOOR = 0.1;
function hpNow(id, lv, skills, nowDate) {
  const now = nowDate || new Date(), max = maxHP(id, lv);
  const day = now.getDay(); if (day === 0 || day === 6) return max; // 주말은 푹 쉬어요
  const start = new Date(now); start.setHours(HP_START, 0, 0, 0);
  if (now < start) return max;
  const rate = max * (1 - HP_FLOOR) / ((HP_END - HP_START) * 3600e3); // 1ms마다 닳는 양
  const end = new Date(now); end.setHours(HP_END, 0, 0, 0);
  const drainUntil = (t) => Math.min(t, end.getTime());
  const heals = [];
  (skills || []).forEach((l) => { const t = new Date(l.created_at).getTime(); if (t >= start.getTime() && t <= now.getTime()) skillEffects(l).forEach((e) => { if (e.to === id && e.hp) heals.push({ t, hp: e.hp }); }); });
  heals.sort((a, b) => a.t - b.t);
  let hp = max, last = start.getTime();
  heals.forEach((h) => { hp = Math.max(0, hp - rate * Math.max(0, drainUntil(h.t) - drainUntil(last))); hp = Math.min(max, hp + h.hp); last = h.t; });
  hp = Math.max(0, hp - rate * Math.max(0, drainUntil(now.getTime()) - drainUntil(last)));
  return Math.round(hp);
}

/* 이번 주 MP: 일어난 순서대로 더하고 빼며, 0과 최대치 사이로 맞춰요 */
function mpNow(id, lv, tasks, skills, weekMon) {
  const wk = ymd(weekMon), start = weekMon.getTime(), end = start + 7 * 864e5, cap = maxMP(id, lv);
  const inWeek = (iso) => { const t = new Date(iso).getTime(); return t >= start && t < end; };
  const ev = [];
  const mineDone = tasks.filter((t) => t.member === id && t.done && t.done_at && inWeek(t.done_at)).sort((a, b) => a.done_at.localeCompare(b.done_at));
  const sizesDone = new Set(); let sCount = 0, passportGiven = false, inspireGiven = false;
  mineDone.forEach((t) => {
    let g = MP_GAIN[t.size] || 0;
    if (id === "hyein" && new Date(t.done_at).getDay() === 5) g *= 2;
    ev.push({ at: t.done_at, d: g });
    if (id === "siwon" && tasks.some((o) => o.member !== id && o.done && o.done_at && dayOf(o.done_at) === dayOf(t.done_at) && o.done_at <= t.done_at)) ev.push({ at: t.done_at, d: 5 });
    sizesDone.add(t.size); if (id === "eunhwan" && !passportGiven && sizesDone.size === 3) { passportGiven = true; ev.push({ at: t.done_at, d: 20 }); }
    if (t.size === "S") { sCount++; if (id === "jina" && !inspireGiven && sCount === 3) { inspireGiven = true; ev.push({ at: t.done_at, d: 15 }); } }
  });
  if (id === "youngmin") {
    const monTasks = tasks.filter((t) => t.member === id && t.week === wk && t.created_at && dayOf(t.created_at) === wk).sort((a, b) => a.created_at.localeCompare(b.created_at));
    if (monTasks.length >= 3) ev.push({ at: monTasks[2].created_at, d: 20 });
  }
  (skills || []).filter((l) => inWeek(l.created_at)).forEach((l) => {
    if (l.caster === id) { const s = skillOf(l.caster, l.skill); if (s) ev.push({ at: l.created_at, d: -s.cost }); }
    skillEffects(l).forEach((e) => { if (e.to === id && e.mp) ev.push({ at: l.created_at, d: e.mp }); });
  });
  ev.sort((a, b) => String(a.at).localeCompare(String(b.at)));
  let mp = 0; ev.forEach((e) => { mp = Math.max(0, Math.min(cap, mp + e.d)); });
  return mp;
}
const usedToday = (caster, sid, skills) => { const today = ymd(new Date()); return (skills || []).some((l) => l.caster === caster && l.skill === sid && dayOf(l.created_at) === today); };
