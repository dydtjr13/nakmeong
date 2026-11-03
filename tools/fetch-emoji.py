# 게임 소스에서 쓰는 이모지를 스캔해 Twemoji(CC-BY 4.0) SVG를 icons/emoji/ 로 받는 스크립트
import re,os,urllib.request,json
os.chdir(os.path.dirname(os.path.abspath(__file__))+'/..')
FILES=['nakmeong.html','game-v2.js','game-data.js','game-data-v3.js','game-data-v4.js','game-data-v5.js','systems.js','rod-3d.js','tank-ext.js','index.html']
RX=r'(?:[\U0001F000-\U0001FAFF\u2600-\u27BF\u2B00-\u2BFF\u2300-\u23FF\u25A0-\u25FF\u3297\u3299]\uFE0F?(?:\u200D[\U0001F000-\U0001FAFF\u2600-\u27BF]\uFE0F?)*)'
import glob
FILES+=glob.glob('mockups-v*/*.html')
txt=''.join(open(f,encoding='utf8').read() for f in FILES if os.path.exists(f))
TXT=set('★☆✦✧■□▲▼◆●○▶◀')
em=sorted(set(re.findall(RX,txt))-TXT)
def code(e):
  cps=[ord(c) for c in e]
  if 0x200D not in cps:cps=[c for c in cps if c!=0xFE0F]
  return '-'.join('%x'%c for c in cps)
miss=[]
for e in em:
  c=code(e);p='icons/emoji/'+c+'.svg'
  if os.path.exists(p):continue
  try:urllib.request.urlretrieve('https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/svg/'+c+'.svg',p)
  except Exception as x:miss.append((e,c))
print(len(em),'emoji, missing:',miss)
