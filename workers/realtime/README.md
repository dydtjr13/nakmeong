# fishcozy-realtime

피쉬코지(FISH COZY) 실시간 멀티플레이 MVP. Cloudflare Workers + Durable Objects + WebSocket.

게임(GitHub Pages, `fishcozy.com`)은 정적으로 그대로 두고, 이 워커만 방(서버)별 접속을 맡습니다. 게시판 워커 `workers/board-api` (`fishcozy-board-api`)와는 분리되어 있습니다.

## 동작

| 항목 | 값 |
| --- | --- |
| 서버 | 호숫가 1–4 (Durable Object 1개 = 서버 1개, 이름 `lake-1` … `lake-4`) |
| 정원 | 서버당 **실유저 WebSocket 50명**. 봇은 서버에 없습니다. |
| 동기화 | 닉네임, 캐릭터 번호, 레벨, 위치, 방향, 앉은 자리, 낚시 상태(`off`/`cast`/`bite`), 짧은 채팅·이모티콘 |
| 가득 참 | 51번째 접속은 WebSocket 수락 전에 HTTP 503. 시작 화면 버튼도 막습니다. |
| 실패 | 워커에 연결되지 않으면 게임은 지금처럼 봇과 혼자 플레이됩니다. |

기본 주소: `https://fishcozy-realtime.mi1ku.workers.dev`

`api.fishcozy.com` 은 아직 붙이지 않습니다. 붙이면 클라이언트 주소만 바꾸면 됩니다.

## 배포

```bash
cd workers/realtime
npm install
npx wrangler login          # 또는 CLOUDFLARE_API_TOKEN
npm run deploy              # wrangler deploy
```

계정은 보드 API와 같은 `account_id` (`mi1ku`) 입니다. 첫 배포가 Durable Object 클래스 `LakeRoom` 을 만듭니다. 마이그레이션 태그 `v1` 은 한 번만 적용됩니다.

확인:

```bash
curl https://fishcozy-realtime.mi1ku.workers.dev/health
curl https://fishcozy-realtime.mi1ku.workers.dev/servers
```

`/servers` 는 `Cache-Control: no-store` 이고, `n` 은 그 방의 열린 WebSocket 수입니다.

## 로컬 워커 + 게임 두 창

터미널 1:

```bash
cd workers/realtime
npm install
npm run dev
```

`http://127.0.0.1:8787` 에 뜹니다.

터미널 2 (저장소 루트):

```bash
python3 -m http.server 5500
```

브라우저 두 개(하나는 시크릿):

1. `http://127.0.0.1:5500/nakmeong.html?rt=http://127.0.0.1:8787`
2. 같은 주소, **다른 닉네임**, **같은 호숫가**를 고르고 시작
3. 서로 캐릭터가 보이고, 채팅이 말풍선·채팅창으로 전달되면 성공
4. 시작 화면 인원은 `실접속/50`. 봇 수는 여기에 더해지지 않습니다.
5. `?rt=off` 이거나 워커를 끄면 시작은 되고, 안내 후 봇과 혼자 플레이됩니다.

프로덕션(워커 배포 후)은 쿼리 없이 `https://fishcozy.com` 만 열면 됩니다. 주소를 임시로 바꾸려면 `localStorage.nk_rt_base` 에 `https://…` 또는 `off` 를 넣으세요.

## 테스트

```bash
cd workers/realtime
npm install
npm test          # 프로토콜 단위 테스트 (정원 50, 닉/채팅, 자리 충돌, CORS 허용 목록)
npm run test:live # wrangler dev를 띄워 두 소켓 채팅·자리·서버 분리·51번째 거절
```

## 프로토콜 (JSON 텍스트)

클라이언트 → 서버

- `{"t":"hello","nick":"민물","ki":1,"lv":3,"x":0,"z":0,"y":0.4,"d":0,"fish":"off","anim":"idle","seat":null}`
- `{"t":"pose", ...}` 같은 필드. 서버가 너무 빠른 틱은 버립니다.
- `{"t":"chat","text":"안녕"}` / `{"t":"emote","text":"🐟"}`

서버 → 클라이언트

- `welcome` `{id, server, n, cap, peers, world}`
- `join` `{n, peer}` / `leave` `{id, n}` / `pose` `{id, nick, ki, lv, x, z, y, d, fish, anim, seat}`
- `world` `{world}` 하루 길이·시각 오프셋·날씨 강제·계절 길이·맵 테마. 그 호숫가에만 저장합니다.
- `notice` 공지. `ch` 가 번호면 그 호숫가, `all` 이면 네 곳. `event` 코인·상자 배율, `balance` 수치, `grant` 자동낚시, `sanc` 채팅 금지·정지, `prof` 비속어는 네 호숫가에 같이 저장합니다. `gift` 는 고른 호숫가의 접속 중 유저에게만 가고 오프라인에는 남지 않습니다.
- 계정 인증은 아직 없습니다. 게임은 관리자 화면에서만 이 메시지를 보냅니다.
- `chat` / `emote` `{id, nick, text}`
- `seat` `{ok:false}` 그 좌표에 다른 실유저가 먼저 앉아 있음

자리는 인덱스만 믿지 않고, 앉아 있을 때의 세계 좌표를 0.5m 격자로 잠급니다. 그래서 데크 설정이 조금 달라도 같은 좌표를 두 사람이 동시에 차지하지 않습니다. 봇은 그 좌표의 의자를 비워 둡니다.

CORS·WebSocket Origin: `https://fishcozy.com`, `https://www.fishcozy.com`, `https://dydtjr13.github.io`, localhost, `null`(file). 그 외 사이트에서의 접속은 403입니다.

## 남은 follow-up

- 로그인 없이 닉네임을 스스로 정합니다. 계정 인증, 닉 위조 방지, 클라우드 세이브는 이번 범위가 아닙니다.
- 낚시 결과·거래·재화는 여전히 각 브라우저 로컬입니다. 서버가 판정하지 않습니다.
- 이동은 짧은 틱과 보간이라 완벽한 애니메이션 동기화는 아닙니다. 찌·낚싯줄은 상대 화면에 그리지 않습니다.
- `api.fishcozy.com` 커스텀 도메인은 안정화된 뒤에 라우트만 추가하면 됩니다.
- 관전자/재접속 시 앉은 자리 복원, 운영자 강퇴의 서버 반영, 50명 부하 튜닝은 다음 단계입니다.
