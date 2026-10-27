/* Homepage motion effects (Naomi). Each effect starts only when JS runs and the visitor has not asked for reduced motion. */
(function(){
  var d=document, TAU=Math.PI*2;
  var mq=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)'), calm=!!(mq&&mq.matches);
  function vis(el,cb){ if(!('IntersectionObserver' in window)){ cb(true); return; } new IntersectionObserver(function(es){ cb(es[0].isIntersecting); },{threshold:.05}).observe(el); }

  /* ---------- 1. Orbit showcase ---------- */
  var orbit=d.getElementById('fxOrbit'), oVis=true, ang=0, target=null, hover=false, oPaused=false, oc=[], N=0;
  if(orbit){
    oc=[].slice.call(orbit.querySelectorAll('.oc')); N=oc.length;
    var p1=orbit.querySelector('.path:not(.p2)'), p2=orbit.querySelector('.p2');
    var layoutOrbit=function(){
      var W=orbit.clientWidth, rx=Math.min(W*.37,400), ry=Math.max(rx*.2,46), best=-2, bi=0;
      p1.style.width=(rx*2)+'px'; p1.style.height=(ry*2)+'px'; p2.style.width=(rx*2.5)+'px'; p2.style.height=(ry*2.7)+'px';
      oc.forEach(function(c,i){ var a=ang+i*TAU/N, x=Math.sin(a)*rx, z=Math.cos(a), y=z*ry, s=.7+.3*(z+1)/2;
        c.style.transform='translate(calc(-50% + '+x.toFixed(1)+'px), calc(-50% + '+y.toFixed(1)+'px)) scale('+s.toFixed(3)+')';
        c.style.zIndex=Math.round(20+z*30)+(z>.2?30:0); c.style.opacity=(.62+.38*(z+1)/2).toFixed(2); if(z>best){best=z;bi=i;} });
      oc.forEach(function(c,i){ c.classList.toggle('front',i===bi); });
    };
    var frontIdx=function(){ var b=-2,bi=0; oc.forEach(function(c,i){ var z=Math.cos(ang+i*TAU/N); if(z>b){b=z;bi=i;} }); return bi; };
    var toFront=function(i){ var want=-i*TAU/N, diff=((want-ang+Math.PI)%TAU+TAU)%TAU-Math.PI; target=ang+diff; if(calm){ ang=target; target=null; layoutOrbit(); } };
    orbit.classList.add('ready'); layoutOrbit();
    oc.forEach(function(c,i){ c.addEventListener('click',function(e){ if(c.getAttribute('href')==='#'||!c.classList.contains('front')) e.preventDefault(); toFront(i); }); });
    d.getElementById('oNext').addEventListener('click',function(){ toFront((frontIdx()+1)%N); });
    d.getElementById('oPrev').addEventListener('click',function(){ toFront((frontIdx()+N-1)%N); });
    var op=d.getElementById('oPause'); if(op) op.addEventListener('click',function(){ oPaused=!oPaused; op.setAttribute('aria-pressed',oPaused); op.textContent=oPaused?'Play motion':'Pause motion'; });
    orbit.addEventListener('pointerenter',function(){ hover=true; }); orbit.addEventListener('pointerleave',function(){ hover=false; });
    orbit.addEventListener('focusin',function(){ hover=true; }); orbit.addEventListener('focusout',function(){ hover=false; });
    vis(orbit,function(v){ oVis=v; });
  }

  /* ---------- 2. Cover ring ---------- */
  var rw=d.getElementById('fxRing'), rot=0, rTarget=null, rHover=false, rVis=true, dragging=false, lastX=0, rc=[], RN=0, STEP=60, R=300, rName=null, topics=[];
  if(rw){
    var stage=rw.querySelector('.ring-stage'), list=rw.querySelector('.ring-list');
    rc=[].slice.call(list.children); RN=rc.length; STEP=360/RN; rName=d.getElementById('rName');
    topics=rc.map(function(c){ return c.getAttribute('data-short')||''; });
    var sizeRing=function(){ var W=stage.clientWidth, w=W<560?168:228, h=W<560?290:330; stage.style.setProperty('--rw',w+'px'); stage.style.setProperty('--rh',h+'px'); R=(w/2)/Math.tan(Math.PI/RN)*1.2;
      rc.forEach(function(c,i){ c.style.transform='rotateY('+(i*STEP)+'deg) translateZ('+R.toFixed(0)+'px)'; }); drawRing(); };
    var drawRing=function(){ list.style.transform='translateZ(-'+(R*.55).toFixed(0)+'px) rotateY('+rot.toFixed(2)+'deg)'; var best=-2,bi=0;
      rc.forEach(function(c,i){ var f=Math.cos((i*STEP+rot)*Math.PI/180); c.style.opacity=(.1+.9*Math.pow((f+1)/2,2.2)).toFixed(2); c.style.zIndex=Math.round(f*10)+10; c.setAttribute('aria-hidden',f<.2?'true':'false'); if(f>best){best=f;bi=i;} });
      if(rName) rName.textContent=topics[bi]; };
    var ringStep=function(dir){ var base=Math.round(rot/STEP)*STEP; rTarget=base-dir*STEP; if(calm){ rot=rTarget; rTarget=null; drawRing(); } };
    rw.classList.add('ready'); sizeRing();
    d.getElementById('rNext').addEventListener('click',function(){ ringStep(1); });
    d.getElementById('rPrev').addEventListener('click',function(){ ringStep(-1); });
    stage.addEventListener('pointerenter',function(){ rHover=true; }); stage.addEventListener('pointerleave',function(){ rHover=false; });
    stage.addEventListener('pointerdown',function(e){ if(e.target.closest('button')) return; dragging=true; lastX=e.clientX; stage.classList.add('drag'); rTarget=null; try{stage.setPointerCapture(e.pointerId);}catch(_){} });
    stage.addEventListener('pointermove',function(e){ if(!dragging) return; rot+=(e.clientX-lastX)*.35; lastX=e.clientX; drawRing(); });
    var endDrag=function(){ if(!dragging) return; dragging=false; stage.classList.remove('drag'); rTarget=Math.round(rot/STEP)*STEP; if(calm){ rot=rTarget; rTarget=null; drawRing(); } };
    stage.addEventListener('pointerup',endDrag); stage.addEventListener('pointercancel',endDrag);
    vis(stage,function(v){ rVis=v; });
    addEventListener('resize',sizeRing);
  }

  /* ---------- 2b. Totem wall (sideways rows) ---------- */
  var tw=d.getElementById('fxTotem');
  if(tw&&!calm){
    var rows=[].slice.call(tw.querySelectorAll('.tcol')), tracks=[];
    rows.forEach(function(c){ var t=c.querySelector('.ttrack'), inner=d.createElement('div'); inner.className='tcol-in'; c.appendChild(inner); inner.appendChild(t); tracks.push(t); });
    tw.classList.add('ready');
    tracks.forEach(function(t){ var orig=[].slice.call(t.children); t._orig=orig.length;
      for(var k=0;k<2;k++) orig.forEach(function(x){ var cl=x.cloneNode(true); cl.setAttribute('aria-hidden','true'); t.appendChild(cl); }); });
    var setW=function(){ tracks.forEach(function(t){ var kids=t.children, w=0; for(var i=0;i<t._orig;i++){ var cs=getComputedStyle(kids[i]); w+=kids[i].getBoundingClientRect().width+parseFloat(cs.marginRight||0); } t.style.setProperty('--set',w.toFixed(0)+'px'); }); };
    setW(); addEventListener('resize',setW);
    var tb=d.getElementById('tPause'); if(tb) tb.addEventListener('click',function(){ var p=tw.classList.toggle('paused'); tb.setAttribute('aria-pressed',p); tb.textContent=p?'Play motion':'Pause motion'; });
    var tt=false, upT=function(){ var r=tw.getBoundingClientRect(), p=((r.top+r.height/2)-innerHeight/2)/innerHeight; p=Math.max(-1,Math.min(1,p));
      rows.forEach(function(c,i){ c.querySelector('.tcol-in').style.setProperty('--px',(p*(i%2?-48:48)).toFixed(1)+'px'); }); };
    addEventListener('scroll',function(){ if(tt) return; tt=true; requestAnimationFrame(function(){ tt=false; upT(); }); },{passive:true}); upT();
  }

  /* ---------- 3. Depth stack ---------- */
  var track=d.getElementById('fxStack');
  if(track&&!calm){
    var steps=[].slice.call(track.querySelectorAll('.stk-step')), dots=[].slice.call(track.querySelectorAll('.stk-dots i')), cue=track.querySelector('.stk-cue'), SN=steps.length;
    track.classList.add('ready');
    var upd=function(){ var r=track.getBoundingClientRect(), range=Math.max(1,r.height-innerHeight), prog=Math.min(1,Math.max(0,-r.top/range))*(SN-1);
      steps.forEach(function(s,i){ var dd=i-prog,y,sc,op,bl;
        if(dd<0){ var t=Math.min(1,-dd); y=-t*150; sc=1+t*.16; op=t<.2?1:Math.max(0,1-(t-.2)*2.4); bl=t*5; s.style.pointerEvents='none'; }
        else{ y=dd*30; sc=1-dd*.06; op=Math.max(0,1-dd*.35); bl=dd*2.6; s.style.pointerEvents=''; }
        s.style.transform='translate(-50%,-50%) translateY('+y.toFixed(1)+'px) scale('+sc.toFixed(3)+')'; s.style.opacity=op.toFixed(2);
        s.style.filter=bl>.05?'blur('+bl.toFixed(1)+'px)':'none'; s.style.zIndex=SN-i; s.setAttribute('aria-hidden',Math.abs(dd)>.5?'true':'false'); });
      dots.forEach(function(x,i){ x.classList.toggle('on',i===Math.round(prog)); }); if(cue) cue.style.opacity=prog<.25?1:0; };
    var tick=false; addEventListener('scroll',function(){ if(tick) return; tick=true; requestAnimationFrame(function(){ tick=false; upd(); }); },{passive:true});
    addEventListener('resize',upd); upd();
  }

  /* ---------- one loop for orbit and ring ---------- */
  if(orbit||rw){
    var last=performance.now();
    var frame=function(now){ var dt=Math.min(64,now-last); last=now;
      if(orbit&&oVis){ var m=false;
        if(target!==null){ var df=target-ang; ang+=df*Math.min(1,dt*.011); if(Math.abs(df)<.002){ ang=target; target=null; } m=true; }
        else if(!calm&&!hover&&!oPaused){ ang+=dt*.000125; m=true; }
        if(m) layoutOrbit(); }
      if(rw&&rVis&&!dragging){ var rm=false;
        if(rTarget!==null){ var rd=rTarget-rot; rot+=rd*Math.min(1,dt*.01); if(Math.abs(rd)<.05){ rot=rTarget; rTarget=null; } rm=true; }
        else if(!calm&&!rHover){ rot-=dt*.0055; rm=true; }
        if(rm) drawRing(); }
      requestAnimationFrame(frame); };
    requestAnimationFrame(frame);
  }
})();

