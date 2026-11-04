# docs/*.md → 스타일 입힌 UTF-8 HTML + docs/index.html
import markdown,glob,re,os,html
os.chdir(os.path.dirname(os.path.abspath(__file__))+'/../docs')
CSS="""body{margin:0;background:#f6f1ea;font-family:system-ui,'Noto Sans KR','Apple SD Gothic Neo',sans-serif;color:#3a3048;line-height:1.7}
main{max-width:960px;margin:24px auto;background:#fff;border-radius:18px;padding:28px 34px;box-shadow:0 6px 24px #3a304814}
h1{font-size:26px;margin-top:0;color:#5a3fb0}h2{font-size:20px;border-bottom:2px solid #f0e8dc;padding-bottom:4px;margin-top:30px}h3{font-size:17px}
a{color:#3a78c8;word-break:break-all}table{border-collapse:collapse;width:100%;margin:12px 0;font-size:14px;display:block;overflow-x:auto}
th,td{border:1px solid #eadfd0;padding:7px 10px;text-align:left;vertical-align:top}th{background:#fbf6ef}tr:nth-child(even) td{background:#fdfbf8}
code{background:#f3eee6;border-radius:5px;padding:1px 5px;font-size:.92em}pre{background:#f3eee6;padding:12px;border-radius:10px;overflow:auto}
.nav{max-width:960px;margin:16px auto 0;font-size:14px;padding:0 6px}.nav a{color:#7a6f86;text-decoration:none}
@media(max-width:640px){main{margin:10px;padding:18px}}"""
def page(t,b):return f'<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{html.escape(t)}</title><style>{CSS}</style></head><body><div class="nav"><a href="index.html">← 문서 목록</a></div><main>{b}</main></body></html>'
L=[]
for f in sorted(glob.glob('*.md')):
  s=open(f,encoding='utf8').read()
  s=re.sub(r'\]\(([^)]+)\.md\)',r'](\1.html)',s)
  b=markdown.markdown(s,extensions=['tables','fenced_code','sane_lists'])
  b=re.sub(r'(?<!["=])(https?://[^\s<|)]+)',r'<a href="\1">\1</a>',b)
  m=re.search(r'^# (.+)',s,re.M);t=m.group(1) if m else f[:-3]
  open(f[:-3]+'.html','w',encoding='utf8').write(page(t,b));L.append((f[:-3]+'.html',t))
L.sort(key=lambda x:x[0],reverse=True)
open('index.html','w',encoding='utf8').write(page('낚멍 문서 목록','<h1>낚멍 문서 목록</h1><ul>'+''.join(f'<li><a href="{h}">{html.escape(t)}</a></li>' for h,t in L)+'</ul>'))
print(len(L))
