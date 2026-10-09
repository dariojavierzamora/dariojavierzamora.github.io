(() => {
  const root=document.getElementById('publication-matrix');
  if(!root||!window.RESEARCH_DATA)return;
  const papers=window.RESEARCH_DATA.papers;
  const rows=[
    ['Solar Wind','Viento solar',[[],[],[2,4,9]]],
    ['Ionosphere & Space Climate','Ionosfera y clima espacial',[[5],[],[6,7,8]]],
    ['Random Walks','Caminatas aleatorias',[[11],[10],[]]],
    ['XY Model & Complexity','Modelo XY y complejidad',[[],[3,13],[]]],
    ['Cosmology','Cosmología',[[12,15,16],[],[]]],
    ['Self-Gravitating Systems','Sistemas autogravitantes',[[17,18,19,20,21,22],[],[]]],
    ['Nonextensive Statistics','Estadística no extensiva',[[23,25],[14],[1]]],
    ['Nonlinear Quantum Physics','Física cuántica no lineal',[[24,28],[],[]]],
    ['Condensed Matter','Materia condensada',[[],[],[26,27]]]
  ];
  const methods=[['Theory','Teoría'],['Simulation','Simulación'],['Data Analysis','Análisis de datos']];
  const tr=(en,es)=>document.documentElement.dataset.lang==='es'?es:en;
  let selected=null;
  const detail=document.getElementById('matrix-detail');
  const table=document.createElement('table');table.className='research-matrix';
  const caption=document.createElement('caption');caption.textContent=tr('Publications by topic and dominant methodology','Publicaciones por tema y metodología dominante');table.append(caption);
  const head=table.createTHead().insertRow();
  for(const title of [tr('Topic','Tema'),...methods.map(m=>tr(...m))]){const th=document.createElement('th');th.scope='col';th.textContent=title;head.append(th);}
  const body=table.createTBody();
  function select(id,row,method){
    selected={id,row,method};const p=papers.find(p=>p.id===id);detail.replaceChildren();
    const category=document.createElement('p');category.className='eyebrow';category.textContent=tr(row[0],row[1])+' · '+tr(...methods[method]);
    const title=document.createElement('h3');title.textContent=p.title;
    const meta=document.createElement('p');meta.className='muted';meta.textContent=p.year+' · '+p.authors.join(', ');
    const venue=document.createElement('p');venue.textContent=p.venue;
    const link=document.createElement('a');link.className='text-link';link.href=p.url;link.target='_blank';link.rel='noopener';link.textContent=tr('Read publication ↗','Leer publicación ↗');
    detail.append(category,title,meta,venue,link);
    if(id===11){const note=document.createElement('p');note.className='muted small';note.textContent=tr('This work combines theory and numerical methods.','Este trabajo combina teoría y métodos numéricos.');detail.append(note);}
    root.querySelectorAll('.matrix-dot').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.id)===id)));
  }
  rows.forEach(row=>{
    const r=body.insertRow(),th=document.createElement('th');th.scope='row';th.textContent=tr(row[0],row[1]);r.append(th);
    row[2].forEach((ids,method)=>{const cell=r.insertCell();
      if(!ids.length){cell.textContent='—';cell.className='matrix-empty';return;}
      const wrap=document.createElement('div');wrap.className='matrix-dots';
      ids.forEach(id=>{const p=papers.find(p=>p.id===id),b=document.createElement('button');b.type='button';b.className='matrix-dot method-'+method;b.dataset.id=id;b.title=p.year+' · '+p.title;b.setAttribute('aria-label',p.year+' · '+p.title);b.setAttribute('aria-pressed','false');b.textContent='●';b.addEventListener('click',()=>select(id,row,method));wrap.append(b);});cell.append(wrap);
    });
  });
  document.getElementById('matrix-table').append(table);
  document.addEventListener('languagechange',()=>{
    caption.textContent=tr('Publications by topic and dominant methodology','Publicaciones por tema y metodología dominante');
    Array.from(head.cells).forEach((c,i)=>c.textContent=i?tr(...methods[i-1]):tr('Topic','Tema'));
    Array.from(body.rows).forEach((r,i)=>r.cells[0].textContent=tr(rows[i][0],rows[i][1]));
    if(selected)select(selected.id,selected.row,selected.method);
  });
})();
