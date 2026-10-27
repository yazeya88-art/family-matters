/* Family Matters V3 mockup behavior (Naomi). Everything degrades gracefully without JS. */
(function(){
  var d=document, reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root=d.documentElement;

  /* ---- scroll progress, dawn light, back-to-top, dock ---- */
  var bar=d.getElementById('fmProgress'), dock=d.querySelector('.dock'), topBtn=d.getElementById('toTop');
  var hero=d.querySelector('.hero,.page-hero'), tick=false;
  function onScroll(){ if(tick) return; tick=true; requestAnimationFrame(function(){
    var h=root.scrollHeight-innerHeight, y=scrollY||0, p=h>0?Math.min(1,y/h):0;
    if(bar) bar.style.transform='scaleX('+p+')';
    root.style.setProperty('--dawn',p.toFixed(3));
    if(topBtn) topBtn.classList.toggle('show',y>700);
    if(dock){ var past=y>(hero?hero.offsetHeight*.6:300); var cta=d.getElementById('contact-cta'); var near=cta&&cta.getBoundingClientRect().top<innerHeight*.7; dock.classList.toggle('show',past&&!near); }
    tick=false; }); }
  addEventListener('scroll',onScroll,{passive:true}); onScroll();
  if(topBtn) topBtn.addEventListener('click',function(){ scrollTo({top:0,behavior:reduce?'auto':'smooth'}); });

  /* ---- mobile menu ---- */
  var burger=d.querySelector('.burger'), nav=d.getElementById('sitenav'), topbar=d.querySelector('.topbar');
  if(burger&&nav){
    var setHH=function(){ root.style.setProperty('--hh',(topbar.getBoundingClientRect().bottom+8)+'px'); };
    var close=function(){ nav.classList.remove('open'); burger.setAttribute('aria-expanded','false'); burger.setAttribute('aria-label','Open menu'); };
    burger.addEventListener('click',function(){ setHH(); var o=nav.classList.toggle('open'); burger.setAttribute('aria-expanded',o); burger.setAttribute('aria-label',o?'Close menu':'Open menu'); });
    d.addEventListener('keydown',function(e){ if(e.key==='Escape') close(); });
    d.addEventListener('click',function(e){ if(nav.classList.contains('open')&&!e.target.closest('#sitenav')&&!e.target.closest('.burger')) close(); });
    addEventListener('resize',function(){ setHH(); if(innerWidth>900) close(); }); setHH();
  }

  /* ---- hero: cursor light, gentle parallax, golden motes ---- */
  var h=d.querySelector('.hero');
  if(h){
    var main=h.querySelector('.hero-main');
    h.addEventListener('pointermove',function(e){
      var r=h.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
      h.style.setProperty('--mx',x+'px'); h.style.setProperty('--my',y+'px'); h.classList.add('hov');
      if(main&&!reduce) main.style.transform='translate('+((x/r.width-.5)*-14)+'px,'+((y/r.height-.5)*-10)+'px)';
    });
    h.addEventListener('pointerleave',function(){ h.classList.remove('hov'); if(main) main.style.transform=''; });
    var m=h.querySelector('.motes');
    if(m&&!reduce){ var n=innerWidth<640?9:16; for(var i=0;i<n;i++){ var s=d.createElement('span'); s.className='mote'; var z=3+Math.random()*7;
      s.style.cssText='left:'+(Math.random()*100)+'%;width:'+z+'px;height:'+z+'px;animation-duration:'+(11+Math.random()*12)+'s;animation-delay:'+(-Math.random()*20)+'s;--dx:'+((Math.random()*80)-40)+'px'; m.appendChild(s); } }
  }

  /* ---- reveal on scroll + kintsugi seams ---- */
  if('IntersectionObserver' in window&&!reduce){
    root.classList.add('rv-on');
    var io=new IntersectionObserver(function(es){ es.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } }); },{threshold:.12,rootMargin:'0px 0px -6% 0px'});
    var last=null,k=0;
    [].slice.call(d.querySelectorAll('.rv')).forEach(function(el){ var p=el.parentElement; if(p!==last){ last=p; k=0; } el.style.setProperty('--rd',Math.min(k++,4)*70+'ms'); io.observe(el); });
    setTimeout(function(){ [].slice.call(d.querySelectorAll('.rv')).forEach(function(el){ el.classList.add('in'); }); },7000);
    var sio=new IntersectionObserver(function(es){ es.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('in'); sio.unobserve(en.target); } }); },{threshold:.5});
    [].slice.call(d.querySelectorAll('.seam')).forEach(function(s){ sio.observe(s); });
  } else {
    [].slice.call(d.querySelectorAll('.seam')).forEach(function(s){ s.classList.add('in'); });
  }

  /* ---- fan-shuffle services deck ---- */
  var stage=d.getElementById('svcStage');
  if(stage){
    var cards=[].slice.call(stage.children), order=cards.map(function(_,i){return i;}), timer=null, busy=false;
    var step=function(){ return Math.min(190,Math.max(60,stage.offsetWidth/6.4)); };
    var slot=function(r,st){ return [{x:0,y:0,r:0,s:1},{x:st,y:10,r:7,s:.95},{x:-st,y:10,r:-7,s:.95},{x:st*1.7,y:22,r:12,s:.88}][Math.min(r,3)]; };
    var render=function(){ var st=step(); order.forEach(function(ci,r){ var c=cards[ci],p=slot(r,st);
      c.style.transform='translate('+p.x+'px,'+p.y+'px) rotate('+p.r+'deg) scale('+p.s+')'; c.style.zIndex=20-r; c.classList.toggle('front',r===0);
      c.setAttribute('aria-hidden',r===0?'false':'true'); c.tabIndex=r===0?0:-1; }); };
    var lift=function(){ var f=cards[order[0]],st=step(); f.style.zIndex=40; f.style.transform='translate('+(-st*1.5)+'px,-36px) rotate(-14deg)'; };
    var shuffle=function(){ if(busy) return; busy=true; lift(); setTimeout(function(){ order.push(order.shift()); render(); busy=false; },reduce?0:420); };
    var bring=function(ci){ if(busy||order[0]===ci) return; busy=true; lift(); setTimeout(function(){ order.splice(order.indexOf(ci),1); order.unshift(ci); render(); busy=false; },reduce?0:380); };
    var start=function(){ if(reduce||timer) return; timer=setInterval(shuffle,4200); }, stop=function(){ if(timer){ clearInterval(timer); timer=null; } }, restart=function(){ stop(); start(); };
    cards.forEach(function(c,ci){ c.addEventListener('click',function(e){ if(order[0]!==ci){ e.preventDefault(); bring(ci); restart(); } }); });
    var sb=d.getElementById('svcShuffle'); if(sb) sb.addEventListener('click',function(){ shuffle(); restart(); });
    var deck=d.getElementById('svcDeck');
    deck.addEventListener('mouseenter',stop); deck.addEventListener('mouseleave',start); deck.addEventListener('focusin',stop); deck.addEventListener('focusout',start);
    addEventListener('resize',render); render();
    if('IntersectionObserver' in window) new IntersectionObserver(function(en){ en.forEach(function(e){ if(e.isIntersecting) start(); else stop(); }); },{threshold:.35}).observe(deck);
  }

  /* ---- demo form (mockup only) ---- */
  var f=d.getElementById('demoForm');
  if(f) f.addEventListener('submit',function(e){ e.preventDefault(); var o=d.getElementById('formNote'); if(o) o.textContent='Mockup only: this form is not connected yet. Thank you for previewing!'; });
})();

