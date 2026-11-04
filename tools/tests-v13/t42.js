const pw=require('playwright-core');(async()=>{const b=await pw.chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const O='/workspace/nakmeong/mockups-v13/';
for(const [W,H,tag] of [[1280,720,'d'],[390,844,'m']]){const MOB=tag==='m';const p=await b.newPage({viewport:{width:W,height:H},...(MOB?{isMobile:true,hasTouch:true}:{})});
await p.goto('http://localhost:8787/nakmeong.html');await p.evaluate(()=>{localStorage.clear();localStorage.setItem('nk_cfg','{"lay":"a","bots":12}')});await p.reload();await p.waitForFunction(()=>!document.getElementById('go').disabled,null,{timeout:180000});await p.click('#go');await p.waitForTimeout(1500);
await p.evaluate(()=>{const d=NKV2.decks[0];NKV2.setPos(d.tip.x,d.tip.z);setInterval(()=>{NKV2.time.t=.12},100);document.querySelectorAll('#dc').forEach(e=>e.style.visibility='hidden');});await p.waitForTimeout(1500);
await p.evaluate(()=>NKV2.fishAction());await p.waitForTimeout(2500);
const info=await p.evaluate(()=>{const f=NKV2.fishing();const ks=Object.keys(f);let pos=null;for(const k of ks){const v=f[k];if(v&&v.position&&v.isObject3D){pos=[k,v.getWorldPosition(new NKV2.THREE.Vector3()).toArray()];break;}if(v&&v.isVector3){pos=[k,v.toArray()];break;}}return {state:f.state,ks,pos,proj:pos?NKV2.project(pos[1]):null};});console.log(tag,JSON.stringify(info));
await p.evaluate(()=>{document.getElementById('fishBtn').style.visibility='hidden';});await p.screenshot({path:O+`base-cast-${tag}.jpg`,type:'jpeg',quality:88});
await p.evaluate(()=>{document.querySelectorAll('#hud,#chat,#equip,#prompt,#joy,#fishBtn,#log,#emo,#msg,#ribbons').forEach(e=>e.style.visibility='hidden');});await p.screenshot({path:O+`base-clean-${tag}.jpg`,type:'jpeg',quality:88});
require('fs').writeFileSync(O+`bob-${tag}.json`,JSON.stringify(info.proj));await p.close();}
await b.close();})();
