/* Snake game implementation
 - Grid-based snake using canvas
 - Food types: normal (+1), bonus (+3), speed (+2 +speed boost), poison (-1)
 - Keyboard controls (arrow keys + WASD)
 - Score and highscore (localStorage)
*/

(function(){
  const canvas = document.getElementById('snakeCanvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const highEl = document.getElementById('highscore');
  const speedDisp = document.getElementById('speedDisp');
  const startBtn = document.getElementById('startBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const resetBtn = document.getElementById('resetBtn');

  const cellSize = 20;
  const cols = Math.floor(canvas.width / cellSize);
  const rows = Math.floor(canvas.height / cellSize);

  let snake = [];
  let dir = {x:1,y:0};
  let nextDir = null;
  let food = null;
  let score = 0;
  let high = Number(localStorage.getItem('snakeHigh')||0);
  let running = false;
  let gameInterval = null;
  let baseSpeed = 120; // ms per tick
  let speedMultiplier = 1.0;

  highEl.textContent = high;

  function resetGame(){
    snake = [ {x:Math.floor(cols/2), y:Math.floor(rows/2)} ];
    dir = {x:1,y:0}; nextDir = null; score = 0; speedMultiplier = 1.0; running = false;
    spawnFood(); draw(); updateHUD();
    stopLoop();
  }

  function startGame(){
    if(running) return;
    running = true;
    stopLoop();
    gameInterval = setInterval(tick, Math.max(40, baseSpeed / speedMultiplier));
  }

  function pauseGame(){
    running = false; stopLoop();
  }

  function stopLoop(){ if(gameInterval){ clearInterval(gameInterval); gameInterval=null; } }

  function updateLoopSpeed(){ if(gameInterval){ clearInterval(gameInterval); gameInterval = setInterval(tick, Math.max(40, baseSpeed / speedMultiplier)); } }

  function tick(){
    // update direction
    if(nextDir){ if(!(nextDir.x === -dir.x && nextDir.y === -dir.y)) dir = nextDir; nextDir = null; }

    // new head
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    // collisions: walls
    if(head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows){ return gameOver(); }

    // collisions: self
    for(let i=0;i<snake.length;i++){ if(snake[i].x===head.x && snake[i].y===head.y) return gameOver(); }

    snake.unshift(head);

    // check food
    if(food && head.x===food.x && head.y===food.y){
      applyFoodEffect(food.type);
      spawnFood();
    } else {
      snake.pop();
    }

    draw(); updateHUD();
  }

  function gameOver(){
    running = false; stopLoop();
    if(score > high){ high = score; localStorage.setItem('snakeHigh', String(high)); highEl.textContent = high; }
    showGameOver();
  }

  function showGameOver(){
    const overlay = document.createElement('div');
    overlay.className = 'game-over-overlay show';
    overlay.innerHTML = `<div class="title">Game Over</div><div class="sub">Score: ${score} — High: ${high}</div><div style="margin-top:12px"><button id='replayNow' style='padding:8px 12px;margin-top:12px'>Play Again</button></div>`;
    document.body.appendChild(overlay);
    document.getElementById('replayNow').addEventListener('click', ()=>{ overlay.remove(); resetGame(); startGame(); });
  }

  function applyFoodEffect(type){
    if(type==='normal'){ score += 1; }
    else if(type==='bonus'){ score += 3; }
    else if(type==='speed'){ score += 2; speedMultiplier *= 1.25; updateLoopSpeed(); setTimeout(()=>{ speedMultiplier /= 1.25; updateLoopSpeed(); }, 4500); }
    else if(type==='poison'){ score = Math.max(0, score-1); if(snake.length>1) snake.pop(); }
  }

  function spawnFood(){
    // choose random type with weights
    const types = [ ['normal',0.6], ['bonus',0.12], ['speed',0.18], ['poison',0.1] ];
    const r = Math.random(); let acc=0; let chosen='normal';
    for(const t of types){ acc+=t[1]; if(r<=acc){ chosen=t[0]; break; } }

    // find empty cell
    const maxAttempts = 2000; let attempts=0; let fx,fy; do{
      fx = Math.floor(Math.random()*cols); fy = Math.floor(Math.random()*rows); attempts++;
      let ok=true; for(let s of snake){ if(s.x===fx && s.y===fy){ ok=false; break; } }
      if(ok) break;
    } while(attempts<maxAttempts);
    food = {x:fx,y:fy,type:chosen};
  }

  function draw(){
    // clear
    ctx.fillStyle = '#071024'; ctx.fillRect(0,0,canvas.width,canvas.height);

    // grid subtle
    ctx.strokeStyle = 'rgba(255,255,255,0.02)'; ctx.lineWidth=1;
    for(let x=0;x<=cols;x++){ ctx.beginPath(); ctx.moveTo(x*cellSize,0); ctx.lineTo(x*cellSize,canvas.height); ctx.stroke(); }
    for(let y=0;y<=rows;y++){ ctx.beginPath(); ctx.moveTo(0,y*cellSize); ctx.lineTo(canvas.width,y*cellSize); ctx.stroke(); }

    // draw food
    if(food){
      if(food.type==='normal') ctx.fillStyle='#10b981';
      else if(food.type==='bonus') ctx.fillStyle='#ef4444';
      else if(food.type==='speed') ctx.fillStyle='#f59e0b';
      else if(food.type==='poison') ctx.fillStyle='#6b7280';
      ctx.fillRect(food.x*cellSize+2, food.y*cellSize+2, cellSize-4, cellSize-4);
    }

    // draw snake
    for(let i=0;i<snake.length;i++){
      const s = snake[i];
      ctx.fillStyle = i===0 ? '#60a5fa' : '#1e40af';
      ctx.fillRect(s.x*cellSize+1, s.y*cellSize+1, cellSize-2, cellSize-2);
    }
  }

  function updateHUD(){ scoreEl.textContent = score; speedDisp.textContent = (speedMultiplier).toFixed(2)+'x'; }

  // input
  window.addEventListener('keydown', (e)=>{
    const key = e.key;
    if(key==='ArrowUp' || key==='w' || key==='W') nextDir = {x:0,y:-1};
    else if(key==='ArrowDown' || key==='s' || key==='S') nextDir = {x:0,y:1};
    else if(key==='ArrowLeft' || key==='a' || key==='A') nextDir = {x:-1,y:0};
    else if(key==='ArrowRight' || key==='d' || key==='D') nextDir = {x:1,y:0};
  });

  startBtn.addEventListener('click', ()=> startGame());
  pauseBtn.addEventListener('click', ()=> pauseGame());
  resetBtn.addEventListener('click', ()=> { resetGame(); });

  // init
  resetGame();
  // spawn initial food
  spawnFood(); draw();

})();
