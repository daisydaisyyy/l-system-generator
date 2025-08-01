let instr = '';
let isAnimating = false;
let curStep = 0;
let animId = null;


// functions 
function resetCanvas(ctx) {
  ctx.save();
  ctx.reset();
  // debug, changes color at every reset
  //ctx.fillStyle = `rgb(${Math.floor(Math.random() * 256)} ${Math.floor(Math.random() * 128)} ${Math.floor(Math.random() * 256)})`;
  
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.restore(); // doesn't change settings for others
  curStep = 0;
  isAnimating = false;
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
  const startxInput = document.querySelector('#startxInput');
  const startyInput = document.querySelector('#startyInput');
  const scaleInput = document.querySelector('#scaleInput');
  

  startBtn.addEventListener('click', () => {
    const scale = parseInt(scaleInput.value);
    if(scale != 5) {
      ctx.canvas.width = ctx.canvas.clientWidth / (scale / 5);
      ctx.canvas.height = ctx.canvas.clientHeight / (scale / 5);
    } else {
      ctx.canvas.width = ctx.canvas.clientWidth;
      ctx.canvas.height = ctx.canvas.clientHeight;
    }

    resetCanvas(ctx);

    ctx.translate(ctx.canvas.width/2 + parseFloat(startxInput.value), ctx.canvas.height*15/16 - parseFloat(startyInput.value));
    ctx.strokeStyle = '#0f0';
    ctx.lineWidth = 2;
    try {
      instr = generateLSystem(axiomInput.value, parseRules(rulesInput.value), parseInt(depthInput.value));
      console.log(instr);

      let rot = setRot(instr, parseFloat(angleInput.value));
      //rot = 0;
      console.log("rot: " + rot*Math.PI/180);
      ctx.rotate( rot*Math.PI/180);
    
      // Reset animation state
      curStep = 0;
      isAnimating = true;
  
      // Start animation
      animId = setInterval(() => animateDrawing(ctx), 0);
  
    } catch(e) {
      isAnimating = false;
      clearInterval(animId);
      console.error(e);
      alert("Too many instructions. Retry with a lower depth.");
    }
    
  });

  pauseBtn.addEventListener('click', () => {
    // console.log("step: " + currentStep + "len: " + instructions.length);
    if(curStep != 0) { // if the drawing is finished, do nothing
      if (isAnimating) {
        isAnimating = false;
        pauseBtn.textContent = 'Resume';
        clearInterval(animId);
      } else {
        isAnimating = true;
        pauseBtn.textContent = 'Pause';
        animId = setInterval(() => animateDrawing(ctx), 0);
      }
    }
   
  });

  resetBtn.addEventListener('click', () => {
    isAnimating = false;
    curStep = 0;
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

