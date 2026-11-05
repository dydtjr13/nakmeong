// node tools/sim-cap-v28.js → 옵션별 단일 최대 / 슬롯 다 채운 최대 합 / 합산 상한(total) 비교
const fs=require('fs'),path=require('path');global.window=global;global.localStorage={getItem:()=>null};const R=p=>path.join(__dirname,'..',p);
const h=fs.readFileSync(R('nakmeong.html'),'utf8');[...h.matchAll(/src="(game-data[^"?]*|systems\.js)[^"]*"/g)].map(m=>m[1]).forEach(f=>eval(fs.readFileSync(R(f),'utf8')));
const D=window.NK_DATA,SYS=window.NK_SYS,C=D.CHARM,top=C.band.length-1;
const slots=Array.isArray(C.slots)?Math.max(...C.slots.map(s=>s.n||s)):C.slots;
console.log('band',JSON.stringify(C.band),'slots',JSON.stringify(C.slots),'opts/charm',JSON.stringify(C.nOpt||C.optN||C.n),'GEAR',JSON.stringify({mul:D.GEAR.mul,pool:D.GEAR.pool,xBand:D.GEAR.xBand,slot:D.GEAR.slots||D.GEAR.slot}));
console.log('BOX',JSON.stringify(Object.keys(D.BOX)),'openMax',D.BOX.openMax||D.BOX.max);
const rows=Object.keys(C.opts).map(k=>{const o=C.opts[k],one=o.cap*C.band[top][1];const gm=Math.max(...Object.values(D.GEAR.mul));const fx=Math.max(0,...D.RODS.map(r=>(r.fixed||{})[k]||0));return {k,n:o.n,cap:o.cap,one:+one.toFixed(1),rodExtra:+(o.cap*gm).toFixed(1),rodFixed:fx,total:o.total,pass:(D.PASSIVE&&D.PASSIVE.cap[k])||0};});
console.table(rows);fs.writeFileSync(R('tools/sim-cap-v28.json'),JSON.stringify(rows,null,1));
