# v28 장비: 60~90 세트 시트에서 아이템 잘라내기(배경 제거) + 1~50은 v27 아이콘 재배치
from PIL import Image;import numpy as np;from scipy import ndimage;import shutil
def cut(f,y0,y1,pick,out):
  im=np.array(Image.open(f).convert('RGB')).astype(int)[y0:y1];bg=np.median(np.concatenate([im[0],im[-1],im[:,0],im[:,-1]]),0)
  fg=np.abs(im-bg).sum(2)>34;col=ndimage.binary_closing(fg.any(0),iterations=12);lab,n=ndimage.label(col);segs=[np.where(lab==i)[0] for i in range(1,n+1)];segs=[s for s in segs if len(s)>40]
  print(f,len(segs))
  for name,si in zip(out,pick):
    s=segs[si];a=im[:,s[0]:s[-1]+1];d=np.abs(a-bg).sum(2)<34;l2,_=ndimage.label(d);edge=set(np.unique(np.concatenate([l2[0],l2[-1],l2[:,0],l2[:,-1]])))-{0};m=~np.isin(l2,list(edge));m=ndimage.binary_opening(m,iterations=1)
    al=ndimage.gaussian_filter(m.astype(float),.8)*255;ys,xs=np.where(m);rgba=np.dstack([a,al]).astype('uint8')[ys.min():ys.max()+1,xs.min():xs.max()+1]
    o=Image.fromarray(rgba,'RGBA');o.thumbnail((120,120));cv=Image.new('RGBA',(128,128));cv.paste(o,((128-o.width)//2,(128-o.height)//2),o);cv.save(f'img/eq/{name}.png')
T=['hat','cloth','shoe','glove']
cut('src/eq60.jpg',0,288,[0,1,2,3],[t+'60' for t in T])
cut('src/eq70.jpg',0,288,[0,1,3,4],[t+'70' for t in T])
cut('src/eq80.jpg',0,576,[0,1,2,3],[t+'80' for t in T])
cut('src/eq90.jpg',0,288,[0,1,2,3],[t+'90' for t in T])
V='../mockups-v27/img/eq/'
# 1~50 재배치: L30 노랑 우비 세트, L40 탐험가(탐험가 모자·낚시 조끼·물막이 장화·네오프렌 장갑), L50 선장(선장 모자·선장 코트·선장 부츠·선장 장갑)
MAP={1:{'hat':1,'cloth':1,'shoe':1,'glove':1},10:{'hat':2,'cloth':2,'shoe':2,'glove':2},20:{'hat':3,'cloth':3,'shoe':3,'glove':3},
 30:{'hat':4,'cloth':5,'shoe':4,'glove':4},40:{'hat':6,'cloth':4,'shoe':5,'glove':5},50:{'hat':5,'cloth':6,'shoe':6,'glove':6}}
for lv,m in MAP.items():
  for t,i in m.items():shutil.copy(f'{V}{t}{i}.png',f'img/eq/{t}{lv}.png')
cut('src/eqfix.jpg',0,576,[0,3],['hat80','glove90'])
