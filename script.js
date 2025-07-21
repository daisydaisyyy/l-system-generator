let instructions = '';
let animId = null;
let isAnimating = false;
let currentStep = 0;
let animationState = null;

// functions 
function resetCanvas(ctx) {
  ctx.save();
  ctx.reset();
  // debug, changes color at every reset
  ctx.fillStyle = `rgb(${Math.floor(Math.random() * 256)} ${Math.floor(Math.random() * 128)} ${Math.floor(Math.random() * 256)})`;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.restore(); // doesn't change settings for others
  // ctx.beginPath();
}

// Helper to parse rules
function parseRules(str) {
  return str.split(';').reduce((obj, pair) => {
    const [k,v] = pair.split('='); if(k && v) obj[k]=v; return obj;
  }, {});
}

// Recupera token da localStorage/session
function getSessionToken() {
  return localStorage.getItem('sessionToken') || '';
}


// events
document.addEventListener('DOMContentLoaded', e => {
  const canvas = document.getElementById('plantCanvas');
  canvas.width = canvas.clientWidth; canvas.height = canvas.clientHeight;
  // TODO: fix reponsive when resizing
  // responsive to resizing
  window.addEventListener("resize", e => {
    canvas.width = canvas.clientWidth * (parseInt(depthInput.value) +1); canvas.height = canvas.clientHeight * (parseInt(depthInput.value)+1);
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

  startBtn.addEventListener('click', () => {
    
    if(parseInt(depthInput.value) != 0) {
      ctx.canvas.width = ctx.canvas.clientWidth * 0.25 * (parseInt(depthInput.value));
      ctx.canvas.height = ctx.canvas.clientHeight * 0.25 * (parseInt(depthInput.value));
    } else {
      ctx.canvas.width = ctx.canvas.clientWidth * 0.25 ;
      ctx.canvas.height = ctx.canvas.clientHeight * 0.25 ;
   
    }

    resetCanvas(ctx);
    ctx.translate(ctx.canvas.width/2, ctx.canvas.height*15/16);
    
    ctx.strokeStyle = '#0f0';
    ctx.lineWidth = 2;
    instructions = generateLSystem(axiomInput.value, parseRules(rulesInput.value), parseInt(depthInput.value));
    console.log(instructions);
    
    // Reset animation state
    currentStep = 0;
    isAnimating = true;
    animationState = {
      x: 0,
      y: 0,
      angle: -90,
      stack: []
    };
    
    // Start animation
    animateDrawing(ctx);
  });

  pauseBtn.addEventListener('click', () => {
    if (isAnimating) {
      cancelAnimationFrame(animId);
      isAnimating = false;
      pauseBtn.textContent = 'Resume';
    } else {
      isAnimating = true;
      pauseBtn.textContent = 'Pause';
      animateDrawing(ctx);
    }
  });

  resetBtn.addEventListener('click', () => {
    cancelAnimationFrame(animId);
    isAnimating = false;
    animId = null;
    currentStep = 0;
    resetCanvas(ctx);
    pauseBtn.textContent = 'Pause';
  });

  saveBtn.addEventListener('click', () => {
    const genome = {
      axiom: axiomInput.value,
      rules: parseRules(rulesInput.value),
      depth: parseInt(depthInput.value),
      angle: parseInt(angleInput.value)
    };
    const compressed = compressGenome(genome);
    fetch('/api/save.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: getSessionToken(), genome: compressed })
    }).then(res => res.json()).then(console.log);
  });
});

