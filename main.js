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
    function label(){toggle.innerHTML=paused?tr('Resume motion','Activar movimiento'):tr('Pause motion','Pausar movimiento');toggle.setAttribute('aria-pressed',String(paused));hero.classList.toggle('motion-paused',paused)}
    toggle.addEventListener('click',()=>{paused=!paused;label();resume()});reduce.addEventListener('change',e=>{paused=e.matches;label();resume()});document.addEventListener('languagechange',label);document.addEventListener('visibilitychange',resume);
    new IntersectionObserver(es=>{visible=es[0].isIntersecting;hero.classList.toggle('motion-paused',paused||!visible);resume()}).observe(hero);
    new ResizeObserver(resize).observe(hero);resize();label();resume();
  }
  updateLanguage();
})();
