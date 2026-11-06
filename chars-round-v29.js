// v29: 동물 캐릭터 라운딩 — R1(기본, 부드러운 셰이딩) / R2(둥근 박스, 설정)
(function(){
  if(!window.NK_CHARS)return;
  const T=THREE,orig=NK_CHARS.buildAnimal;
  function roundBox(w,h,d){const r=Math.min(w,h,d)*.38,g=new T.BoxGeometry(w,h,d,4,4,4),a=g.attributes.position,v=new T.Vector3(),c=new T.Vector3(),I=new T.Vector3(w/2-r,h/2-r,d/2-r);
    for(let i=0;i<a.count;i++){v.fromBufferAttribute(a,i);c.copy(v).clamp(I.clone().negate(),I);v.sub(c);if(v.lengthSq()>0)v.normalize().multiplyScalar(r);v.add(c);a.setXYZ(i,v.x,v.y,v.z);}g.computeVertexNormals();return g;}
  NK_CHARS.buildAnimal=function(id){
    const mode=(window.NKV2&&NKV2.S&&NKV2.S.animR)||(JSON.parse(localStorage.getItem('nk')||'{}').animR)||'R1';
    // 임시로 THREE 생성자를 패치해 AN 빌드에 반영
    const OB=T.BoxGeometry,OI=T.IcosahedronGeometry,OC=T.CylinderGeometry,OCn=T.ConeGeometry,OMS=T.MeshStandardMaterial;
    T.MeshStandardMaterial=function(o){o=Object.assign({},o||{},{flatShading:false});return new OMS(o);};
    T.IcosahedronGeometry=function(r,det){return new OI(r,Math.max(det||1,3));};
    T.CylinderGeometry=function(a,b,h,s){return new OC(a,b,h,Math.max(s||8,20));};
    T.ConeGeometry=function(r,h,s){return new OCn(r,h,Math.max(s||4,s>4?20:s));};
    if(mode==='R2'){T.BoxGeometry=function(w,h,d){return roundBox(w,h,d);};}
    let g;try{g=orig(id);}finally{T.BoxGeometry=OB;T.IcosahedronGeometry=OI;T.CylinderGeometry=OC;T.ConeGeometry=OCn;T.MeshStandardMaterial=OMS;}
    return g;};
})();
