// 낚멍 v4 데이터: 19종 어종(흔한→희귀 순), 부적 6개 장착, 장비(낚싯대) 옵션·합성, 상자 보상 확장
(function(D){
const add=[
 {k:'chambungeo',n:'참붕어',min:4,max:12,g:[6,8,10,11],scale:1.6,w:30,base:3,col:'#b8b49a',desc:'아주 작은 도감 수집용'},
 {k:'pirami',n:'피라미',min:6,max:22,g:[10,13,17,20],scale:3,w:28,base:4,col:'#c8d0d8',desc:'수면 반짝임, 빠른 입질'},
 {k:'tteokbungeo',n:'떡붕어',min:15,max:58,g:[25,35,45,52],scale:7,w:22,base:8,col:'#c2bfa2',desc:'붕어와 닮음, 떡밥 선호'},
 {k:'nuchi',n:'누치',min:15,max:65,g:[25,35,48,58],scale:9,w:14,base:14,col:'#c9c4b4',desc:'강바닥 무리, 초반 강한 당김'},
 {k:'kkeuri',n:'끄리',min:10,max:40,g:[18,25,32,37],scale:6,w:14,base:9,col:'#a9b8c8',desc:'공격적 육식, 루어 선호'},
 {k:'donjagae',n:'동자개',min:8,max:34,g:[14,20,26,31],scale:5,w:12,base:12,col:'#c9a24a',night:1.5,desc:'밤 출현 ×1.5, 빠가빠가 소리'},
 {k:'moraemuji',n:'모래무지',min:8,max:29,g:[12,17,22,26],scale:4,w:12,base:10,col:'#cdb88e',desc:'모래 속에 숨음'},
 {k:'gangjunchi',n:'강준치',min:25,max:100,g:[40,55,75,90],scale:13,w:10,base:16,col:'#d8dde0',desc:'표층 회유, 루어 반응'},
 {k:'catfish',n:'메기',min:25,max:110,g:[45,65,85,100],scale:14,w:8,base:28,col:'#6f6a5a',night:2,desc:'밤 출현 ×2, 묵직한 저항'},
 {k:'trout',n:'무지개송어',min:20,max:80,g:[35,45,60,72],scale:10,w:6,base:32,col:'#9fae9a',night:1.5,desc:'새벽·밤 ×1.5, 점프'},
 {k:'kkeokji',n:'꺽지',min:8,max:20,g:[11,14,16,18],scale:2.5,w:6,base:45,col:'#8a8a5a',desc:'한국 고유종, 바위틈'},
 {k:'eel',n:'뱀장어',min:35,max:126,g:[55,75,95,115],scale:16,w:3,base:60,col:'#5a5f48',nightOnly:true,desc:'밤에만 출현, 최고가'}];
add.forEach(f=>{f.img='img/fish/'+f.k+'.png';f.src='v4 신규';});
D.FISH=D.FISH.concat(add).sort((a,b)=>b.w-a.w||a.base-b.base); // 흔한 → 희귀
D.FISH.forEach(f=>{f.rare=f.w<=8;f.expert=f.base>=28;});
D.DECK_COUNT_DEFAULT=20;
// 신규 어종 미끼 선호
const BB={paste:{tteokbungeo:2,nuchi:1.5,chambungeo:1.5},shrimp:{catfish:1.5,kkeokji:2,donjagae:1.5,eel:1.3},lure:{gangjunchi:2.5,kkeuri:2.5,trout:2,pirami:.5}};
D.BAITS.forEach(b=>{if(BB[b.k])Object.assign(b.boost,BB[b.k]);});
D.BAITS.find(b=>b.k==='paste').desc='입질 30% 빠름, 붕어·잉어·향어·떡붕어 ×2';D.BAITS.find(b=>b.k==='shrimp').desc='쏘가리 ×2.5, 배스·가물치·꺽지 ×2, 메기 ×1.5';D.BAITS.find(b=>b.k==='lure').desc='영구. 배스·가물치 ×3, 강준치·끄리 ×2.5, 송어 ×2';
D.CHARM.slots=6;
// 6개 장착 + 장비 추가옵션까지 합산되는 상한 (v3 3개 기준 대비 소폭 상향)
const T={luck:40,treasure:120,quick:35,big:15,expert:30,bait:60,merchant:20,appraise:50,master:100};for(const k in T)D.CHARM.opts[k].total=T[k];
D.CHARM.opts.expert.d='고가 어종(기본가 28↑: 메기·가물치·송어·쏘가리·꺽지·뱀장어) 출현 가중치 +';
D.CHARM.dismantle={coin:[25,60,150,400,1000,2500],stone:[0,1,1,2,3,5]};
// 상자 보상
D.BOX.reward={charm:.55,stone:.2,rod:.1,bait:.15};
D.BOX.rodPool=[['bamboo','carbon'],['carbon'],['carbon','silver'],['silver','gold'],['gold'],['gold','dragon']];
D.BOX.baitPool=[['paste',10],['shrimp',10],['shrimp',20],['golden',5],['golden',10],['golden',20]];
// 장비(낚싯대) 옵션·합성
D.GEAR={
 slots:{bamboo:0,carbon:1,silver:1,gold:2,dragon:2}, // 기본 추가옵션 슬롯
 mul:{bamboo:.1,carbon:.12,silver:.18,gold:.24,dragon:.3}, // 추가옵션 크기 = 부적 상한 × mul × (40~100%)
 pool:['luck','quick','expert','bait','treasure'],
 q:[.92,1.08],            // 기본옵션 품질 굴림 (상점 구매·상자 획득 시)
 starMax:5,starBonus:.04,// 합성 ★당 기본옵션 +6%
 starSlot:[2,4],         // ★2, ★4에서 추가옵션 슬롯 +1
 starUp:1.1,             // 합성 시 기존 추가옵션 ×1.1 (슬롯 상한까지)
 synthCoin:(ri,star)=>150*(ri+1)*(star+1),
 sellRate:.4
};
D.ALERT={botTick:[40,110],legend:.06,myth:.006};
})(window.NK_DATA);
