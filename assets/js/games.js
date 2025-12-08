// Simple tab/filter for games listing
(function(){
  const tabs = document.querySelectorAll('.tab');
  const cards = document.querySelectorAll('.game-card');

  function setFilter(filter){
    tabs.forEach(t=> t.classList.toggle('active', t.getAttribute('data-filter')===filter));
    cards.forEach(c=>{
      const cat = c.getAttribute('data-category')||'all';
      if(filter==='all' || cat===filter) c.classList.remove('hidden'); else c.classList.add('hidden');
    });
  }

  tabs.forEach(t=> t.addEventListener('click', ()=> setFilter(t.getAttribute('data-filter'))));

  // initial filter
  setFilter('all');

  // Add smooth scroll animation for cards
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, index * 100);
      }
    });
  }, { threshold: 0.1 });

  cards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
  });
})();
