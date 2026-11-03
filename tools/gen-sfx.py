import numpy as np,wave
R=44100;rng=np.random.default_rng(7)
def T(d):return np.arange(int(R*d))/R
def env(t,a,d):return np.minimum(t/a,1)*np.exp(-np.maximum(t-a,0)/d)
def noise(n):return rng.standard_normal(n)
def lp(x,c):  # one-pole lowpass, c in Hz (array or scalar)
    c=np.broadcast_to(np.asarray(c,float),x.shape);k=1-np.exp(-2*np.pi*c/R);y=np.zeros_like(x);s=0
    for i in range(len(x)):s+=k[i]*(x[i]-s);y[i]=s
    return y
def hp(x,c):return x-lp(x,c)
def save(n,x):
    x=x/ (np.abs(x).max()+1e-9)*.85;
    # tiny fade
    f=int(.005*R);x[:f]*=np.linspace(0,1,f);x[-f:]*=np.linspace(1,0,f)
    w=wave.open(n,'w');w.setnchannels(1);w.setsampwidth(2);w.setframerate(R);w.writeframes((x*32767).astype('<i2').tobytes());w.close()
def swish(d,f0,f1):
    t=T(d);c=f0*(f1/f0)**(t/d);e=np.sin(np.pi*t/d)**2;return hp(lp(noise(len(t)),c),300)*e
def click_reel(d,rate,pitch):
    t=T(d);x=np.zeros(len(t))
    r=rate*(1-0.5*t/d)
    ph=np.cumsum(r)/R;idx=np.where(np.diff(np.floor(ph))>0)[0]
    for i in idx:
        L=min(400,len(t)-i);tt=np.arange(L)/R;x[i:i+L]+=np.sin(2*np.pi*pitch*tt)*np.exp(-tt/.004)
    return x*np.exp(-t/(d*.8))
def splash(d,big,bright):
    t=T(d);n=noise(len(t));body=lp(n,bright*np.exp(-t/.25)+300)*env(t,.008,.18*big)
    bub=np.zeros(len(t))
    for _ in range(int(14*big)):
        s=int(rng.uniform(.03,d*.7)*R);f=rng.uniform(500,1400);L=int(.05*R)
        if s+L<len(t):tt=np.arange(L)/R;bub[s:s+L]+=np.sin(2*np.pi*f*(1+12*tt)*tt)*np.exp(-tt/.012)*rng.uniform(.1,.35)
    return body+bub
def plop(f,d=.18):
    t=T(d);return np.sin(2*np.pi*f*(1+6*t)*t)*np.exp(-t/.04)+.15*lp(noise(len(t)),2500)*np.exp(-t/.02)
def bell(fs,d=1.2,gap=.11):
    t=T(d+gap*len(fs));x=np.zeros(len(t))
    for j,f in enumerate(fs):
        s=int(j*gap*R);tt=t[:len(t)-s]
        x[s:]+=(np.sin(2*np.pi*f*tt)+.35*np.sin(2*np.pi*2*f*tt)+.12*np.sin(2*np.pi*3.01*f*tt))*np.exp(-tt/.35)
    return x
cat=lambda *a:np.concatenate(a)
sil=lambda d:np.zeros(int(R*d))
# 1 cast
save('cast-a-swish-reel.wav',cat(swish(.32,600,5000),click_reel(.7,55,3200)*.5))
save('cast-b-whoosh-long.wav',cat(swish(.5,400,3500)*1.0,click_reel(.9,70,2600)*.4))
save('cast-c-light-flick.wav',cat(swish(.2,1500,7000),click_reel(.5,90,4000)*.35))
# 2 splash (bobber lands)
save('splash-a-bobber-plop.wav',cat(plop(420),splash(.4,.5,2500)*.4))
save('splash-b-soft.wav',splash(.6,.7,1800))
save('splash-c-drop.wav',cat(plop(300,.25),sil(.05),plop(700,.1)*.3))
# 3 bite
save('bite-a-double-plip.wav',cat(plop(900,.12),sil(.08),plop(1100,.12)))
save('bite-b-tug-ripple.wav',cat(plop(520,.15),plop(640,.15)*.7,plop(760,.15)*.5))
x=bell([1318.5],.5);save('bite-c-alert-ping.wav',cat(plop(800,.1),x*.6))
# 4 reel-in
save('reel-a-ratchet.wav',click_reel(1.4,38,2800))
save('reel-b-fast-spin.wav',click_reel(1.2,120,3600)+.08*hp(lp(noise(int(1.2*R)),4000),1500)*np.exp(-T(1.2)/1))
save('reel-c-drag-zing.wav',click_reel(1.2,60,2200)*.7+ .25*np.sin(2*np.pi*(900+300*np.sin(2*np.pi*3*T(1.2)))*T(1.2))*np.exp(-T(1.2)/.7))
# 5 pull-out splash
save('pullout-a-big.wav',splash(1.0,1.4,4500))
save('pullout-b-medium.wav',cat(swish(.15,1200,4000)*.6,splash(.8,1.0,3200)))
save('pullout-c-drip.wav',cat(splash(.5,.8,3500),sil(.05),plop(1200,.1)*.3,sil(.12),plop(1500,.1)*.25,sil(.1),plop(1000,.1)*.2))
# 6 catch jingle (no fireworks)
save('jingle-a-bell-arpeggio.wav',bell([784,988,1175,1568]))
save('jingle-b-marimba.wav',sum([0]) + cat(*[np.sin(2*np.pi*f*T(.22))*np.exp(-T(.22)/.07) for f in [523,659,784]],np.sin(2*np.pi*1047*T(.6))*np.exp(-T(.6)/.2)))
save('jingle-c-soft-chime.wav',bell([659,880,1319],1.6,.16))
