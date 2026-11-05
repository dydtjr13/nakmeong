# v26: 시안 낚싯대 그림(흰 배경 jpg) → 투명 png 아이콘 256px
from PIL import Image, ImageFilter
import numpy as np
from scipy import ndimage
M={'L1':'heaven','L2':'galaxy','L3':'fire','L4':'abyss'}
for s,k in M.items():
  im=Image.open(f'mockups-v25/img/rodimg-{s}.jpg').convert('RGB');a=np.asarray(im).astype(int)
  d=np.abs(a-255).max(2)
  lab,n=ndimage.label(d<=14);edge=set(np.unique(np.r_[lab[0],lab[-1],lab[:,0],lab[:,-1]]))-{0}
  bg=np.isin(lab,list(edge))
  lab2,n2=ndimage.label(d<=6);sz=ndimage.sum(np.ones_like(d),lab2,range(1,n2+1))
  for i,z in enumerate(sz):
    if z>120:bg|=lab2==i+1
  A=Image.fromarray(np.where(bg,0,255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(.8))
  o=im.convert('RGBA');o.putalpha(A);o.resize((256,256),Image.LANCZOS).save(f'img/rods/{k}.png')
