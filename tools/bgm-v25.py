# 피쉬레스트 v25 BGM 시안: 순수 파이썬(numpy) 합성 → 저작권 걱정 없음
import numpy as np,subprocess,sys,os
SR=32000
def env(n,a,r):
    e=np.ones(n);A=int(a*SR);R=int(r*SR);A=min(A,n);e[:A]=np.linspace(0,1,A)
    if R<n:e[-R:]*=np.linspace(1,0,R)
    return e
def note(f,d,typ='sine',a=.01,r=.3,v=.3,det=0):
    n=int(d*SR);t=np.arange(n)/SR
    if typ=='pluck':
        s=np.sin(2*np.pi*f*t)+.3*np.sin(4*np.pi*f*t)+.1*np.sin(6*np.pi*f*t);s*=np.exp(-t*3.2)
    elif typ=='bell':
        s=np.sin(2*np.pi*f*t)+.4*np.sin(2*np.pi*f*2.76*t)*np.exp(-t*4)+.2*np.sin(2*np.pi*f*5.4*t)*np.exp(-t*7);s*=np.exp(-t*1.6)
    elif typ=='pad':
        s=sum(np.sin(2*np.pi*f*(1+k*.003)*t+k) for k in (-1,0,1))/3+.25*np.sin(4*np.pi*f*t)
    elif typ=='piano':
        s=(np.sin(2*np.pi*f*t)+.5*np.sin(4*np.pi*f*t)*np.exp(-t*2)+.2*np.sin(6*np.pi*f*t)*np.exp(-t*4))*np.exp(-t*1.2)
    else: s=np.sin(2*np.pi*f*t)
    return s*env(n,a,r)*v
def hz(m):return 440*2**((m-69)/12)
def mix(buf,s,at):
    i=int(at*SR);j=min(len(buf),i+len(s));buf[i:j]+=s[:j-i]
def reverb(x,mix_=.3):
    y=x.copy()
    for d,g in ((.031,.5),(.047,.45),(.071,.4),(.113,.35),(.163,.3),(.241,.25)):
        k=int(d*SR);z=np.zeros_like(x);z[k:]=x[:-k]*g;y+=z*mix_
    for d,g in ((.29,.25),(.43,.18)):
        k=int(d*SR);z=np.zeros_like(y);z[k:]=y[:-k]*g;y+=z
    return y
def noise_water(n,rng):
    w=rng.standard_normal(n);
    # 단순 저역 통과
    a=.02;y=np.zeros(n);acc=0
    for i in range(0,n,1):pass
    y=np.convolve(w,np.ones(200)/200,'same')
    mod=.5+.5*np.sin(2*np.pi*np.arange(n)/SR*.13)
    return y*mod*.6
def track(name,bpm,prog,scale,melT,padT,bassOn,dur,seed,water=0,bellR=0):
    rng=np.random.default_rng(seed);N=int(dur*SR);L=np.zeros(N);Rr=np.zeros(N)
    beat=60/bpm;bar=beat*4;t=0;bi=0
    while t<dur-bar:
        ch=prog[bi%len(prog)]
        for k,m in enumerate(ch):mix(L if k%2 else Rr,note(hz(m),bar*1.05,padT,a=.8,r=1.2,v=.10),t);mix(Rr if k%2 else L,note(hz(m),bar*1.05,padT,a=.8,r=1.2,v=.07),t)
        if bassOn:
            for b in (0,2):s=note(hz(ch[0]-12),beat*1.8,'sine',a=.02,r=.4,v=.16);mix(L,s,t+b*beat);mix(Rr,s,t+b*beat)
        # 멜로디: 스케일에서 걷기
        pos=rng.integers(0,len(scale));s8=0
        while s8<8:
            ln=rng.choice([1,1,2,2,3])
            if rng.random()<.72 and t>bar*1.5:
                pos=int(np.clip(pos+rng.choice([-2,-1,-1,1,1,2]),0,len(scale)-1));pn=rng.random()*.6-.3
                s=note(hz(scale[pos]),beat*ln*.5+.8,melT,a=.005,r=.6,v=.16)
                mix(L,s*(1-pn),t+s8*beat*.5);mix(Rr,s*(1+pn),t+s8*beat*.5)
            s8+=ln
        if bellR and rng.random()<bellR:s=note(hz(rng.choice(scale)+12),2.5,'bell',v=.06);mix(L,s,t+beat*rng.integers(0,4));mix(Rr,s*.7,t+beat*rng.integers(0,4))
        t+=bar;bi+=1
    if water:w=noise_water(N,rng)*water;L+=w;Rr+=np.roll(w,4000)
    L=reverb(L,.35);Rr=reverb(Rr,.35)
    st=np.stack([L,Rr],1);fade=env(N,2.5,5);st*=fade[:,None];st/=np.abs(st).max()*1.12
    raw=(st*32767).astype(np.int16).tobytes()
    out=f'/workspace/nakmeong/mockups-v25/bgm/{name}.mp3'
    subprocess.run(['ffmpeg','-y','-loglevel','error','-f','s16le','-ar',str(SR),'-ac','2','-i','-','-b:a','128k',out],input=raw,check=True);print(name,dur)
C=lambda r,*iv:[r+i for i in iv]
T=[('m1-morning-lake',72,[C(60,0,4,7,11),C(57,0,3,7,10),C(65,0,4,7,11),C(67,0,4,7,10)],[72,74,76,79,81,84,86],'piano','pad',1,96,1,.25,.2),
 ('m2-sunset-dock',64,[C(62,0,3,7,10),C(67,0,4,7,9),C(60,0,4,7,11),C(57,0,3,7,10)],[69,72,74,76,79,81],'pluck','pad',1,100,2,.35,.1),
 ('m3-rain-window',58,[C(57,0,3,7,10),C(53,0,4,7,11),C(60,0,4,7,9),C(55,0,4,7,10)],[69,71,72,76,79,81],'bell','pad',0,104,3,.6,.3),
 ('m4-campfire-night',66,[C(55,0,4,7,11),C(52,0,3,7,10),C(60,0,4,7,11),C(62,0,4,7,10)],[67,69,71,74,76,79],'pluck','pad',1,92,4,.15,.15),
 ('m5-cozy-cabin',80,[C(65,0,4,7,11),C(62,0,3,7,10),C(58,0,4,7,9),C(60,0,4,7,10)],[72,74,77,79,81,84],'piano','pad',1,90,5,0,.1),
 ('m6-starlight-lullaby',54,[C(60,0,4,7,14),C(64,0,3,7,10),C(57,0,3,7,10),C(65,0,4,7,11)],[76,79,81,84,86,88],'bell','pad',0,110,6,.2,.4)]
for x in T: track(*x)
