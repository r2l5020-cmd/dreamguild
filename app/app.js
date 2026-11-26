/* DREAM GUILD 데스크톱 친구들 — 화면 */
const D = window.desk || { setClickable() {}, wantFocus() {}, on() {}, quit() { window.__quit = true; }, minimize() { window.__min = true; }, platform: "web" };
const WEB = D.platform === "web";
if (WEB) document.documentElement.classList.add("web");
/* 윈도우 프로그램(program/) 안에서 열렸을 때: 하늘이 투명하고, 직접 만든 제목 줄과 크기 조절 손잡이가 생겨요 */
const PROGRAM = WEB && !!window.deskShell;
if (PROGRAM) document.documentElement.classList.add("program");
const CONFIG = Object.assign({}, CONFIG_DEFAULT);
try { const c = JSON.parse(localStorage.getItem("dg-config")); if (c) Object.assign(CONFIG, c); } catch (e) {}
const IMG = (id) => "assets/" + id + ".png";

/* ---------- 저장소 (웹 마을과 같은 Supabase 표를 써요) ---------- */
function uid() { return "t" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
function makeLocal() {
  const KEY = "dreamguild-v1"; let mem = { tasks: [], routes: {}, chat: [] };
  const read = () => { try { const v = JSON.parse(localStorage.getItem(KEY)); if (v) mem = Object.assign({ chat: [] }, v); } catch (e) {} return mem; };
  const write = (d) => { mem = d; try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} };
  let h = null;
  return {
    mode: "local",
    async load() { return JSON.parse(JSON.stringify(read())); },
    async add(t) { const d = read(); d.tasks.push(Object.assign({ id: uid(), created_at: new Date().toISOString() }, t)); write(d); },
    async update(id, p) { const d = read(); d.tasks = d.tasks.map((t) => t.id === id ? Object.assign({}, t, p) : t); write(d); },
    async remove(id) { const d = read(); d.tasks = d.tasks.filter((t) => t.id !== id); write(d); },
    async setRoute(m, r) { const d = read(); d.routes[m] = r; write(d); },
    async loadChat() { return read().chat.slice(-200); },
    async loadRooms() { return Object.assign({}, read().rooms || {}); },
    async loadSkills() { return (read().skills || []).slice(); },
    async castSkill(c) { const d = read(); const m = Object.assign({ id: uid(), created_at: new Date().toISOString() }, c); d.skills = (d.skills || []).concat([m]).slice(-500); write(d); return m; },
    async saveRoom(m, layout) { const d = read(); d.rooms = Object.assign({}, d.rooms || {}, { [m]: layout }); write(d); },
    async sendChat(c) { const d = read(); const m = Object.assign({ id: uid(), created_at: new Date().toISOString() }, c); d.chat.push(m); d.chat = d.chat.slice(-200); write(d); if (h) h.chat(m); return m; },
    async chatSince() { return []; },
    async chatBefore() { return []; },
    async loadNotes() { return (read().notes || []).slice(-100).reverse(); },
    async sendNote(n) { const d = read(); const m = Object.assign({ id: Date.now(), created_at: new Date().toISOString(), read_at: null }, n); d.notes = (d.notes || []).concat([m]).slice(-200); write(d); return m; },
    async readNote(id) { const d = read(); d.notes = (d.notes || []).map((n) => n.id === id ? Object.assign({}, n, { read_at: new Date().toISOString() }) : n); write(d); },
    live(handlers) { h = handlers; },
    sendMove() {}, retrack() {}
  };
}
function makeRemote() {
  const sb = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
  const chk = (r) => { if (r.error) throw r.error; return r; };
  return {
    mode: "remote", _sb: sb,
    async load() {
      const [t, m] = await Promise.all([sb.from("dg_tasks").select("*").order("created_at"), sb.from("dg_members").select("*")]);
      chk(t); chk(m);
      const routes = {}; m.data.forEach((r) => { routes[r.member] = r.route; });
      return { tasks: t.data, routes };
    },
    async add(t) { chk(await sb.from("dg_tasks").insert(t)); },
    async update(id, p) { chk(await sb.from("dg_tasks").update(p).eq("id", id)); },
    async remove(id) { chk(await sb.from("dg_tasks").delete().eq("id", id)); },
    async setRoute(m, r) { chk(await sb.from("dg_members").upsert({ member: m, route: r })); },
    async loadSkills() { const since = new Date(Date.now() - 14 * 864e5).toISOString(); const r = await sb.from("dg_skills").select("*").gte("created_at", since).order("id"); return r.error ? [] : r.data; },
    async castSkill(c) { const r = chk(await sb.from("dg_skills").insert(c).select().single()); return r.data; },
    async loadRooms() { const r = await sb.from("dg_rooms").select("*"); if (r.error) return {}; const o = {}; r.data.forEach((x) => { o[x.member] = x.layout; }); return o; },
    async saveRoom(m, layout) { chk(await sb.from("dg_rooms").upsert({ member: m, layout, updated_at: new Date().toISOString() })); },
    async loadChat() { const r = chk(await sb.from("dg_chat").select("*").order("id", { ascending: false }).limit(200)); return r.data.reverse(); },
    async chatBefore(id) { const r = await sb.from("dg_chat").select("*").lt("id", id).order("id", { ascending: false }).limit(100); return r.error ? [] : r.data.reverse(); },
    async sendChat(c) { const r = chk(await sb.from("dg_chat").insert(c).select().single()); return r.data; },
    async chatSince(id) { const r = await sb.from("dg_chat").select("*").gt("id", id).order("id").limit(50); return r.error ? [] : r.data; },
    /* 쪽지 (dg_notes 표 — setup.sql 8번) */
    async loadNotes() {
      if (!S.me) return [];
      const r = await sb.from("dg_notes").select("*").or("recipient.eq." + S.me + ",sender.eq." + S.me).order("id", { ascending: false }).limit(100);
      if (r.error) { S.notesMissing = true; return []; }
      S.notesMissing = false; return r.data;
    },
    async sendNote(n) { const r = chk(await sb.from("dg_notes").insert(n).select().single()); return r.data; },
    async readNote(id) { chk(await sb.from("dg_notes").update({ read_at: new Date().toISOString() }).eq("id", id)); },
    live(h) {
      const ch = sb.channel("dreamguild-village", { config: { private: true, presence: { key: S.me }, broadcast: { self: false } } });
      this._ch = ch;
      ch.on("presence", { event: "sync" }, () => { const st = ch.presenceState(); h.presence(Object.keys(st).map((k) => ({ id: k, f: (st[k][0] || {}).f }))); })
        .on("broadcast", { event: "desk-move" }, ({ payload }) => h.move(payload))
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "dg_chat" }, (p) => h.chat(p.new))
        .on("postgres_changes", { event: "*", schema: "public", table: "dg_tasks" }, () => h.data())
        .on("postgres_changes", { event: "*", schema: "public", table: "dg_members" }, () => h.data())
        .on("postgres_changes", { event: "*", schema: "public", table: "dg_rooms" }, () => h.data())
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "dg_skills" }, () => h.data())
        .on("postgres_changes", { event: "*", schema: "public", table: "dg_notes" }, () => h.data())
        .subscribe(async (status, err) => {
          if (status === "SUBSCRIBED") { await ch.track({ desk: true, f: myF() }); if (this._warned) toast("실시간 연결이 다시 이어졌어요."); this._warned = false; logJoin(); }
          else if ((status === "CHANNEL_ERROR" || status === "TIMED_OUT") && !this._warned) { this._warned = true; console.warn("realtime", status, err); toast("실시간 연결이 잠시 끊겼어요. 채팅과 할 일은 몇 초마다 다시 확인할게요."); }
        });
    },
    sendMove(p) { if (this._ch) this._ch.send({ type: "broadcast", event: "desk-move", payload: p }); },
    retrack() { if (this._ch) this._ch.track({ desk: true, f: myF() }); }
  };
}

/* ---------- 상태 ---------- */
const S = { openBoards: new Set(), tasks: [], routes: {}, chat: [], skills: [], week: mondayOf(new Date()), me: null, card: null, say: false, size: "M", draft: "", online: new Set(), bubbles: {}, hover: null, off: 40 };
try { S.me = localStorage.getItem("dreamguild-me"); if (!byId(S.me)) S.me = null; } catch (e) {}
try { const o = parseInt(localStorage.getItem("dg-offset"), 10); if (!isNaN(o)) S.off = o; } catch (e) {}
let store;
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const xpOf = (id) => S.tasks.filter((t) => t.member === id && t.done).reduce((a, t) => a + (XP[t.size] || 0), 0);
const weekTasks = (id, wk) => S.tasks.filter((t) => t.member === id && t.week === ymd(wk || S.week));
const thisWeek = () => mondayOf(new Date());
const asleep = (id) => store && store.mode === "remote" && id !== S.me && !S.online.has(id);

/* ---------- 클릭 통과: 캐릭터·카드 위에서만 마우스를 받아요 ---------- */
let clickable = false, dragging = null;
function setClickable(on) { if (on !== clickable) { clickable = on; D.setClickable(on); } }
document.addEventListener("mousemove", (e) => {
  if (dragging) { setClickable(true); return; }
  const t = document.elementFromPoint(e.clientX, e.clientY);
  setClickable(!!(t && t.closest(".hit")));
});
document.addEventListener("mouseleave", () => { if (!dragging) setClickable(false); });

function toast(msg, lv) {
  const box = document.getElementById("toasts"), el = document.createElement("div");
  el.className = "toast" + (lv ? " lv" : ""); el.textContent = msg; box.appendChild(el);
  setTimeout(() => el.remove(), lv ? 6000 : 4200);
  while (box.children.length > 4) box.firstChild.remove();
}

/* ---------- 캐릭터 줄 ---------- */
const row = document.getElementById("row");
const PAL = {};
const SLOT = 88, FIREW = 70, CTRLW = 74, ROWW = MEMBERS.length * SLOT + FIREW + CTRLW;
const POS = {}; MEMBERS.forEach((m) => { POS[m.id] = { f: null }; });
function myF() { return S.me ? POS[S.me].f : null; }
try { const f = parseFloat(localStorage.getItem("dg-myf")); if (!isNaN(f) && S.me) POS[S.me].f = f; } catch (e) {}
const rowLeft = () => window.innerWidth - S.off - ROWW;
const homeX = (i) => rowLeft() + i * SLOT + SLOT / 2;
const palX = (id, i) => POS[id].f != null ? POS[id].f * window.innerWidth : homeX(i);
function buildRow() {
  row.innerHTML = '<div class="ground" id="ground" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>';
  MEMBERS.forEach((m) => {
    const el = document.createElement("div");
    el.className = "pal hit"; el.dataset.pal = m.id; el.tabIndex = 0;
    el.setAttribute("role", "button"); el.setAttribute("aria-label", m.name + " 님 할 일 보기");
    el.innerHTML = '<span class="tag"></span><span class="bars" aria-hidden="true"><i class="hp"><b></b><em></em></i><i class="mp"><b></b></i></span>' + avatarHTML(m.id, {});
    el.addEventListener("mouseenter", () => { S.hover = m.id; paintBubble(m.id); });
    el.addEventListener("mouseleave", () => { if (S.hover === m.id) S.hover = null; paintBubble(m.id); });
    row.appendChild(el); PAL[m.id] = el;
  });
  const f = document.createElement("div");
  f.className = "fire hit"; f.id = "fire"; f.setAttribute("role", "button"); f.tabIndex = 0;
  f.setAttribute("aria-label", "팀 캠프파이어 — 클릭하면 팀 소식, 끌면 위치를 옮겨요");
  f.innerHTML = '<svg id="fireSvg" width="56" height="64" viewBox="0 0 24 28" aria-hidden="true"><g class="flame"><path d="M12 24c3.6 0 6.3-2.5 6.3-6 0-3-2-5-3.4-6.8-.4 1.4-1.2 2.5-2.3 3C12.8 10.8 11.6 8 9.3 5.6c.3 3-1.3 4.7-2.7 6.5C5.5 13.6 5.7 15.2 5.7 18c0 3.5 2.7 6 6.3 6z" fill="#F2A03A" stroke="#B8452F" stroke-width="1.2"/><path d="M12 24c-1.7 0-2.9-1.2-2.9-2.8 0-1.5 1.1-2.4 1.8-3.4.3.9.8 1.4 1.4 1.6.2-1.2.8-2.1 1.6-2.8.3 1.7.9 2.7.9 4.6 0 1.6-1.2 2.8-2.8 2.8z" fill="#FCE38A"/></g><path d="M3 27l18-3M3 24l18 3" stroke="#6E4424" stroke-width="2" stroke-linecap="round"/></svg><span class="meter"><i id="fireMeter"></i></span>';
  f.addEventListener("mouseenter", () => showFireTip(true));
  f.addEventListener("mouseleave", () => showFireTip(false));
  f.addEventListener("pointerdown", (e) => { dragging = { x: e.screenX, off: S.off, moved: false }; f.setPointerCapture(e.pointerId); });
  f.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.screenX - dragging.x; if (Math.abs(dx) > 4) dragging.moved = true;
    S.off = Math.max(0, Math.min(window.innerWidth - ROWW, dragging.off - dx)); placeRow();
  });
  f.addEventListener("pointerup", () => {
    const wasDrag = dragging && dragging.moved; dragging = null;
    try { localStorage.setItem("dg-offset", String(S.off)); } catch (e) {}
    if (!wasDrag) { if (S.mini) setMini(false); else openCard({ type: "plaza" }); }
  });
  row.appendChild(f);
  const ctrl = document.createElement("div");
  ctrl.className = "ctrl hit"; ctrl.id = "ctrl";
  ctrl.innerHTML = '<button type="button" data-act="myroom">🏠 내 방</button><button type="button" data-act="openShop">👕 옷가게</button>' + (WEB ? '<button type="button" data-act="openWho">👤 사람</button>' : '<span class="ctrlrow"><button type="button" data-act="minimize" aria-label="최소화" title="최소화">–</button><button type="button" class="quit" data-act="askQuit" aria-label="종료" title="종료">✕</button></span>');
  row.appendChild(ctrl);
  buildChatBar();
  placeRow();
}
/* 땅 아래 고정 채팅창 — 보내면 내 캐릭터 머리 위에 말풍선만 떠요 */
const CHATH = 44;
function buildChatBar() {
  if (document.getElementById("chatbar")) return;
  const f = document.createElement("form");
  f.id = "chatbar"; f.className = "chatbar hit"; f.dataset.form = "bar"; f.autocomplete = "off";
  f.innerHTML = '<button type="button" class="helpb" data-act="help" title="DREAM GUILD 사용법">❓ 도움말</button><span class="who" id="barWho"></span><label for="sayIn" class="sr">메시지</label><input id="sayIn" maxlength="200" autocomplete="off"><button type="submit" class="send">말하기</button><button type="button" class="jumpb" data-act="jump" title="점프 (↑ 키)">⤴ 점프</button><button type="button" class="log" data-act="openLog" title="채팅 기록 보기">💬 기록</button>';
  const inp = f.querySelector("input");
  f.addEventListener("pointerdown", () => D.wantFocus(true));
  inp.addEventListener("focus", () => {
    if (!S.me) { inp.blur(); openCard("who"); return; }
    if (S.mini) setMini(false);
    S.walk = true; S.say = true; PAL[S.me].style.transform = "none";
  });
  inp.addEventListener("blur", () => { if (S.say) exitWalk(true); });
  inp.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { e.preventDefault(); exitWalk(); return; }
    if ((e.key === "ArrowLeft" || e.key === "ArrowRight") && !inp.value) { e.preventDefault(); walkKeys.add(e.key); }
    if (e.key === "ArrowUp" && !inp.value && !e.repeat) { e.preventDefault(); jumpMe(); }
  });
  inp.addEventListener("keyup", (e) => walkKeys.delete(e.key));
  document.body.appendChild(f);
  paintSay();
}
function setMini(on) {
  S.mini = on; document.body.classList.toggle("mini", on);
  try { localStorage.setItem("dg-mini", on ? "1" : ""); } catch (e) {}
  if (on) { if (S.walk) exitWalk(); if (S.say) closeSay(); if (S.card) closeCard(); }
  const b = document.querySelector('[data-act="mini"]');
  if (b) { b.textContent = on ? "+" : "–"; b.setAttribute("aria-label", on ? "펼치기" : "최소화"); b.title = on ? "펼치기 (캐릭터 다시 보이기)" : "최소화 (모닥불만 남기기)"; }
  placeRow();
}
function placeRow() {
  S.off = Math.max(0, Math.min(Math.max(0, window.innerWidth - ROWW), S.off));
  MEMBERS.forEach((m, i) => { const el = PAL[m.id]; if (el) el.style.left = Math.round(Math.max(42, Math.min(window.innerWidth - 42, palX(m.id, i))) - 42) + "px"; });
  const fire = document.getElementById("fire"), fx = Math.round(rowLeft() + MEMBERS.length * SLOT);
  const gr = document.getElementById("ground"); if (gr) { gr.style.left = Math.round(rowLeft() - 16) + "px"; gr.style.width = (ROWW + 32) + "px"; }
  const cb = document.getElementById("chatbar"); if (cb) { cb.style.left = Math.round(rowLeft() - 16) + "px"; cb.style.width = (ROWW + 32) + "px"; }
  if (fire) fire.style.left = fx + "px";
  const ctrl = document.getElementById("ctrl"); if (ctrl) ctrl.style.left = (fx + FIREW + 2) + "px";
  const c = document.querySelector(".card"); if (c) c.style.right = Math.max(8, S.off) + "px";
  document.getElementById("toasts").style.right = (c ? Math.max(8, S.off) + c.offsetWidth + 12 : S.off) + "px";
}
window.addEventListener("resize", placeRow);
function showFireTip(on) {
  const f = document.getElementById("fire"), old = f.querySelector(".bubble"); if (old) old.remove();
  if (!on) return;
  const wk = ymd(thisWeek()), txp = S.tasks.filter((t) => t.week === wk && t.done).reduce((a, t) => a + XP[t.size], 0);
  const b = document.createElement("div"); b.className = "bubble soft";
  b.innerHTML = "<b>팀 캠프파이어" + (store && store.mode === "local" ? " · 체험 모드" : "") + "</b>" + (S.mini ? "클릭하면 캐릭터들이 다시 나와요" : "이번 주 " + txp + " / " + CONFIG.TEAM_GOAL + " XP<br>클릭: 팀 소식 · 끌기: 위치 옮기기");
  f.appendChild(b);
}
function paintPal(id) {
  const m = byId(id), el = PAL[id]; if (!el) return;
  const lv = levelInfo(xpOf(id)).lv, sleep = asleep(id);
  el.classList.toggle("me", id === S.me);
  el.classList.toggle("sleep", sleep);
  el.querySelector(".tag").textContent = m.name + " Lv." + lv;
  const st = statsOf(id), hpb = el.querySelector(".hp b"), mpb = el.querySelector(".mp b"), ratio = st.hp / st.hpMax;
  if (hpb) { hpb.style.width = Math.round(ratio * 100) + "%"; hpb.style.background = ratio < 0.3 ? "#E07A2F" : "#E05A4F"; }
  el.classList.toggle("tired", ratio < 0.3 && !sleep);
  let sw = el.querySelector(".sweat");
  if (ratio < 0.3 && !sleep && !sw) { sw = document.createElement("span"); sw.className = "sweat"; sw.textContent = "💦"; el.appendChild(sw); }
  if ((ratio >= 0.3 || sleep) && sw) sw.remove();
  if (mpb) mpb.style.width = Math.round(st.mp / st.mpMax * 100) + "%";
  const wear = closetOf(id).wear, wk = JSON.stringify(wear);
  if (el._wk !== wk) { el._wk = wk; el.querySelector(".ol.back").innerHTML = outfitSvg(id, wear, "back"); el.querySelector(".ol.front").innerHTML = outfitSvg(id, wear, "front"); }
  let zz = el.querySelector(".zz");
  if (sleep && !zz) { zz = document.createElement("span"); zz.className = "zz"; zz.textContent = "z z"; el.appendChild(zz); }
  if (!sleep && zz) zz.remove();
  paintLunch(id);
  paintBubble(id);
  paintSay();
}
function statusLine(id) {
  const wt = weekTasks(id, thisWeek()), open = wt.find((t) => !t.done);
  if (!wt.length) return "이번 주 할 일을 아직 안 적었어요";
  return open ? open.title + " 하는 중…" : "이번 주 할 일 끝!";
}
function paintBubble(id) {
  const el = PAL[id]; if (!el) return;
  const b = S.bubbles[id], m = byId(id);
  let html = null, soft = false;
  if (b && b.until > Date.now()) html = esc(b.text);
  else if (S.hover === id) { soft = true; const lv = levelInfo(xpOf(id)).lv; const st = statsOf(id); html = "<b>" + esc(m.name) + " · " + esc(titleOf(m, lv, S.routes[id])) + (asleep(id) ? " · 자리 비움" : "") + "</b>" + esc(statusLine(id)) + '<span class="statline">❤ ' + st.hp + "/" + st.hpMax + (st.hp / st.hpMax < 0.3 ? ' <i>지쳤어요</i>' : "") + " · 💧 " + st.mp + "/" + st.mpMax + "</span>"; }
  const cls = "bubble" + (soft ? " soft" : ""), key = html ? cls + "|" + html : "";
  if (el._bk === key && (key === "" || el.querySelector(".bubble"))) return; // 같은 말풍선이면 그대로 둬요
  const old2 = el.querySelector(".bubble"); if (old2) old2.remove();
  el._bk = key;
  if (!html) return;
  const d = document.createElement("div"); d.className = cls; d.innerHTML = html; el.appendChild(d);
}
function paintAll() {
  MEMBERS.forEach((m) => paintPal(m.id));
  const wk = ymd(thisWeek()), txp = S.tasks.filter((t) => t.week === wk && t.done).reduce((a, t) => a + XP[t.size], 0), k = Math.min(1, txp / CONFIG.TEAM_GOAL);
  const svg = document.getElementById("fireSvg"); if (svg) { svg.setAttribute("width", Math.round(44 + 22 * k)); svg.setAttribute("height", Math.round(50 + 25 * k)); }
  const mt = document.getElementById("fireMeter"); if (mt) mt.style.width = Math.round(k * 100) + "%";
  paintBoards();
  placeRow();
}
/* 살짝 걸어 다니기 */
setInterval(() => {
  MEMBERS.forEach((m) => {
    const el = PAL[m.id]; if (!el || asleep(m.id) || (S.say && m.id === S.me) || (S.walk && m.id === S.me) || S.hover === m.id) return;
    if (Math.random() < 0.12) {
      const dx = Math.round((Math.random() - 0.5) * 34);
      el.classList.add("walk"); el.style.transform = "translateX(" + dx + "px)";
      clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove("walk"), 1800);
    }
  });
}, 1000);
setInterval(() => { if (store) paintAll(); }, 60000); // HP가 시간에 따라 닳는 걸 1분마다 반영
setInterval(() => { const now = Date.now(); Object.keys(S.bubbles).forEach((id) => { if (S.bubbles[id].until < now) { delete S.bubbles[id]; paintBubble(id); } }); }, 500);

