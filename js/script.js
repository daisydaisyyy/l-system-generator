let instr = '';
let isAnimating = false;
let curStep = 0;
let animId = null;
const STEP_SIZE = 10;
const LINE_WIDTH = 1;
let stepSize = null;
let varObjList = [];
let axiom = '';


function getRandColor(colorToAvoid = "#ffffff") {
  let color = colorToAvoid;
  while (color === colorToAvoid) // evita che il colore sia uguale allo sfondo
    color = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  return color;
}


// prende in input l'axiom e le regole e ritorna la stringa con i simboli presenti in entrambi per creare le variabili
function getVariables() {
  const vars = new Set();
  axiom.split("").map(c => {
    if (c.match(/[^\[\]+\-=;]/)) // regex per prendere tutto tranne i caratteri speciali ([,],+,-)
      vars.add(c);
  });

  rules = "";

  document.querySelectorAll('.varConfig input[type="text"]').forEach(el => {
    if (el.id.startsWith('ruleInput_')) {
      rules += el.value;
    }
  });

  // prendi variabile nella label
  document.querySelectorAll('.varConfig label').forEach(el => {
    if (el.htmlFor.startsWith('ruleInput_')) {
      rules += el.innerText;
    }
  });


  // applica regex per trovare le variabili
  rules.split("").map(c => {
    if (c.match(/[^\[\]+\-=;]/)) // regex per prendere tutto tranne i caratteri speciali ([,],+,-)
      vars.add(c);
  });

  return [...vars.values()];
}


// cancella disegno dal canvas, torna allo stato iniziale
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

