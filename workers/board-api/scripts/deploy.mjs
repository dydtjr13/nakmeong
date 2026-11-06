// fishcozy-board-api 배포 (Cloudflare Workers Script API)
// D1 바인딩 유지 + 이미 설정된 시크릿(ADMIN_KEY)은 keep_bindings 로 보존한다.
// 사용: CLOUDFLARE_API_TOKEN=... node scripts/deploy.mjs
import { readFile } from "node:fs/promises";

const ACCOUNT = "0dd46e415e6622db15aec7a31865b350";
const SCRIPT = "fishcozy-board-api";
const D1_ID = "a0e990c1-470b-46a1-8525-3a8a68804f17";
const token = process.env.CLOUDFLARE_API_TOKEN;
if (!token) {
  console.error("CLOUDFLARE_API_TOKEN 이 없습니다.");
  process.exit(1);
}
const metadata = {
  main_module: "index.js",
  compatibility_date: "2026-11-01",
  bindings: [{ type: "d1", name: "DB", id: D1_ID }],
  keep_bindings: ["secret_text", "secret_key"],
  observability: { enabled: true },
};
const form = new FormData();
form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
const code = await readFile(new URL("../src/index.js", import.meta.url));
form.append("index.js", new Blob([code], { type: "application/javascript+module" }), "index.js");
const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${ACCOUNT}/workers/scripts/${SCRIPT}`, {
  method: "PUT",
  headers: { Authorization: `Bearer ${token}` },
  body: form,
});
const body = await res.json().catch(() => ({}));
if (!res.ok || !body.success) {
  console.error("배포 실패", res.status, JSON.stringify(body.errors || body, null, 2));
  process.exit(1);
}
console.log("배포 성공", JSON.stringify({ id: body.result?.id, modified_on: body.result?.modified_on }));