/* ---------- 방향키로 걷기 ---------- */
const walkKeys = new Set();
let lastMoveSend = 0, saveT = null, wasMoving = false;
/* 아래 채팅창에 커서가 있고 비어 있을 때 ← → 로 걸어요 */
function enterWalk() {
  if (!S.me) { openCard("who"); return; }
  if (S.mini) setMini(false);
  D.wantFocus(true);
  const i = document.getElementById("sayIn"); if (i) { i.focus(); setTimeout(() => i.focus(), 30); }
}
function exitWalk(keepFocus) {
  if (!S.walk && !S.say) return;
  S.walk = false; S.say = false; walkKeys.clear(); if (S.me) PAL[S.me].classList.remove("walk", "stepping");
  const i = document.getElementById("sayIn"); if (i && document.activeElement === i) i.blur();
  if (store) store.retrack();
  if (!keepFocus && !S.card) D.wantFocus(false);
}
function goHome() {
  if (!S.me) return;
  POS[S.me].f = null; try { localStorage.removeItem("dg-myf"); } catch (e) {}
  store.sendMove({ id: S.me, f: null }); store.retrack(); placeRow();
}
let lastFrame = performance.now();
function walkLoop(now) {
  const dt = Math.min(0.05, (now - lastFrame) / 1000); lastFrame = now;
  if (S.walk && S.me) {
    const dir = (walkKeys.has("ArrowRight") ? 1 : 0) - (walkKeys.has("ArrowLeft") ? 1 : 0), el = PAL[S.me];
    if (dir) {
      const i = MEMBERS.findIndex((m) => m.id === S.me), W = window.innerWidth;
      const x = Math.max(42, Math.min(W - 42, palX(S.me, i) + dir * 230 * dt));
      POS[S.me].f = x / W; el.style.left = Math.round(x - 42) + "px";
      if (!wasMoving) { el.classList.add("walk", "stepping"); wasMoving = true; }
      if (now - lastMoveSend > 100) { store.sendMove({ id: S.me, f: POS[S.me].f }); lastMoveSend = now; }
      clearTimeout(saveT); saveT = setTimeout(() => { try { localStorage.setItem("dg-myf", String(POS[S.me].f)); } catch (e) {} store.sendMove({ id: S.me, f: POS[S.me].f }); store.retrack(); }, 400);
    } else if (wasMoving) {
      el.classList.remove("walk", "stepping"); wasMoving = false; clearTimeout(saveT);
      try { localStorage.setItem("dg-myf", String(POS[S.me].f)); } catch (e) {}
      store.sendMove({ id: S.me, f: POS[S.me].f }); store.retrack();
    }
  }
  requestAnimationFrame(walkLoop);
}
requestAnimationFrame(walkLoop);

/* ---------- 말풍선 채팅 ---------- */
function paintSay() {
  const who = document.getElementById("barWho"), inp = document.getElementById("sayIn"); if (!who || !inp) return;
  const k = S.me || "";
  if (paintSay._k === k) return; paintSay._k = k;
  who.innerHTML = S.me ? '<img src="' + IMG(S.me) + '" alt="">' + esc(byId(S.me).name) : "";
  inp.placeholder = S.me ? "말하면 머리 위에 말풍선이 떠요 · Enter 보내기 · 비어 있을 때 ← → 걷기, ↑ 점프" : "먼저 누구로 들어갈지 골라 주세요";
}
function openSay() { enterWalk(); }
function closeSay(keepFocus) { exitWalk(keepFocus); }
function addChat(m) {
  if (S.chat.some((c) => c.id === m.id)) return;
  S.chat.push(m); S.chat.sort(byTime); if (S.chat.length > 1000) S.chat = S.chat.slice(-1000);
  if (m.kind === "lunch") {
    const fresh = Date.now() - new Date(m.created_at).getTime() < 60000, prev = S.lunch[m.member];
    if (fresh && (!prev || new Date(prev.at) <= new Date(m.created_at))) {
      const live = Date.now() - new Date(m.created_at).getTime() < 60000 && m.member !== S.me && S.ready;
      if (live && !spinning && document.querySelector("#village .wheel")) spinTo(MENUS.indexOf(m.text) >= 0 ? MENUS.indexOf(m.text) : 0, () => showLunch(m.member, m.text, m.created_at));
      else showLunch(m.member, m.text, m.created_at);
      if (live && byId(m.member)) toast("🍽 " + byId(m.member).name + " 님이 점심 룰렛을 돌렸어요 · 추천메뉴 " + m.text);
    }
  }
  else if (m.kind === "system") { if (m.member !== S.me) toast(m.text); }
  else if (m.kind === "join" || m.kind === "leave") { /* 접속 기록은 채팅 기록에만 남아요 */ }
  else if (byId(m.member)) { S.bubbles[m.member] = { text: m.text, until: Date.now() + BUBBLE_MS }; paintBubble(m.member); }
  paintSkyChat();
  if (S.card && (S.card.type === "plaza" || S.card === "log")) renderCard();
}
async function announce(text) { try { const row = await store.sendChat({ member: S.me, text, kind: "system" }); if (row) addChat(row); } catch (e) {} }

/* ---------- 능력치와 스킬 ---------- */
function statsOf(id) {
  const lv = levelInfo(xpOf(id)).lv;
  return { lv, hp: hpNow(id, lv, S.skills), hpMax: maxHP(id, lv), mp: mpNow(id, lv, S.tasks, S.skills, thisWeek()), mpMax: maxMP(id, lv) };
}
function floatText(id, text, cls) {
  const el = PAL[id]; if (!el) return;
  const f = document.createElement("span"); f.className = "float " + (cls || ""); f.textContent = text;
  f.style.left = (20 + Math.random() * 30) + "px"; el.appendChild(f); setTimeout(() => f.remove(), 1800);
}
function playSkill(l) {
  const s = skillOf(l.caster, l.skill); if (!s) return;
  const c = PAL[l.caster]; if (c) { c.classList.remove("cast"); void c.offsetWidth; c.classList.add("cast"); setTimeout(() => c.classList.remove("cast"), 1400); }
  floatText(l.caster, s.icon + " " + s.name, "sk");
  skillEffects(l).forEach((e, i) => setTimeout(() => {
    if (e.hp) floatText(e.to, "❤ +" + e.hp, "hpf");
    if (e.mp) setTimeout(() => floatText(e.to, "💧 +" + e.mp, "mpf"), 250);
  }, 350 + i * 120));
}
const seenSkills = new Set();
function announceNewSkills() {
  const fresh = (S.skills || []).filter((l) => !seenSkills.has(l.id));
  const first = !announceNewSkills.ready; announceNewSkills.ready = true;
  fresh.forEach((l) => {
    seenSkills.add(l.id);
    if (first || Date.now() - new Date(l.created_at).getTime() > 120000) return;
    playSkill(l);
    if (l.caster !== S.me && skillEffects(l).some((e) => e.to === S.me)) { const s = skillOf(l.caster, l.skill); toast(byId(l.caster).name + " 님이 「" + s.name + "」을(를) 보내 주었어요! " + s.icon); }
  });
}
async function castSkill(sid, target) {
  if (!S.me) return;
  const s = skillOf(S.me, sid), st = statsOf(S.me); if (!s) return;
  if (st.lv < s.lv) { toast("Lv." + s.lv + "에 열리는 스킬이에요."); return; }
  if (usedToday(S.me, sid, S.skills)) { toast("「" + s.name + "」은(는) 오늘 이미 썼어요. 내일 다시 쓸 수 있어요."); return; }
  if (st.mp < s.cost) { toast("MP가 부족해요. 할 일을 끝내면 MP가 차요. (필요 " + s.cost + ", 지금 " + st.mp + ")"); return; }
  if (s.target === "one" && (!target || target === S.me)) { S.pickSkill = sid; renderCard(); return; }
  S.pickSkill = null;
  try {
    const row = await store.castSkill({ caster: S.me, target: s.target === "one" ? target : s.target === "self" ? S.me : null, skill: sid });
    if (row) { S.skills.push(row); seenSkills.add(row.id); playSkill(row); }
    const who = s.target === "team" ? "팀 전체" : s.target === "self" ? "자신" : byId(target).name + " 님";
    const eff = (s.hp ? "HP +" + Math.round(s.hp * (S.me === "seonhan" ? 1.5 : 1)) + " 회복" : "") + (s.hp && s.mp ? ", " : "") + (s.mp ? "MP +" + s.mp : "");
    announce(byId(S.me).name + " 님이 " + who + "에게 「" + s.name + "」 " + s.icon + " (" + eff + ")");
    if (sid === "gift") toast(byId(target).name + " 님 방 꾸미기에 「진아의 선물 그림」이 생겼어요!");
  } catch (e) { toast("스킬을 쓰지 못했어요. 잠시 후 다시 해 주세요."); }
  await reload(true);
}
function statPanel(id, mine) {
  const st = statsOf(id), m = byId(id), pas = PASSIVES[id], me = S.me && byId(S.me);
  const skills = (SKILLS[id] || []).map((s) => {
    const locked = st.lv < s.lv, used = usedToday(id, s.id, S.skills), tgt = { one: "동료 1명", team: "팀 전체", self: "나" }[s.target];
    let btn = "";
    if (mine) btn = locked ? '<span class="lock">Lv.' + s.lv + "에 열려요</span>" : used ? '<span class="lock">오늘 사용함</span>' : '<button class="primary sm" data-skill="' + s.id + '"' + (st.mp < s.cost ? " disabled" : "") + ">사용 · MP " + s.cost + "</button>";
    else if (locked) btn = '<span class="lock">Lv.' + s.lv + "</span>";
    return '<li class="' + (locked ? "locked" : "") + '"><span class="ic">' + s.icon + "</span><span class=\"sd\"><b>" + esc(s.name) + '</b> <span class="muted" style="margin:0">' + tgt + " · MP " + s.cost + "</span><br>" + esc(s.desc) + "</span>" + btn + "</li>";
  }).join("");
  let picker = "";
  if (mine && S.pickSkill) {
    const s = skillOf(id, S.pickSkill);
    picker = '<div class="picker"><p class="muted" style="margin:0 0 6px">「' + esc(s.name) + "」을(를) 누구에게 보낼까요?</p>" + MEMBERS.filter((x) => x.id !== id).map((x) => '<button class="ghost" data-skilltarget="' + x.id + '"><img src="' + IMG(x.id) + '" alt="">' + esc(x.name) + "</button>").join("") + '<button class="ghost" data-act="cancelPick">취소</button></div>';
  }
  let give = "";
  if (!mine && me) {
    const mst = statsOf(S.me);
    const mySkills = (SKILLS[S.me] || []).filter((s) => s.target === "one" && mst.lv >= s.lv);
    if (mySkills.length) give = '<div class="give"><span class="muted" style="margin:0">' + esc(m.name) + " 님에게</span>" + mySkills.map((s) => { const used = usedToday(S.me, s.id, S.skills); return '<button class="primary sm" data-skill="' + s.id + '" data-to="' + id + '"' + (used || mst.mp < s.cost ? " disabled" : "") + ">" + s.icon + " " + esc(s.name) + (used ? " (오늘 씀)" : " · MP " + s.cost) + "</button>"; }).join("") + '<span class="muted" style="margin:0">내 MP ' + mst.mp + "</span></div>";
  }
  return '<div class="stats"><div class="statbar"><span>❤ HP</span><i class="hpbar"><b style="width:' + Math.round(st.hp / st.hpMax * 100) + "%" + (st.hp / st.hpMax < 0.3 ? ";background:#E07A2F" : "") + '"></b></i><span class="num">' + st.hp + " / " + st.hpMax + (st.hp / st.hpMax < 0.3 ? ' <em>지침</em>' : "") + "</span></div>" +
    '<p class="muted" style="margin:0 0 4px 54px;font-size:11px">평일 9시에 가득 차서 6시까지 천천히 닳아요. 동료의 회복 스킬로 다시 차요.</p>' +
    '<div class="statbar"><span>💧 MP</span><i class="mpbar"><b style="width:' + Math.round(st.mp / st.mpMax * 100) + '%"></b></i><span class="num">' + st.mp + " / " + st.mpMax + "</span></div>" +
    '<p class="passive"><b>고유 효과 · ' + esc(pas.name) + "</b> " + esc(pas.desc) + "</p>" +
    "<h3>고유 스킬</h3><ul class=\"skills\">" + skills + "</ul>" + picker + give + "</div>";
}

