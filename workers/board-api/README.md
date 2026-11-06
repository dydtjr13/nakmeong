# fishcozy-board-api

피쉬코지 게시판 API (Cloudflare Worker + D1).

## 엔드포인트

| Method | Path | 설명 |
|--------|------|------|
| GET | `/health` | 상태 |
| GET | `/posts` | 목록 `?cat=&limit=&offset=` |
| GET | `/posts/:id` | 글 + 댓글 |
| POST | `/posts` | 글 작성 `{cat,title,body,nick}` |
| POST | `/posts/:id/comments` | 댓글 `{body,nick}` |
| DELETE | `/posts/:id` | 글 삭제 (**X-Admin-Key**) |
| DELETE | `/comments/:id` | 댓글 삭제 (**X-Admin-Key**) |

CORS: `https://fishcozy.com`, `https://www.fishcozy.com`, `https://dydtjr13.github.io` (+ localhost)

## 시크릿

```bash
npx wrangler secret put ADMIN_KEY
```

값은 채팅/커밋에 넣지 마세요.

## NS Active 후

`api.fishcozy.com` 커스텀 도메인(Workers route) 연결.
