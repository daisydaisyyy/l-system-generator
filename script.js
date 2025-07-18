
const canvas = document.getElementById('plantCanvas');
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

let instructions = '';
let animId;

// events
startBtn.addEventListener('click', () => {
  resetCanvas();
  instructions = generateLSystem(axiomInput.value, parseRules(rulesInput.value), parseInt(depthInput.value));
  drawInstructions(ctx, instructions, parseInt(angleInput.value));
});

// TODO: fix cancelAnimationFrame
pauseBtn.addEventListener('click', () => {
  cancelAnimationFrame(animId);
});

resetBtn.addEventListener('click', () => {
  cancelAnimationFrame(animId);
  resetCanvas();
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

function resetCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(canvas.width/2, canvas.height);
}

// Helper per parse delle regole in oggetto
function parseRules(str) {
  return str.split(';').reduce((obj, pair) => {
    const [k,v] = pair.split('='); if(k && v) obj[k]=v; return obj;
  }, {});
}

// Recupera token da localStorage/session
function getSessionToken() {
  return localStorage.getItem('sessionToken') || '';
}