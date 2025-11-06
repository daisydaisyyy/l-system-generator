let instr = '';
let isAnimating = false;
let curStep = 0;
let animId = null;
const STEP_SIZE = 10;
const LINE_WIDTH = 1;
let stepSize = null;
let varObjList = [];
let axiom = '';
const REGEX = /[\[\]\+\-\=;\()\\]/; // regex per evitare caratteri speciali

let currentUser = null;
let currentScale = 1;


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
    if (!c.match(REGEX)) // regex per prendere tutto tranne i caratteri speciali ([,],+,-)
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
    if (!c.match(REGEX)) // regex per prendere tutto tranne i caratteri speciali ([,],+,-)
      vars.add(c);
  });

  return [...vars.values()];
}


// cancella disegno dal canvas, torna allo stato iniziale
function resetCanvas(ctx) {
  // reset delle trasformazioni (translate, rotate, scale) riportando la matrice di trasformazione allo stato iniziale
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  // pulisci il canvas
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

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
  const angleInput = document.getElementById('angleInput');

  const userArea = document.getElementById('userArea');
  const showLoginBtn = document.getElementById('showLoginBtn');
  const showRegisterBtn = document.getElementById('showRegisterBtn');
  const showSaveModalBtn = document.getElementById('showSaveModalBtn');
  const showLoadModalBtn = document.getElementById('showLoadModalBtn');

  const loginModal = document.getElementById('loginModal');
  const registerModal = document.getElementById('registerModal');
  const saveModal = document.getElementById('saveModal');
  const loadModal = document.getElementById('loadModal');
  const varModal = document.getElementById('varModal');

  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const saveForm = document.getElementById('saveForm');

  const loginError = document.getElementById('loginError');
  const registerError = document.getElementById('registerError');
  const saveError = document.getElementById('saveError');

  const drawingListContainer = document.getElementById('drawingListContainer');

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
    // console.log(newVars);
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


    let [x, y, scale] = autoCenter(1, axiomInput.value, parseInt(depthInput.value), parseInt(angleInput.value), parseInt(rotInput.value), varObjList, ctx.canvas.width, ctx.canvas.height);
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
          if (animateDrawing(ctx, stepSize, varObjList, parseInt(angleInput.value))) {
            clearInterval(animId);
            setConfigState(false);
            startBtn.innerText = 'Start';
          }
        }, 0);

      } else {

        while (!animateDrawing(ctx, stepSize, varObjList, parseInt(angleInput.value))) {
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
          if (animateDrawing(ctx, stepSize, varObjList, parseInt(angleInput.value))) {
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
    document.getElementById("varModal").showModal();
  });

  discardVarBtn.addEventListener('click', e => {
    document.getElementById("varModal").close();
  });

  confirmVarBtn.addEventListener('click', e => {
    const label = document.getElementById("newVarInput").value.trim();
    // validazione input, evita duplicati
    if (label.length === 0) {
      alert("Variable cannot be empty!");
    } else if (label.match(REGEX)) {
      alert("Variable cannot be a special character ([,],+,-,=,;). Choose another symbol.");
    }
    else if (varObjList.map(obj => obj.label).includes(label)) {
      alert("Variable is already on the list! Choose another symbol or discard your choice.");
    } else {
      varObjList.push(new DrawLine(label, "", getRandColor(backgroundColorInput.value))); // aggiunta di default
      renderVarsContainer();
      document.getElementById("varModal").close();
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
      document.getElementById("varModal").close(); // TODO: fix, not hiding when exiting fullscreen

    }
  });

  // ridimensiona il canvas (ridisegna da capo) se si ridimensiona la finestra
  window.addEventListener('resize', e => {
    startBtn.click();
  });

  backgroundColorInput.addEventListener('change', handleBackgroundColor);


  // modals
  showLoginBtn.addEventListener('click', () => loginModal.classList.remove('hidden'));
  showRegisterBtn.addEventListener('click', () => registerModal.classList.remove('hidden'));
  showSaveModalBtn.addEventListener('click', () => saveModal.classList.remove('hidden'));
  showLoadModalBtn.addEventListener('click', handleOpenLoadModal);

  // --- gestione DATABASE ---

  // aggiorna la UI dopo login/logout
  function updateUserUI() {
    if (currentUser) {
      // logged
      userArea.innerHTML = `
        <span>Welcome, <strong>${currentUser}</strong></span>
        <button id="logoutBtn" type="button">Logout</button>
      `;
      showSaveModalBtn.disabled = false;
      showLoadModalBtn.disabled = false;
      document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    } else {
      // not logged in
      userArea.innerHTML = `
        <button id="showLoginBtn" type="button">Login</button>
        <button id="showRegisterBtn" type="button">Register</button>
      `;
      showSaveModalBtn.disabled = true;
      showLoadModalBtn.disabled = true;
      document.getElementById('showLoginBtn').addEventListener('click', () => loginModal.classList.remove('hidden'));
      document.getElementById('showRegisterBtn').addEventListener('click', () => registerModal.classList.remove('hidden'));
    }
  }


  // --- gestione PHP ---

  // registrazione
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    registerError.textContent = '';
    const username = document.getElementById('registerUser').value;
    const password = document.getElementById('registerPass').value;

    try {
      const res = await fetch('../php/register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      currentUser = data.username;
      updateUserUI();
      registerModal.classList.add('hidden');
      registerForm.reset();

    } catch (err) {
      registerError.textContent = err.message;
    }
  });

  // login
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.textContent = '';
    const username = document.getElementById('loginUser').value;
    const password = document.getElementById('loginPass').value;

    try {
      const res = await fetch('../php/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      currentUser = data.username;
      updateUserUI();
      loginModal.classList.add('hidden');
      loginForm.reset();

    } catch (err) {
      loginError.textContent = err.message;
    }
  });

  // logout
  async function handleLogout() {
    try {
      await fetch('../php/logout.php');
    } catch (err) {
      console.error('Logout failed', err);
    }
    currentUser = null;
    updateUserUI();
  }

  // salvataggio
  saveForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    saveError.textContent = '';

    const payload = {
      name: document.getElementById('drawingNameInput').value,
      axiom: axiomInput.value,
      is_public: document.getElementById('drawingPublicInput').checked ? 1 : 0,
      depth: parseInt(depthInput.value),
      angle: parseFloat(angleInput.value),
      starting_rot: parseFloat(rotInput.value),
      line_width: parseFloat(lineWInput.value),
      scale: currentScale,

      rules: varObjList.map(obj => {
        let movement_type = 'noOp';
        if (obj instanceof DrawLine) movement_type = 'drawLine';
        else if (obj instanceof DrawDot) movement_type = 'drawDot';
        else if (obj instanceof MoveTo) movement_type = 'moveTo';

        return {
          variable: obj.label,
          replacement: obj.rule,
          movement_type: movement_type,
          color: obj.color || '#000000'
        };
      })
    };

    try {
      const res = await fetch('../php/save_drawing.php', { // Il percorso è corretto
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');

      alert('Drawing saved successfully!');
      saveModal.classList.add('hidden');
      saveForm.reset();

    } catch (err) {
      saveError.textContent = err.message;
    }
  });


  // load drawing, visualizzazione lista
  async function handleOpenLoadModal() {
    loadModal.classList.remove('hidden');
    drawingListContainer.innerHTML = '<p>Loading drawings...</p>';

    try {
      const res = await fetch('../php/list_drawings.php?page=1&per_page=100');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load list');

      if (data.total === 0 || data.drawings.length === 0) {
        drawingListContainer.innerHTML = '<p>No drawings found.</p>';
        return;
      }


      // eliminazione se l'owner === currentUser
      drawingListContainer.innerHTML = '<ul>' + data.drawings.map(d => {

        const deleteBtnHtml = d.owner === currentUser
          ? `<button class="delete-item-btn" data-name="${d.name}" title="Delete">🗑️</button>`
          : ''; // non mostrare l'icona

        return `<li>
         <span>${d.name} (by ${d.owner === currentUser ? 'you' : d.owner})</span>
         <div class="drawing-item-actions">
           <button class="load-item-btn" data-name="${d.name}" data-owner="${d.owner}">Load</button>
           ${deleteBtnHtml}
         </div>
       </li>`;
      }).join('') + '</ul>';

      drawingListContainer.insertAdjacentHTML('afterbegin', `<h4>Showing ${data.drawings.length} of ${data.total} drawings</h4>`);


    } catch (err) {
      drawingListContainer.innerHTML = `<p class="modalError">${err.message}</p>`;
    }
  }


  drawingListContainer.addEventListener('click', async (e) => {
    const target = e.target;

    if (target.classList.contains('load-item-btn')) {
      const name = target.dataset.name;
      const owner = target.dataset.owner;

      try {
        const res = await fetch(`../php/load_drawing.php?name=${encodeURIComponent(name)}&owner=${encodeURIComponent(owner)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load drawing');

        // load drawing
        loadDrawingData(data);
        loadModal.classList.add('hidden');

      } catch (err) {
        alert(`Error loading drawing: ${err.message}`);
      }
    }

    if (target.classList.contains('delete-item-btn')) {
      const li = target.closest('li'); // riga piu' vicina (<li>)
      const name = target.dataset.name;

      if (!confirm(`Are you sure to delete "${name}"? This action is irreversible.`)) {
        return;
      }

      try {
        const res = await fetch(`../php/delete_drawing.php?name=${encodeURIComponent(name)}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Failed to delete drawing');

        alert(data.message || 'Drawing deleted!');

        handleOpenLoadModal();

      } catch (err) {
        alert(`Error deleting drawing: ${err.message}`);
      }
    }
  });

  function loadDrawingData(data) {
    handleReset();
    axiomInput.value = data.axiom;
    axiom = data.axiom;
    depthInput.value = data.depth;
    angleInput.value = data.angle;
    rotInput.value = data.starting_rot;
    lineWInput.value = data.line_width;
    currentScale = data.scale;

    varObjList = data.rules.map(rule => {
      switch (rule.movement_type) {
        case 'drawLine':
          return new DrawLine(rule.variable, rule.replacement, rule.color);
        case 'drawDot':
          return new DrawDot(rule.variable, rule.replacement, rule.color);
        case 'moveTo':
          return new MoveTo(rule.variable, rule.replacement);
        case 'noOp':
          return new NoOp(rule.variable, rule.replacement);
        default:
          // fallback
          return new DrawLine(rule.variable, rule.replacement, getRandColor(backgroundColorInput.value));
      }
    });

    renderVarsContainer();

    handleObjChange();
  }

  // aggiorna ui dell'utente
  (async () => {
    try {
      const res = await fetch('../php/check_session.php');

      if (res.ok) {
        const data = await res.json();
        currentUser = data.username;
      } else {
        currentUser = null;
      }
    } catch (err) {
      console.error('Error checking session:', err);
      currentUser = null;
    }

    updateUserUI();
  })();



});