/* ---------- 각자의 방 ---------- */
function layoutOf(id) { const L = (S.edit && S.edit.id === id) ? S.edit.layout : (S.rooms && S.rooms[id]); return L && L.items ? L : defaultLayout(); }
function roomHTML(id, edit) {
  const L = layoutOf(id), lv = levelInfo(xpOf(id)).lv;
  const wall = WALLS.find((w) => w.id === L.wall) || WALLS[0], floor = FLOORS.find((f) => f.id === L.floor) || FLOORS[0];
  const placed = L.items.map((p) => ({ p, it: itemById(p.id) })).filter((o) => o.it && (!o.it.cls || o.it.cls === id) && (!o.it.gift || hasGift(id, o.it.gift)) && o.it.lv <= lv);
  const rank = (o) => (o.it.place === "rug" ? 0 : o.it.place === "wall" ? 1 : 2) * 1000 + o.p.y;
  placed.sort((a, b) => rank(a) - rank(b));
  const me = L.me || { x: 52, y: 99 };
  return '<div class="room' + (edit ? " edit" : "") + '" data-room="' + id + '">' +
    '<div class="wall" style="background:' + wall.css + '"></div><div class="floor" style="background:' + floor.css + '"></div>' +
    '<div class="window" aria-hidden="true"><i></i></div>' +
    placed.map((o) => '<div class="it ' + o.it.place + '" data-item="' + o.it.id + '" title="' + esc(o.it.name) + '" style="left:' + o.p.x + "%;top:" + o.p.y + "%;width:" + o.it.w + "px;height:" + o.it.h + 'px">' + itemSvg(o.it, id) + "</div>").join("") +
    avatarHTML(id, closetOf(id).wear, "roomspr" + (edit ? " movable" : ""), ' data-item="__me" style="left:' + me.x + "%;top:" + me.y + '%"') +
    (edit ? '<span class="roomhint">가구를 끌어서 옮겨요</span>' : "") + "</div>";
}
function decorPanel(id, lv) {
  const L = S.edit.layout, on = new Set(L.items.map((p) => p.id));
  const sw = (list, key) => list.map((w) => { const locked = w.lv > lv; return '<button type="button" class="sw' + (L[key] === w.id ? " on" : "") + '" ' + (locked ? "disabled" : 'data-' + key + '="' + w.id + '"') + ' title="' + esc(w.name) + (locked ? " · Lv." + w.lv + "에 열려요" : "") + '"><i style="background:' + w.css + '"></i>' + (locked ? "<em>Lv." + w.lv + "</em>" : "") + "</button>"; }).join("");
  const items = itemsFor(id).slice().sort((a, b) => a.lv - b.lv).map((it) => { const locked = it.lv > lv;
    return '<button type="button" class="chip' + (on.has(it.id) ? " on" : "") + (it.cls ? " special" : "") + '" ' + (locked ? "disabled" : 'data-toggleitem="' + it.id + '"') + ">" +
      '<span class="mini">' + itemSvg(it, id) + "</span><span>" + esc(it.name) + "</span>" + (locked ? "<em>Lv." + it.lv + "</em>" : "") + "</button>"; }).join("");
  return '<div class="decor"><h3>벽지</h3><div class="swatches">' + sw(WALLS, "wall") + '</div><h3>바닥</h3><div class="swatches">' + sw(FLOORS, "floor") + "</div>" +
    '<h3>가구 <span class="muted" style="font-family:var(--body)">누르면 놓이고, 다시 누르면 치워요</span></h3><div class="chips">' + items + "</div>" +
    '<div style="display:flex;gap:6px;margin-top:12px"><button class="primary" data-act="saveRoom">이대로 저장</button><button class="ghost" data-act="cancelDecor">취소</button></div></div>';
}
function startDecor() {
  const cur = layoutOf(S.me);
  S.edit = { id: S.me, layout: JSON.parse(JSON.stringify(cur)) };
  renderCard();
}
/* 가구 끌기 */
let roomDrag = null;
document.addEventListener("pointerdown", (e) => {
  const el = e.target.closest(".room.edit [data-item]"); if (!el) return;
  e.preventDefault();
  const room = el.closest(".room"); roomDrag = { el, id: el.dataset.item, rect: room.getBoundingClientRect() };
  el.setPointerCapture(e.pointerId); el.classList.add("drag");
});
document.addEventListener("pointermove", (e) => {
  if (!roomDrag) return;
  const { el, id, rect } = roomDrag, it = id === "__me" ? { place: "floor" } : itemById(id);
  let x = (e.clientX - rect.left) / rect.width * 100, y = (e.clientY - rect.top) / rect.height * 100 + (id === "__me" ? 30 : (it.h / ROOM_H * 100) / 2);
  const wallMax = WALL_H / ROOM_H * 100;
  x = Math.max(4, Math.min(96, x));
  y = it.place === "wall" ? Math.max(14, Math.min(wallMax - 2, y)) : Math.max(wallMax + 6, Math.min(100, y));
  el.style.left = x + "%"; el.style.top = y + "%"; roomDrag.x = x; roomDrag.y = y;
});
document.addEventListener("pointerup", () => {
  if (!roomDrag) return;
  const { el, id, x, y } = roomDrag; el.classList.remove("drag"); roomDrag = null;
  if (x == null || !S.edit) return;
  const L = S.edit.layout;
  if (id === "__me") L.me = { x: Math.round(x), y: Math.round(y) };
  else { const p = L.items.find((q) => q.id === id); if (p) { p.x = Math.round(x); p.y = Math.round(y); } }
  renderCard();
});
function unlockedBetween(id, a, b) {
  const inRange = (o) => o.lv > a && o.lv <= b;
  return itemsFor(id).filter(inRange).map((o) => o.name).concat(WALLS.filter(inRange).map((o) => o.name + " 벽지"), FLOORS.filter(inRange).map((o) => o.name + " 바닥"));
}

/* ---------- 옷장과 옷가게 ---------- */
const spentOf = (id) => closetOf(id).owned.reduce((a, x) => a + ((outfitById(x) || {}).price || 0), 0);
const goldOf = (id) => Math.max(0, xpOf(id) - spentOf(id));
async function saveCloset(c) {
  const cur = S.rooms && S.rooms[S.me];
  const L = cur && cur.items ? JSON.parse(JSON.stringify(cur)) : Object.assign(defaultLayout(), cur || {});
  L.closet = c;
  S.rooms = Object.assign({}, S.rooms, { [S.me]: L });
  paintAll(); renderCard();
  try { await store.saveRoom(S.me, L); } catch (e) { toast("옷장을 저장하지 못했어요. 잠시 후 다시 해 주세요."); }
}
function toggleWear(oid) {
  if (!S.me) return;
  const o = outfitById(oid), c = closetOf(S.me); if (!o || !c.owned.includes(oid)) return;
  if (c.wear[o.slot] === oid) delete c.wear[o.slot]; else c.wear[o.slot] = oid;
  saveCloset(c);
}
async function buyOutfit(oid) {
  if (!S.me) { openCard("who"); return; }
  const o = outfitById(oid), c = closetOf(S.me); if (!o || c.owned.includes(oid)) return;
  if (o.cls && o.cls !== S.me) return;
  if ((o.lv || 1) > levelInfo(xpOf(S.me)).lv) { toast("Lv." + o.lv + "이 되면 살 수 있어요."); return; }
  const g = goldOf(S.me);
  if (g < o.price) { toast("골드가 " + (o.price - g) + " 모자라요. 할 일을 끝내면 XP만큼 골드가 생겨요."); return; }
  c.owned.push(oid); c.wear[o.slot] = oid;
  if (S.tryOn) delete S.tryOn[o.slot];
  await saveCloset(c);
  toast("「" + o.name + "」을(를) 사서 바로 입었어요! 🪙 " + goldOf(S.me) + " 남았어요.");
  announce(byId(S.me).name + " 님이 옷가게에서 「" + o.name + "」을(를) 샀어요!");
}
function closetPanel(id, mine) {
  const c = closetOf(id);
  if (!mine) {
    const on = SLOTS.map((s) => c.wear[s.id] && outfitById(c.wear[s.id]).name).filter(Boolean);
    return '<h3>입은 옷</h3><p class="muted" style="margin:0">' + (on.length ? esc(on.join(" · ")) : "아직 아무것도 걸치지 않았어요.") + "</p>";
  }
  if (!c.owned.length) return '<h3>옷장</h3><p class="empty">아직 옷이 없어요. 마을 옷가게에 가 볼까요? <button class="ghost" data-act="openShop">👕 옷가게</button></p>';
  return '<h3>옷장 <span class="muted" style="font-family:var(--body)">누르면 입고, 다시 누르면 벗어요</span></h3><div class="chips">' +
    SLOTS.map((s) => c.owned.map(outfitById).filter((o) => o.slot === s.id).map((o) => '<button type="button" class="chip' + (c.wear[o.slot] === o.id ? " on" : "") + '" data-wear="' + o.id + '"><span class="mini">' + outfitIcon(o) + "</span><span>" + esc(o.name) + "</span>" + (c.wear[o.slot] === o.id ? "<em>입는 중</em>" : "") + "</button>").join("")).join("") + "</div>";
}
function shopHTML() {
  if (!S.me) return "";
  const c = closetOf(S.me), g = goldOf(S.me), tryOn = S.tryOn || {}, look = Object.assign({}, c.wear, tryOn);
  Object.keys(look).forEach((k) => { if (!look[k]) delete look[k]; });
  const myLv = levelInfo(xpOf(S.me)).lv, slotName = (id) => (SLOTS.find((s) => s.id === id) || {}).name;
  const ware = (o) => {
    const own = c.owned.includes(o.id), wearing = c.wear[o.slot] === o.id, trying = tryOn[o.slot] === o.id, locked = (o.lv || 1) > myLv;
    const btn = own ? '<button class="ghost sm" data-wear="' + o.id + '">' + (wearing ? "벗기" : "입기") + "</button>"
      : locked ? '<button class="ghost sm" disabled>🔒 Lv.' + o.lv + "</button>"
      : '<button class="primary sm" data-buy="' + o.id + '"' + (g < o.price ? " disabled" : "") + ">🪙 " + o.price + "</button>";
    return '<div class="ware' + (trying ? " try" : "") + (wearing ? " on" : "") + (locked && !own ? " locked" : "") + (o.lv > 1 ? " fancy" : "") + '"><button type="button" class="pic" data-try="' + o.id + '" title="' + (own ? "" : "눌러서 입어 보기") + '">' + outfitIcon(o) + "</button><b>" + esc(o.name) + "</b>" +
      '<span class="muted" style="margin:0;font-size:11px">' + (own ? (wearing ? "입는 중" : "가진 옷") : slotName(o.slot) + (o.lv > 1 ? " · Lv." + o.lv + "+" : "") + (locked ? " · 🪙" + o.price : "")) + "</span>" + btn + "</div>";
  };
  const byLv = (a, b) => (a.lv || 1) - (b.lv || 1) || a.price - b.price;
  const mineCls = OUTFITS.filter((o) => o.cls === S.me).sort(byLv);
  const rows = (mineCls.length ? '<h3 class="clsh">⭐ ' + esc(byId(S.me).cls) + ' 전용 옷 <span class="muted" style="font-family:var(--body)">레벨이 오르면 더 멋진 옷이 열려요</span></h3><div class="shop">' + mineCls.map(ware).join("") + "</div>" : "") +
    SLOTS.map((s) => "<h3>" + s.name + '</h3><div class="shop">' + OUTFITS.filter((o) => o.slot === s.id && !o.cls).sort(byLv).map(ware).join("") + "</div>").join("");
  return '<div class="card wide hit" role="dialog" aria-label="마을 옷가게"><button class="x" data-act="close" aria-label="닫기">✕</button>' +
    '<p class="big">👕 마을 옷가게</p>' +
    '<div class="fitting">' + avatarHTML(S.me, look, "big") + '<div><p style="margin:0"><b>' + esc(byId(S.me).name) + '</b> 님의 골드 <b class="gold">🪙 ' + g + "</b></p>" +
    '<p class="muted" style="margin:4px 0 0">할 일을 끝내 모은 XP만큼 골드가 생겨요. 옷을 사도 레벨은 그대로예요.<br>그림을 누르면 거울 앞에서 입어 볼 수 있어요.</p>' +
    (Object.keys(tryOn).length ? '<button class="ghost sm" data-act="clearTry" style="margin-top:6px">입어 보기 그만</button>' : "") + "</div></div>" + rows + "</div>";
}

/* ---------- 효과음 (파일 없이 WebAudio로 만들어요) ---------- */
let AC = null;
function sfx(kind, vol) {
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    if (AC.state === "suspended") AC.resume();
    const t = AC.currentTime, v = (vol == null ? 1 : vol) * 0.16;
    const tone = (type, f0, f1, at, dur, vv) => {
      const o = AC.createOscillator(), g = AC.createGain();
      o.type = type; o.frequency.setValueAtTime(f0, t + at); if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + at + dur);
      g.gain.setValueAtTime(0.0001, t + at); g.gain.exponentialRampToValueAtTime(vv, t + at + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + at + dur);
      o.connect(g); g.connect(AC.destination); o.start(t + at); o.stop(t + at + dur + 0.03);
    };
    if (kind === "jump") { tone("square", 240, 760, 0, 0.17, v * 0.7); tone("triangle", 480, 1200, 0.02, 0.14, v * 0.6); }
    else if (kind === "land") tone("sine", 150, 60, 0, 0.09, v * 0.8);
    else if (kind === "check") { tone("triangle", 988, 0, 0, 0.12, v); tone("triangle", 1319, 0, 0.08, 0.2, v); tone("sine", 1976, 0, 0.15, 0.28, v * 0.45); }
    else if (kind === "add") tone("triangle", 660, 990, 0, 0.1, v * 0.6);
    else if (kind === "tick") tone("square", 1800, 0, 0, 0.025, v * 0.35);
    else if (kind === "note") { tone("sine", 784, 0, 0, 0.14, v); tone("sine", 1047, 0, 0.12, 0.22, v); }
  } catch (e) {}
}

/* ---------- 점프 (↑ 또는 스페이스, 채팅창 옆 ⤴ 버튼) ---------- */
let lastJump = 0;
function doJump(id, remote) {
  const el = PAL[id]; if (!el) return;
  el.classList.remove("hop"); void el.offsetWidth; el.classList.add("hop");
  clearTimeout(el._hop); el._hop = setTimeout(() => el.classList.remove("hop"), 650);
  sfx("jump", remote ? 0.4 : 1); setTimeout(() => sfx("land", remote ? 0.35 : 0.8), 440);
  const fx = document.createElement("span"); fx.className = "jumpfx"; fx.setAttribute("aria-hidden", "true");
  fx.innerHTML = '<i class="d1"></i><i class="d2"></i><i class="d3"></i><i class="d4"></i><b class="s1">✦</b><b class="s2">✧</b><b class="s3">✦</b>';
  el.appendChild(fx); setTimeout(() => fx.remove(), 900);
}
function jumpMe() {
  if (!S.me) { openCard("who"); return; }
  const now = Date.now(); if (now - lastJump < 500) return; lastJump = now;
  doJump(S.me); if (store) store.sendMove({ id: S.me, jump: now });
}

