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
  ctx.fillStyle = `rgb(${Math.floor(Math.random() * 256)} ${Math.floor(Math.random() * 256)} ${Math.floor(Math.random() * 256)})`;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.restore(); // doesn't change settings for others
  // ctx.beginPath();
}

function animateDrawing(ctx) {
  if (!isAnimating || currentStep >= instructions.length) {
    isAnimating = false;
    return;
  }

  const cmd = instructions[currentStep];
  const angle = parseInt(angleInput.value);
  const stepSize = 10;

  switch (cmd) {
    case 'F':
      ctx.beginPath();
      ctx.moveTo(animationState.x, animationState.y);
      animationState.x += Math.cos(animationState.angle * Math.PI/180) * stepSize;
      animationState.y += Math.sin(animationState.angle * Math.PI/180) * stepSize;
      ctx.lineTo(animationState.x, animationState.y);
      ctx.stroke();
      break;

    case 'f':
      animationState.x += Math.cos(animationState.angle * Math.PI/180) * stepSize;
      animationState.y += Math.sin(animationState.angle * Math.PI/180) * stepSize;
      break;

    case '+':
      animationState.angle += angle;
      break;

    case '-':
      animationState.angle -= angle;
      break;

    case '[':
      animationState.stack.push({
        x: animationState.x,
        y: animationState.y,
        angle: animationState.angle
      });
      break;

    case ']':
      if (animationState.stack.length > 0) {
        const saved = animationState.stack.pop();
        animationState.x = saved.x;
        animationState.y = saved.y;
        animationState.angle = saved.angle;
        ctx.beginPath();
        ctx.moveTo(animationState.x, animationState.y);
      }
      break;

    case '.':
      ctx.beginPath();
      ctx.arc(animationState.x, animationState.y, 3, 0, Math.PI*2);
      ctx.fillStyle = '#f00';
      ctx.fill();
      break;
  }

  currentStep++;
  animId = requestAnimationFrame(() => animateDrawing(ctx));
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

// Keep your existing generateLSystem function
function generateLSystem(axiom, rules, depth) {
  let current = axiom;
  for (let i = 0; i < depth; i++) {
    let next = '';
    for (const ch of current) {
      next += rules[ch] || ch;
    }
    current = next;
  }
  return current;
}




// events
document.addEventListener('DOMContentLoaded', e => {
  const canvas = document.getElementById('plantCanvas');
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  // TODO: fix reponsive when resizing
  // responsive to resizing
  // window.addEventListener("resize", e => {
  //   canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  // });
  canvas.style.scale = 1; // optional
  const ctx = canvas.getContext('2d');
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
    resetCanvas(ctx);
    ctx.translate(canvas.width/2, canvas.height);
    
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

