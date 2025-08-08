let instr = '';
let isAnimating = false;
let curStep = 0;
let animId = null;
let stepSize = 10;

function resetCanvas(ctx) {
  ctx.save();
  ctx.reset();
  // debug, changes color at every reset
  //ctx.fillStyle = `rgb(${Math.floor(Math.random() * 256)} ${Math.floor(Math.random() * 128)} ${Math.floor(Math.random() * 256)})`;

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.restore(); // doesn't change settings for others
  curStep = 0;
  isAnimating = false;
}

// helper to parse rules
function parseRules(str) {
  return str.split(';').reduce((obj, pair) => {
    const [k, v] = pair.split('='); if (k && v) obj[k] = v; return obj;
  }, {});
}

function getSessionToken() {
  return localStorage.getItem('sessionToken') || '';
}

// events
document.addEventListener('DOMContentLoaded', e => {
  const canvas = document.getElementById('plantCanvas');
  canvas.width = canvas.clientWidth; canvas.height = canvas.clientHeight;
  window.addEventListener("resize", e => {
    canvas.width = canvas.clientWidth * (parseInt(depthInput.value) + 1); canvas.height = canvas.clientHeight * (parseInt(depthInput.value) + 1);
    handleReset();
  });

  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  const startBtn = document.getElementById('startBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const resetBtn = document.getElementById('resetBtn');
  const saveBtn = document.getElementById('saveBtn');

  // input parameters
  const axiomInput = document.getElementById('axiomInput');
  const rulesInput = document.getElementById('rulesInput');
  const depthInput = document.getElementById('depthInput');
  const angleInput = document.getElementById('angleInput');
  const startxInput = document.getElementById('startxInput');
  const startyInput = document.getElementById('startyInput');
  const scaleInput = document.getElementById('scaleInput');
  const rotInput = document.getElementById('rotInput');
  const centerChx = document.getElementById('centerChx');
  const centerSelect = document.getElementById('centerSelect');

  // disable/enables parameters
  const config_params = [...document.querySelectorAll('.config')];
  function changeEnabledState(state) {
    config_params.map(el => el.disabled = state);
    if (centerSelect.value !== "no") state = true;
    startyInput.disabled = state;
    startxInput.disabled = state;
  }

  startBtn.addEventListener('click', () => {
    handleReset();
    changeEnabledState(true);
    startBtn.innerText = 'Restart';

    const scale = parseInt(scaleInput.value);
    
    if (scale != 5) {
      ctx.canvas.width = ctx.canvas.clientWidth / (scale / 5);
      ctx.canvas.height = ctx.canvas.clientHeight / (scale / 5);
    } else {
      ctx.canvas.width = ctx.canvas.clientWidth;
      ctx.canvas.height = ctx.canvas.clientHeight;
    }

    resetCanvas(ctx);

    ctx.translate(ctx.canvas.width / 2 + parseFloat(startxInput.value), ctx.canvas.height / 2 - parseFloat(startyInput.value));
    ctx.strokeStyle = '#0f0';
    ctx.lineWidth = 2;
    try {
      instr = generateLSystem(axiomInput.value, parseRules(rulesInput.value), parseInt(depthInput.value));
      console.log(instr);

      let rot = parseInt(rotInput.value)
      // console.log("rot: " + rot*Math.PI/180);
      ctx.rotate(rot * Math.PI / 180);

      // reset animation state
      curStep = 0;
      isAnimating = true;

      // start animation
      animId = setInterval(() => {
        console.log("Animation");
        if (animateDrawing(ctx)) {
          clearInterval(animId);
          changeEnabledState(false);
          startBtn.innerText = 'Start';
        }
      }, 0);
    } catch (e) {
      isAnimating = false;
      clearInterval(animId);
      console.error(e);
      alert("Too many instructions. Retry with a lower depth.");
    }

  });

  pauseBtn.addEventListener('click', () => {
    // console.log("step: " + currentStep + "len: " + instructions.length);
    if (curStep != 0) { // if the drawing is finished, do nothing
      if (isAnimating) {
        isAnimating = false;
        pauseBtn.innerText = 'Resume';
        clearInterval(animId);
      } else {
        isAnimating = true;
        pauseBtn.innerText = 'Pause';
        animId = setInterval(() => {
          console.log("Animation");
          if (animateDrawing(ctx)) {
            clearInterval(animId);

            changeEnabledState(false);
          }
        }, 0);
      }
    }

  });

  const handleReset = () => {
    centerSelect.disabled = false;
    isAnimating = false;
    curStep = 0;
    resetCanvas(ctx);
    pauseBtn.innerText = 'Pause';
    startBtn.innerText = 'Start';
    changeEnabledState(false);
  };

  resetBtn.addEventListener('click', handleReset);

  saveBtn.addEventListener('click', () => {
    const drawingConfig = {
      axiom: axiomInput.value,
      rules: parseRules(rulesInput.value),
      depth: parseInt(depthInput.value),
      angle: parseInt(angleInput.value),
      startx: parseInt(startxInput.value),
      starty: parseInt(startyInput.value),
      scale: parseInt(scaleInput.value),
      rot: parseInt(rotInput.value)
    };
    const compressed = compressDrawing(drawingConfig);
    fetch('/api/save.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: getSessionToken(), drawingConfig: compressed })
    }).then(res => res.json()).then(console.log);
  });


  let savedX = parseInt(startxInput.value);
  let savedY = parseInt(startyInput.value);

  const centerListener = () => {
    if (centerSelect.value !== "no" && !isAnimating) {
      startxInput.disabled = true; startyInput.disabled = true;
      savedX = parseInt(startxInput.value);
      savedY = parseInt(startyInput.value);
      let [x, y] = autoCenter(ctx);
      console.log("autoCenter: " + x + ", " + y);
      ctx.translate(x, y);
      startxInput.value = x;
      startyInput.value = y;
    }
    else {
      startxInput.value = savedX;
      startyInput.value = savedY;
      startxInput.disabled = false; startyInput.disabled = false;

    }
  };

  centerSelect.addEventListener('change', centerListener);
});