/* ---------- 집 위 할 일 판 (웹) ---------- */
const todayStr = () => ymd(new Date());
const doneDay = (t) => t.done_at ? ymd(new Date(t.done_at)) : t.week;
const byMade = (a, b) => String(a.created_at || "").localeCompare(String(b.created_at || ""));
function boardTasks(id) {
  const wk = ymd(thisWeek()), today = todayStr();
  return S.tasks.filter((t) => t.member === id && ((!t.done && t.week === wk) || (t.done && doneDay(t) === today))).sort((a, b) => (a.done ? 1 : 0) - (b.done ? 1 : 0) || byMade(a, b));
}
const doneTasks = (id) => S.tasks.filter((t) => t.member === id && t.done).sort((a, b) => String(b.done_at || b.week).localeCompare(String(a.done_at || a.week)));
function paintBoards() {
  if (!WEB) return;
  MEMBERS.forEach((m) => {
    const box = document.querySelector('.vboard[data-board="' + m.id + '"]'); if (!box) return;
    const mine = m.id === S.me;
    let list = box.querySelector(".vlist"); if (!list) { list = document.createElement("div"); list.className = "vlist"; box.appendChild(list); }
    let form = box.querySelector(".vadd");
    if (mine && !form) {
      form = document.createElement("form"); form.className = "vadd"; form.dataset.form = "vadd"; form.autocomplete = "off";
      form.innerHTML = '<input class="vin" maxlength="60" placeholder="+ 할 일 추가 (Enter)" aria-label="새 할 일"><button type="button" class="vsz" data-vsize="cycle"></button>';
      box.insertBefore(form, list);
    }
    if (!mine && form) form.remove();
    if (form) { const b = form.querySelector(".vsz"); b.textContent = S.size; b.className = "vsz " + S.size; b.title = "크기 " + S.size + " · " + XP[S.size] + " XP (누르면 바뀌어요)"; b.setAttribute("aria-label", b.title); }
    const items = boardTasks(m.id), nDone = doneTasks(m.id).length;
    const notes = mine ? unreadNotes() : [];
    // 윈도우 프로그램에서는 동료의 할 일을 접어 두고, 「📋 할 일」을 눌러야 펼쳐져요 (화면을 덜 가리게)
    if (PROGRAM && !mine && !S.openBoards.has(m.id)) {
      const nOpen = items.filter((t) => !t.done).length;
      const peek = items.length || nDone ? '<button type="button" class="vpeek" data-peek="' + m.id + '" title="' + esc(m.name) + ' 님의 할 일 펼치기">📋 할 일 ' + nOpen + "</button>" : "";
      if (list._sig !== peek) { list._sig = peek; list.innerHTML = peek; }
      return;
    }
    const html = (notes.length ? '<div class="vnotes">' + notes.slice(0, 3).map((n) => '<button type="button" class="vnote" data-note="' + n.id + '">✉ <b>' + esc((byId(n.sender) || { name: "?" }).name) + "</b> 님의 쪽지</button>").join("") + (notes.length > 3 ? '<button type="button" class="vnote more" data-act="inbox">+' + (notes.length - 3) + "통 더</button>" : "") + "</div>" : "") +
      '<ul>' + items.map((t) => '<li class="vt' + (t.done ? " done" : "") + (t.id === S.justDone ? " fresh" : "") + '">' +
      (mine ? '<label><input type="checkbox" data-toggle="' + esc(t.id) + '"' + (t.done ? " checked" : "") + '><i class="vck" aria-hidden="true"></i>' : '<i class="vdot" aria-hidden="true"></i>') +
      '<span class="vtt" title="' + esc(t.title) + '">' + esc(t.title) + '</span><em class="vs ' + t.size + '">' + t.size + "</em>" + (mine ? "</label>" + '<button type="button" class="vdel" data-del="' + esc(t.id) + '" aria-label="' + esc(t.title) + ' 지우기">✕</button>' : "") + "</li>").join("") + "</ul>" +
      (nDone ? '<button type="button" class="vdone" data-done="' + m.id + '">✓ 완료한 할 일 <b>' + nDone + "</b></button>" : "") +
      (PROGRAM && !mine ? '<button type="button" class="vpeek on" data-peek="' + m.id + '">▲ 접기</button>' : "");
    if (list._sig !== html) { list._sig = html; list.innerHTML = html; }
  });
  S.justDone = null;
  layoutBoards();
}
/* 집이 붙어 있어도 할 일 판이 겹치지 않게: 판 너비 ≤ 양옆 집 가운데까지의 거리 (판은 집 가운데 정렬이라 이러면 절대 안 겹쳐요) */
function layoutBoards() {
  if (!WEB) return;
  const boards = [...document.querySelectorAll("#village .vboard")]; if (!boards.length) return;
  const W = window.innerWidth, MAXW = PROGRAM ? 220 : 180, GAP = 8;
  const cs = boards.map((b) => { const r = b.parentElement.getBoundingClientRect(); return r.left + r.width / 2; });
  // 접힌 판(프로그램에서 동료 할 일)은 버튼 크기만큼만 차지해요 → 그 옆의 펼친 판이 더 넓어져요
  const folded = boards.map((b) => !!b.querySelector(".vpeek:not(.on)") || !b.querySelector("li, .vadd, .vnote"));
  boards.forEach((b, i) => { if (folded[i]) b.style.width = "auto"; });
  const fw = boards.map((b, i) => folded[i] ? b.offsetWidth : 0);
  boards.forEach((b, i) => {
    if (folded[i]) return;
    let h = Math.min(MAXW / 2, cs[i] - 4, W - cs[i] - 4);
    boards.forEach((_, j) => {
      if (j === i) return;
      const d = Math.abs(cs[i] - cs[j]);
      if (folded[j]) { if (fw[j] > 0) h = Math.min(h, d - fw[j] / 2 - GAP); } // 접힌 판은 버튼 폭만 피해요 (비어 있으면 무시)
      else h = Math.min(h, (d - GAP) / 2);                                    // 펼친 판끼리는 반씩 나눠요
    });
    b.style.width = Math.max(60, Math.floor(2 * h)) + "px";
  });
}
window.addEventListener("resize", () => layoutBoards());
window.addEventListener("load", () => layoutBoards());
function checkFx(el, xp) {
  const r = el.getBoundingClientRect(), fx = document.createElement("div");
  fx.className = "checkfx"; fx.style.left = (r.left + r.width / 2) + "px"; fx.style.top = (r.top + r.height / 2) + "px";
  fx.innerHTML = Array.from({ length: 12 }, (_, i) => '<i style="--a:' + (i * 30) + "deg;--c:" + ["#F5C451", "#8DBB5E", "#F27A9B", "#4F9BE0", "#FFF4DC", "#E07A2F"][i % 6] + '"></i>').join("") + "<b>+" + xp + " XP</b>";
  document.body.appendChild(fx); setTimeout(() => fx.remove(), 1200);
}
function doneHTML(id) {
  const m = byId(id), mine = id === S.me, list = doneTasks(id).slice(0, 80), today = todayStr(), yest = ymd(addDays(new Date(), -1));
  const groups = {}; list.forEach((t) => { const d = doneDay(t); (groups[d] = groups[d] || []).push(t); });
  const dayName = (d) => { if (d === today) return "오늘"; if (d === yest) return "어제"; const x = new Date(d + "T00:00"); return (x.getMonth() + 1) + "월 " + x.getDate() + "일 " + "일월화수목금토"[x.getDay()] + "요일"; };
  const row = (t, showTime) => '<li class="task done">' + (mine ? '<label><input type="checkbox" data-toggle="' + esc(t.id) + '"' + (t.done ? " checked" : "") + '><span class="sz ' + t.size + '">' + t.size + '</span><span class="tt">' + esc(t.title) + "</span></label>"
    : '<span class="sz ' + t.size + '">' + t.size + '</span><span class="tt" style="flex:1">' + esc(t.title) + "</span>") +
    (showTime && t.done_at ? '<span class="muted" style="margin:0;font-size:11px">' + hhmm(t.done_at) + "</span>" : "") + '<span class="pts">+' + XP[t.size] + "</span></li>";
  const left = S.tasks.filter((t) => t.member === id && !t.done && t.week < ymd(thisWeek())).sort(byMade);
  const todayXP = (groups[today] || []).reduce((a, t) => a + XP[t.size], 0);
  return '<div class="card wide hit" role="dialog" aria-label="' + esc(m.name) + ' 님이 끝낸 일"><button class="x" data-act="close" aria-label="닫기">✕</button>' +
    '<p class="big">✓ ' + esc(m.name) + " 님이 끝낸 일</p>" +
    '<p class="muted">오늘 ' + (groups[today] || []).length + "개 · +" + todayXP + " XP" + (mine ? " · 체크를 풀면 다시 집 위로 돌아가요" : "") + "</p>" +
    (list.length ? Object.keys(groups).sort().reverse().map((d) => "<h3>" + dayName(d) + '</h3><ul class="tasks">' + groups[d].map((t) => row(t, true)).join("") + "</ul>").join("") : '<p class="empty">아직 끝낸 일이 없어요.</p>') +
    (left.length ? '<h3>지난주에 남은 일</h3><ul class="tasks">' + left.map((t) => '<li class="task">' + (mine ? '<label><input type="checkbox" data-toggle="' + esc(t.id) + '"><span class="sz ' + t.size + '">' + t.size + '</span><span class="tt">' + esc(t.title) + "</span></label>" : '<span class="sz ' + t.size + '">' + t.size + '</span><span class="tt" style="flex:1">' + esc(t.title) + "</span>") + '<span class="pts">+' + XP[t.size] + "</span>" + (mine ? '<button class="del" data-del="' + esc(t.id) + '" aria-label="삭제">✕</button>' : "") + "</li>").join("") + "</ul>" : "") +
    "</div>";
}

/* ---------- 하늘 위 시계 · 날씨 · 퇴근 (웹) ---------- */
const WEATHER = { name: "서울", lat: 37.5665, lon: 126.978 }; // Open-Meteo (키 필요 없음)
const OFF_HOUR = 18, ON_HOUR = 9;
const WX = (c) => c === 0 ? ["☀️", "맑음"] : c <= 2 ? ["🌤️", "구름 조금"] : c === 3 ? ["☁️", "흐림"] : c <= 48 ? ["🌫️", "안개"] : c <= 57 ? ["🌦️", "이슬비"] : c <= 67 ? ["🌧️", "비"] : c <= 77 ? ["❄️", "눈"] : c <= 82 ? ["🌧️", "소나기"] : c <= 86 ? ["🌨️", "눈"] : ["⛈️", "뇌우"];
let wx = null;
async function loadWeather() {
  try {
    const u = "https://api.open-meteo.com/v1/forecast?latitude=" + WEATHER.lat + "&longitude=" + WEATHER.lon + "&current=temperature_2m,weather_code&hourly=precipitation_probability&daily=precipitation_probability_max,precipitation_sum,temperature_2m_max,temperature_2m_min&timezone=Asia%2FSeoul&forecast_days=1";
    const r = await fetch(u); if (!r.ok) throw 0; wx = await r.json(); paintSky(true);
  } catch (e) { wx = wx || { failed: true }; paintSky(true); }
}
function skyHTML() {
  const now = new Date(), d = now.getDay(), h = now.getHours(), m = now.getMinutes();
  const time = String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");
  const date = (now.getMonth() + 1) + "월 " + now.getDate() + "일 " + "일월화수목금토"[d] + "요일";
  let weather = "날씨를 불러오는 중…", rain = "";
  if (wx && wx.current) {
    const [ic, nm] = WX(wx.current.weather_code), t = Math.round(wx.current.temperature_2m), dl = wx.daily || {};
    weather = ic + " " + nm + " " + t + "°" + (dl.temperature_2m_max ? ' <span class="sk-dim">' + Math.round(dl.temperature_2m_min[0]) + "° / " + Math.round(dl.temperature_2m_max[0]) + "°</span>" : "");
    const pmax = dl.precipitation_probability_max ? dl.precipitation_probability_max[0] : 0, psum = dl.precipitation_sum ? dl.precipitation_sum[0] : 0;
    let when = "";
    if (wx.hourly) { const i = wx.hourly.time.findIndex((tt, k) => new Date(tt).getHours() >= h && wx.hourly.precipitation_probability[k] >= 50); if (i >= 0) when = new Date(wx.hourly.time[i]).getHours() + "시쯤 "; }
    rain = (pmax >= 50 || psum >= 1) ? "☔ 오늘 비 소식 있어요 · " + when + "강수확률 " + pmax + "%" : "🌂 오늘 비 소식 없어요 · 강수확률 " + pmax + "%";
  } else if (wx && wx.failed) weather = "날씨를 불러오지 못했어요";
  let off, pct = 0;
  if (d === 0 || d === 6) off = "🌿 오늘은 주말이에요";
  else if (h < ON_HOUR) off = "☕ 출근 전이에요 · 퇴근 18:00";
  else if (h >= OFF_HOUR) { off = "🎉 퇴근 시간! 오늘도 수고했어요"; pct = 100; }
  else { const left = (OFF_HOUR * 60) - (h * 60 + m); off = "🏃 퇴근까지 <b>" + (Math.floor(left / 60) ? Math.floor(left / 60) + "시간 " : "") + (left % 60) + "분</b>"; pct = Math.round(((h * 60 + m) - ON_HOUR * 60) / ((OFF_HOUR - ON_HOUR) * 60) * 100); }
  return '<div class="sk-time">' + time + '</div><div class="sk-date">' + date + " · " + WEATHER.name + '</div><div class="sk-wx">' + weather + "</div>" + (rain ? '<div class="sk-rain">' + rain + "</div>" : "") +
    '<div class="sk-off">' + off + "</div>" + (pct > 0 && pct < 100 ? '<span class="sk-bar"><i style="width:' + pct + '%"></i></span>' : "");
}
function paintSky(force) {
  if (!WEB) return;
  let el = document.getElementById("sky");
  if (!el) { el = document.createElement("div"); el.id = "sky"; el.setAttribute("role", "status"); el.setAttribute("aria-live", "off"); document.body.appendChild(el); if (PROGRAM) { el.title = "끌어서 옮기기 · 두 번 누르면 원래 자리"; requestAnimationFrame(placePanels); } }
  const html = skyHTML(); if (force || el._h !== html) { el._h = html; el.innerHTML = html; }
}
if (WEB) { setInterval(() => paintSky(), 10000); setInterval(loadWeather, 30 * 60000); }

/* ---------- 말풍선 · 접속 기록 · 하늘 옆 채팅 기록 ---------- */
const BUBBLE_MS = 20000; // 말풍선이 떠 있는 시간
const durText = (ms) => { const m = Math.max(1, Math.round(ms / 60000)); return m >= 60 ? Math.floor(m / 60) + "시간 " + (m % 60 ? (m % 60) + "분" : "") : m + "분"; };
/* 채팅이 아닌 기록(알림·룰렛·입장·퇴장)을 한 줄 글로 */
function eventText(x) {
  const m = byId(x.member), nm = m ? m.name : "";
  if (x.kind === "lunch" && m) return "🍽 " + nm + " 님의 룰렛 추천메뉴: " + x.text;
  if (x.kind === "join" && m) return "🌅 " + nm + " 님이 들어왔어요";
  if (x.kind === "leave" && m) return "🌙 " + nm + " 님이 나갔어요" + (x.text && x.text !== "퇴장" ? " · " + x.text : "");
  if (x.kind === "system" || !m) return x.text;
  return null; // 일반 채팅
}
let joinedAt = null, leaveSent = false;
const byTime = (a, b) => new Date(a.created_at) - new Date(b.created_at) || ((typeof a.id === "number" && typeof b.id === "number") ? a.id - b.id : 0);
/* 그 사람의 마지막 입장/퇴장 기록 */
async function lastPresence(member) {
  if (store.mode === "remote") {
    const sb = store._sb; const r = await sb.from("dg_chat").select("kind,created_at").eq("member", member).in("kind", ["join", "leave"]).order("id", { ascending: false }).limit(1);
    return r.error ? undefined : (r.data[0] || null);
  }
  const l = S.chat.filter((x) => x.member === member && (x.kind === "join" || x.kind === "leave")); return l[l.length - 1] || null;
}
/* 안전장치 1: 열려 있는 동안 20초마다 "아직 있어요" 시각을 이 브라우저에 적어 둬요.
   창이 갑자기 닫혀 퇴장 기록이 못 갔으면, 다음에 들어올 때 그 시각으로 퇴장을 채워 넣어요. */
