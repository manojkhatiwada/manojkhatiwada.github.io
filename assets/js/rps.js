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
  const winsEl = document.getElementById('wins');
  const lossesEl = document.getElementById('losses');
  const tiesEl = document.getElementById('ties');
  const resetBtn = document.getElementById('resetScore');
  const graffitiCanvas = document.getElementById('graffitiCanvas');
  const playerIcon = document.getElementById('playerIcon');
  const computerIcon = document.getElementById('computerIcon');
  const vsText = document.getElementById('vsText');

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

  function getChoiceEmoji(choice) {
    if (choice === 'rock') return '🪨';
    if (choice === 'paper') return '📄';
    if (choice === 'scissors') return '✂️';
    return '❓';
  }

  function showBattleAnimation(playerChoice, computerChoice, outcome) {
    try {
      // Reset previous animation
      playerIcon.className = 'choice-icon player';
      computerIcon.className = 'choice-icon computer';
      vsText.classList.remove('show');

      // Show both choices immediately
      playerIcon.textContent = getChoiceEmoji(playerChoice);
      computerIcon.textContent = getChoiceEmoji(computerChoice);

      // Show VS text after a brief moment
      setTimeout(() => {
        vsText.classList.add('show');
      }, 500);

      // Apply winner/loser animations
      setTimeout(() => {
        if (outcome === 'win') {
          playerIcon.classList.add('winner');
          computerIcon.classList.add('loser');
        } else if (outcome === 'loss') {
          playerIcon.classList.add('loser');
          computerIcon.classList.add('winner');
        }
        // For tie, both stay neutral
      }, 1000);

      // Reset arena after animation completes
      setTimeout(() => {
        playerIcon.textContent = '';
        computerIcon.textContent = '';
        playerIcon.className = 'choice-icon player';
        computerIcon.className = 'choice-icon computer';
        vsText.classList.remove('show');
      }, 3000);
    } catch (e) {
      console.warn('Battle animation failed', e);
    }
  }

  // main handler
  function play(playerChoice, playerBtn) {
    // Show player choice immediately in battle arena
    playerIcon.textContent = getChoiceEmoji(playerChoice);
    playerIcon.className = 'choice-icon player';
    computerIcon.textContent = '';
    computerIcon.className = 'choice-icon computer';
    vsText.classList.remove('show');

    // Wait 2 seconds before computer makes decision
    setTimeout(() => {
      const computerChoice = computerPick();
      const outcome = decide(playerChoice, computerChoice);

      // Show battle animation with computer choice
      showBattleAnimation(playerChoice, computerChoice, outcome);

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

      // pulse scoreboard briefly
      const winsBox = winsEl.parentElement;
      winsBox.classList.add('pulse');
      setTimeout(() => winsBox.classList.remove('pulse'), 400);
    }, 2000);
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
  });

  // init UI from session
  const initial = readScore();
  updateScoreboardUI(initial);

})();
