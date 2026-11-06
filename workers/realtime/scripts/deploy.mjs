// fishcozy-realtime 배포 (Cloudflare Workers Script API · declarative `exports` 방식)
// 이 워커는 v45 때 `exports` 메타데이터로 올라가서, wrangler 의 `migrations` 방식으로는 덮어쓸 수 없다.
// 사용: CLOUDFLARE_API_TOKEN=... node scripts/deploy.mjs
import { readFile } from "node:fs/promises";

const ACCOUNT = "0dd46e415e6622db15aec7a31865b350";
const SCRIPT = "fishcozy-realtime";
const token = process.env.CLOUDFLARE_API_TOKEN;
if (!token) {
  console.error("CLOUDFLARE_API_TOKEN 이 없습니다.");
  process.exit(1);
}
const dir = new URL("../src/", import.meta.url);
const metadata = {
  main_module: "index.js",
  compatibility_date: "2026-11-06",
  bindings: [{ type: "durable_object_namespace", name: "LAKE", class_name: "LakeRoom" }],
  exports: { LakeRoom: { type: "durable-object", storage: "sqlite" } },
  observability: { enabled: true, head_sampling_rate: 1 },
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
for (const name of ["index.js", "protocol.js"]) {
  const code = await readFile(new URL(name, dir));
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
console.log("배포 성공", JSON.stringify({ id: body.result?.id, etag: body.result?.etag, modified_on: body.result?.modified_on }));