setInterval(() => { if (S.me && joinedAt) { try { localStorage.setItem("dg-lastseen", JSON.stringify({ me: S.me, t: Date.now(), since: joinedAt })); } catch (e) {} } }, 20000);
async function logJoin() {
  if (!S.me || joinedAt) return;
  joinedAt = Date.now(); leaveSent = false;
  try {
    const last = await lastPresence(S.me);
    if (last && last.kind === "join") {
      let seen = null; try { seen = JSON.parse(localStorage.getItem("dg-lastseen")); } catch (e) {}
      const jt = new Date(last.created_at).getTime(), t = seen && seen.me === S.me && seen.t > jt ? seen.t : null;
      if (t) { const row = await store.sendChat({ member: S.me, text: durText(t - jt) + " 머물렀어요", kind: "leave", created_at: new Date(t).toISOString() }); if (row) addChat(row); }
    }
  } catch (e) {}
  try { const row = await store.sendChat({ member: S.me, text: "입장", kind: "join" }); if (row) addChat(row); } catch (e) {}
}
/* 안전장치 2: 동료가 마을에서 사라지면, 20초 뒤에도 안 돌아왔고 퇴장 기록이 없을 때 남아 있는 사람이 대신 적어요 */
const leaveWatch = {};
function watchLeave(id) {
  if (store.mode !== "remote") return;
  clearTimeout(leaveWatch[id]);
  const goneAt = Date.now();
  leaveWatch[id] = setTimeout(async () => {
    if (S.online.has(id) || !S.online.has(S.me)) return; // 내 연결이 끊긴 거라면 남을 퇴장 처리하지 않아요
    try {
      const last = await lastPresence(id);
      if (!last || last.kind !== "join" || S.online.has(id)) return;
      const jt = new Date(last.created_at).getTime(); if (goneAt - jt < 5000) return;
      const row = await store.sendChat({ member: id, text: durText(goneAt - jt) + " 머물렀어요", kind: "leave", created_at: new Date(goneAt).toISOString() });
      if (row) addChat(row);
    } catch (e) {}
  }, 20000 + Math.random() * 6000); // 여러 명이 동시에 적지 않게 조금씩 다르게 기다려요
}
/* 창을 닫을 때: 페이지가 사라져도 끝까지 보내지도록 keepalive로 직접 보내요 */
async function logLeave(wait) {
  if (!S.me || !joinedAt || leaveSent) return;
  leaveSent = true;
  const row = { member: S.me, text: durText(Date.now() - joinedAt) + " 머물렀어요", kind: "leave" };
  joinedAt = null;
  if (!store || store.mode !== "remote") { try { await store.sendChat(row); } catch (e) {} return; }
  const p = fetch(CONFIG.SUPABASE_URL + "/rest/v1/dg_chat", { method: "POST", keepalive: true, headers: { apikey: CONFIG.SUPABASE_ANON_KEY, Authorization: "Bearer " + CONFIG.SUPABASE_ANON_KEY, "Content-Type": "application/json", Prefer: "return=minimal" }, body: JSON.stringify(row) }).catch(() => {});
  if (wait) await Promise.race([p, new Promise((r) => setTimeout(r, 1500))]);
}
window.addEventListener("pagehide", () => { logLeave(false); });
function paintSkyChat() {
  if (!WEB) return;
  let el = document.getElementById("skychat");
  if (!el) {
    el = document.createElement("div"); el.id = "skychat"; el.className = "hit";
    el.innerHTML = '<button type="button" class="sc-head" data-act="openLog" title="전체 채팅 기록 보기">💬 채팅 기록 <span>전체 보기 ›</span></button><ul class="sc-list" aria-live="polite"></ul>';
    document.body.appendChild(el);
    if (PROGRAM) requestAnimationFrame(placePanels);
  }
  const rows = S.chat.slice(-30).map((x) => {
    const ev = eventText(x), t = "<time>" + hhmm(x.created_at) + "</time>";
    if (ev !== null) return '<li class="ev ' + esc(x.kind) + '">' + esc(ev) + " " + t + "</li>";
    const m = byId(x.member);
    return '<li class="' + (x.member === S.me ? "mine" : "") + '"><b>' + esc(m.name) + "</b> " + esc(x.text) + " " + t + "</li>";
  }).join("") || '<li class="ev">아직 이야기가 없어요. 아래 채팅창에 인사해 볼까요?</li>';
  const list = el.querySelector(".sc-list");
  if (list._h === rows) return;
  const atBottom = list.scrollHeight - list.scrollTop - list.clientHeight < 24;
  list._h = rows; list.innerHTML = rows;
  if (atBottom || !list._init) { list.scrollTop = list.scrollHeight; list._init = true; }
}

/* ---------- 윈도우 프로그램용 제목 줄 · 크기 조절 ---------- */
function buildProgramChrome() {
  if (!PROGRAM || document.getElementById("titlebar")) return;
  const ds = window.deskShell;
  const tb = document.createElement("div"); tb.id = "titlebar";
  tb.innerHTML = '<img src="assets/appicon.png" alt=""><span class="tt">DREAM GUILD</span><span class="sp"></span>' +
    '<label class="tbop" title="전체 투명도"><span aria-hidden="true">◐</span><input type="range" min="25" max="100" step="5" aria-label="전체 투명도"></label>' +
    (ds.zoom ? '<span class="tbzoom"><button type="button" data-zoom="-1" aria-label="작게" title="작게 (Ctrl −)">−</button><button type="button" data-zoom="0" class="zv" title="원래 크기 (Ctrl 0)">100%</button><button type="button" data-zoom="1" aria-label="크게" title="크게 (Ctrl +)">+</button></span>' : "") +
    '<button type="button" data-win="min" aria-label="최소화" title="최소화">─</button><button type="button" data-win="max" aria-label="크게" title="화면 가득 / 원래 크기">☐</button><button type="button" data-win="close" class="cl" aria-label="닫기" title="닫기">✕</button>';
  tb.addEventListener("click", (e) => { const b = e.target.closest("[data-win]"); if (!b) return; ({ min: ds.min, max: ds.max, close: ds.close })[b.dataset.win](); });
  tb.addEventListener("dblclick", (e) => { if (!e.target.closest("button")) ds.max(); });
  document.body.appendChild(tb);
  // 전체 투명도 (25~100%) — 이 컴퓨터에 기억해요
  const lsGet = (k, d) => { try { const v = parseFloat(localStorage.getItem(k)); return isFinite(v) ? v : d; } catch (e) { return d; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, String(v)); } catch (e) {} };
  const op = tb.querySelector(".tbop input");
  const setOp = (v) => { v = Math.max(25, Math.min(100, Math.round(v))); op.value = v; document.body.style.opacity = v >= 100 ? "" : String(v / 100); lsSet("dg-opacity", v); };
  setOp(lsGet("dg-opacity", 100));
  op.addEventListener("input", () => setOp(+op.value));
  // 전체 크기 (브라우저 확대/축소처럼, 50~150%)
  if (ds.zoom) {
    const zv = tb.querySelector(".zv");
    let Z = 1;
    const setZoom = (z) => { Z = Math.max(0.5, Math.min(1.5, Math.round(z * 10) / 10)); ds.zoom(Z); zv.textContent = Math.round(Z * 100) + "%"; lsSet("dg-zoom", Z); setTimeout(() => { try { layoutBoards(); placePanels(); } catch (e) {} }, 60); };
    window.dgZoom = () => Z;
    setZoom(lsGet("dg-zoom", 1));
    tb.addEventListener("click", (e) => { const b = e.target.closest("[data-zoom]"); if (!b) return; const d = +b.dataset.zoom; setZoom(d ? Z + d * 0.1 : 1); });
    document.addEventListener("keydown", (e) => {
      if (!e.ctrlKey || e.altKey) return;
      if (e.key === "=" || e.key === "+") { e.preventDefault(); setZoom(Z + 0.1); }
      else if (e.key === "-" || e.key === "_") { e.preventDefault(); setZoom(Z - 0.1); }
      else if (e.key === "0") { e.preventDefault(); setZoom(1); }
    });
    window.addEventListener("wheel", (e) => { if (!e.ctrlKey) return; e.preventDefault(); setZoom(Z + (e.deltaY < 0 ? 0.1 : -0.1)); }, { passive: false });
  }
  ds.onMaxState((on) => { const b = tb.querySelector('[data-win="max"]'); b.textContent = on ? "❐" : "☐"; document.documentElement.classList.toggle("maxed", on); });
  // 오른쪽 아래 손잡이로 창 크기 조절 (투명한 창은 윈도우 기본 크기 조절이 불안정해서 직접 만들어요)
  const grip = document.createElement("div"); grip.id = "grip"; grip.title = "끌어서 창 크기 조절"; document.body.appendChild(grip);
  let rs = null, raf = 0;
  grip.addEventListener("pointerdown", (e) => { e.preventDefault(); grip.setPointerCapture(e.pointerId); rs = { x: e.screenX, y: e.screenY, w: window.outerWidth, h: window.outerHeight }; });
  grip.addEventListener("pointermove", (e) => { if (!rs) return; const w = rs.w + e.screenX - rs.x, h = rs.h + e.screenY - rs.y; cancelAnimationFrame(raf); raf = requestAnimationFrame(() => ds.resize(w, h)); });
  const end = () => { if (rs) { rs = null; ds.resizeEnd(); } }; grip.addEventListener("pointerup", end); grip.addEventListener("pointercancel", end);
  // 닫기 전에 마을에 "나갔어요"를 남겨요
  ds.onBeforeClose(async () => { try { await logLeave(true); } catch (e) {} ds.closeNow(); });
  // 아무것도 없는 투명한 하늘 위에서는 클릭이 뒤로 통과해요 (바탕화면 아이콘·뒤에 있는 창을 누를 수 있고, 누른 창은 앞으로 와요)
  if (ds.setIgnore) {
    let ig = false;
    const EMPTY = (t) => !t || t === document.documentElement || t === document.body || t.id === "village" || t.id === "row" || t.id === "cards" || t.id === "toasts" ||
      (t.classList && (t.classList.contains("vrow") || t.classList.contains("vcol") || t.classList.contains("row") || t.classList.contains("vboard") || t.classList.contains("vlist") || t.classList.contains("toasts")));
    const set = (on) => { if (on !== ig) { ig = on; ds.setIgnore(on); } };
    document.addEventListener("mousemove", (e) => {
      if (dragging || rs || panelDrag) { set(false); return; }
      set(EMPTY(document.elementFromPoint(e.clientX, e.clientY)));
    }, { passive: true });
  }
}

/* (프로그램) 시계 칸 · 채팅 기록 칸을 끌어서 옮겨요. 가까운 모서리 기준으로 기억해서 창 크기가 바뀌어도 그 자리 근처에 있어요. 두 번 누르면 원래 자리. */
let panelDrag = null;
const PANEL_KEY = (id) => "dg-pos-" + id;
function panelPos(id) { try { return JSON.parse(localStorage.getItem(PANEL_KEY(id))); } catch (e) { return null; } }
function placePanels() {
  if (!PROGRAM) return;
  ["sky", "skychat"].forEach((id) => {
    const el = document.getElementById(id); if (!el) return;
    const p = panelPos(id);
    if (!p) { el.style.left = el.style.right = el.style.top = el.style.bottom = ""; el.classList.remove("moved"); return; }
    const W = window.innerWidth, H = window.innerHeight, w = el.offsetWidth, h = el.offsetHeight;
    const cl = (v, max) => Math.max(0, Math.min(v, Math.max(0, max)));
    const top = 36; // 제목 줄 아래로
    let x = p.ax === "r" ? W - p.x - w : p.x, y = p.ay === "b" ? H - p.y - h : p.y;
    x = cl(x, W - w); y = Math.max(top, cl(y, H - h));
    el.style.right = el.style.bottom = "auto"; el.style.left = x + "px"; el.style.top = y + "px"; el.classList.add("moved");
  });
}
if (PROGRAM) {
  window.addEventListener("resize", () => placePanels());
  document.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    const el = e.target.closest && e.target.closest("#sky, #skychat"); if (!el) return;
    const list = e.target.closest(".sc-list"); if (list && e.offsetX >= list.clientWidth) return; // 스크롤 막대는 그대로
    const r = el.getBoundingClientRect();
    panelDrag = { el, sx: e.clientX, sy: e.clientY, x: r.left, y: r.top, moved: false, id: e.pointerId };
  });
  document.addEventListener("pointermove", (e) => {
    const d = panelDrag; if (!d) return;
    const dx = e.clientX - d.sx, dy = e.clientY - d.sy;
    if (!d.moved && Math.abs(dx) + Math.abs(dy) < 5) return;
    if (!d.moved) { d.moved = true; d.el.classList.add("dragging"); try { d.el.setPointerCapture(d.id); } catch (x) {} }
    const W = window.innerWidth, H = window.innerHeight, w = d.el.offsetWidth, h = d.el.offsetHeight;
    const x = Math.max(0, Math.min(d.x + dx, W - w)), y = Math.max(36, Math.min(d.y + dy, H - h));
    d.el.style.right = d.el.style.bottom = "auto"; d.el.style.left = x + "px"; d.el.style.top = y + "px"; d.el.classList.add("moved");
  });
  const endPanel = () => {
    const d = panelDrag; panelDrag = null; if (!d || !d.moved) return;
    d.el.classList.remove("dragging");
    const r = d.el.getBoundingClientRect(), W = window.innerWidth, H = window.innerHeight;
    const right = r.left + r.width / 2 > W / 2, bottom = r.top + r.height / 2 > H / 2;
    const p = { ax: right ? "r" : "l", ay: bottom ? "b" : "t", x: Math.round(right ? W - r.right : r.left), y: Math.round(bottom ? H - r.bottom : r.top) };
    try { localStorage.setItem(PANEL_KEY(d.el.id), JSON.stringify(p)); } catch (x) {}
    // 끈 뒤에 따라오는 클릭(채팅 기록 열기 등)은 막아요
    const stop = (ev) => { ev.stopPropagation(); ev.preventDefault(); };
    document.addEventListener("click", stop, { capture: true, once: true }); setTimeout(() => document.removeEventListener("click", stop, { capture: true }), 50);
  };
  document.addEventListener("pointerup", endPanel); document.addEventListener("pointercancel", endPanel);
  document.addEventListener("dblclick", (e) => {
    const el = e.target.closest && e.target.closest("#sky, #skychat"); if (!el || e.target.closest(".sc-list")) return;
    try { localStorage.removeItem(PANEL_KEY(el.id)); } catch (x) {} placePanels();
  });
}
buildProgramChrome();

/* ---------- 점심 룰렛 (웹: 마을 표지판 위) ---------- */
const MENUS = ["닭갈비", "쌀국수", "김치찌개", "보리밥", "부대찌개", "돈까스", "마라탕", "분식", "샌드위치", "세무서급식", "햄버거", "중국집", "카레", "콩나물국밥", "순대국", "고양이부엌", "배민"];
const LUNCH_MS = 20000; // 추천메뉴가 캐릭터 옆에 떠 있는 시간 (20초)
const WHEEL_COLORS = ["#F7D58B", "#F2A58C", "#BFE3A3", "#9CCBE8", "#F2B8CF", "#D9C4F0", "#FCE38A", "#A8DCC8"];
S.lunch = {};
let wheelRot = 0, spinning = false;
function wheelSVG() {
  const n = MENUS.length, seg = 360 / n, R = 64, pt = (a, r) => [(r * Math.sin(a * Math.PI / 180)).toFixed(2), (-r * Math.cos(a * Math.PI / 180)).toFixed(2)];
  const slices = MENUS.map((name, i) => {
    const a0 = i * seg, a1 = a0 + seg, [x0, y0] = pt(a0, R), [x1, y1] = pt(a1, R), mid = a0 + seg / 2;
    return '<path d="M0,0 L' + x0 + "," + y0 + " A" + R + "," + R + " 0 0 1 " + x1 + "," + y1 + ' Z" fill="' + WHEEL_COLORS[i % WHEEL_COLORS.length] + '" stroke="#6E4424" stroke-width=".8"/>' +
      '<text x="59" y="2.6" text-anchor="end" transform="rotate(' + (mid - 90).toFixed(2) + ')">' + name + "</text>";
  }).join("");
  return '<svg class="wheel-svg" viewBox="-72 -78 144 152" aria-hidden="true"><circle r="69" fill="#6E4424"/><circle r="66.5" fill="#FFF4DC"/><g class="wheel" style="transform:rotate(' + wheelRot + 'deg)">' + slices + "</g>" +
    '<path d="M-7,-74 L7,-74 L0,-60 Z" fill="#E05A4F" stroke="#4E2E17" stroke-width="1.6" stroke-linejoin="round"/></svg>';
}
function buildRoulette() {
  const box = document.querySelector("#village .vroul"); if (!box || box._built) return; box._built = true;
  box.innerHTML = '<div class="roul-title">🍽 오늘 뭐 먹지?</div>' + wheelSVG() + '<button type="button" class="roul-hub" data-act="spin" aria-label="점심 룰렛 돌리기">돌리기</button>';
}
function spinTo(index, done) {
  const n = MENUS.length, seg = 360 / n, target = -(index * seg + seg / 2);
  const start = wheelRot, end = start + 360 * 5 + (((target - start) % 360) + 360) % 360, dur = 4200, t0 = performance.now();
  const g = document.querySelector("#village .wheel"); spinning = true;
  let lastSeg = Math.floor(start / seg);
  const step = (now) => {
    const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3.2);
    wheelRot = start + (end - start) * e; if (g) g.style.transform = "rotate(" + wheelRot + "deg)";
    const s = Math.floor(wheelRot / seg); if (s !== lastSeg) { lastSeg = s; sfx("tick", 0.5); }
    if (p < 1) requestAnimationFrame(step); else { wheelRot = end % 360; if (g) g.style.transform = "rotate(" + wheelRot + "deg)"; spinning = false; done && done(); }
  };
  requestAnimationFrame(step);
}
async function spinLunch() {
  if (!S.me) { openCard("who"); return; }
  if (spinning) return;
  const i = Math.floor(Math.random() * MENUS.length), me = S.me;
  spinTo(i, async () => {
    sfx("check");
    try { const row = await store.sendChat({ member: me, text: MENUS[i], kind: "lunch" }); if (row) addChat(row); else showLunch(me, MENUS[i], new Date().toISOString()); }
    catch (e) { showLunch(me, MENUS[i], new Date().toISOString()); }
  });
}
function showLunch(member, menu, at, shownAt) {
  S.lunch[member] = { menu, at, shownAt: shownAt || Date.now() };
  if (PAL[member]) paintPal(member);
  clearTimeout(showLunch["t" + member]);
  showLunch["t" + member] = setTimeout(() => paintLunch(member), Math.max(0, S.lunch[member].shownAt + LUNCH_MS - Date.now()) + 100);
}
function paintLunch(id) {
  const el = PAL[id]; if (!el) return;
  const l = S.lunch[id], live = l && Date.now() - (l.shownAt || 0) < LUNCH_MS;
  let tag = el.querySelector(".lunchtag");
  if (!live) { if (tag) tag.remove(); return; }
  if (!tag) { tag = document.createElement("span"); tag.className = "lunchtag"; el.appendChild(tag); }
  const html = '<small>🍽 추천메뉴</small><b>' + esc(l.menu) + "</b>";
  if (tag._h !== html) { tag._h = html; tag.innerHTML = html; tag.classList.remove("pop"); void tag.offsetWidth; tag.classList.add("pop"); }
}

