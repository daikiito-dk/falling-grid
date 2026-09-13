(() => {
  const style = document.createElement('style');
  style.textContent = `
    .touch-controls{display:none}
    .touch-btn{border:1px solid #334155;border-radius:14px;background:linear-gradient(145deg,#182235,#0d1523);color:#e2e8f0;box-shadow:0 7px 18px #0005,inset 0 1px #ffffff08;min-height:52px;padding:0 12px;font:800 13px system-ui;touch-action:none;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent}
    .touch-btn:active{transform:translateY(1px);filter:brightness(1.25)}
    .touch-row{display:grid;gap:8px}
    .touch-actions{grid-template-columns:1fr 1fr 1fr 1.35fr;margin-bottom:8px}
    .touch-move{grid-template-columns:1fr 1fr 1fr}
    .touch-wide{background:linear-gradient(135deg,#7c3aed,#5b21b6);border-color:#7c3aed}
    @media(max-width:500px){
      .touch-controls{display:block;width:min(300px,92vw);margin:10px auto 0}
      .help{display:none}
      .touch-btn{min-height:56px;font-size:15px}
      .touch-actions .touch-btn:first-child{font-size:11px}
    }
  `;
  document.head.appendChild(style);

  const board = document.querySelector('.board-shell');
  const side = document.querySelector('.side');
  if (!board || !side) return;

  const controls = document.createElement('div');
  controls.className = 'touch-controls';
  controls.setAttribute('aria-label', 'Touch controls');
  controls.innerHTML = `
    <div class="touch-row touch-actions">
      <button class="touch-btn" data-action="hold" aria-label="Hold">HOLD</button>
      <button class="touch-btn" data-action="rotateCCW" aria-label="Rotate counterclockwise">↺</button>
      <button class="touch-btn" data-action="rotateCW" aria-label="Rotate clockwise">↻</button>
      <button class="touch-btn touch-wide" data-action="drop" aria-label="Hard drop">DROP</button>
    </div>
    <div class="touch-row touch-move">
      <button class="touch-btn" data-repeat="left" aria-label="Move left">←</button>
      <button class="touch-btn" data-repeat="down" aria-label="Soft drop">↓</button>
      <button class="touch-btn" data-repeat="right" aria-label="Move right">→</button>
    </div>`;
  board.insertAdjacentElement('afterend', controls);

  const state = {};
  const action = a => {
    if (a === 'left') window.move(-1);
    else if (a === 'right') window.move(1);
    else if (a === 'down') window.soft();
    else if (a === 'rotateCW') window.rotate(1);
    else if (a === 'rotateCCW') window.rotate(-1);
    else if (a === 'hold') window.hold();
    else if (a === 'drop') window.hard();
  };

  controls.querySelectorAll('.touch-btn').forEach(btn => {
    const once = btn.dataset.action;
    const repeat = btn.dataset.repeat;
    const key = once || repeat;
    const stop = e => {
      if (e) e.preventDefault();
      if (repeat && state[key]) {
        clearTimeout(state[key]);
        clearInterval(state[key]);
        delete state[key];
      }
    };
    btn.addEventListener('pointerdown', e => {
      e.preventDefault();
      if (btn.setPointerCapture) btn.setPointerCapture(e.pointerId);
      action(key);
      if (repeat) {
        clearTimeout(state[key]);
        state[key] = setTimeout(() => {
          clearInterval(state[key]);
          state[key] = setInterval(() => action(key), 70);
        }, 170);
      }
    }, {passive:false});
    btn.addEventListener('pointerup', stop, {passive:false});
    btn.addEventListener('pointercancel', stop, {passive:false});
  });
})();
