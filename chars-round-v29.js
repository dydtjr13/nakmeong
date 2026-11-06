// v29 hotfix: 동물 라운딩 R1(기본)/R2 — THREE 전역을 안전하게 일시 패치, R2 roundBox는 원본 BoxGeometry 사용
(function(){
  if(!window.NK_CHARS||!window.THREE)return;
  const T=THREE, orig=NK_CHARS.buildAnimal;
  const OB=T.BoxGeometry, OI=T.IcosahedronGeometry, OC=T.CylinderGeometry, OCn=T.ConeGeometry, OMS=T.MeshStandardMaterial;
  function clampVec(v,lo,hi){
    if(typeof v.clamp==='function'){v.clamp(lo,hi);return v;}
    v.x=Math.max(lo.x,Math.min(hi.x,v.x));v.y=Math.max(lo.y,Math.min(hi.y,v.y));v.z=Math.max(lo.z,Math.min(hi.z,v.z));return v;
  }
  function roundBox(w,h,d){
    const r=Math.min(w,h,d)*.38, g=new OB(w,h,d,4,4,4), a=g.attributes.position;
    const v=new T.Vector3(), c=new T.Vector3(), I=new T.Vector3(w/2-r,h/2-r,d/2-r), nI=I.clone().negate();
    for(let i=0;i<a.count;i++){
      v.fromBufferAttribute(a,i); c.copy(v); clampVec(c,nI,I); v.sub(c);
      if(v.lengthSq()>0)v.normalize().multiplyScalar(r); v.add(c); a.setXYZ(i,v.x,v.y,v.z);
    }
    g.computeVertexNormals(); return g;
  }
  function modeOf(){
    try{
      if(window.NKV2&&NKV2.S&&NKV2.S.animR)return NKV2.S.animR;
      const raw=localStorage.getItem('nk'); if(raw){const s=JSON.parse(raw); if(s&&s.animR)return s.animR;}
    }catch(e){}
    return 'R1';
  }
  NK_CHARS.buildAnimal=function(id){
    const mode=modeOf();
    const prev={Box:T.BoxGeometry,Ico:T.IcosahedronGeometry,Cyl:T.CylinderGeometry,Cone:T.ConeGeometry,Mat:T.MeshStandardMaterial};
    try{
      T.MeshStandardMaterial=function(o){return new OMS(Object.assign({},o||{},{flatShading:false}));};
      T.MeshStandardMaterial.prototype=OMS.prototype;
      T.IcosahedronGeometry=function(r,det){return new OI(r,Math.max(det||1,3));};
      T.CylinderGeometry=function(a,b,h,s){return new OC(a,b,h,Math.max(s||8,20));};
      T.ConeGeometry=function(r,h,s){return new OCn(r,h,Math.max(s||4, s>4?20:s));};
      if(mode==='R2'){T.BoxGeometry=function(w,h,d){return roundBox(w,h,d);};}
      return orig(id);
    }catch(e){
      console.warn('[chars-round] fallback to raw animal', id, e);
      T.BoxGeometry=OB;T.IcosahedronGeometry=OI;T.CylinderGeometry=OC;T.ConeGeometry=OCn;T.MeshStandardMaterial=OMS;
      return orig(id);
    }finally{
      T.BoxGeometry=prev.Box;T.IcosahedronGeometry=prev.Ico;T.CylinderGeometry=prev.Cyl;T.ConeGeometry=prev.Cone;T.MeshStandardMaterial=prev.Mat;
    }
  };
})();