/* ---------- 쪽지 (글 + 그림) ---------- */
const myInbox = () => (S.notes || []).filter((n) => n.recipient === S.me);
const unreadNotes = () => myInbox().filter((n) => !n.read_at);
const seenNotes = new Set();
function announceNewNotes() {
  const first = !announceNewNotes.ready; announceNewNotes.ready = true;
  unreadNotes().forEach((n) => { if (seenNotes.has(n.id)) return; seenNotes.add(n.id); if (!first && byId(n.sender)) { toast("✉ " + byId(n.sender).name + " 님이 쪽지를 보냈어요! 내 집 위를 확인해 보세요."); sfx("note"); } });
}
S.pen = { color: "#3B2A1E", size: 4, eraser: false };
function composeHTML(to) {
  const m = byId(to), cols = ["#3B2A1E", "#E05A4F", "#F2A03A", "#F5C451", "#4F9B58", "#4F86C6", "#9B6FD1", "#F27A9B"];
  return '<div class="card wide hit compose" role="dialog" aria-label="' + esc(m.name) + ' 님에게 쪽지"><button class="x" data-act="close" aria-label="닫기">✕</button>' +
    '<div class="prof" style="align-items:center">' + avatarHTML(m.id, closetOf(m.id).wear, "mid") + '<div class="pinfo"><p class="big" style="margin:0">✉ ' + esc(m.name) + ' 님에게 쪽지</p><p class="muted" style="margin:2px 0 0">글을 쓰거나, 아래 종이에 마우스로 그림을 그려요.</p>' +
    '<div class="pbtns"><button class="ghost sm" data-goroom="' + m.id + '">🏠 ' + esc(m.place) + " 구경</button></div></div></div>" +
    '<label class="sr" for="noteText">쪽지 내용</label><textarea id="noteText" maxlength="500" rows="3" placeholder="하고 싶은 말을 적어요 (500자까지)"></textarea>' +
    '<div class="pad"><canvas id="noteCanvas" width="720" height="320" aria-label="그림 그리는 종이"></canvas></div>' +
    '<div class="tools" role="toolbar" aria-label="그리기 도구">' + cols.map((c) => '<button type="button" class="pen' + (!S.pen.eraser && S.pen.color === c ? " on" : "") + '" data-pen="' + c + '" style="--c:' + c + '" aria-label="색 ' + c + '"></button>').join("") +
    '<span class="tsep"></span>' + [[3, "가는 펜"], [7, "굵은 펜"]].map(([s, nm]) => '<button type="button" class="psize' + (S.pen.size === s ? " on" : "") + '" data-pensize="' + s + '" title="' + nm + '" aria-label="' + nm + '"><i style="width:' + (s + 2) + "px;height:" + (s + 2) + 'px"></i></button>').join("") +
    '<button type="button" class="ghost sm' + (S.pen.eraser ? " on" : "") + '" data-act="eraser">지우개</button><button type="button" class="ghost sm" data-act="clearPad">모두 지우기</button></div>' +
    '<div style="display:flex;gap:6px;justify-content:flex-end;margin-top:10px"><button class="ghost" data-act="close">취소</button><button class="primary" data-act="sendNote" data-to="' + m.id + '">✉ 보내기</button></div></div>';
}
function syncTools() {
  document.querySelectorAll(".compose [data-pen]").forEach((b) => b.classList.toggle("on", !S.pen.eraser && b.dataset.pen === S.pen.color));
  document.querySelectorAll(".compose [data-pensize]").forEach((b) => b.classList.toggle("on", +b.dataset.pensize === S.pen.size));
  const er = document.querySelector('.compose [data-act="eraser"]'); if (er) er.classList.toggle("on", S.pen.eraser);
}
function initPad() {
  const cv = document.getElementById("noteCanvas"); if (!cv || cv._init) return; cv._init = true;
  const ctx = cv.getContext("2d"); ctx.fillStyle = "#FFFDF6"; ctx.fillRect(0, 0, cv.width, cv.height); ctx.lineCap = "round"; ctx.lineJoin = "round";
  let last = null;
  const pos = (e) => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * cv.width / r.width, (e.clientY - r.top) * cv.height / r.height]; };
  const line = (a, b) => { ctx.strokeStyle = S.pen.eraser ? "#FFFDF6" : S.pen.color; ctx.lineWidth = (S.pen.eraser ? S.pen.size * 4 : S.pen.size) * 2; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); cv._dirty = true; };
  cv.addEventListener("pointerdown", (e) => { e.preventDefault(); cv.setPointerCapture(e.pointerId); last = pos(e); line(last, [last[0] + 0.1, last[1] + 0.1]); });
  cv.addEventListener("pointermove", (e) => { if (!last) return; const p = pos(e); line(last, p); last = p; });
  const up = () => { last = null; }; cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);
}
async function sendNote(to) {
  const ta = document.getElementById("noteText"), cv = document.getElementById("noteCanvas");
  const text = (ta ? ta.value : "").trim().slice(0, 500), drawing = cv && cv._dirty ? cv.toDataURL("image/png") : null;
  if (!text && !drawing) { toast("글을 쓰거나 그림을 그려 주세요."); return; }
  if (store.mode === "remote" && S.notesMissing) { toast("쪽지함이 아직 준비되지 않았어요. setup.sql의 8번(쪽지)을 Supabase에서 한 번 실행해 주세요."); return; }
  const btn = document.querySelector('[data-act="sendNote"]'); if (btn) btn.disabled = true;
  try {
    const row = await store.sendNote({ sender: S.me, recipient: to, text, drawing });
    if (row) S.notes = [row].concat(S.notes || []);
    sfx("add"); closeCard(); toast("✉ " + byId(to).name + " 님에게 쪽지를 보냈어요!");
  } catch (e) { if (btn) btn.disabled = false; toast("쪽지를 보내지 못했어요. 쪽지함 준비(setup.sql 8번)가 됐는지 확인해 주세요."); }
}
function noteHTML(id) {
  const n = (S.notes || []).find((x) => String(x.id) === String(id)); if (!n) return "";
  const from = byId(n.sender), to = byId(n.recipient), mine = n.recipient === S.me, d = new Date(n.created_at);
  return '<div class="card wide hit" role="dialog" aria-label="쪽지"><button class="x" data-act="close" aria-label="닫기">✕</button>' +
    '<div class="prof" style="align-items:center">' + avatarHTML(from.id, closetOf(from.id).wear, "mid") + '<div class="pinfo"><p class="big" style="margin:0">✉ ' + esc(from.name) + " 님의 쪽지</p>" +
    '<p class="muted" style="margin:2px 0 0">' + (mine ? "" : esc(to.name) + " 님에게 · ") + (d.getMonth() + 1) + "월 " + d.getDate() + "일 " + hhmm(n.created_at) + "</p></div></div>" +
    '<div class="letter">' + (n.text ? '<p class="ltext">' + esc(n.text).replace(/\n/g, "<br>") + "</p>" : "") + (n.drawing && /^data:image\/png;base64,/.test(n.drawing) ? '<img class="ldraw" alt="' + esc(from.name) + ' 님이 그린 그림" src="' + n.drawing + '">' : "") + "</div>" +
    '<div style="display:flex;gap:6px;justify-content:flex-end;margin-top:10px"><button class="ghost" data-act="inbox">✉ 쪽지함</button>' + (mine && from.id !== S.me ? '<button class="primary" data-compose="' + from.id + '">↩ 답장하기</button>' : "") + "</div></div>";
}
function inboxHTML() {
  const inbox = myInbox(), sent = (S.notes || []).filter((n) => n.sender === S.me && n.recipient !== S.me);
  const row = (n, who) => { const m = byId(who); return '<li class="' + (!n.read_at && n.recipient === S.me ? "unread" : "") + '"><button type="button" data-note="' + n.id + '"><img src="' + IMG(m.id) + '" alt=""><span><b>' + esc(m.name) + "</b> " + esc((n.text || "🎨 그림 쪽지").slice(0, 40)) + (n.drawing && n.text ? " 🎨" : "") + '</span><time>' + hhmm(n.created_at) + "</time></button></li>"; };
  return '<div class="card wide hit" role="dialog" aria-label="쪽지함"><button class="x" data-act="close" aria-label="닫기">✕</button><p class="big">✉ 쪽지함</p>' +
    (store.mode === "remote" && S.notesMissing ? '<p class="note">쪽지함이 아직 준비되지 않았어요. setup.sql의 8번(쪽지)을 Supabase SQL Editor에서 한 번 실행해 주세요.</p>' : "") +
    "<h3>받은 쪽지</h3>" + (inbox.length ? '<ul class="inbox">' + inbox.map((n) => row(n, n.sender)).join("") + "</ul>" : '<p class="empty">아직 받은 쪽지가 없어요.</p>') +
    "<h3>보낸 쪽지</h3>" + (sent.length ? '<ul class="inbox">' + sent.slice(0, 20).map((n) => row(n, n.recipient)).join("") + "</ul>" : '<p class="empty">동료의 집을 누르면 쪽지를 보낼 수 있어요.</p>') + "</div>";
}
async function openNote(id) {
  const n = (S.notes || []).find((x) => String(x.id) === String(id)); if (!n) return;
  if (S.say) exitWalk(true);
  openCard({ type: "note", id: n.id });
  if (n.recipient === S.me && !n.read_at) { n.read_at = new Date().toISOString(); paintBoards(); try { await store.readNote(n.id); } catch (e) {} }
}

/* ---------- 도움말 ---------- */
function helpHTML() {
  const sec = (icon, title, items) => '<section class="hsec"><h3><span class="hic">' + icon + "</span>" + title + "</h3><ul>" + items.map((x) => "<li>" + x + "</li>").join("") + "</ul></section>";
  const k = (s) => "<kbd>" + s + "</kbd>";
  const todo = WEB ? [
    "<b>내 집 위</b>의 「+ 할 일 추가」 칸에 적고 " + k("Enter") + "를 눌러요.",
    "칸 옆 <b>S / M / L</b> 버튼은 일의 크기예요. 누를 때마다 바뀌고, 끝내면 " + "S " + XP.S + " · M " + XP.M + " · L " + XP.L + " XP를 받아요.",
    "다 한 일은 왼쪽 <b>네모 칸을 눌러 체크</b>해요. 반짝! 하고 XP가 올라가요. 잘못 눌렀으면 한 번 더 눌러 풀어요.",
    "오늘 끝낸 일은 줄이 그어진 채 흐리게 남고, 다음 날부터는 집 위에서 사라져요. 집 아래 <b>「✓ 완료한 할 일」</b>을 누르면 날짜별로 다시 볼 수 있어요.",
    "할 일에 마우스를 올리면 ✕가 나와서 지울 수 있어요. 다른 사람 집 위의 할 일은 보기만 할 수 있어요.",
  ] : [
    "내 캐릭터를 누르면 나오는 카드의 「할 일」에서 적고, 크기(S·M·L)를 고른 뒤 「추가」를 눌러요.",
    "다 한 일은 체크칸을 눌러요. S " + XP.S + " · M " + XP.M + " · L " + XP.L + " XP를 받아요. (웹 버전에서는 각자 집 위에서 바로 적고 체크해요)",
  ];
  return '<div class="card wide hit help" role="dialog" aria-label="도움말"><button class="x" data-act="close" aria-label="닫기">✕</button>' +
    '<p class="big">❓ DREAM GUILD 사용법</p><p class="muted">한 주의 할 일을 끝낼수록 경험치가 쌓이고, 각자의 꿈을 향해 레벨업하는 우리 팀 마을이에요.</p>' +
    sec("📝", "할 일 적고 체크하기", todo) +
    sec("⭐", "레벨과 골드", [
      "끝낸 할 일의 XP가 쌓이면 레벨이 올라요. 다음 레벨까지 100 + 20×(지금 레벨−1) XP, 최대 Lv.20이에요.",
      "레벨이 오르면 꿈 로드맵의 새 칭호를 얻고, 방 꾸미기 가구와 멋진 옷이 열려요.",
      "<b>골드</b>는 모은 XP만큼 생겨요. 옷을 사면 골드만 줄고 레벨은 그대로예요.",
    ]) +
    sec("❤", "HP · MP · 스킬", [
      "<b>HP</b>는 평일 아침 9시에 가득 찼다가 저녁 6시까지 천천히 닳아요. 동료의 회복 스킬로 다시 채워요.",
      "<b>MP</b>는 할 일을 끝내면 쌓여요. 내 캐릭터를 눌러 고유 스킬을 써 보세요. 스킬마다 하루 한 번이에요.",
    ]) +
    sec("🏘", "마을 둘러보기", [
      (WEB ? "뒤쪽 <b>집을 누르면</b> 그 사람의 방이 열려요. " : "🏠 버튼이나 내 카드에서 방에 들어가요. ") + "내 방에서는 「방 꾸미기」로 벽지·바닥·가구를 바꿀 수 있어요.",
      "<b>내 캐릭터</b>를 누르면 레벨·골드·HP/MP·스킬·옷장이 보이고, <b>다른 사람</b>을 누르면 이름·직업·HP·MP가 보여요.",
      "<b>모닥불</b>을 누르면 이번 주 팀 소식과 팀 목표 XP가 보여요. 끌면 캐릭터 줄 위치를 옮길 수 있어요.",
    ]) +
    sec("💬", "채팅 · 걷기 · 점프", [
      "맨 아래 채팅창에 쓰고 " + k("Enter") + "를 누르면 내 캐릭터 머리 위에 말풍선이 " + (BUBBLE_MS / 1000) + "초 동안 떠요. " + (WEB ? "하늘 시계 오른쪽 <b>채팅 기록</b>에 늘 남아 있어서 놓쳐도 괜찮아요. " : "") + "전체 기록은 「💬 기록」에서 봐요.",
      "누가 마을에 들어오고 나간 시간도 채팅 기록에 남아요.",
      "채팅창이 비어 있을 때 " + k("←") + " " + k("→") + "로 걷고, " + k("↑") + "로 점프해요. 채팅창 밖에서는 " + k("스페이스") + ", 또는 「⤴ 점프」 버튼도 돼요.",
      "내 점프와 걷기는 동료들 화면에도 그대로 보여요.",
    ]) +
    sec("✉", "쪽지", [
      (WEB ? "<b>동료의 집을 누르면</b> 그 사람에게 쪽지를 쓸 수 있어요. " : "") + "동료 캐릭터를 눌러 「✉ 쪽지 보내기」로도 써요.",
      "글을 쓰고, 아래 종이에 <b>마우스로 그림</b>도 그릴 수 있어요. 색·굵기·지우개를 골라 보세요.",
      "쪽지가 오면 " + (WEB ? "<b>내 집 위 할 일 맨 위</b>에 「✉ ○○ 님의 쪽지」가 떠요. 누르면 읽고 답장할 수 있어요. " : "알림이 떠요. ") + "지난 쪽지는 내 카드의 「✉ 쪽지함」에 있어요.",
    ]) +
    (WEB ? sec("🍽", "점심 룰렛 · 하늘 시계", [
      "마을 표지판 위 룰렛의 「돌리기」를 누르면 오늘의 <b>추천메뉴</b>가 나와요. 돌린 사람 옆에 " + (LUNCH_MS / 1000) + "초 동안 떠 있고, 동료들 화면에서도 같이 돌아가요. 결과는 채팅 기록에도 남아요.",
      "하늘 가운데에는 지금 시각, " + WEATHER.name + " 날씨, 오늘 비 소식, <b>퇴근(18시)까지 남은 시간</b>이 보여요.",
    ]) : "") +
    sec("👕", "옷가게와 옷장", [
      (WEB ? "마을의 <b>분홍 옷가게</b>나 " : "") + "「👕 옷가게」 버튼으로 들어가요. 그림을 누르면 거울 앞에서 먼저 입어 볼 수 있어요.",
      "맨 위 <b>⭐ 직업 전용 옷</b>은 나만 살 수 있어요. 🔒 표시가 붙은 옷은 그 레벨이 되면 열려요.",
      "산 옷은 내 카드의 <b>옷장</b>이나 옷가게에서 눌러 입고 벗어요. 동료들 화면에도 입은 모습이 보여요.",
    ]) +
    (PROGRAM ? sec("🖥", "윈도우 프로그램", [
      "<b>시계 칸과 채팅 기록 칸</b>은 마우스로 끌어서 원하는 곳에 둘 수 있어요. 두 번 누르면 원래 자리로 돌아가요.",
      "제목 줄의 <b>◐ 막대</b>로 전체 투명도를, <b>− 100% +</b>로 전체 크기를 바꿔요. " + k("Ctrl") + "+마우스 휠, " + k("Ctrl") + " " + k("+") + " / " + k("−") + " / " + k("0") + "도 돼요.",
      "건물·글자·버튼이 없는 투명한 하늘은 클릭이 뒤로 지나가요. 뒤에 있는 창을 누르면 그 창이 앞으로 와요.",
    ]) : "") +
    '<p class="muted" style="margin-top:12px;text-align:center">언제든 채팅창 왼쪽 「❓ 도움말」을 누르면 이 안내를 다시 볼 수 있어요.</p></div>';
}

