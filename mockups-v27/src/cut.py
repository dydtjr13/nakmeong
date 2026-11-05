# 장비 시트(5x2) → 아이콘 40개 (배경 회색 제거, 투명 png 128px)
from PIL import Image;import numpy as np;from scipy import ndimage
for t in ['hat','cloth','shoe','glove']:
  im=np.array(Image.open(f'src/eq-{t}.jpg').convert('RGB')).astype(int);H,W,_=im.shape
  for r in range(2):
    for c in range(5):
      a=im[r*H//2:(r+1)*H//2,c*W//5:(c+1)*W//5];bg=np.median(np.concatenate([a[0],a[-1],a[:,0],a[:,-1]]),0)
      d=np.abs(a-bg).sum(2)<34;lab,_=ndimage.label(d);edge=set(np.unique(np.concatenate([lab[0],lab[-1],lab[:,0],lab[:,-1]])))-{0}
      m=~np.isin(lab,list(edge));m=ndimage.binary_opening(m,iterations=1)
      al=ndimage.gaussian_filter(m.astype(float),.8)*255
      ys,xs=np.where(m);rgba=np.dstack([a,al]).astype('uint8')[ys.min():ys.max()+1,xs.min():xs.max()+1]
      o=Image.fromarray(rgba,'RGBA');o.thumbnail((120,120));cv=Image.new('RGBA',(128,128));cv.paste(o,((128-o.width)//2,(128-o.height)//2),o);cv.save(f'img/eq/{t}{r*5+c+1}.png')
