
(function(){
  const html = document.documentElement;
  const storedLang = localStorage.getItem('site-lang') || 'en';
  html.setAttribute('data-lang', storedLang);
  document.querySelectorAll('.lang-toggle button').forEach(btn => {
    if(btn.dataset.lang === storedLang) btn.classList.add('active');
    btn.addEventListener('click', () => {
      document.querySelectorAll('.lang-toggle button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      html.setAttribute('data-lang', btn.dataset.lang);
      localStorage.setItem('site-lang', btn.dataset.lang);
    });
  });

  const menuBtn = document.querySelector('.menu-btn');
  if(menuBtn){
    menuBtn.addEventListener('click', ()=>{
      const open = document.body.classList.toggle('menu-open');
      menuBtn.setAttribute('aria-expanded', String(open));
    });
  }

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, {threshold: .12});
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  const year = document.getElementById('year');
  if(year) year.textContent = new Date().getFullYear();

  const form = document.getElementById('contact-form');
  if(form){
    form.addEventListener('submit', ev => {
      ev.preventDefault();
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const message = document.getElementById('message').value.trim();
      const subject = encodeURIComponent(`Website contact from ${name}`);
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
      window.location.href = `mailto:djzamora@conicet.gov.ar?subject=${subject}&body=${body}`;
    });
  }

  const collabData = {
    home: {
      name: 'Darío Javier Zamora',
      city: 'San Miguel de Tucumán, Argentina',
      institution: 'INFINOA–CONICET / Universidad Nacional de Tucumán',
      lat: -26.8241,
      lng: -65.2226
    },
    collaborators: [
      {name:'Facundo M. Abaca', city:'San Miguel de Tucumán, Argentina', institution:'Universidad Nacional de Tucumán', relation:'Doctoral student / coauthor', lat:-26.8247, lng:-65.2221, kind:'arg'},
      {name:'Berta S. Zossi', city:'San Miguel de Tucumán, Argentina', institution:'LIANM / UNT', relation:'Coauthor', lat:-26.8252, lng:-65.2233, kind:'arg'},
      {name:'Ana G. Elias', city:'San Miguel de Tucumán, Argentina', institution:'LIANM / CONICET', relation:'Coauthor', lat:-26.8234, lng:-65.2214, kind:'arg'},
      {name:'Juan P. Olmos', city:'San Miguel de Tucumán, Argentina', institution:'Universidad Nacional de Tucumán', relation:'Coauthor', lat:-26.8226, lng:-65.2241, kind:'arg'},
      {name:'Carlos Tsallis', city:'Rio de Janeiro, Brazil', institution:'Centro Brasileiro de Pesquisas Físicas', relation:'Coauthor / nonextensive statistical mechanics', lat:-22.9068, lng:-43.1729, kind:'int'},
      {name:'Roberto Artuso', city:'Varese, Italy', institution:'Università degli Studi dell’Insubria', relation:'Academic collaboration / stochastic transport', lat:45.8206, lng:8.8250, kind:'int'},
      {name:'Petr Hellinger', city:'Ondřejov, Czech Republic', institution:'Astronomical Institute of the Czech Academy of Sciences', relation:'Solar-wind research contact', lat:49.9057, lng:14.7836, kind:'int'},
      {name:'Facundo Córdoba', city:'San Miguel de Tucumán, Argentina', institution:'Universidad Nacional de Tucumán', relation:'Student project', lat:-26.8261, lng:-65.2208, kind:'arg'}
    ]
  };

  function renderCollabList(data){
    const list = document.getElementById('collab-list');
    if(!list) return;
    list.innerHTML = data.collaborators.map(c => `
      <article class="collab-item">
        <h3>${c.name}</h3>
        <p>${c.institution}</p>
        <p>${c.city}</p>
        <p><strong>${c.relation}</strong></p>
      </article>
    `).join('');
  }

  function initCollabMap(){
    const mapEl = document.getElementById('collab-map');
    if(!mapEl || typeof L === 'undefined') return;
    renderCollabList(collabData);
    const map = L.map(mapEl, {scrollWheelZoom:false}).setView([12, -15], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const homeIcon = L.circleMarker([collabData.home.lat, collabData.home.lng], {
      radius:9, color:'#1d4ed8', weight:2, fillColor:'#1d4ed8', fillOpacity:.95
    }).addTo(map).bindPopup(`<strong>${collabData.home.name}</strong><br>${collabData.home.institution}<br>${collabData.home.city}`);

    const bounds = [[collabData.home.lat, collabData.home.lng]];
    collabData.collaborators.forEach(c => {
      const color = c.kind === 'arg' ? '#0f766e' : '#7c3aed';
      L.polyline([[collabData.home.lat, collabData.home.lng], [c.lat, c.lng]], {
        color, weight:2, opacity:.55, dashArray: c.kind === 'int' ? '7 7' : null
      }).addTo(map);
      L.circleMarker([c.lat, c.lng], {
        radius:7, color:'#ffffff', weight:1.5, fillColor:color, fillOpacity:.95
      }).addTo(map).bindPopup(`<strong>${c.name}</strong><br>${c.institution}<br>${c.city}<br><em>${c.relation}</em>`);
      bounds.push([c.lat, c.lng]);
    });
    map.fitBounds(bounds, {padding:[50,50]});
    setTimeout(()=>map.invalidateSize(), 200);
    homeIcon.openPopup();
  }

  initCollabMap();
})();
