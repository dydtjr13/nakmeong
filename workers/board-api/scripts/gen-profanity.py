# profanity-v15.js(게임 금칙어 필터) → workers/board-api/src/profanity.js (게시판 서버용 ES 모듈)
import pathlib
root = pathlib.Path(__file__).resolve().parents[3]
s = (root / "profanity-v15.js").read_text(encoding="utf-8")
core = s[s.index("const KO_ROOTS"):s.index("// ── 낚멍 연결")]
out = ("// 자동 생성: profanity-v15.js 의 필터 본체(단어 목록·정규화·검사)를 게시판 서버에서 쓰도록 옮긴 것.\n"
       "// 단어를 바꾸려면 profanity-v15.js 를 고친 뒤 workers/board-api/scripts/gen-profanity.py 를 다시 실행.\n"
       + core +
       "\nconst FILTER = makeFilter(() => ({ enabled: true, words: buildSeed(), allow: SEED_ALLOW.slice(), rev: 1 }));\n"
       "export const hasProfanity = (t) => FILTER.has(String(t || ''));\n")
(root / "workers/board-api/src/profanity.js").write_text(out, encoding="utf-8")
