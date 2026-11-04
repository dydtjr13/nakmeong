const {chromium}=require('playwright-core');(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:1280,height:720}});
await p.goto('http://localhost:8787/nakmeong.html');await p.evaluate(()=>{localStorage.clear();localStorage.setItem('nk_cfg',JSON.stringify({lay:'a',bots:12}));});await p.reload();await p.waitForFunction(()=>!document.getElementById('go').disabled,null,{timeout:180000});await p.click('#go');await p.waitForTimeout(3000);
await p.addStyleTag({content:'#hud,#dc,#chat,#bubs,#rkL{visibility:hidden!important}'});await p.evaluate(()=>{NKV2.time.auto=false;NKV2.time.t=.1;NKV2.S.wxOv='clear';const P=NKV2.me().o.position;const r=Math.hypot(P.x,P.z);NKV2.setPos(P.x/r*(r+3),P.z/r*(r+3));});await p.waitForTimeout(2000);
const V=[['A','현재'],['B','부드러운 안개·따뜻한 하늘빛'],['C','선명한 그림자·대비'],['D','파스텔 매트 (채도↓ 밝기↑)']];
for(const [k] of V){await p.evaluate(k=>{const sc=NKV2.scene,T=NKV2.THREE;if(!window.__o){window.__o=[];sc.traverse(o=>{if(o.isLight)__o.push([o,o.intensity,o.color.clone()]);});window.__f=sc.fog&&[sc.fog.color.clone(),sc.fog.near,sc.fog.far,sc.fog.density];}
 __o.forEach(([o,i,c])=>{o.intensity=i;o.color.copy(c);});if(sc.fog&&__f){sc.fog.color.copy(__f[0]);if(__f[1]!=null){sc.fog.near=__f[1];sc.fog.far=__f[2];}}const cv=(document.querySelector('#world canvas')||document.querySelector('canvas:not(#wxCv):not(#reelCv)'));cv.style.filter='';
 if(k==='B'){__o.forEach(([o])=>{if(o.isHemisphereLight||o.isAmbientLight){o.intensity*=1.15;o.color.lerp(new T.Color(0xffe6c8),.4);}});if(sc.fog&&sc.fog.near!=null){sc.fog.near*=.3;sc.fog.far*=.5;sc.fog.color.lerp(new T.Color(0xffe9d6),.5);}cv.style.filter='saturate(1.05)';}
 if(k==='C'){__o.forEach(([o])=>{if(o.isDirectionalLight)o.intensity*=1.7;if(o.isHemisphereLight||o.isAmbientLight)o.intensity*=.7;});cv.style.filter='contrast(1.18) saturate(1.25)';}
 if(k==='D'){__o.forEach(([o])=>{if(o.isHemisphereLight||o.isAmbientLight)o.intensity*=1.3;if(o.isDirectionalLight)o.intensity*=.8;});cv.style.filter='saturate(.7) brightness(1.1) hue-rotate(-6deg)';}},k);
 await p.waitForTimeout(900);await p.screenshot({path:'/workspace/nakmeong/mockups-v14/map-'+k+'.jpg',type:'jpeg',quality:85});}
await b.close();})();
