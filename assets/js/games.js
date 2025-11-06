// Simple tab/filter for games listing
(function(){
  const tabs = document.querySelectorAll('.tab');
  const cards = document.querySelectorAll('.game-card');
  const modal = document.getElementById('gameModal');
  const iframe = document.getElementById('gameFrame');
  const closeBtn = document.getElementById('closeGame');
  const openNewTab = document.getElementById('openNewTab');

  function setFilter(filter){
    tabs.forEach(t=> t.classList.toggle('active', t.getAttribute('data-filter')===filter));
    cards.forEach(c=>{
      const cat = c.getAttribute('data-category')||'all';
      if(filter==='all' || cat===filter) c.classList.remove('hidden'); else c.classList.add('hidden');
    });
  }

  tabs.forEach(t=> t.addEventListener('click', ()=> setFilter(t.getAttribute('data-filter'))));
  // initial
  setFilter('all');

  // open game in embedded iframe
  cards.forEach(c => {
    c.addEventListener('click', (e) => {
      e.preventDefault();
      const href = c.getAttribute('href') || c.dataset.link;
      if(!href) return;
      iframe.src = href;
      openNewTab.href = href;
      modal.classList.add('show');
      modal.setAttribute('aria-hidden', 'false');
    });
  });

  function closeModal(){
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    // stop running content
    try{ iframe.src = 'about:blank'; }catch(e){}
  }

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (ev)=>{ if(ev.target===modal) closeModal(); });
})();
