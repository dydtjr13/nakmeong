// v87: Cloudflare 에 올릴 사이트 만들기 (_site/)
// - 저장소 파일을 그대로 복사하고 (workers·.github·tools·site 제외)
// - nakmeong.html 의 스크립트 41개 → 1개, CSS 7개 → 1개로 묶어요 (파일 이름에 내용 해시 → 오래 캐시해도 안전)
// - _headers: 묶음 파일은 1년 캐시, HTML 은 매번 새로 확인
// 사용: node tools/build-site.mjs   (저장소의 nakmeong.html 은 그대로 — GitHub Pages 백업 주소는 예전처럼 동작)
import { readFile, writeFile, mkdir, cp, rm, readdir, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import path from "node:path";

const ROOT = path.resolve(new URL("..", import.meta.url).pathname);
const OUT = path.join(ROOT, "_site");
const SKIP = new Set([".git", ".github", "workers", "tools", "site", "_site", "node_modules"]);
const MAX = 25 * 1024 * 1024;
// v133: 테스트 기능 키가 서버 목록에 빠졌는지 경고만 (배포는 막지 않아요)
try { execFileSync(process.execPath, [path.join(ROOT, "tools", "check-lab-keys.mjs")], { stdio: "inherit" }); } catch { /* 경고용 */ }

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });
let files = 0, skipped = [];
async function copyDir(src, dst) {
  for (const e of await readdir(src, { withFileTypes: true })) {
    if (SKIP.has(e.name) && src === ROOT) continue;
    if (e.name === "node_modules") continue;
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    if (e.isDirectory()) { await mkdir(d, { recursive: true }); await copyDir(s, d); }
    else if (e.isFile()) {
      const st = await stat(s);
      if (st.size > MAX) { skipped.push(path.relative(ROOT, s)); continue; }
      await cp(s, d); files++;
    }
  }
}
await copyDir(ROOT, OUT);

// ── 묶기
const htmlPath = path.join(OUT, "nakmeong.html");
let html = await readFile(htmlPath, "utf8");
const scriptRe = /<script src="([^"?]+)(?:\?[^"]*)?"><\/script>/g;
const all = [...html.matchAll(scriptRe)];
// 맨 앞(head)의 3개(boot·full·emoji)는 화면이 그려지기 전에 필요해서 그대로 두고, 그 뒤 body 끝의 스크립트를 묶어요
const head = new Set(["boot-v85.js", "full-v23.js", "emoji.js"]);
const body = all.filter((m) => !head.has(m[1]));
// v132: 잘 안 바뀌는 3D 엔진·3D 모델은 vendor 묶음으로 따로 — 게임만 고쳐 배포하면 유저는 app 묶음만 다시 받아요
//  (vendor 파일들은 맨 앞에서 차례로 실행되는 것들이라 순서가 그대로예요)
const VENDOR = ["lib/three.min.js", "lib/GLTFLoader.js", "lib/SkeletonUtils.js", "assets/assets-data.js"];
const vend = body.filter((m) => VENDOR.includes(m[1]));
if (vend.map((m) => m[1]).join() !== body.slice(0, vend.length).map((m) => m[1]).join()) throw new Error("vendor 파일은 스크립트 맨 앞에 차례로 있어야 해요");
let vjs = "";
for (const m of vend) {
  const src = await readFile(path.join(ROOT, m[1]), "utf8");
  vjs += `\n/* ===== ${m[1]} ===== */\n` + src.replace(/\/\/# sourceMappingURL=.*$/gm, "") + "\n;\n";
}
const vh = createHash("sha256").update(vjs).digest("hex").slice(0, 12);
await writeFile(path.join(OUT, `vendor-${vh}.js`), vjs);
let js = "";
for (const m of body.slice(vend.length)) {
  const src = await readFile(path.join(ROOT, m[1]), "utf8");
  js += `\n/* ===== ${m[1]} ===== */\n` + src.replace(/\/\/# sourceMappingURL=.*$/gm, "") + "\n;\n";
}
// 한 파일로 합쳐도 문법이 맞는지 확인 (같은 이름을 두 번 선언하면 여기서 걸려요)
const tmp = path.join(OUT, "__check.js");
await writeFile(tmp, js);
execFileSync(process.execPath, ["--check", tmp], { stdio: "inherit" });
await rm(tmp);
const jh = createHash("sha256").update(js).digest("hex").slice(0, 12);
await writeFile(path.join(OUT, `app-${jh}.js`), js);
let first = true;
html = html.replace(scriptRe, (all, src) => {
  if (head.has(src)) return all;
  if (first) { first = false; return `<script src="vendor-${vh}.js"></script><script src="app-${jh}.js"></script>`; }
  return "";
});
const linkRe = /<link rel="stylesheet" href="([^"?]+)(?:\?[^"]*)?">/g;
const links = [...html.matchAll(linkRe)];
let css = "";
for (const m of links) css += `\n/* ===== ${m[1]} ===== */\n` + (await readFile(path.join(ROOT, m[1]), "utf8")) + "\n";
const ch = createHash("sha256").update(css).digest("hex").slice(0, 12);
await writeFile(path.join(OUT, `app-${ch}.css`), css);
first = true;
html = html.replace(linkRe, () => { if (first) { first = false; return `<link rel="stylesheet" href="app-${ch}.css">`; } return ""; });
await writeFile(htmlPath, html);
// v88: 주소 끝의 /nakmeong 없애기 — fishcozy.com/ 에서 바로 게임이 열리고, 예전 주소(/nakmeong.html · /nakmeong)는 / 로 넘어가요 (?뒤 값·#은 그대로)
await writeFile(path.join(OUT, "index.html"), html);
await writeFile(htmlPath, `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>피쉬코지 FISH COZY</title><meta http-equiv="refresh" content="0; url=/"><script>location.replace('/'+location.search+location.hash);</script></head><body><p>피쉬코지로 이동 중… <a href="/">바로 가기</a></p></body></html>`);

// ── 캐시 규칙
await writeFile(path.join(OUT, "_headers"), [
  "/app-*",
  "  Cache-Control: public, max-age=31536000, immutable",
  "/vendor-*",
  "  Cache-Control: public, max-age=31536000, immutable",
  "/*.html",
  "  Cache-Control: public, max-age=0, must-revalidate",
  "/",
  "  Cache-Control: public, max-age=0, must-revalidate",
  "/index.html",
  "  Cache-Control: public, max-age=0, must-revalidate",
  "/nakmeong",
  "  Cache-Control: public, max-age=0, must-revalidate",
  "",
].join("\n"));
console.log(`사이트 ${files}개 파일 · 스크립트 ${body.length}개 → vendor-${vh}.js (${(vjs.length / 1024 / 1024).toFixed(2)}MB) + app-${jh}.js (${(js.length / 1024 / 1024).toFixed(2)}MB) · CSS ${links.length}개 → app-${ch}.css`);
if (skipped.length) console.log("25MB 넘어서 뺀 파일:", skipped.join(", "));
