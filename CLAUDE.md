# DREAM GUILD — 작업 안내 (Claude Code용)

파이디온 홍보영상팀 6명이 쓰는 데스크톱 게임이에요. 주간 할 일을 끝내면 경험치가 오르고, 각자 장래희망 직업으로 레벨업해요. 사용자(은환)에게는 따뜻하고 친근한 한국어로 말해 주세요.

## 구조
- `app/` — 실제 코드. Electron 데스크톱 앱과 웹 버전이 같은 코드를 써요.
  - `main.js` · `preload.js` — Electron 전용. 투명 창이 작업표시줄 위에 띠처럼 떠요. 트레이 메뉴와 클릭 통과 처리를 해요.
  - `app.js` — 화면 전체(캐릭터 줄, 모닥불 옆 버튼, 말풍선, 방, 카드, 실시간 연결). `window.desk`가 없으면 웹 모드(`WEB`)로 동작하고 `html.web` 클래스가 붙어요.
  - `data.js` — Supabase 주소와 anon 키(CONFIG_DEFAULT), 멤버·직업·레벨 표.
  - `rooms.js` — 방 꾸미기 가구, 벽지, 바닥. `skills.js` — HP·MP, 고유 스킬, 고유 효과.
  - `style.css`, `index.html`, `manifest.json`, `assets/`, `fonts/`(Galmuri11), `vendor/supabase.js`
- `build-web.js` — `app/`을 `docs/`로 복사해요. GitHub Pages는 `docs/`를 배포해요.
- `pack.js` — 데스크톱 앱 3종(Windows, Mac Apple Silicon, Mac Intel)을 `dist/`에 만들어요.
- `setup.sql` — Supabase 표(dg_tasks, dg_members, dg_chat, dg_rooms, dg_skills), RLS, 실시간 정책. 이미 실행돼 있어요.
- `설치안내.md` — 팀원용 설치 안내.

## 배포
- 웹 버전은 GitHub 저장소 `r2l5020-cmd/dreamguild`에서 GitHub Pages로 배포해요. 브랜치는 `main`, 폴더는 `/docs`예요.
- 주소: https://r2l5020-cmd.github.io/dreamguild/
- 코드를 고치면: `node build-web.js` → 커밋 → `git push`. 1~2분 뒤 맥 친구들 화면에 반영돼요.
- 데스크톱 앱을 고치면: `npm install`(처음 한 번) → `node pack.js` → `dist/` 안 세 폴더를 각각 zip으로 묶어 팀원에게 전달해요. Mac zip은 심볼릭 링크를 보존해야 해요(`zip -ry`). Windows에서 묶으면 Mac 앱이 깨질 수 있으니, Mac 빌드는 가능하면 Mac이나 WSL에서 묶어요.

## 처음 한 번 할 일 (이 폴더를 처음 열었을 때)
1. `git init` → `git remote add origin https://github.com/r2l5020-cmd/dreamguild.git` → `git pull origin main`(README만 있어요) 또는 그냥 덮어써도 돼요.
2. `node build-web.js`로 `docs/`를 만들고, 모두 커밋해서 `main`에 push해요.
3. GitHub 저장소 Settings → Pages에서 Source를 "Deploy from a branch", Branch `main`, 폴더 `/docs`로 저장해요(`gh api`로 해도 돼요).
4. 배포 주소를 열어 캐릭터가 보이고 채팅이 오가는지 확인해요.

## 지켜야 할 것
- Supabase **service_role 키는 절대** 코드에 넣거나 공유하지 않아요. anon 키는 공개돼도 괜찮게 설계돼 있어요(RLS).
- Supabase DB나 보안 설정을 바꾸는 일은 사용자에게 먼저 물어봐요.
- 실시간 채널은 private 채널 `dreamguild-village`이고, realtime.messages 정책이 'dreamguild%' 주제만 허용해요.
- 화면이 깜빡이지 않게 데이터 서명 비교, 말풍선 key 비교를 쓰고 있어요. 주기적으로 전체를 다시 그리지 않아요.
- 조작 설명 말풍선은 넣지 않아요(사용자가 방해된다고 함). 조작: 사람 클릭 → 스테이터스 카드(레벨·골드·HP/MP·스킬·옷장·할 일·로드맵), (웹) 뒤 건물 클릭 → 그 사람의 방, 옷가게 건물 → 옷가게. 땅 아래 고정 채팅창에 Enter → 머리 위 말풍선만, 칸이 비면 ← → 걷기. 모닥불 옆 버튼: 🏠 내 방, 👕 옷가게, (데스크톱) – ✕ / (웹) 👤 사람. 채팅 기록은 채팅창의 💬 기록.
- 마을 배경(`village.js`)은 웹 전용이에요. 옷(`wardrobe.js`)은 캐릭터 그림 위에 겹치는 도트 SVG(1칸=그림의 4px)이고, 옷장 기록은 `dg_rooms.layout.closet`({owned, wear})에 저장해요. 골드 = 모은 XP − 산 옷 가격 합(레벨은 그대로).

## 게임 수치
- 경험치: S 10, M 30, L 60. 다음 레벨까지 100+20(lv-1). 최대 Lv20.
- HP: 평일 9시에 가득 → 18시까지 최대치의 90%가 닳아요. 회복 스킬로 다시 채워요. MP는 할 일을 끝내면 쌓이고, 스킬에 써요.
