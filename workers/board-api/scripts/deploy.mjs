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
// v52: 관리자 비밀번호 — GitHub 보안 비밀 ADMIN_PASSWORD 가 있으면 워커 시크릿으로 올린다(코드·로그에 남지 않음).
//      없으면 이미 워커에 있던 시크릿을 그대로 둔다(keep_bindings).
if (!metadata.keep_bindings) metadata.keep_bindings = ["secret_text"];
const PW = process.env.ADMIN_PASSWORD || "";
if (PW) {
  if (PW.length < 12) { console.error("ADMIN_PASSWORD 는 12자 이상으로 해 주세요."); process.exit(1); }
  metadata.bindings.push({ type: "secret_text", name: "ADMIN_PASSWORD", text: PW });
  if (process.env.ADMIN_ID) metadata.bindings.push({ type: "secret_text", name: "ADMIN_ID", text: process.env.ADMIN_ID });
  console.log("관리자 비밀번호 시크릿 포함");
} else console.log("ADMIN_PASSWORD 없음 → 기존 워커 시크릿 유지");
const form = new FormData();
form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
for (const name of ["index.js", "profanity.js"]) {
  const code = await readFile(new URL("../src/" + name, import.meta.url));
  form.append(name, new Blob([code], { type: "application/javascript+module" }), name);
}
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