/* Services spread columns */
(function(){var d=document,sp=d.getElementById('fmSp'); if(!sp) return;
 var cols=[].slice.call(sp.querySelectorAll('.fmcol')), btn=d.getElementById('fmSpPause'), i=0, t=null,
 paused=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 function open(c,auto){ cols.forEach(function(x){ x.classList.toggle('on',x===c); }); if(!auto){ i=cols.indexOf(c); run(); } }
 function run(){ clearInterval(t); if(!paused) t=setInterval(function(){ i=(i+1)%cols.length; open(cols[i],true); },3800); }
 function label(){ btn.textContent=paused?'Play motion':'Pause motion'; btn.setAttribute('aria-pressed',paused); sp.classList.toggle('still',paused); }
 cols.forEach(function(c){ c.addEventListener('click',function(){ open(c); }); c.addEventListener('focus',function(){ open(c); });
  c.addEventListener('mouseenter',function(){ if(window.matchMedia('(hover:hover)').matches) open(c); }); });
 btn.addEventListener('click',function(){ paused=!paused; label(); run(); }); label();
 if('IntersectionObserver' in window){ new IntersectionObserver(function(e,o){ if(e[0].isIntersecting){ sp.classList.add('in'); run(); o.disconnect(); } },{threshold:.2}).observe(sp); }
 else { sp.classList.add('in'); run(); }
})();