/* ---------- 카드 ---------- */
function openCard(c) { if (S.walk) exitWalk(true); S.card = c; renderCard(); if (c && c !== "who") D.wantFocus(true); }
function closeCard() { S.edit = null; S.pickSkill = null; S.tryOn = null; S.card = null; renderCard(); if (!S.say) D.wantFocus(false); }
function renderCard() {
  const box = document.getElementById("cards"); let html = "";
  const c = S.card;
  if (!S.me && c !== "settings" && c !== "help") {
    html = '<div class="card hit center" role="dialog" aria-label="나는 누구인가요"><p class="big">어서 오세요, 모험가님!</p><p class="muted">누구로 들어갈까요? 이 컴퓨터가 기억해요.</p><div class="pick">' +
      MEMBERS.map((m) => '<button data-me="' + m.id + '"><img src="' + IMG(m.id) + '" alt=""><b>' + esc(m.name) + '</b><span class="muted" style="margin:0">' + esc(m.cls) + "</span></button>").join("") + "</div></div>";
  } else if (c === "help") {
    html = helpHTML();
  } else if (c && c.type === "compose") {
    html = composeHTML(c.id);
  } else if (c && c.type === "note") {
    html = noteHTML(c.id);
  } else if (c === "inbox") {
    html = inboxHTML();
  } else if (c === "who") {
    html = '<div class="card hit center" role="dialog" aria-label="사람 바꾸기"><button class="x" data-act="close" aria-label="닫기">✕</button><p class="big">누구로 바꿀까요?</p><div class="pick">' +
      MEMBERS.map((m) => '<button data-me="' + m.id + '"><img src="' + IMG(m.id) + '" alt=""><b>' + esc(m.name) + "</b></button>").join("") + "</div></div>";
  } else if (c === "log") {
    let lastDay = "";
    const fmtDay = (iso) => { const d = new Date(iso); return (d.getMonth() + 1) + "월 " + d.getDate() + "일 " + "일월화수목금토"[d.getDay()] + "요일"; };
    const rows = S.chat.map((x) => {
      const day = fmtDay(x.created_at), sep = day !== lastDay ? '<li class="day">' + day + "</li>" : ""; lastDay = day;
      const m = byId(x.member);
      const ev = eventText(x);
      if (ev !== null) return sep + '<li class="sys">' + esc(ev) + " <time>" + hhmm(x.created_at) + "</time></li>";
      return sep + '<li class="' + (x.member === S.me ? "mine" : "") + '"><img src="' + IMG(m.id) + '" alt=""><div><b>' + esc(m.name) + "</b><time>" + hhmm(x.created_at) + "</time><p>" + esc(x.text) + "</p></div></li>";
    }).join("");
    html = '<div class="card wide hit" role="dialog" aria-label="채팅 기록"><button class="x" data-act="close" aria-label="닫기">✕</button><p class="big">마을 채팅 기록</p>' +
      (S.chatEnd ? '<p class="muted">처음 이야기까지 모두 불러왔어요.</p>' : '<button class="ghost" data-act="moreLog" style="margin-top:6px">이전 기록 더 보기</button>') +
      '<ul class="chatlog">' + (rows || '<li class="sys">아직 이야기가 없어요.</li>') + "</ul>" +
      '<form class="add" data-form="logsay"><label class="sr" for="logIn">메시지</label><input type="text" id="logIn" maxlength="200" autocomplete="off" placeholder="여기서 바로 말할 수 있어요 (Enter)"><button class="primary" type="submit">보내기</button></form></div>';
  } else if (c === "quit") {
    html = '<div class="card hit center" role="dialog" aria-label="종료"><p class="big">오늘은 여기까지 할까요?</p><p class="muted">DREAM GUILD를 끄면 동료들 화면에서 내 캐릭터가 잠들어요.<br>잠깐 숨기기만 하려면 「최소화」를 눌러 주세요.</p>' +
      '<div style="display:flex;gap:6px;justify-content:center;margin-top:14px"><button class="primary" data-act="quit">끄기</button><button class="ghost" data-act="miniFromQuit">최소화</button><button class="ghost" data-act="close">취소</button></div></div>';
  } else if (c === "settings") {
    html = '<div class="card hit" role="dialog" aria-label="팀 연결 설정"><button class="x" data-act="close" aria-label="닫기">✕</button><p class="big">팀 연결 설정</p>' +
      '<p class="muted">웹 마을과 같은 Supabase 주소와 anon 키를 넣으면, 여섯 명이 같은 기록을 함께 봐요. 팀원 모두 같은 값을 넣어 주세요.</p>' +
      '<form data-form="settings" style="display:flex;flex-direction:column;gap:8px;margin-top:10px">' +
      '<label class="muted" for="setUrl">Supabase 주소</label><input class="field" id="setUrl" placeholder="https://xxxx.supabase.co" value="' + esc(CONFIG.SUPABASE_URL) + '">' +
      '<label class="muted" for="setKey">anon public 키</label><input class="field" id="setKey" placeholder="eyJhbGciOi..." value="' + esc(CONFIG.SUPABASE_ANON_KEY) + '">' +
      '<label class="muted" for="setGoal">팀 주간 목표 XP</label><input class="field" id="setGoal" type="number" min="50" step="50" value="' + CONFIG.TEAM_GOAL + '">' +
      '<div style="display:flex;gap:6px;margin-top:4px"><button class="primary" type="submit">저장하고 다시 시작</button><button class="ghost" type="button" data-act="clearConfig">체험 모드로</button></div></form></div>';
  } else if (c && c.type === "class") {
    html = '<div class="card hit center" role="dialog" aria-label="전직 선택"><p class="muted">Lv.10 달성 · 2차 전직</p><p class="big">길이 갈라져요. 어느 길로 갈까요?</p><div class="routes">' +
      ["explorer", "leader", "story"].map((k) => { const r = ROUTES[k]; return '<button data-route="' + k + '"><b>' + r.name + "</b><span>" + r.desc + "</span><span>" + r.titles.join(" → ") + "</span></button>"; }).join("") +
      '<div class="locked"><b>히든 루트</b><span>동료를 도와주는 보너스 퀘스트를 10번 채우면 열려요</span></div></div></div>';
  } else if (c && c.type === "plaza") {
    const wk = ymd(thisWeek()), done = S.tasks.filter((t) => t.week === wk && t.done), txp = done.reduce((a, t) => a + XP[t.size], 0), tp = Math.min(100, Math.round(txp / CONFIG.TEAM_GOAL * 100));
    const feed = S.chat.slice(-14).reverse();
    html = '<div class="card hit" role="dialog" aria-label="팀 소식"><button class="x" data-act="close" aria-label="닫기">✕</button><p class="big">팀 캠프파이어</p>' +
      '<p class="muted">' + weekLabel(thisWeek()).title + " · 팀 경험치 <b>" + txp + "</b> / " + CONFIG.TEAM_GOAL + " XP" + (tp >= 100 ? " · 목표 달성! 금요일 간식 타임" : "") + (store.mode === "local" ? " · 체험 모드" : "") + "</p>" +
      '<span class="xp" style="height:10px"><i style="width:' + tp + '%;background:#E07A2F"></i></span>' +
      "<h3>팀원</h3><ul class=\"feed\">" + MEMBERS.map((m) => { const w = weekTasks(m.id, thisWeek()), d = w.filter((t) => t.done).length, lv = levelInfo(xpOf(m.id)).lv;
        return '<li><img src="' + IMG(m.id) + '" alt=""><span><b>' + esc(m.name) + "</b> Lv." + lv + " " + esc(titleOf(m, lv, S.routes[m.id])) + ' <span class="muted">· ' + d + "/" + w.length + (asleep(m.id) ? " · 자리 비움" : "") + "</span></span></li>"; }).join("") + "</ul>" +
      '<h3>최근 이야기<button class="ghost" data-act="openLog" style="margin-left:auto">전체 기록 보기</button></h3>' +
      (feed.length ? '<ul class="feed">' + feed.map((x) => { const m = byId(x.member); if (x.kind === "lunch" || x.kind === "join" || x.kind === "leave") return '<li class="sys">· ' + esc(eventText(x)) + " " + hhmm(x.created_at) + "</li>"; return x.kind === "system" || !m ? '<li class="sys">· ' + esc(x.text) + "</li>" : '<li><img src="' + IMG(m.id) + '" alt=""><span><b>' + esc(m.name) + "</b> " + esc(x.text) + ' <span class="muted">' + hhmm(x.created_at) + "</span></span></li>"; }).join("") + "</ul>" : '<p class="empty">아직 조용해요. 먼저 인사해 볼까요?</p>') + "</div>";
  } else if (c && c.type === "room") {
    const m = byId(c.id), route = S.routes[m.id], info = levelInfo(xpOf(m.id)), mine = m.id === S.me, edit = S.edit && S.edit.id === m.id;
    html = '<div class="card wide hit" role="dialog" aria-label="' + esc(m.place) + '"><button class="x" data-act="close" aria-label="닫기">✕</button>' +
      '<p class="roomtitle"><span class="cls">' + esc(m.place) + '</span> <b class="big" style="font-size:19px">' + esc(m.name) + " 님의 방</b></p>" +
      roomHTML(m.id, edit) +
      (edit ? decorPanel(m.id, info.lv) :
        '<div class="rowline"><p class="muted" style="margin:0;flex:1">' + esc(m.name) + " · Lv." + info.lv + " " + esc(titleOf(m, info.lv, route)) + (mine ? "" : " · 방 구경은 마음껏!") + "</p>" +
        (mine ? '<button class="ghost" data-act="decor">방 꾸미기</button>' : "") + '<button class="ghost" data-person="' + m.id + '">👤 스테이터스</button></div>') + "</div>";
  } else if (c && c.type === "shop") {
    html = shopHTML();
  } else if (c && c.type === "person" && c.id !== S.me) {
    const m = byId(c.id), st = statsOf(m.id), low = st.hp / st.hpMax < 0.3;
    html = '<div class="card hit mini-card" role="dialog" aria-label="' + esc(m.name) + '"><button class="x" data-act="close" aria-label="닫기">✕</button>' +
      '<div class="prof">' + avatarHTML(m.id, closetOf(m.id).wear, "big") + '<div class="pinfo"><p class="big" style="margin:0 0 2px">' + esc(m.name) + (asleep(m.id) ? ' <small class="muted" style="font-family:var(--body);font-size:12px">자리 비움</small>' : "") + "</p>" +
      '<span class="cls">' + esc(m.cls) + "</span>" +
      '<div class="statbar" style="margin-top:12px"><span>❤ HP</span><i class="hpbar"><b style="width:' + Math.round(st.hp / st.hpMax * 100) + "%" + (low ? ";background:#E07A2F" : "") + '"></b></i><span class="num">' + st.hp + " / " + st.hpMax + "</span></div>" +
      '<div class="statbar"><span>💧 MP</span><i class="mpbar"><b style="width:' + Math.round(st.mp / st.mpMax * 100) + '%"></b></i><span class="num">' + st.mp + " / " + st.mpMax + "</span></div>" +
      (S.me ? '<div class="pbtns"><button class="ghost sm" data-compose="' + m.id + '">✉ 쪽지 보내기</button></div>' : "") +
      "</div></div></div>";
  } else if (c && c.type === "done") {
    html = doneHTML(c.id);
  } else if (c && c.type === "person") {
    const m = byId(c.id), route = S.routes[m.id], info = levelInfo(xpOf(m.id)), nx = nextStep(m, info.lv, route);
    const mine = m.id === S.me, wt = weekTasks(m.id), wl = weekLabel(S.week), cl = closetOf(m.id);
    const stops = [1, 5, 10, 15, 20].map((l) => { let t = titleOf(m, l, route); if (m.id === "eunhwan" && !route && l >= 10) t = l === 10 ? "2차 전직 · 세 갈래 길" : "???"; return '<li class="' + (info.lv >= l ? "on" : "") + '"><i></i><small>Lv.' + l + "</small>" + esc(t) + "</li>"; }).join("");
    html = '<div class="card wide hit" role="dialog" aria-label="' + esc(m.name) + ' 님의 스테이터스"><button class="x" data-act="close" aria-label="닫기">✕</button>' +
      '<div class="prof">' + avatarHTML(m.id, cl.wear, "big") + '<div class="pinfo">' +
        '<span class="cls">' + esc(m.cls) + '</span><p class="big" style="margin:4px 0 2px">' + esc(m.name) + ' <small class="muted" style="font-family:var(--body);font-size:13px">Lv.' + info.lv + "</small></p>" +
        '<b class="ptitle">' + esc(titleOf(m, info.lv, route)) + "</b>" +
        '<p class="muted" style="margin:4px 0 0">' + (info.lv < 20 ? info.into + " / " + info.need + " XP" : "만렙") + (nx ? " · 다음 Lv." + nx.lv + " " + esc(nx.title) : "") + "</p>" +
        '<span class="xp"><i style="width:' + info.pct + '%"></i></span>' +
        '<p class="gold">🪙 ' + goldOf(m.id) + ' 골드 <span class="muted">· 모은 XP만큼 생겨요</span></p>' +
        '<div class="pbtns"><button class="ghost" data-goroom="' + m.id + '">🏠 ' + (mine ? "내 방" : "방 구경") + "</button>" + (mine ? '<button class="ghost" data-act="openShop">👕 옷가게</button><button class="ghost" data-act="inbox">✉ 쪽지함' + (unreadNotes().length ? ' <b class="nbadge">' + unreadNotes().length + "</b>" : "") + "</button>" : "") + "</div>" +
      "</div></div>" +
      statPanel(m.id, mine) +
      closetPanel(m.id, mine) +
      (WEB ? '<h3>할 일</h3><p class="muted" style="margin:0">할 일은 마을의 내 집 위에서 적고 체크해요. <button class="ghost sm" data-done="' + m.id + '">✓ 완료한 할 일</button></p>' :
        '<h3>할 일<span class="wk"><button data-act="prev" aria-label="지난주">◀</button>' + wl.title + '<button data-act="next" aria-label="다음 주">▶</button></span></h3>' +
        (wt.length ? '<ul class="tasks">' + wt.map((t) => '<li class="task' + (t.done ? " done" : "") + '">' +
          (mine ? '<label><input type="checkbox" data-toggle="' + esc(t.id) + '"' + (t.done ? " checked" : "") + '><span class="sz ' + t.size + '">' + t.size + '</span><span class="tt">' + esc(t.title) + "</span></label>"
                : '<span class="sz ' + t.size + '">' + t.size + '</span><span class="tt" style="flex:1">' + (t.done ? "✓ " : "") + esc(t.title) + "</span>") +
          '<span class="pts">+' + XP[t.size] + "</span>" + (mine ? '<button class="del" data-del="' + esc(t.id) + '" aria-label="삭제">✕</button>' : "") + "</li>").join("") + "</ul>"
          : '<p class="empty">' + (mine ? "이번 주에 할 일을 적어 볼까요?" : "아직 할 일이 없어요.") + "</p>") +
        (mine ? '<form class="add" data-form="add"><label class="sr" for="newTask">새 할 일</label><input type="text" id="newTask" maxlength="60" placeholder="예: 쇼츠 1편 편집" value="' + esc(S.draft) + '">' +
          '<div class="seg" role="group" aria-label="크기">' + ["S", "M", "L"].map((z) => '<button type="button" data-size="' + z + '" aria-pressed="' + (S.size === z) + '">' + z + "·" + XP[z] + "</button>").join("") + "</div>" +
          '<button class="primary" type="submit">추가</button></form>' : '<p class="note">다른 사람의 할 일은 볼 수만 있어요. 방 구경은 마음껏!</p>')) +
        '<h3>꿈 로드맵</h3><ol class="road">' + stops + "</ol>" + "</div>";
  }
  const prev = box.querySelector(".card"), prevScroll = prev ? prev.scrollTop : 0, prevLog = box.querySelector(".chatlog"), logAtBottom = prevLog ? prevLog.scrollHeight - prevLog.scrollTop - prevLog.clientHeight < 30 : true, logScroll = prevLog ? prevLog.scrollTop : 0, sameKind = renderCard._k === JSON.stringify(c);
  const sayVal = document.getElementById("logIn") ? document.getElementById("logIn").value : null;
  box.innerHTML = html; renderCard._k = JSON.stringify(c);
  initPad();
  const card = box.querySelector(".card");
  if (card && sameKind) card.scrollTop = prevScroll;
  const lg = box.querySelector(".chatlog"); if (lg) lg.scrollTop = (sameKind && !logAtBottom) ? logScroll : lg.scrollHeight;
  const li = document.getElementById("logIn"); if (li) { if (sayVal !== null) li.value = sayVal; if (S.focusLog) { li.focus(); S.focusLog = false; } }
  if (card) { card.style.right = Math.max(8, S.off) + "px"; card.style.bottom = (140 + CHATH) + "px"; }
  const tb = document.getElementById("toasts");
  tb.style.bottom = (150 + CHATH) + "px"; tb.style.right = (card ? Math.max(8, S.off) + card.offsetWidth + 12 : S.off) + "px";
  const inp = document.getElementById("newTask"); if (inp && S.focusInput) { inp.focus(); S.focusInput = false; }
}

