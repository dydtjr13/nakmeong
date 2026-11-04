// 각 시안 stage를 1280px 폭으로 크게 캡처 (라이트박스용)
const pw=require('playwright-core');(async()=>{const b=await pw.chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const O='/workspace/nakmeong/mockups-v13/cap/';
for(const [file,pre,times] of [['ui.html','ui',[2400]],['reel.html','reel',[350,800,1250]],['weather.html','wx',[2500]]]){const p=await b.newPage({viewport:{width:1280,height:800}});await p.goto('http://localhost:8787/mockups-v13/'+file);
 await p.addStyleTag({content:'.grid{grid-template-columns:1fr!important;max-width:1100px}.card{padding:0}.card>p,.card>h3,.card>button{display:none}'});
 for(const tm of times){if(file==='reel.html'){await p.reload();await p.addStyleTag({content:'.grid{grid-template-columns:1fr!important;max-width:1100px}.card{padding:0}.card>p,.card>h3,.card>button{display:none}'});}await p.waitForTimeout(tm);const st=await p.$$('.stage');for(let i=0;i<st.length;i++){await st[i].screenshot({path:O+`${pre}-${i}${times.length>1?'-'+tm:''}.jpg`,type:'jpeg',quality:88});}}
 await p.close();}
await b.close();})();