// on DOMContentLoaded
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
  const addVarBtn = document.getElementById('addVarBtn');
  const discardVarBtn = document.getElementById('discardVarBtn');
  const confirmVarBtn = document.getElementById('confirmVarBtn');
  const newVarInput = document.getElementById('newVarInput');

  // crea dinamicamente l'html di configurazione per ogni variabile trovata
  function renderVarsContainer() {
    let dynamicElems = '';

    // ri-crea da capo html dinamico per ogni variabile trovata
    // imposta il selected e l'input color in base al movimento e colore gia' scelti in precedenza cosi' non si resetta ogni volta che si aggiunge/rimuove una variabile qualsiasi
    varObjList.map(obj => {
      dynamicElems += `
      <div id="varContainer_${obj.label}" class="varConfig">
        <label for="ruleInput_${obj.label}">${obj.label}</label>
        <input type="text" id="ruleInput_${obj.label}" class="config" placeholder="rule" value="${obj && obj.rule ? obj.rule : ""}"/>
        <select id="ruleSelect_${obj.label}" class="config">
          <option value="drawLine" ${obj instanceof DrawLine ? "selected" : ""}>Draw Line</option>
          <option value="drawDot" ${obj instanceof DrawDot ? "selected" : ""}>Draw Dot</option>
          <option value="moveTo" ${obj instanceof MoveTo ? "selected" : ""}>Move To</option>
          <option value="noOp" ${obj instanceof NoOp ? "selected" : ""}>Do nothing</option>
        </select>
        <input type="color" id="colorInput_${obj.label}" class="config ${(obj instanceof NoOp || obj instanceof MoveTo) ? "hidden" : ""}" value="${obj ? obj.color : "#00ff00"}"/>
        <button class="config" type="button">-</button>
      </div>
      `;
    });
    varsContainer.innerHTML = dynamicElems;
  }


  // assegna il movimento a ciascuna variabile istanziando gli oggetti e mettendoli in una lista
  function updateVarsConfig() {
    const configsList = [];
    varObjList.map(obj => {
      const sel = document.getElementById(`ruleSelect_${obj.label}`).value;
      const color = document.getElementById(`colorInput_${obj.label}`).value;
      const rule = document.getElementById(`ruleInput_${obj.label}`).value == undefined ? obj.rule : document.getElementById(`ruleInput_${obj.label}`).value; // se non e' stata inserita nessuna regola, la regola e' la variabile stessa

      switch (sel) {
        case 'drawLine': configsList.push(new DrawLine(obj.label, rule, color)); break;
        case 'drawDot': configsList.push(new DrawDot(obj.label, rule, color)); break;
        case 'moveTo': configsList.push(new MoveTo(obj.label, rule)); break;
        case 'noOp': configsList.push(new NoOp(obj.label, rule)); break;
        default: configsList.push(new NoOp(obj.label, rule)); break;
      }
    });
    varObjList = configsList; // aggiorno lista di oggetti con i nuovi movimenti
    renderVarsContainer();
  }

  // on change, aggiunge o rimuove variabili dalla lista e aggiorna l'html
  function handleObjChange() {
    let newVars = getVariables();
    console.log(newVars);
    let objLabels = varObjList.map(m => m.label);

    // controlla se sono state aggiunte o rimosse variabili
    if (objLabels.some(label => !newVars.includes(label))) { // rimossa
      let toRemove = objLabels.filter(label => !newVars.includes(label));
      // console.log("to remove: ", toRemove);
      varObjList = varObjList.filter(m => !toRemove.includes(m.label));
    }

    if (newVars.some(label => !objLabels.includes(label)))  // aggiunta
      varObjList.push(...newVars.filter(label => !objLabels.includes(label)).map(v => new DrawLine(v, "", getRandColor(backgroundColorInput.value)))); // di default il movimento e' DrawLine

    renderVarsContainer(); // aggiorna html
  }

  function handleReset() {
    isAnimating = false;
    curStep = 0;
    resetCanvas(ctx);
    pauseBtn.innerText = 'Pause';
    startBtn.innerText = 'Start';
    setConfigState(false);
  }

  function handleBackgroundColor() {
    document.querySelector('body').style.backgroundColor = backgroundColorInput.value || "#ffffff";
    resetCanvas(ctx);
    ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = backgroundColorInput.value || '#ffffff';
    ctx.fill();
  }

  handleBackgroundColor(); // mantieni colore scelto al caricamento della pagina
  axiom = axiomInput.value;
  handleObjChange(); // inizializza varObjList e html delle variabili

  // disable/enables parameters
  const config_params = [...document.querySelectorAll('.config')];
  function setConfigState(state) {
    config_params.map(el => el.disabled = state);
  }


  startBtn.addEventListener('click', () => {
    handleReset();
    setConfigState(true);
    startBtn.innerText = 'Restart';

    updateVarsConfig();

    // handle zoom
    stepSize = STEP_SIZE;

    resetCanvas(ctx);

    ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = backgroundColorInput.value || '#ffffff';
    ctx.fill();

    ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);


    let [x, y, scale] = autoCenter(1, axiomInput.value, varObjList, ctx.canvas.width, ctx.canvas.height);
    ctx.translate(x, y);
    stepSize = scale * STEP_SIZE; // aggiorna step size (lunghezza unitaria della linea) in base alla scala

    // handle line width, depends on zoom if the checkbox is checked
    ctx.lineWidth = (scaleLineWInput.checked ? scale * 1.2 : 1) * parseInt(lineWInput.value) || LINE_WIDTH;

    try {
      instr = generateLSystem(axiomInput.value, varObjList, parseInt(depthInput.value));
      // console.log(instr);

      let rot = parseInt(rotInput.value)
      ctx.rotate(rot * Math.PI / 180);

      // reset animation state
      curStep = 0;
      isAnimating = true;

      if (showAnimInput.checked) {
        // start animation
        animId = setInterval(() => {
          if (animateDrawing(ctx, stepSize, varObjList)) {
            clearInterval(animId);
            setConfigState(false);
            startBtn.innerText = 'Start';
          }
        }, 0);

      } else {

        while (!animateDrawing(ctx, stepSize, varObjList)) {
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
          if (animateDrawing(ctx, stepSize, varObjList)) {
            clearInterval(animId);
            setConfigState(false);
          }
        }, 0);
      }
    }

  });

  // event listeners
  resetBtn.addEventListener('click', handleReset);

  // aggiorna le variabili e i movimenti associati quando cambia l'axiom
  axiomInput.addEventListener('input', () => {
    axiom = axiomInput.value;
    handleObjChange();
  });

  // aggiorna i movimenti associati quando cambia il movimento scelto per una variabile
  varsContainer.addEventListener('change', e => {
    // event delegation
    if (e.target && e.target.tagName === 'SELECT') {
      updateVarsConfig();
      if (e.target.value == "moveTo" || e.target.value == "noOp") {
        document.getElementById(`colorInput_${e.target.id.split('_')[1]}`).classList.add("hidden"); //  nascondi scelta del colore se il movimento non disegna nulla
      } else document.getElementById(`colorInput_${e.target.id.split('_')[1]}`).classList.remove("hidden"); // mostra di nuovo al cambio della scelta se il movimento disegna
    }
  });

  // ascolta i cambiamenti nelle rules e aggiorna la singola rule nell'oggetto corrispondente
  varsContainer.addEventListener('change', e => {
    if (e.target && e.target.tagName === 'INPUT' && e.target.id.startsWith('ruleInput_')) {
      const v = e.target.id.split('_')[1];
      const obj = Variable.findByLabel(varObjList, v);
      if (obj) obj.rule = e.target.value || ""; // aggiorna solo questa regola
      // chiama handler per aggiungere variabili se scritte nella regola
      handleObjChange();
    }
  });

  //  rimozione regole
  varsContainer.addEventListener('click', e => {
    // event delegation
    if (e.target && e.target.tagName === 'BUTTON') {
      // rimuovi il varContainer
      const label = e.target.parentElement.querySelector('label').innerText;
      if (!axiom.includes(label)) {
        e.target.parentElement.remove();
        // rimuovi l'oggetto e aggiorna la lista delle variabili presenti
        varObjList = varObjList.filter(m => m.label != label);
      }
    }
  });

  addVarBtn.addEventListener('click', e => {
    document.getElementById("varModal").classList.remove("hidden");
  });

  discardVarBtn.addEventListener('click', e => {
    document.getElementById("varModal").classList.add("hidden");
  });

  confirmVarBtn.addEventListener('click', e => {
    const label = document.getElementById("newVarInput").value.trim();
    // validazione input, evita duplicati
    if (!varObjList.map(obj => obj.label).includes(label)) {
      // aggiungi variabile nella lista, edit html
      varObjList.push(new DrawLine(label, "", getRandColor(backgroundColorInput.value))); // aggiunta di default
      renderVarsContainer();
      document.getElementById("varModal").classList.add("hidden");
    } else {
      alert("Variable is already on the list! Choose another symbol or discard your choice.");
    }
  });

  newVarInput.addEventListener('input', e => {
    if (e.target.value.length > 1)
      e.target.value = e.target.value[0];
  });


  // handle fullscreen
  document.addEventListener('keydown', e => {
    if (e.key === "F11") {
      e.preventDefault();
      ctx.canvas.requestFullscreen();
    }
    else if (e.key === "Escape") {
      e.preventDefault();
      document.exitFullscreen();
      document.getElementById("varModal").classList.add("hidden"); // TODO: fix, not hiding when exiting fullscreen

    }
  });

  // ridimensiona il canvas (ridisegna da capo) se si ridimensiona la finestra
  window.addEventListener('resize', e => {
    startBtn.click();
  });

  backgroundColorInput.addEventListener('change', handleBackgroundColor);
});

