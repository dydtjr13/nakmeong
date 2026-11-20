// v204: 🎣 낚싯대를 손(앞발)에 꼭 쥐어요
// · 동물·크리스마스 캐릭터: 오른쪽 앞발(팔)을 어깨 축으로 따로 떼서, 낚시할 때 앞으로 들어 낚싯대를 잡아요.
//   (손이 없는 개구리는 낚시할 때만 작은 앞발이 나와요)
// · 손잡이 위치는 매 프레임 손(앞발) 끝을 따라가요 — 앉기·던지기·감기·입질 모두.
// 표의 좌표는 각 캐릭터 빌더(chars-v18 / xmas-chars-v201)에서 오른팔 부품의 '자기 좌표' 기준이에요.
//  m: 오른팔 부품의 위치(rig 좌표, 이걸로 찾아요) · sh: 어깨(돌아가는 축) · tip: 쥐는 곳 · d: 낚시할 때 어깨→손 방향(rig 좌표)
(function(){if(!window.THREE)return;const T=THREE,V=T.Vector3;
const D0=[-.12,-.5,.86];
const A18=y=>({m:[-.44,y,.02],sh:[0,.17,0],tip:[0,-.13,0]});
const AX=y=>({m:[-.44,y,.02],sh:[0,.17,0],tip:[0,-.22,0]});
const TB={cat:A18(.8),fox:A18(.8),raccoon:A18(.8),bear:A18(.78),rabbit:A18(.66),
 penguin:{m:[-.56,.72,0],sh:[0,.23,0],tip:[0,-.19,0]},
 duck:{m:[-.48,.7,-.02],sh:[0,.15,0],tip:[0,-.12,.08]},
 otter:{m:[-.3,.62,.3],sh:[0,.12,0],tip:[0,-.11,0],d:[-.1,-.35,.93]},
 seal:{m:[-.56,.18,.32],sh:[0,0,-.15],tip:[0,.0,.15],d:[-.25,.45,.86]},
 frog:{add:1,c:'#5aa040',sh:[-.5,.56,.18],len:.26,tip:[0,-.2,0],d:[-.1,-.45,.89]},
 'xm-rud':Object.assign(AX(.8),{d:[-.3,-.5,.81]})/* 큰 뿔에 닿지 않게 조금 바깥으로 */,'xm-san':AX(.86),
 'xm-snow':{m:[-.48,.86,0],sh:[0,0,0],tip:[0,.62,0],d:[-.18,-.38,.91]}};
const _q=new T.Quaternion(),_x=new V(1,0,0);
// 동물 rig에서 오른팔을 떼어 'paw' 축에 붙여요 (mergeStatic 전에 불러요). 돌려줌: paw(Group) 또는 null
function paw(rig,id){const t=TB[id];if(!t||!rig)return null;rig.updateMatrixWorld(true);const pv=new T.Group();pv.name='paw';
 let node=null;
 if(t.add){/* 손 없는 캐릭터: 작은 앞발을 새로 (낚시할 때만 보여요) */pv.position.fromArray(t.sh);const mt=new T.MeshStandardMaterial({color:new T.Color(t.c).convertSRGBToLinear(),roughness:.85,flatShading:false});
  const a=new T.Mesh(new T.CylinderGeometry(.075,.085,t.len,16),mt);a.position.y=-t.len/2;a.castShadow=true;pv.add(a);const h=new T.Mesh(new T.SphereGeometry(.1,16,12),mt);h.position.y=-t.len;h.scale.set(1,.85,1.05);h.castShadow=true;pv.add(h);
  rig.add(pv);pv.userData.addOnly=1;pv.visible=false;pv.userData.tip=new V().fromArray(t.tip);}
 else{for(const ch of rig.children){if(Math.abs(ch.position.x-t.m[0])<.006&&Math.abs(ch.position.y-t.m[1])<.006&&Math.abs(ch.position.z-t.m[2])<.006&&(ch.isMesh||ch.isGroup)){node=ch;break;}}
  if(!node)return null;const shW=node.localToWorld(new V().fromArray(t.sh)),tipW=node.localToWorld(new V().fromArray(t.tip));
  pv.position.copy(rig.worldToLocal(shW.clone()));rig.add(pv);pv.updateMatrixWorld(true);pv.attach(node);pv.userData.tip=pv.worldToLocal(tipW.clone());}
 const rest=pv.userData.tip.clone().normalize(),d=new V().fromArray(t.d||D0).normalize();pv.userData.qUp=new T.Quaternion().setFromUnitVectors(rest,d);return pv;}
// 낚시 자세: lift(라디안, 음수=위로) = 던지기·감기 때 팔을 더 드는 만큼 (사람 팔과 같은 값)
function pose(pv,lift){_q.setFromAxisAngle(_x,lift||0);pv.quaternion.copy(_q).multiply(pv.userData.qUp);if(pv.userData.addOnly)pv.visible=true;}
function rest(pv){pv.quaternion.identity();if(pv.userData.addOnly)pv.visible=false;}
window.NK_RODHAND={TB,paw,pose,rest,HOLD:.12};
})();
