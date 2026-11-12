// v133: 🧪 테스트 기능(LAB) 키가 실시간 서버 sanitizePlay 목록에 있는지 확인해요.
// 빠져 있으면 「✅ 인게임 적용」이 서버에서 버려져요. build-site 에서 경고로 보여줘요 (exit 1 은 --strict 일 때만).
import { readFileSync } from "node:fs";
const root = new URL("..", import.meta.url);
const game = readFileSync(new URL("game-v2.js", root), "utf8");
const proto = readFileSync(new URL("workers/realtime/src/protocol.js", root), "utf8");
const body = proto.slice(proto.indexOf("export function sanitizePlay"));
const end = body.indexOf("\nexport function", 10);
const sp = end > 0 ? body.slice(0, end) : body;
const keys = [...game.matchAll(/k:'([A-Za-z0-9]+)'[^{}]{0,900}?scope:'(me|all)'/g)].map((m) => m[1]);
const miss = [...new Set(keys)].filter((k) => !sp.includes(`"${k}"`));
if (miss.length) {
  console.warn("⚠ LAB 키가 서버 sanitizePlay 에 없어요 (인게임 적용이 버려져요): " + miss.join(", "));
  if (process.argv.includes("--strict")) process.exit(1);
} else console.log(`LAB 키 ${new Set(keys).size}개 모두 서버 목록에 있어요`);