/* ---------- 데이터 ---------- */
let lastSig = "", loadFailToast = 0;
async function reload(force) {
  try {
    const [d, rooms, skills, notes] = await Promise.all([store.load(), store.loadRooms(), store.loadSkills(), store.loadNotes().catch(() => S.notes || [])]); // 동시에 불러와서 빨리 떠요
    S.tasks = d.tasks || []; S.routes = d.routes || {}; S.rooms = rooms; S.skills = skills; S.notes = notes;
  }
  catch (e) { if (Date.now() - loadFailToast > 60000) { loadFailToast = Date.now(); toast("팀 기록을 불러오지 못했어요. 인터넷이나 연결 설정을 확인해 주세요."); } return; }
  announceNewSkills();
  announceNewNotes();
  const sig = JSON.stringify([S.tasks, S.routes, S.rooms, S.skills, (S.notes || []).map((n) => n.id + (n.read_at ? "r" : ""))]);
  if (!force && sig === lastSig) return; // 바뀐 게 없으면 다시 그리지 않아요 (깜빡임 방지)
  lastSig = sig;
  if (document.activeElement && document.activeElement.id === "newTask") S.focusInput = true;
  paintAll();
  if (S.card && S.card !== "settings" && S.card !== "quit" && S.card.type !== "compose" && !S.edit && !roomDrag) renderCard();
}
async function act(fn) { try { await fn(); } catch (e) { toast("저장하지 못했어요. 잠시 후 다시 해 주세요."); } await reload(true); }
async function toggleTask(id, done) {
  const t = S.tasks.find((x) => x.id === id); if (!t) return;
  const m = byId(t.member), before = levelInfo(xpOf(m.id)).lv;
  await act(() => store.update(id, { done, done_at: done ? new Date().toISOString() : null }));
  const after = levelInfo(xpOf(m.id)).lv;
  if (done) {
    announce(m.name + " 님이 「" + t.title + "」 완료! +" + XP[t.size] + " XP");
    const el = PAL[m.id]; el.classList.remove("jump"); void el.offsetWidth; el.classList.add("jump"); setTimeout(() => el.classList.remove("jump"), 1600);
  }
  if (done && after > before) {
    const title = titleOf(m, after, S.routes[m.id]);
    announce(m.name + " 님이 Lv." + after + " 「" + title + "」이(가) 되었어요!");
    toast("LEVEL UP! Lv." + after + " " + title, true);
    const un = unlockedBetween(m.id, before, after);
    if (un.length) toast("새로 열렸어요: " + un.join(", ") + " — 방 꾸미기에서 써 보세요!");
    toast(eventOf(m, after, S.routes[m.id]));
    if (m.id === "eunhwan" && before < 10 && after >= 10 && !S.routes.eunhwan) openCard({ type: "class" });
  }
}

/* ---------- 입력 ---------- */
document.addEventListener("click", async (e) => {
  const pal = e.target.closest("[data-pal]");
  const toggleCard = (c) => { if (S.say) exitWalk(true); if (S.card && S.card.type === c.type && S.card.id === c.id) closeCard(); else { S.week = thisWeek(); S.edit = null; S.tryOn = null; openCard(c); } };
  if (pal) { toggleCard({ type: "person", id: pal.dataset.pal }); return; }
  const house = e.target.closest("[data-house],[data-goroom],[data-person]");
  if (house) {
    if (house.dataset.person) toggleCard({ type: "person", id: house.dataset.person });
    else if (house.dataset.house && S.me && house.dataset.house !== S.me) toggleCard({ type: "compose", id: house.dataset.house }); // 동료의 집 → 쪽지 쓰기
    else toggleCard({ type: "room", id: house.dataset.house || house.dataset.goroom });
    return;
  }
  const cp = e.target.closest("[data-compose]"); if (cp) { if (!S.me) { openCard("who"); return; } if (S.say) exitWalk(true); openCard({ type: "compose", id: cp.dataset.compose }); return; }
  const nt = e.target.closest("[data-note]"); if (nt) { openNote(nt.dataset.note); return; }
  const pn = e.target.closest("[data-pen],[data-pensize]");
  if (pn) { if (pn.dataset.pen) { S.pen.color = pn.dataset.pen; S.pen.eraser = false; } else S.pen.size = +pn.dataset.pensize; syncTools(); return; }
  const pk = e.target.closest("[data-peek]"); if (pk) { const id = pk.dataset.peek; if (S.openBoards.has(id)) S.openBoards.delete(id); else S.openBoards.add(id); paintBoards(); return; }
  const dn = e.target.closest("[data-done]"); if (dn) { toggleCard({ type: "done", id: dn.dataset.done }); return; }
  const vz = e.target.closest("[data-vsize]"); if (vz) { S.size = { S: "M", M: "L", L: "S" }[S.size] || "M"; paintBoards(); const i = vz.closest("form").querySelector(".vin"); if (i) i.focus(); return; }
  if (e.target.closest("[data-shop]")) { if (!S.me) { openCard("who"); return; } toggleCard({ type: "shop" }); return; }
  const wr = e.target.closest("[data-wear],[data-buy],[data-try]");
  if (wr) {
    if (wr.dataset.wear) toggleWear(wr.dataset.wear);
    else if (wr.dataset.buy) buyOutfit(wr.dataset.buy);
    else { const o = outfitById(wr.dataset.try); S.tryOn = Object.assign({}, S.tryOn); if (S.tryOn[o.slot] === o.id) S.tryOn[o.slot] = null; else S.tryOn[o.slot] = o.id; renderCard(); }
    return;
  }
  const dz = e.target.closest("[data-wall],[data-floor],[data-toggleitem]");
  if (dz && S.edit) {
    const L = S.edit.layout;
    if (dz.dataset.wall) L.wall = dz.dataset.wall;
    else if (dz.dataset.floor) L.floor = dz.dataset.floor;
    else { const id = dz.dataset.toggleitem, i = L.items.findIndex((p) => p.id === id); if (i >= 0) L.items.splice(i, 1); else { const it = itemById(id); L.items.push({ id, x: it.x, y: it.y }); } }
    renderCard(); return;
  }
  const sk = e.target.closest("[data-skill],[data-skilltarget]");
  if (sk) { if (sk.dataset.skilltarget) { const sid = S.pickSkill; S.pickSkill = null; castSkill(sid, sk.dataset.skilltarget); } else castSkill(sk.dataset.skill, sk.dataset.to); return; }
  const el = e.target.closest("[data-act],[data-me],[data-size],[data-del],[data-route]"); if (!el) return;
  const a = el.dataset.act;
  if (a === "close") closeCard();
  else if (a === "mini") setMini(!S.mini);
  else if (a === "decor") startDecor();
  else if (a === "cancelPick") { S.pickSkill = null; renderCard(); }
  else if (a === "openLog") { if (S.say) exitWalk(true); if (S.card === "log") closeCard(); else { S.focusLog = true; openCard("log"); } }
  else if (a === "moreLog") { const nums = S.chat.map((x) => x.id).filter((x) => typeof x === "number"); const more = nums.length ? await store.chatBefore(Math.min(...nums)) : []; if (!more.length) S.chatEnd = true; more.forEach((x) => { if (!S.chat.some((y) => y.id === x.id)) S.chat.push(x); }); S.chat.sort(byTime); renderCard._k = ""; renderCard(); const lg = document.querySelector(".chatlog"); if (lg) lg.scrollTop = 0; }
  else if (a === "cancelDecor") { S.edit = null; renderCard(); }
  else if (a === "saveRoom") { const L = S.edit.layout; S.edit = null; S.rooms = Object.assign({}, S.rooms, { [S.me]: L }); renderCard(); try { await store.saveRoom(S.me, L); toast("방을 저장했어요. 동료들이 놀러 오면 볼 수 있어요!"); } catch (err) { toast("방을 저장하지 못했어요. setup.sql을 다시 실행했는지 확인해 주세요."); } }
  else if (a === "myroom") { if (!S.me) { openCard("who"); return; } toggleCard({ type: "room", id: S.me }); }
  else if (a === "openShop") { if (!S.me) { openCard("who"); return; } if (S.card && S.card.type === "shop" && el.closest(".ctrl")) closeCard(); else { S.tryOn = null; openCard({ type: "shop" }); } }
  else if (a === "clearTry") { S.tryOn = null; renderCard(); }
  else if (a === "jump") jumpMe();
  else if (a === "spin") spinLunch();
  else if (a === "inbox") { if (!S.me) { openCard("who"); return; } if (S.say) exitWalk(true); openCard("inbox"); }
  else if (a === "eraser") { S.pen.eraser = !S.pen.eraser; syncTools(); }
  else if (a === "clearPad") { const cv = document.getElementById("noteCanvas"); if (cv) { const x = cv.getContext("2d"); x.fillStyle = "#FFFDF6"; x.fillRect(0, 0, cv.width, cv.height); cv._dirty = false; } }
  else if (a === "sendNote") sendNote(el.dataset.to);
  else if (a === "help") { if (S.say) exitWalk(true); if (S.card === "help") closeCard(); else openCard("help"); }
  else if (a === "minimize") { if (S.walk) exitWalk(); if (S.say) closeSay(); D.minimize(); }
  else if (a === "miniFromQuit") { closeCard(); setMini(true); }
  else if (a === "askQuit") openCard("quit");
  else if (a === "openWho") { if (S.card === "who") closeCard(); else openCard("who"); }
  else if (a === "quit") { await logLeave(true); D.quit(); }
  else if (a === "prev") { S.week = addDays(S.week, -7); renderCard(); }
  else if (a === "next") { S.week = addDays(S.week, 7); renderCard(); }
  else if (a === "say") { closeCard(); openSay(); }
  else if (a === "clearConfig") { try { localStorage.removeItem("dg-config"); } catch (err) {} location.reload(); }
  else if (el.dataset.me) {
    const prev = S.me; S.me = el.dataset.me;
    try { localStorage.setItem("dreamguild-me", S.me); } catch (err) {}
    if (prev && prev !== S.me && store.mode === "remote") { location.reload(); return; }
    if (!prev) startLive();
    closeCard(); paintAll(); toast(byId(S.me).name + " 님, 반가워요! 아래 채팅창에 말하면 말풍선이 떠요.");
  }
  else if (el.dataset.size) { S.size = el.dataset.size; const i = document.getElementById("newTask"); if (i) S.draft = i.value; renderCard(); }
  else if (el.dataset.del) await act(() => store.remove(el.dataset.del));
  else if (el.dataset.route) { const r = el.dataset.route; await act(() => store.setRoute("eunhwan", r)); closeCard(); toast("전직 완료! " + ROUTES[r].titles[0], true); announce("은환 님이 「" + ROUTES[r].name + "」로 전직했어요!"); }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.target.classList && (e.target.classList.contains("pal") || e.target.classList.contains("vhouse"))) { e.preventDefault(); e.target.click(); return; }
  if ((e.key === " " || e.key === "ArrowUp") && !e.repeat && (e.target === document.body || (e.target.classList && e.target.classList.contains("pal")))) { e.preventDefault(); jumpMe(); return; }
  if (e.key === "Escape") { if (S.card && S.me) closeCard(); else if (S.say) exitWalk(); }
});
document.addEventListener("keyup", (e) => walkKeys.delete(e.key));
document.addEventListener("change", (e) => {
  const id = e.target.dataset && e.target.dataset.toggle; if (!id) return;
  const t = S.tasks.find((x) => x.id === id);
  if (e.target.checked && t) { checkFx(e.target, XP[t.size]); sfx("check"); S.justDone = id; }
  toggleTask(id, e.target.checked);
});
document.addEventListener("input", (e) => { if (e.target.id === "newTask") S.draft = e.target.value; });
document.addEventListener("submit", async (e) => {
  const f = e.target.dataset && e.target.dataset.form; if (!f) return;
  e.preventDefault();
  if (f === "add") {
    const title = (S.draft || "").trim(); if (!title || !S.me) return;
    S.draft = ""; S.focusInput = true;
    await act(() => store.add({ member: S.me, week: ymd(S.week), title: title.slice(0, 60), size: S.size, done: false }));
  } else if (f === "vadd") {
    const inp = e.target.querySelector(".vin"), title = inp.value.trim(); if (!title || !S.me) return;
    inp.value = ""; inp.focus(); sfx("add");
    await act(() => store.add({ member: S.me, week: ymd(thisWeek()), title: title.slice(0, 60), size: S.size, done: false }));
  } else if (f === "bar") {
    const inp = document.getElementById("sayIn"), text = inp.value.trim();
    if (!S.me) { openCard("who"); return; }
    if (!text) return;
    inp.value = ""; inp.focus();
    try { const row = await store.sendChat({ member: S.me, text: text.slice(0, 200), kind: "chat" }); if (row) addChat(row); } catch (err) { toast("메시지를 보내지 못했어요."); }
  } else if (f === "logsay") {
    const inp = document.getElementById("logIn"), text = inp.value.trim(); if (!text || !S.me) return;
    inp.value = ""; S.focusLog = true;
    try { const row = await store.sendChat({ member: S.me, text: text.slice(0, 200), kind: "chat" }); if (row) addChat(row); } catch (err) { toast("메시지를 보내지 못했어요."); }
  } else if (f === "settings") {
    const url = document.getElementById("setUrl").value.trim(), key = document.getElementById("setKey").value.trim(), goal = parseInt(document.getElementById("setGoal").value, 10) || 400;
    try { localStorage.setItem("dg-config", JSON.stringify({ SUPABASE_URL: url, SUPABASE_ANON_KEY: key, TEAM_GOAL: goal })); } catch (err) {}
    location.reload();
  }
});
window.addEventListener("blur", () => { walkKeys.clear(); const i = document.getElementById("sayIn"); if (S.say && i && !i.value) exitWalk(true); });
D.on("open-chat", () => enterWalk());
D.on("open-log", () => { S.focusLog = true; openCard("log"); });
D.on("open-walk", () => { if (S.mini) setMini(false); enterWalk(); });

D.on("go-home", goHome);
D.on("open-mine", () => { if (S.me) { S.week = thisWeek(); openCard({ type: "person", id: S.me }); } else openCard("who"); });
D.on("open-who", () => openCard("who"));
D.on("open-settings", () => openCard("settings"));

/* ---------- 시작 ---------- */
let live = false;
async function pollChat() {
  const nums = S.chat.map((c) => c.id).filter((x) => typeof x === "number");
  const last = nums.length ? Math.max(...nums) : 0;
  try { (await store.chatSince(last)).forEach(addChat); } catch (e) {}
}
function startLive() {
  if (live || !S.me) return; live = true;
  if (store.mode === "local") logJoin(); // 팀 연결이 있으면 실시간 채널에 들어간 순간 기록해요
  if (store.mode === "remote") { setInterval(pollChat, 6000); setInterval(() => reload(), 20000); }
  store.live({
    presence: (list) => {
      const before = S.online || new Set();
      S.online = new Set(list.map((p) => p.id));
      before.forEach((id) => { if (!S.online.has(id) && id !== S.me) watchLeave(id); }); // 사라진 동료 → 잠시 뒤에도 없으면 퇴장 기록
      list.forEach((p) => { if (p.id !== S.me && POS[p.id] && p.f !== undefined) POS[p.id].f = (typeof p.f === "number") ? p.f : null; });
      paintAll();
    },
    move: (p) => { if (p && p.jump) { if (p.id !== S.me && PAL[p.id]) doJump(p.id, true); return; } if (p && p.id !== S.me && POS[p.id]) { POS[p.id].f = (typeof p.f === "number") ? p.f : null; placeRow(); } },
    chat: (m) => addChat(m),
    data: () => reload()
  });
}
(async function init() {
  buildRow(); paintAll();
  try { localStorage.removeItem("dg-mini"); localStorage.removeItem("dg-layer"); } catch (e) {}
  if (CONFIG.SUPABASE_URL && CONFIG.SUPABASE_ANON_KEY && window.supabase) {
    try { store = makeRemote(); } catch (e) { store = makeLocal(); toast("팀 연결에 실패해 체험 모드로 열었어요."); }
  } else store = makeLocal();
  if (!S.me) renderCard();
  if (WEB) paintSky(true);
  const chatP = store.loadChat().catch(() => []).then((c) => { S.chat = c; paintSkyChat(); return c; }); // 채팅 기록은 먼저 띄워요
  await reload();
  await chatP;
  S.chat.filter((m) => m.kind === "lunch" && byId(m.member) && Date.now() - new Date(m.created_at).getTime() < LUNCH_MS).forEach((m) => showLunch(m.member, m.text, m.created_at, new Date(m.created_at).getTime()));
  S.ready = true;
  if (WEB) { paintSky(true); loadWeather(); }
  startLive();
  if (store.mode === "local") setTimeout(() => toast("체험 모드예요. 트레이 아이콘 → 「팀 연결 설정」에서 팀과 연결할 수 있어요."), 1500);
  lastSig = JSON.stringify([S.tasks, S.routes, S.rooms, S.skills]);
})();
