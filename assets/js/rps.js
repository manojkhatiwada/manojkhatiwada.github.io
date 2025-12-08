// Simple Rock Paper Scissors game
// Tracks wins/losses/ties in sessionStorage for the browser session

(function () {
  // quick runtime marker to confirm the script loaded
  console.log('rps.js loaded');

  // debug banner (created dynamically) to show runtime errors on the page
  const debugBanner = (function createDebug(){
    const el = document.createElement('div');
    el.className = 'rps-debug';
    el.id = 'rpsDebug';
    el.innerHTML = '<strong>RPS Error</strong><small id="rpsDebugMsg"></small>';
    document.body.appendChild(el);
    return el;
  })();

  function showDebug(msg){
    try{
      const msgEl = document.getElementById('rpsDebugMsg');
      if(msgEl) msgEl.textContent = msg;
      debugBanner.classList.add('show');
      console.error('RPS DEBUG:', msg);
    }catch(e){console.error(e)}
  }

  window.addEventListener('error', function(ev){
    showDebug((ev && ev.message) ? ev.message : String(ev));
  });
  window.addEventListener('unhandledrejection', function(ev){
    showDebug((ev && ev.reason) ? String(ev.reason) : 'Unhandled promise rejection');
  });
  const choices = ["rock", "paper", "scissors"];

  // DOM
  const btns = document.querySelectorAll('.rps-buttons button');
  const resultEl = document.getElementById('result');
  const choiceDisplay = document.getElementById('choiceDisplay');
  const winsEl = document.getElementById('wins');
  const lossesEl = document.getElementById('losses');
  const tiesEl = document.getElementById('ties');
  const resetBtn = document.getElementById('resetScore');
  const seriesWinsEl = document.getElementById('seriesWins');
  const seriesLossesEl = document.getElementById('seriesLosses');
  const graffitiCanvas = document.getElementById('graffitiCanvas');

  // scoreboard in sessionStorage under key 'rpsScore'
  function readScore() {
    try {
      const raw = sessionStorage.getItem('rpsScore');
      if (!raw) return { wins: 0, losses: 0, ties: 0 };
      return JSON.parse(raw);
    } catch (e) {
      return { wins: 0, losses: 0, ties: 0 };
    }
  }

  function writeScore(score) {
    try {
      sessionStorage.setItem('rpsScore', JSON.stringify(score));
    } catch (e) {
      // ignore storage errors
    }
  }

  function updateScoreboardUI(score) {
    winsEl.textContent = score.wins;
    lossesEl.textContent = score.losses;
    tiesEl.textContent = score.ties;
  }

  // series (best of 3) -- in-memory for current series
  let seriesWins = 0;
  let seriesLosses = 0;

  function updateSeriesUI() {
    if (!seriesWinsEl || !seriesLossesEl) {
      // surface debug if elements are missing
      showDebug('Series UI elements not found (seriesWins / seriesLosses).');
      console.warn('seriesWinsEl or seriesLossesEl is null', {seriesWinsEl, seriesLossesEl});
      return;
    }
    seriesWinsEl.textContent = seriesWins;
    seriesLossesEl.textContent = seriesLosses;
  }

  function computerPick() {
    const i = Math.floor(Math.random() * choices.length);
    return choices[i];
  }

  // create confetti burst using DOM elements
  function showConfetti(xPercent) {
    try {
      const container = document.createElement('div');
      container.className = 'rps-confetti';
      const colors = ['#ef4444','#f97316','#facc15','#10b981','#06b6d4','#3b82f6','#8b5cf6'];
      const count = 18;
      for (let i = 0; i < count; i++) {
        const el = document.createElement('span');
        el.className = 'confetti-piece';
        const left = Math.max(5, Math.min(95, xPercent + (Math.random() * 20 - 10)));
        el.style.left = left + '%';
        el.style.top = (Math.random() * -10) + 'vh';
        el.style.background = colors[Math.floor(Math.random() * colors.length)];
        el.style.transform = `rotate(${Math.random()*360}deg) translateX(0)`;
        el.style.animationDelay = (Math.random() * 120) + 'ms';
        el.style.width = (6 + Math.random()*10) + 'px';
        el.style.height = (8 + Math.random()*14) + 'px';
        container.appendChild(el);
      }
      document.body.appendChild(container);
      // remove after animation
      setTimeout(() => { container.remove(); }, 1400);
    } catch (e) {
      // ignore
    }
  }

  // graffiti painting on canvas when series is won
  function showGraffiti(winner) {
    try {
      if (!graffitiCanvas) return;
      const canvas = graffitiCanvas;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      canvas.classList.add('graffiti-show');

      // paint colorful splashes
      const colors = ['#ff3b30','#ff9500','#ffcc00','#34c759','#0aa5ff','#5856d6','#ff2d55'];
      function splatter(x,y,r,color){
        for(let i=0;i<30;i++){
          const rx = x + (Math.random()-0.5)*r*3;
          const ry = y + (Math.random()-0.5)*r*3;
          const rr = Math.random()*r/2;
          const g = ctx.createRadialGradient(rx,ry,0,rx,ry,rr*2);
          g.addColorStop(0,color);
          g.addColorStop(1,'rgba(0,0,0,0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(rx,ry,rr,0,Math.PI*2);
          ctx.fill();
        }
      }

      // animate splatters
      let ticks = 0;
      const interval = setInterval(()=>{
        const x = Math.random()*canvas.width;
        const y = Math.random()*canvas.height;
        const r = 40 + Math.random()*140;
        const c = colors[Math.floor(Math.random()*colors.length)];
        splatter(x,y,r,c);
        ticks++;
        if(ticks>18){
          clearInterval(interval);
          // draw big text
          ctx.save();
          const txt = winner === 'player' ? 'YOU WON!!' : 'COMPUTER WON!!';
          ctx.font = `bold ${Math.max(36, Math.round(canvas.width/10))}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          // multi-layered stroke & fill for graffiti effect
          ctx.lineWidth = Math.max(6, Math.round(canvas.width/200));
          ctx.strokeStyle = '#111';
          ctx.strokeText(txt, canvas.width/2, canvas.height/2);
          // colorful fills
          for(let i=0;i<6;i++){
            ctx.fillStyle = colors[i%colors.length];
            const dx = (Math.random()-0.5)*40;
            const dy = (Math.random()-0.5)*40;
            ctx.fillText(txt, canvas.width/2 + dx, canvas.height/2 + dy);
          }
          ctx.restore();

          // remove after delay
          setTimeout(()=>{
            canvas.classList.remove('graffiti-show');
            // clear with fade
            setTimeout(()=>{ ctx.clearRect(0,0,canvas.width,canvas.height); }, 300);
          }, 2200);
        }
      }, 90);
    } catch(e){
      // ignore
    }
  }

  // show a short joke/message when computer wins the series
  function showComputerWinJoke() {
    try {
      const jokes = [
        "Computer: I only won because you let me practice in the cloud.",
        "Computer: Don't worry — it's just a software update glitch.",
        "Computer: I promise I won't gloat... much.",
        "Computer: I used rock-paper-scissors AI (v0.1). Results: predictable.",
        "Computer: You played well. My algorithms just had coffee."
      ];
      const text = jokes[Math.floor(Math.random()*jokes.length)];

      const el = document.createElement('div');
      el.className = 'series-msg pop';
      el.innerHTML = `<div class="title">Computer wins the series</div><div class="body">${text}</div>`;
      document.body.appendChild(el);
      // show
      requestAnimationFrame(()=> el.classList.add('show'));
      // remove after short delay
      setTimeout(()=>{
        el.classList.remove('show');
        setTimeout(()=> el.remove(), 350);
      }, 2500);
    } catch (e) {
      console.warn('showComputerWinJoke failed', e);
    }
  }

  function decide(player, computer) {
    if (player === computer) return 'tie';
    if (
      (player === 'rock' && computer === 'scissors') ||
      (player === 'paper' && computer === 'rock') ||
      (player === 'scissors' && computer === 'paper')
    ) return 'win';
    return 'loss';
  }

  function niceChoiceLabel(choice) {
    if (choice === 'rock') return '🪨 Rock';
    if (choice === 'paper') return '📄 Paper';
    if (choice === 'scissors') return '✂️ Scissors';
    return choice;
  }

  // main handler
  function play(playerChoice, playerBtn) {
    const computerChoice = computerPick();
    const outcome = decide(playerChoice, computerChoice);

    // update display
    choiceDisplay.textContent = `You: ${niceChoiceLabel(playerChoice)} — Computer: ${niceChoiceLabel(computerChoice)}`;

    let message = '';
    if (outcome === 'win') message = 'You win! 🎉';
    else if (outcome === 'loss') message = 'You lose. 😕';
    else message = "It's a tie. 🤝";

    // set result class for color/animation
    resultEl.textContent = message;
    resultEl.classList.remove('win','loss','tie');
    resultEl.classList.add(outcome === 'win' ? 'win' : outcome === 'loss' ? 'loss' : 'tie');

    // animate player button and computer button
    try {
      // find the button for computer choice
      const compBtn = document.querySelector(`.rps-buttons button[data-choice="${computerChoice}"]`);
      if (outcome === 'win') {
        playerBtn.classList.add('btn-win');
        if (compBtn) compBtn.classList.add('btn-lose');
        // show confetti roughly near player's button (use button center)
        const rect = playerBtn.getBoundingClientRect();
        const xPercent = ((rect.left + rect.width/2) / window.innerWidth) * 100;
        showConfetti(xPercent);
      } else if (outcome === 'loss') {
        if (playerBtn) playerBtn.classList.add('btn-lose');
        if (compBtn) compBtn.classList.add('btn-win');
        const rect = compBtn ? compBtn.getBoundingClientRect() : playerBtn.getBoundingClientRect();
        const xPercent = ((rect.left + rect.width/2) / window.innerWidth) * 100;
        showConfetti(xPercent);
      } else {
        // tie pulse both
        if (playerBtn) playerBtn.classList.add('btn-win');
        if (compBtn) compBtn.classList.add('btn-win');
      }
    } catch (e) {
      // ignore animation errors
    }

    // cleanup animation classes after they finish
    setTimeout(() => {
      btns.forEach(b => b.classList.remove('btn-win','btn-lose'));
      resultEl.classList.remove('win','loss','tie');
    }, 900);

    // update score
    const score = readScore();
    if (outcome === 'win') score.wins += 1;
    else if (outcome === 'loss') score.losses += 1;
    else score.ties += 1;
    writeScore(score);
    updateScoreboardUI(score);

  // update series (best of 3)
  if (outcome === 'win') { seriesWins += 1; console.log('seriesWins ->', seriesWins); }
  else if (outcome === 'loss') { seriesLosses += 1; console.log('seriesLosses ->', seriesLosses); }
  updateSeriesUI();

    // check for series winner (first to 2)
    if (seriesWins >= 2 || seriesLosses >= 2) {
      const winner = seriesWins >= 2 ? 'player' : 'computer';
      // Only show graffiti when the human player wins the series
      if (winner === 'player') {
        showGraffiti('player');
        // small celebratory confetti near center
        showConfetti(50);
      } else {
        // Computer won the series: no graffiti (per user request).
        // You could add a subtle visual here if you like (e.g. a short message).
      }
      // reset series after short delay
      setTimeout(()=>{
        seriesWins = 0; seriesLosses = 0; updateSeriesUI();
      }, 2600);
    }

    // pulse scoreboard briefly
    const winsBox = winsEl.parentElement;
    winsBox.classList.add('pulse');
    setTimeout(() => winsBox.classList.remove('pulse'), 400);
  }

  // wire buttons
  btns.forEach((b) => {
    b.addEventListener('click', () => {
      const choice = b.getAttribute('data-choice');
      play(choice, b);
    });
  });

  resetBtn.addEventListener('click', () => {
    const score = { wins: 0, losses: 0, ties: 0 };
    writeScore(score);
    updateScoreboardUI(score);
    resultEl.textContent = 'Score reset.';
    choiceDisplay.textContent = 'Make a choice to start';
  });

  // init UI from session
  const initial = readScore();
  updateScoreboardUI(initial);

  // initialize series UI to ensure elements are populated
  try{
    updateSeriesUI();
  }catch(e){
    console.warn('Failed to initialize series UI', e);
  }

})();
