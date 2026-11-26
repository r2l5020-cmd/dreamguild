-- DREAM GUILD · Supabase 준비 스크립트
-- Supabase 대시보드 > SQL Editor > New query 에 전체를 붙여 넣고 Run 을 누르세요.
-- (웹 채팅방 때 쓰던 프로젝트에 그대로 실행해도 돼요. 기존 표는 건드리지 않아요.)

-- 1) 주간 할 일
create table if not exists dg_tasks (
  id uuid primary key default gen_random_uuid(),
  member text not null,                 -- youngmin, seonhan, hyein, siwon, jina, eunhwan
  week date not null,                   -- 그 주의 월요일
  title text not null,
  size text not null check (size in ('S','M','L')),
  done boolean not null default false,
  done_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists dg_tasks_week_idx on dg_tasks (week);

-- 2) 팀원별 설정 (은환 님의 전직 루트 등)
create table if not exists dg_members (
  member text primary key,
  route text
);

-- 3) 마을 채팅
create table if not exists dg_chat (
  id bigint generated always as identity primary key,
  member text not null,
  text text not null check (char_length(text) <= 200),
  kind text not null default 'chat',     -- chat: 대화, system: 완료·레벨업 알림
  created_at timestamptz not null default now()
);

-- 3-2) 각자의 방 꾸미기 (데스크톱 버전)
create table if not exists dg_rooms (
  member text primary key,
  layout jsonb not null,                -- 벽지·바닥·가구 위치
  updated_at timestamptz not null default now()
);

-- 4) 링크를 아는 팀원 누구나 읽고 쓸 수 있게 (팀 내부용 게임)
alter table dg_tasks enable row level security;
alter table dg_members enable row level security;
alter table dg_chat enable row level security;
alter table dg_rooms enable row level security;
drop policy if exists "dg_tasks open" on dg_tasks;
drop policy if exists "dg_members open" on dg_members;
drop policy if exists "dg_chat open" on dg_chat;
drop policy if exists "dg_rooms open" on dg_rooms;
create policy "dg_tasks open" on dg_tasks for all to anon, authenticated using (true) with check (true);
create policy "dg_members open" on dg_members for all to anon, authenticated using (true) with check (true);
create policy "dg_chat open" on dg_chat for all to anon, authenticated using (true) with check (true);
create policy "dg_rooms open" on dg_rooms for all to anon, authenticated using (true) with check (true);

-- 5) 실시간 반영 (누가 완료하면 다른 사람 화면에도 바로 보이게)
do $$
begin
  alter publication supabase_realtime add table dg_tasks;
exception when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table dg_members;
exception when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table dg_chat;
exception when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table dg_rooms;
exception when duplicate_object then null;
end $$;

-- 6) 실시간 채널 허용 (프로젝트가 '비공개 채널만' 설정일 때도 DREAM GUILD 채널만 열어 줘요)
drop policy if exists "dreamguild realtime read" on realtime.messages;
drop policy if exists "dreamguild realtime write" on realtime.messages;
create policy "dreamguild realtime read" on realtime.messages
  for select to anon, authenticated using ( realtime.topic() like 'dreamguild%' );
create policy "dreamguild realtime write" on realtime.messages
  for insert to anon, authenticated with check ( realtime.topic() like 'dreamguild%' );

-- 7) 고유 스킬 사용 기록 (HP·MP 효과 계산용)
create table if not exists dg_skills (
  id bigint generated always as identity primary key,
  caster text not null,
  target text,                          -- 동료 1명에게 쓴 스킬의 대상 (팀 전체·나 자신이면 비어 있어요)
  skill text not null,
  created_at timestamptz not null default now()
);
alter table dg_skills enable row level security;
drop policy if exists "dg_skills open" on dg_skills;
create policy "dg_skills open" on dg_skills for all to anon, authenticated using (true) with check (true);
do $$ begin alter publication supabase_realtime add table dg_skills; exception when duplicate_object then null; end $$;
