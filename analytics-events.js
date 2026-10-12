(() => {
 const send=(event,params)=>{if(typeof window.gtag==='function')window.gtag('event',event,params);};
 document.addEventListener('click',e=>{
   const link=e.target.closest('a');
   if(!link)return;
   const paper=link.closest('.pub-item');
   if(paper)send('publication_click',{publication_title:paper.querySelector('.pub-title')?.textContent.trim(),link_url:link.href});
 });
 const search=document.getElementById('pub-search');
 let timer,last='';
 search?.addEventListener('input',()=>{
   clearTimeout(timer);
   timer=setTimeout(()=>{const q=search.value.trim();if(q&&q!==last){last=q;send('publication_search',{result_count:document.querySelectorAll('.pub-item:not([hidden])').length});}},1200);
 });
 ['pub-year','pub-type'].forEach(id=>document.getElementById(id)?.addEventListener('change',e=>send('publication_filter',{filter_type:id,filter_value:e.target.value})));
})();
