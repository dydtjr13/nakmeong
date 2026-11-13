// v30: 바다 물고기 12종. 바다 맵은 없어서 호숫가에서 함께 낚이며, hab:'sea' 로만 구분해요.
// 저장은 어종 키(dex[k], tank[].k)라 없던 키는 빈 도감으로 시작하고, 예전 기록은 그대로예요.
(function(D){
 if(!D||!D.FISH||D.FISH.some(f=>f.k==='godeungeo'))return;
 const add=[
  {k:'godeungeo',n:'고등어',min:18,max:50,g:[26,33,40,45],scale:5,w:12,base:6,gb:6,col:'#5e8ea0',asp:3.291,
   desc:'등푸른 물결무늬. 떼를 지어 다녀요',src:'FishBase Scomber japonicus: 보통 30cm · 최대 약 50cm'},
  {k:'jeonjaengi',n:'전갱이',min:12,max:42,g:[18,25,32,37],scale:4.5,w:10,base:7,gb:7,col:'#c5d0d2',asp:3.586,
   desc:'노란 옆줄과 꼬리. 방추형 무리',src:'FishBase Trachurus japonicus: 보통 25cm · 최대 약 50cm'},
  {k:'nollaemi',n:'놀래미',min:8,max:25,g:[12,16,19,22],scale:2.6,w:9,base:8,gb:8,col:'#2a9a96',asp:2.012,
   desc:'둥근 몸에 분홍 물결. 바위 근처',src:'국립수산과학원 놀래기과: 보통 10~20cm'},
  {k:'ureok',n:'우럭',min:18,max:60,g:[28,38,46,53],scale:6,w:8,base:16,gb:16,col:'#6e5840',asp:2.671,
   desc:'큰 머리와 얼룩무늬. 방파제 단골',src:'FishBase Sebastes schlegelii: 보통 30cm · 최대 약 65cm'},
  {k:'gamseong',n:'감성돔',min:15,max:55,g:[24,33,41,48],scale:6,w:7,base:19,gb:18,col:'#b7c4c8',asp:2.333,
   desc:'은빛 몸에 세로 줄. 가슴지느러미 뿌리의 검은 점',src:'FishBase Acanthopagrus schlegelii: 보통 25cm · 최대 약 50cm'},
  {k:'galchi',n:'갈치',min:45,max:140,g:[65,85,105,122],scale:14,w:6,base:24,gb:22,col:'#d5e0e6',asp:8.719,night:1.8,
   desc:'은빛 리본. 밤에 더 잘 나와요',src:'FishBase Trichiurus lepturus: 보통 70~100cm · 최대 200cm 이상. 게임 최대는 140cm'},
  {k:'gwangeo',n:'광어',min:25,max:95,g:[40,55,70,82],scale:10,w:4.5,base:30,gb:32,col:'#c4a36a',asp:3.181,
   desc:'눈이 한쪽에 모인 납작한 몸. 모래 위 점무늬',src:'FishBase Paralichthys olivaceus: 보통 60cm · 최대 103cm'},
  {k:'chamdom',n:'참돔',min:20,max:85,g:[32,46,60,72],scale:9,w:4,base:36,gb:36,col:'#e09090',asp:2.395,
   desc:'분홍 몸과 등의 푸른 점. 가파른 이마',src:'FishBase Pagrus major: 보통 30cm · 최대 100cm'},
  {k:'bogeo',n:'복어',min:15,max:60,g:[24,34,44,52],scale:6.5,w:3.5,base:32,gb:30,col:'#d9c7a2',asp:1.884,
   desc:'둥근 몸과 잔점, 작은 부리',src:'FishBase Takifugu rubripes: 보통 40cm · 최대 약 80cm'},
  {k:'doldom',n:'돌돔',min:18,max:65,g:[28,38,48,56],scale:7,w:2.6,base:48,gb:42,col:'#d8d4cc',asp:2.337,
   desc:'짙은 세로 띠와 두꺼운 입',src:'국립수산과학원 돌돔: 보통 30~40cm · 최대 약 60cm'},
  {k:'bangeo',n:'방어',min:30,max:120,g:[48,68,88,104],scale:13,w:2,base:60,gb:50,col:'#6a94aa',asp:3.785,
   desc:'주둥이에서 노란 꼬리까지 이어진 노란 띠',src:'FishBase Seriola quinqueradiata: 보통 80cm · 최대 150cm'},
  {k:'darangeo',n:'다랑어',min:50,max:160,g:[75,100,122,142],scale:16,w:1.1,base:98,gb:62,col:'#234878',asp:3.208,
   desc:'등푸른 큰 몸, 노란 토막지느러미. 가장 드물어요',src:'FishBase Thunnus orientalis: 보통 150cm · 최대 300cm. 게임 최대는 160cm'}
 ];
 // v10과 같은 신화 구간 압축 (이 파일은 v10 다음에 읽혀서, 여기서 같은 식을 적용)
 add.forEach(f=>{const s0=f.g[3],M=f.max-s0,sr=f.scale*1.45,y0=1-Math.pow(.2,sr/M),y=Math.min(.85,y0);
  f.soft=s0;f.g[3]=Math.round((s0+M*y)*10)/10;const got=Math.pow(1-y,M/sr);f.mythP=Math.min(1,.2/got);
  let s=0;for(let i=0;i<200;i++){const cm=f.min+(f.max-f.min)*Math.pow((i+.5)/200,1.6)*.85;s+=f.base*Math.pow(cm/f.min,1.5);}f.ev=Math.round(s/200);
  f.hab='sea';f.img='img/fish/'+f.k+'.png';f.rare=f.w<=8;f.expert=f.base>=28;});
 D.FISH=D.FISH.concat(add);
 const BB={paste:{godeungeo:1.8,jeonjaengi:1.6},shrimp:{gamseong:2,chamdom:2,doldom:1.8,bogeo:1.6,nollaemi:1.5,ureok:1.4},lure:{ureok:2.2,bangeo:2.6,darangeo:2.4,galchi:2.2,gwangeo:2,doldom:1.5}};
 D.BAITS.forEach(b=>{if(BB[b.k])Object.assign(b.boost,BB[b.k]);});
 const paste=D.BAITS.find(b=>b.k==='paste'),shrimp=D.BAITS.find(b=>b.k==='shrimp'),lure=D.BAITS.find(b=>b.k==='lure');
 if(paste&&paste.desc.indexOf('고등어')<0)paste.desc+=' · 고등어 ×1.8, 전갱이 ×1.6';
 if(shrimp&&shrimp.desc.indexOf('감성돔')<0)shrimp.desc+=' · 감성돔·참돔 ×2';
 if(lure&&lure.desc.indexOf('방어')<0)lure.desc+=' · 방어 ×2.6, 다랑어 ×2.4, 갈치 ×2.2';
 const seaC=[{id:'seaTable',n:'바다의 식탁',ks:['godeungeo','gwangeo','chamdom'],e:{merchant:1.4}},{id:'pelagic',n:'회유 어군',ks:['bangeo','darangeo','galchi'],e:{luck:2}}];
 if(D.COMBO)seaC.forEach(c=>{if(!D.COMBO.list.some(x=>x.id===c.id))D.COMBO.list.push(c);});
 if(D.GOALS){const rw=(co,st,bx)=>({co,st,bx});seaC.forEach(c=>{
  if(D.GOALS.some(g=>g.id==='set1_'+c.id))return;
  D.GOALS.push({id:'set1_'+c.id,lv:1,cat:'세트',n:c.n+' 모으기',d:c.ks.length+'종 모두 낚기',t:'set',ks:c.ks,minG:0,r:rw(1000,0,0)});
  D.GOALS.push({id:'set2_'+c.id,lv:2,cat:'세트',n:c.n+' · 전설 컬렉션',d:'모두 전설 등급 이상으로 낚기',t:'set',ks:c.ks,minG:3,r:rw(3000,1,1)});
  D.GOALS.push({id:'set3_'+c.id,lv:3,cat:'세트',n:c.n+' · 신화 컬렉션',d:'모두 신화 등급으로 낚기',t:'set',ks:c.ks,minG:4,r:rw(10000,4,2)});
 });
  if(!D.GOALS.some(g=>g.id==='sea6'))D.GOALS.push({id:'sea6',cat:'도감',n:'바다 물고기 6종',d:'바다에서 온 어종 6종을 도감에 등록',t:'keys',ks:add.map(f=>f.k),cnt:6,r:rw(4000,1,1)});}
 if(D.ACH&&!D.ACH.some(a=>a.id==='sea6'))D.ACH.push({id:'sea6',n:'바다를 엿보다',d:'바다 물고기 6종 발견',p:S=>[add.filter(f=>S.dex&&S.dex[f.k]&&S.dex[f.k].n).length,6],e:{luck:2}});
 if(window.NK_BAL0&&NK_BAL0.fish)add.forEach(f=>{NK_BAL0.fish[f.k]={w:f.w,base:f.base};});
 D.SEA_FISH=add.map(f=>f.k);
})(window.NK_DATA);
