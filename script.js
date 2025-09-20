let instr = '';
let isAnimating = false;
let curStep = 0;
let animId = null;
const STEP_SIZE = 10;
const LINE_WIDTH = 1;
let stepSize = null;
let varsList = []; // lista con variabili associate al movimento da fare nel disegno
let movList = [];
let rulesList = []; //  stringa con le rules, var = regola separate da ;

// prende in input l'axiom e le regole e ritorna la stringa con i simboli
function getVariables(axiom) {
  const vars = new Set();
  axiom.split("").map(c => {
    if (c.match(/[^\[\]+\-=;]/)) // regex per prendere tutto tranne i caratteri speciali ([,],+,-)
      vars.add(c);
  });

  rules = "";

  // trasforma rulesList a stringa
  rulesList.map(x => rules += `${x.label}=${x.rule};`);

  // applica regex per trovare le variabili
  rules.split("").map(c => {
    if (c.match(/[^\[\]+\-=;]/)) // regex per prendere tutto tranne i caratteri speciali ([,],+,-)
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


function getSessionToken() {
  return localStorage.getItem('sessionToken') || '';
}

// events
document.addEventListener('DOMContentLoaded', e => {
  const canvas = document.getElementById('drawingCanvas');
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

  // input parameters
  const axiomInput = document.getElementById('axiomInput');
  const depthInput = document.getElementById('depthInput');

  const rotInput = document.getElementById('rotInput');
  const lineWInput = document.getElementById('lineWInput');
  const scaleLineWInput = document.getElementById('scaleLineWInput');
  const showAnimInput = document.getElementById('showAnimInput');
  const backgroundColorInput = document.getElementById('backgroundColorInput');
  const varsContainer = document.getElementById('varsContainer');
  const rulesContainer = document.getElementById('rulesContainer');
  const addRuleBtn = document.getElementById('addRuleBtn');


  function parseRules() {
    let rules = [];
    const rulesElems = [...rulesContainer.querySelectorAll('input')];
    for (let i = 0; i < rulesElems.length; i += 2) {
      const variable = rulesElems[i].value.trim();
      const replacement = rulesElems[i + 1].value.trim();
      if (variable && replacement) {
        rules.push({ label: variable, rule: replacement });
      }
    }
    return rules;
  }


  // gestisci le regole e aggiungi una nuova regola dinamicamente
  function handleRules() {
    let elems = "";

    // rigenera html per non resettare i dati gia' inseriti
    rulesList.map(x =>
      elems += `
        <input type="text" class="config" value="${x.label}"/>
        <span>=</span>
        <input type="text" class="config" value="${x.rule}" />
        <button class="config" type="button">-</button>
      `
    );

    // nuova regola
    elems += `
        <input type="text" class="config" placeholder="Variable"/>
        <span>=</span>
        <input type="text" class="config" placeholder="Replacement" />
        <button class="config" type="button">-</button>
    `;

    rulesContainer.innerHTML = elems;
  }

  // crea dinamicamente html per ogni variabile trovata per scegliere il movimento da fare
  function handleMovements() {
    varsList = getVariables(axiomInput.value);
    let dynamicElems = "";
    // imposta il selected e l'input color in base al movimento e colore gia' scelti in precedenza cosi' non si resetta ogni volta che si aggiunge/rimuove una variabile qualsiasi
    varsList.map(v => {
      const obj = Movement.findByLabel(movList, v);

      dynamicElems += `
        <label for="movSelect_${v}">${v}</label>
        <select id="movSelect_${v}" class="config">
          <option value="drawLine" ${obj instanceof DrawLine ? "selected" : ""}>Draw Line</option>
          <option value="drawDot" ${obj instanceof DrawDot ? "selected" : ""}>Draw Dot</option>
          <option value="moveTo" ${obj instanceof MoveTo ? "selected" : ""}>Move To</option>
          <option value="noOp" ${obj instanceof NoOp ? "selected" : ""}>Do nothing</option>
        </select>
        <input type="color" id="colorInput_${v}" class="config ${(obj instanceof NoOp || obj instanceof MoveTo) ? "hidden" : ""}" value="${obj ? obj.color : "#00ff00"}"/>
      `;
    });
    varsContainer.innerHTML = dynamicElems;
    movList = assignMovements();
  }

  // assegna il movimento a ciascuna variabile istanziando gli oggetti e mettendoli in una lista
  function assignMovements() {
    const movList = [];
    varsList.map(v => {
      const sel = document.getElementById(`movSelect_${v}`).value;
      const color = document.getElementById(`colorInput_${v}`).value;

      switch (sel) {
        case 'drawLine': movList.push(new DrawLine(v, color)); break;
        case 'drawDot': movList.push(new DrawDot(v, color)); break;
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

  handleRules(); // aggiungi di default una regola vuota
  handleMovements();

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

    // handle zoom
    stepSize = STEP_SIZE;

    resetCanvas(ctx);

    ctx.rect(0,0,ctx.canvas.width,ctx.canvas.height);
    ctx.fillStyle = backgroundColorInput.value || '#ffffff';
    ctx.fill();

    ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);

    let rules = {};
    rulesList.map(x => rules[x.label] = x.rule); // trasforma in dizionario

    let [x, y, scale] = autoCenter(1, axiomInput.value, rules, ctx.canvas.width, ctx.canvas.height);
    ctx.translate(x, y);
    stepSize = scale * STEP_SIZE; // aggiorna step size (lunghezza unitaria della linea) in base alla scala

    // handle line width, depends on zoom if the checkbox is checked
    ctx.lineWidth = (scaleLineWInput.checked ? scale * 1.2 : 1) * parseInt(lineWInput.value) || LINE_WIDTH;

    try {
      instr = generateLSystem(axiomInput.value, rules, parseInt(depthInput.value));
      // console.log(instr);

      let rot = parseInt(rotInput.value)
      ctx.rotate(rot * Math.PI / 180);

      // reset animation state
      curStep = 0;
      isAnimating = true;

      if (showAnimInput.checked) {
        // start animation
        animId = setInterval(() => {
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
          if (animateDrawing(ctx, stepSize, movList)) {
            clearInterval(animId);
            setConfigState(false);
          }
        }, 0);
      }
    }

  });

  // event listeners
  resetBtn.addEventListener('click', handleReset);
  addRuleBtn.addEventListener('click', handleRules);

  // ascolta i cambiamenti nelle  regole e aggiorna la lista delle regole
  rulesContainer.addEventListener('input', e => {
    rulesList = parseRules();
    handleMovements();
  });

  //  aggiunta e rimozione regole
  rulesContainer.addEventListener('click', e => {
    // event delegation
    if (e.target && e.target.tagName === 'BUTTON') {
      let btns = Array.from(document.querySelectorAll("#rulesContainer > button"));
      let idx = btns.findIndex(x => x === e.target);
      rulesList.splice(idx, 1); // rimuovi regola dalla lista

      // rimuovi elementi html
      e.target.previousElementSibling.remove();
      e.target.previousElementSibling.remove();
      e.target.previousElementSibling.remove();
      e.target.remove();
    }
  });

  // aggiorna le variabili e i movimenti associati quando cambia l'axiom
  axiomInput.addEventListener('input', handleMovements);

  // aggiorna i movimenti associati quando cambia il movimento scelto per una variabile
  varsContainer.addEventListener('change', e => {
    // event delegation
    if (e.target && e.target.tagName === 'SELECT') {
      movList = assignMovements();
      if (e.target.value == "moveTo" || e.target.value == "noOp")
        document.getElementById(`colorInput_${e.target.id.split('_')[1]}`).classList.add("hidden"); //  nascondi scelta del colore se il movimento non disegna nulla
      else document.getElementById(`colorInput_${e.target.id.split('_')[1]}`).classList.remove("hidden"); // mostra di nuovo al cambio della scelta se il movimento disegna
    }
  });


  // handle fullscreen
  document.addEventListener('keydown', e => {
    if (e.key === "F11") {
      e.preventDefault();
      ctx.canvas.requestFullscreen();
    }
    else  if (e.key === "Escape") {
      e.preventDefault();
      document.exitFullscreen();
    }
  });

  // ridimensiona il canvas (ridisegna da capo) se si ridimensiona la finestra
  window.addEventListener('resize', e => {
    startBtn.click();
  });

  backgroundColorInput.addEventListener('change', e => {
    document.querySelector('body').style.backgroundColor = backgroundColorInput.value || "#ffffff";
  });

});

