let instr = '';
let isAnimating = false;
let curStep = 0;
let animId = null;
const STEP_SIZE = 10;
const LINE_WIDTH = 1;
let stepSize = null;
let varsList = []; // lista con variabili associate al movimento da fare nel disegno
let movList = null;
// prende in input l'axiom e le regole e ritorna la stringa con i simboli
function getVariables(axiom, rules) {
  const vars = new Set();
  axiom.split("").map(c => {
    if (c.match(/[a-zA-Z\d]/)) // regex per prendere solo lettere e numeri
      vars.add(c);
  });

  rules.split("").map(c => {
    if (c.match(/[a-zA-Z\d]/)) // regex per prendere solo lettere e numeri
      vars.add(c);
  });

  return [...vars.values()];
}


function resetCanvas(ctx) {
  ctx.save();
  ctx.reset();
  // debug, changes color at every reset
  //ctx.fillStyle = `rgb(${Math.floor(Math.random() * 256)} ${Math.floor(Math.random() * 128)} ${Math.floor(Math.random() * 256)})`;

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.restore();
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

  const scaleInput = document.getElementById('scaleInput');
  const rotInput = document.getElementById('rotInput');
  const lineWInput = document.getElementById('lineWInput');
  const scaleLineWInput = document.getElementById('scaleLineWInput');
  const showAnimInput = document.getElementById('showAnimInput');
  const varsContainer = document.getElementById('varsContainer');


  // crea dinamicamente html per ogni variabile trovata per scegliere il movimento da fare
  function handleRules() {
    varsList = getVariables(axiomInput.value, rulesInput.value);
    let dynamicElems = "";
    varsList.map(v => {
      dynamicElems += `
        <label for="movSelect_${v}">${v}</label>
        <select id="movSelect_${v}">
          <option value="drawLine" selected>Draw Line</option>
          <option value="drawDot">Draw Dot</option>
          <option value="moveTo">Move To</option>
          <option value="noOp">Do nothing</option>
        </select>
      `;
    });
    varsContainer.innerHTML = dynamicElems;
  }

  // assegna il movimento a ciascuna variabile istanziando gli oggetti e mettendoli in una lista
  function assignMovements() {
    const movList = [];
    varsList.map(v => {
      const sel = document.getElementById(`movSelect_${v}`).value;
      switch (sel) {
        case 'drawLine': movList.push(new DrawLine(v)); break;
        case 'drawDot': movList.push(new DrawDot(v)); break;
        case 'moveTo': movList.push(new MoveTo(v)); break;
        case 'noOp': movList.push(new NoOp(v)); break;
        default: movList.push(new NoOp(v)); break;
      }
    });
    return movList;
  }

  function handleReset() {
    isAnimating = false;
    curStep = 0;
    resetCanvas(ctx);
    pauseBtn.innerText = 'Pause';
    startBtn.innerText = 'Start';
    setConfigState(false);
  }

  handleRules();

  // disable/enables parameters
  const config_params = [...document.querySelectorAll('.config')];
  function setConfigState(state) {
    config_params.map(el => el.disabled = state);
  }

  startBtn.addEventListener('click', () => {
    handleReset();
    setConfigState(true);
    startBtn.innerText = 'Restart';

    movList = assignMovements();
    console.log(movList);
    // handle zoom
    stepSize = parseFloat(scaleInput.value) * STEP_SIZE || STEP_SIZE;

    resetCanvas(ctx);

    ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);

    let [x, y] = autoCenter(parseFloat(scaleInput.value))
    console.log("autoCenter: " + x + ", " + y);
    ctx.translate(x, y);
    ctx.strokeStyle = "rgba(0, 255, 76, 0.50)"; // imposta il colore e la trasparenza delle linee

    // handle line width, depends on zoom if the checkbox is checked
    ctx.lineWidth = (scaleLineWInput.checked ? parseFloat(scaleInput.value) : 1) * parseInt(lineWInput.value) || LINE_WIDTH;

    try {
      instr = generateLSystem(axiomInput.value, parseRules(rulesInput.value), parseInt(depthInput.value));
      // console.log(instr);

      let rot = parseInt(rotInput.value)
      // console.log("rot: " + rot*Math.PI/180);
      ctx.rotate(rot * Math.PI / 180);

      // reset animation state
      curStep = 0;
      isAnimating = true;

      if (showAnimInput.checked) {
        // start animation
        animId = setInterval(() => {
          // console.log("Animation");
          if (animateDrawing(ctx, stepSize, movList)) {
            clearInterval(animId);
            setConfigState(false);
            startBtn.innerText = 'Start';
          }
        }, 0);

      } else {

        while (!animateDrawing(ctx, stepSize, movList)) {
          setConfigState(false);
          startBtn.innerText = 'Start';
        }
      }

    } catch (e) {
      isAnimating = false;
      clearInterval(animId);
      console.error(e);
      alert("Too many instructions. Retry with a lower depth.");
    }

  });

  pauseBtn.addEventListener('click', () => {
    // console.log("step: " + currentStep + "len: " + instructions.length);
    if (curStep != 0) { // se il disegno e' finito (curStep = 0) non fare nulla
      if (isAnimating) { // pausa l'animazione
        isAnimating = false;
        setConfigState(true); // temporarily disable config params
        pauseBtn.innerText = 'Resume';
        clearInterval(animId);
      } else { // continua l'animazione
        isAnimating = true;
        pauseBtn.innerText = 'Pause';
        animId = setInterval(() => {
          // console.log("Animation");
          if (animateDrawing(ctx, stepSize, movList)) {
            clearInterval(animId);
            setConfigState(false);
          }
        }, 0);
      }
    }

  });

  resetBtn.addEventListener('click', handleReset);

  saveBtn.addEventListener('click', () => {
    const drawingConfig = {
      axiom: axiomInput.value,
      rules: parseRules(rulesInput.value),
      depth: parseInt(depthInput.value),
      angle: parseInt(angleInput.value),
      startx: parseInt(startxInput.value),
      starty: parseInt(startyInput.value),
      scale: parseFloat(scaleInput.value),
      rot: parseInt(rotInput.value)
    };
    const compressed = compressDrawing(drawingConfig);
    fetch('/api/save.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: getSessionToken(), drawingConfig: compressed })
    }).then(res => res.json()).then(console.log);
  });


  // TODO: implementa aggiunta variabili dinamicamente
  axiomInput.addEventListener('change', handleRules);
  rulesInput.addEventListener('change', handleRules);
});