/* Who we are: iso focus entrance and tap-to-focus */
(function(){var d=document,id=d.getElementById('fmIdent'); if(!id) return;
 var cards=[].slice.call(id.querySelectorAll('.glass'));
 cards.forEach(function(c){ c.addEventListener('click',function(){ cards.forEach(function(x){ x.classList.toggle('on',x===c&&!c.classList.contains('on')); }); }); });
 if('IntersectionObserver' in window){ new IntersectionObserver(function(e,o){ if(e[0].isIntersecting){ id.classList.add('in'); o.disconnect(); } },{threshold:.2}).observe(id); } else id.classList.add('in');
 setTimeout(function(){ id.classList.add('in'); },7000);
})();
/* Who we serve: tags rise in one after another */
(function(){var d=document,pl=d.getElementById('fmPills'); if(!pl) return;
 var rm=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 [].slice.call(pl.children).forEach(function(li,i){ li.style.setProperty('--d',(i*.1)+'s'); });
 if(rm||!('IntersectionObserver' in window)){ pl.classList.add('in'); return; }
 pl.classList.add('js');
 new IntersectionObserver(function(e,o){ if(e[0].isIntersecting){ pl.classList.add('in'); o.disconnect(); } },{threshold:.3}).observe(pl);
 setTimeout(function(){ pl.classList.add('in'); },9000);
})();

/* Section dividers: place the magic butterflies along the gold ribbon */
(function(){var d=document,rs=[].slice.call(d.querySelectorAll('.ribbon')); if(!rs.length) return;
 function place(){ rs.forEach(function(r){ var p=r.querySelector('.rl1'); if(!p) return; var L=p.getTotalLength(), W=r.clientWidth, H=r.clientHeight;
  [].slice.call(r.querySelectorAll('.rb')).forEach(function(b){ var pt=p.getPointAtLength(parseFloat(b.getAttribute('data-t'))*L); b.style.left=(pt.x/1200*W)+'px'; b.style.top=(pt.y/80*H)+'px'; }); r.classList.add('ready'); }); }
 place(); window.addEventListener('resize',place);
 var btn=d.getElementById('fmMagicPause'), still=false;
 if(btn) btn.addEventListener('click',function(){ still=!still; d.documentElement.classList.toggle('fm-still',still); btn.textContent=still?'Play motion':'Pause motion'; btn.setAttribute('aria-pressed',still); });
})();
