(() => {
  const D = window.RESEARCH_DATA;
  const html = document.documentElement;
  let lang = 'en';
  try { lang = localStorage.getItem('site-lang') === 'es' ? 'es' : 'en'; } catch {}
  const tr = (en, es) => lang === 'es' ? es : en;
  const escapeHTML = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normalize = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  function updateLanguage() {
    html.dataset.lang = lang; html.lang = lang;
    document.querySelectorAll('.lang-toggle button').forEach(b => { b.classList.toggle('active', b.dataset.lang === lang); b.setAttribute('aria-pressed',String(b.dataset.lang===lang)); });
    document.querySelectorAll('select option').forEach(o => { const en=o.querySelector('.lang-en'), es=o.querySelector('.lang-es'); if(en&&es){ o.dataset.en=en.textContent; o.dataset.es=es.textContent; } if(o.dataset.en) o.textContent=tr(o.dataset.en,o.dataset.es); });
    document.dispatchEvent(new Event('languagechange'));
  }
  document.querySelectorAll('.lang-toggle button').forEach(b => b.addEventListener('click', () => {lang=b.dataset.lang;try{localStorage.setItem('site-lang',lang)}catch{}updateLanguage();}));
  const menu = document.querySelector('.menu-btn');
  menu?.addEventListener('click',()=>{const open=document.body.classList.toggle('menu-open');menu.setAttribute('aria-expanded',String(open));});
  const io = new IntersectionObserver(entries => entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}}),{threshold:.08});
  document.querySelectorAll('.reveal').forEach(e=>io.observe(e));
  const year=document.getElementById('year');if(year)year.textContent=new Date().getFullYear();
  document.getElementById('print-cv')?.addEventListener('click',()=>window.print());
  document.getElementById('contact-form')?.addEventListener('submit',ev=>{ev.preventDefault();const name=document.getElementById('name').value.trim(),email=document.getElementById('email').value.trim(),message=document.getElementById('message').value.trim();location.href=`mailto:djzamora@conicet.gov.ar?subject=${encodeURIComponent('Website contact from '+name)}&body=${encodeURIComponent('Name: '+name+'\nEmail: '+email+'\n\n'+message)}`;});

  const search=document.getElementById('pub-search'), yearSelect=document.getElementById('pub-year'), typeSelect=document.getElementById('pub-type');
  if(search&&D){
    const cards=Array.from(document.querySelectorAll('#publications-list .pub-item'));
    function filter(){
      const query=normalize(search.value.trim());let count=0;
      cards.forEach(c=>{const match=(!query||normalize(c.textContent+' '+c.dataset.authors).includes(query))&&(yearSelect.value==='all'||c.dataset.year===yearSelect.value)&&(typeSelect.value==='all'||c.dataset.type===typeSelect.value);c.hidden=!match;if(match)count++});
      document.getElementById('pub-count').textContent=tr(`${count} of ${cards.length} publications`,`${count} de ${cards.length} publicaciones`);
      document.getElementById('pub-empty').hidden=count!==0;
      document.querySelectorAll('.year-column').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.year===yearSelect.value)));
    }
    [search,yearSelect,typeSelect].forEach(el=>el.addEventListener(el===search?'input':'change',filter));
    document.getElementById('pub-reset').addEventListener('click',()=>{search.value='';yearSelect.value='all';typeSelect.value='all';filter()});
    const chart=document.getElementById('publication-chart');
    for(let y=2016;y<=2026;y++){
      const works=D.papers.filter(p=>p.year===y),pub=works.filter(p=>p.type!=='preprint').length,pre=works.length-pub;
      const b=document.createElement('button');b.className='year-column';b.dataset.year=y;b.type='button';b.setAttribute('aria-label',`${y}: ${works.length}`);b.innerHTML=`<strong>${works.length}</strong><span class="year-bars" style="height:${Math.max(works.length*17,3)}px"><i class="preprint" style="height:${pre*17}px"></i><i class="published" style="height:${pub*17}px"></i></span><small>${y}</small>`;b.addEventListener('click',()=>{yearSelect.value=String(y);search.value='';typeSelect.value='all';filter()});chart.appendChild(b);
    }
    document.addEventListener('languagechange',filter);filter();
  }

  const mapEl=document.getElementById('collab-map');
  if(mapEl&&D){
    const list=document.getElementById('collab-list'),detail=document.getElementById('collab-detail'),input=document.getElementById('collab-search');
    let map=null,selected=null;const markers={};
    const cityGroups=Object.entries(D.places).map(([key,p])=>({key,...p,people:D.collaborators.filter(c=>c.place===key)}));
    function paperLinks(ids){return ids.map(id=>{const p=D.papers.find(p=>p.id===id);return `<a class="shared-paper" href="${escapeHTML(p.url)}" target="_blank" rel="noopener"><span>${p.year}</span>${escapeHTML(p.title)} ↗</a>`}).join('')}
    function selectPerson(c){
      selected=c.key;
      detail.innerHTML=`<p class="eyebrow">${tr('Joint publications','Publicaciones conjuntas')}</p><h2>${escapeHTML(c.name)}</h2><p class="muted">${escapeHTML(c.institution)} · ${escapeHTML(c.city)}</p><p>${c.papers.length} ${c.papers.length===1?tr('shared work in the CV','trabajo compartido en el CV'):tr('shared works in the CV','trabajos compartidos en el CV')}</p>${paperLinks(c.papers)}`;
      if(map){map.setView([c.lat,c.lng],c.country==='Argentina'?5:4,{animate:!matchMedia('(prefers-reduced-motion: reduce)').matches});markers[c.place]?.openPopup()}
      list.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.key===selected)));
    }
    function renderList(){
      const query=normalize(input.value);list.replaceChildren();
      const people=D.collaborators.filter(c=>normalize(c.name+' '+c.institution+' '+c.city).includes(query));
      people.forEach(c=>{const b=document.createElement('button');b.type='button';b.className='collab-person';b.dataset.key=c.key;b.setAttribute('aria-pressed',String(selected===c.key));b.innerHTML=`<strong>${escapeHTML(c.name)}</strong><small>${escapeHTML(c.institution)}</small><small>${escapeHTML(c.city)} · ${escapeHTML(c.country)}</small><small class="co-count">${c.papers.length} ${c.papers.length===1?tr('shared work','trabajo compartido'):tr('shared works','trabajos compartidos')} ↗</small>`;b.addEventListener('click',()=>selectPerson(c));list.appendChild(b)});
      if(!people.length)list.textContent=tr('No researchers match your search.','No hay investigadores para esta búsqueda.');
    }
    function popup(g){return `<strong>${escapeHTML(g.city)}</strong><br>${escapeHTML(g.country)}<br><br>${g.people.map(c=>escapeHTML(c.name)).join('<br>')}`;}
    if(typeof L!=='undefined'){
      map=L.map(mapEl,{scrollWheelZoom:false}).setView([4,-8],2);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'&copy; OpenStreetMap contributors'}).addTo(map);
      const home=D.places.tuc;
      cityGroups.forEach(g=>{
        const color=g.key==='tuc'?'#1d4ed8':g.country==='Argentina'?'#0f766e':'#7c3aed';
        if(g.key!=='tuc')L.polyline([[home.lat,home.lng],[g.lat,g.lng]],{color,weight:2,opacity:.55,dashArray:g.country==='Argentina'?null:'5 8'}).addTo(map);
        const marker=L.circleMarker([g.lat,g.lng],{radius:7+Math.sqrt(g.people.length)*2,color:'#ffffff',weight:2,fillColor:color,fillOpacity:.95}).addTo(map).bindPopup(popup(g));markers[g.key]=marker;
        marker.bindTooltip(g.city,{permanent:false,direction:'top',className:'map-city-label'});
        marker.on('click',()=>{detail.innerHTML=`<h2>${escapeHTML(g.city)}</h2><p>${g.people.length} ${tr('coauthors','coautores')}</p>${g.people.map(c=>`<button class="collab-person" data-key="${escapeHTML(c.key)}"><strong>${escapeHTML(c.name)}</strong><small>${c.papers.length} ${c.papers.length===1?tr('shared work','trabajo compartido'):tr('shared works','trabajos compartidos')}</small></button>`).join('')}`;detail.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>selectPerson(D.collaborators.find(c=>c.key===b.dataset.key))));});
      });
      const full=()=>map.fitBounds(cityGroups.map(g=>[g.lat,g.lng]),{padding:[45,45],maxZoom:3});full();
      document.getElementById('map-reset').addEventListener('click',()=>{selected=null;input.value='';map.closePopup();full();renderList();detail.innerHTML=`<h2>${tr('A network built on publications','Una red basada en publicaciones')}</h2><p>${tr('Choose a researcher from the list to see your shared work.','Elegí un investigador de la lista para ver los trabajos compartidos.')}</p>`;});
      const ro=new ResizeObserver(()=>map.invalidateSize());ro.observe(mapEl);
    }else{mapEl.innerHTML=`<p style="padding:30px">${tr('The map could not be loaded. Explore the full coauthor list below.','No se pudo cargar el mapa. Podés explorar la lista completa de coautores.')}</p>`;}
    input.addEventListener('input',renderList);document.addEventListener('languagechange',()=>{renderList();if(selected)selectPerson(D.collaborators.find(c=>c.key===selected))});renderList();
  }

  const canvas=document.getElementById('hero-canvas');
  if(canvas){
    const ctx=canvas.getContext('2d'),hero=canvas.closest('section'),toggle=document.getElementById('motion-toggle'),reduce=matchMedia('(prefers-reduced-motion: reduce)');
    let w=0,h=0,paused=reduce.matches,visible=true,raf=0,last=0,time=0;
    const points=Array.from({length:55},(_,i)=>({x:(i*.6180339887)%1,y:(i*.4142135623)%1,r:1+(i%3)*.6}));
    function resize(){w=hero.clientWidth;h=hero.clientHeight;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);draw();}
    function draw(){ctx.clearRect(0,0,w,h);const pos=points.map((p,i)=>({x:((p.x+time*(.007+(i%4)*.002))%1)*w,y:p.y*h+Math.sin(time*.3+i)*18,r:p.r}));
      for(let i=0;i<pos.length;i++){for(let j=i+1;j<pos.length;j++){const a=pos[i],b=pos[j],dist=Math.hypot(a.x-b.x,a.y-b.y);if(dist<135){ctx.strokeStyle=`rgba(82,187,180,${(1-dist/135)*.16})`;ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()}}ctx.fillStyle='#66cebf';ctx.beginPath();ctx.arc(pos[i].x,pos[i].y,pos[i].r,0,Math.PI*2);ctx.fill();}
      for(let k=0;k<3;k++){ctx.beginPath();ctx.strokeStyle=`rgba(80,166,185,${.1+k*.025})`;ctx.lineWidth=1;for(let x=0;x<w;x+=5){const y=h*.72+Math.sin(x*.007+time*.25+k*.5)*45+Math.cos(x*.003+time*.14)*30; x?ctx.lineTo(x,y+k*22):ctx.moveTo(x,y+k*22)}ctx.stroke()}
    }
    function tick(ts){raf=0;if(paused||!visible||document.hidden)return;if(ts-last>32){time+=Math.min((ts-last)/1000,.07);last=ts;draw()}raf=requestAnimationFrame(tick);}
    function resume(){cancelAnimationFrame(raf);raf=0;if(!paused&&visible&&!document.hidden){last=performance.now();raf=requestAnimationFrame(tick)}}
    function label(){hero.classList.toggle('motion-paused',paused);if(!toggle)return;toggle.innerHTML=paused?tr('Resume motion','Activar movimiento'):tr('Pause motion','Pausar movimiento');toggle.setAttribute('aria-pressed',String(paused));hero.classList.toggle('motion-paused',paused)}
    toggle?.addEventListener('click',()=>{paused=!paused;label();resume()});reduce.addEventListener('change',e=>{paused=e.matches;label();resume()});document.addEventListener('languagechange',label);document.addEventListener('visibilitychange',resume);
    new IntersectionObserver(es=>{visible=es[0].isIntersecting;hero.classList.toggle('motion-paused',paused||!visible);resume()}).observe(hero);
    new ResizeObserver(resize).observe(hero);resize();label();resume();
  }

  const logoCanvas=document.getElementById('logo-vortex');
  if(logoCanvas){
    const core=logoCanvas.parentElement,ctx=logoCanvas.getContext('2d'),reduce=matchMedia('(prefers-reduced-motion: reduce)');
    const dots=[[0.48657, 0.64455, 0.04977], [0.64013, 0.67923, 0.03769], [0.47303, 0.46012, 0.03364], [0.37361, 0.64946, 0.05368], [0.79354, 0.32336, 0.01354], [0.59568, 0.5028, 0.03626], [0.73549, 0.62166, 0.0327], [0.47861, 0.29664, 0.03707], [0.25276, 0.6556, 0.05808], [0.20122, 0.5415, 0.05976], [0.43233, 0.5523, 0.04918], [0.59619, 0.15793, 0.01923], [0.31839, 0.55268, 0.04934], [0.3558, 0.46072, 0.04142], [0.51058, 0.81872, 0.0272], [0.24603, 0.42237, 0.05488], [0.29838, 0.32665, 0.02924], [0.40154, 0.36897, 0.04625], [0.76719, 0.69911, 0.01319], [0.67456, 0.55372, 0.0341], [0.71391, 0.35035, 0.02876], [0.79127, 0.51222, 0.01028], [0.57536, 0.3331, 0.0201], [0.32051, 0.75707, 0.05759], [0.43988, 0.74743, 0.05275], [0.58723, 0.76305, 0.03875], [0.46471, 0.19341, 0.02549], [0.37581, 0.24772, 0.04047], [0.71018, 0.21308, 0.01475], [0.56222, 0.24189, 0.02848], [0.65259, 0.27608, 0.01947], [0.68923, 0.75696, 0.01807], [0.77559, 0.41741, 0.01866], [0.82969, 0.60938, 0.01319], [0.84987, 0.46429, 0.01234]];
    let size=0,start=performance.now(),raf=0,visible=true;
    function paint(now){
      const phase=((now-start)/1000)%13;
      const progress=reduce.matches?1:Math.min(1,phase/4.8);
      const blend=1-Math.pow(1-progress,3);
      const dissolve=!reduce.matches&&phase>11?((phase-11)/2):0;
      const settle=blend*(1-dissolve);
      ctx.clearRect(0,0,size,size);
      dots.forEach((d,i)=>{
        const angle=i*2.39996+(1-progress)*Math.PI*6+phase*.12;
        const radius=.12+.31*Math.sqrt((i+1)/dots.length);
        const x=((.5+Math.cos(angle)*radius)*(1-settle)+d[0]*settle)*size;
        const y=((.5+Math.sin(angle)*radius)*(1-settle)+d[1]*settle)*size;
        ctx.fillStyle='#006568';ctx.beginPath();ctx.arc(x,y,d[2]*size*(.55+.45*settle),0,Math.PI*2);ctx.fill();
      });
    }
    function tick(now){raf=0;paint(now);if(!reduce.matches&&visible&&!document.hidden)raf=requestAnimationFrame(tick);}
    function resume(){cancelAnimationFrame(raf);raf=0;if(visible&&!document.hidden)tick(performance.now());}
    new ResizeObserver(()=>{size=logoCanvas.clientWidth;const dpr=Math.min(devicePixelRatio||1,2);logoCanvas.width=size*dpr;logoCanvas.height=size*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);paint(performance.now());core.classList.add('vortex-ready');}).observe(core);
    new IntersectionObserver(es=>{visible=es[0].isIntersecting;resume();}).observe(core);
    reduce.addEventListener('change',resume);document.addEventListener('visibilitychange',resume);
  }

  const reel=document.querySelector('.photo-reel');
  if(reel){
    const photos=Array.from(reel.querySelectorAll('.reel-photo'));let current=0;
    function showPhoto(step){current=(current+step+photos.length)%photos.length;photos.forEach((p,i)=>p.hidden=i!==current);document.getElementById('photo-count').textContent=`${current+1} / ${photos.length}`;}
    let timer=0,inView=false,hovered=false;
    function restart(){clearInterval(timer);timer=0;if(inView&&!hovered&&!reel.contains(document.activeElement)&&!document.hidden)timer=setInterval(()=>showPhoto(1),5000);}
    function manual(step){showPhoto(step);restart();}
    document.getElementById('photo-prev').addEventListener('click',()=>manual(-1));
    document.getElementById('photo-next').addEventListener('click',()=>manual(1));
    reel.addEventListener('mouseenter',()=>{hovered=true;restart();});reel.addEventListener('mouseleave',()=>{hovered=false;restart();});
    reel.addEventListener('focusin',restart);reel.addEventListener('focusout',()=>setTimeout(restart,0));document.addEventListener('visibilitychange',restart);
    new IntersectionObserver(es=>{inView=es[0].isIntersecting;restart();},{threshold:.2}).observe(reel);
    document.addEventListener('languagechange',()=>{reel.setAttribute('aria-label',tr('Photo gallery','Galería de fotos'));document.getElementById('photo-prev').setAttribute('aria-label',tr('Previous photo','Foto anterior'));document.getElementById('photo-next').setAttribute('aria-label',tr('Next photo','Foto siguiente'));});
    let touchX=0;reel.addEventListener('touchstart',e=>{touchX=e.changedTouches[0].screenX;clearInterval(timer);},{passive:true});reel.addEventListener('touchend',e=>{const dx=e.changedTouches[0].screenX-touchX;if(Math.abs(dx)>50)manual(dx<0?1:-1);else restart();},{passive:true});
  }
  updateLanguage();
})();
