import { initialState } from './controllers/state.js';
import { getDOMElements } from './views/dom.js';
import { handleBackgroundColor } from './views/canvas.js';
import { checkSession } from './api.js';
import * as Handlers from './controllers/handlers.js';

// Init State (copia per evitare mutazioni sull'export originale)
const state = { ...initialState };

document.addEventListener('DOMContentLoaded', () => {
  // 1. Get Elements
  const elems = getDOMElements();
  
  // 2. Setup Context
  const ctx = elems.canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  elems.canvas.width = elems.canvas.clientWidth;
  elems.canvas.height = elems.canvas.clientHeight;

  // 3. Initial Logic
  handleBackgroundColor(ctx, elems.backgroundColorInput);
  state.axiom = elems.axiomInput.value;
  Handlers.handleObjChange(state, elems); // Initial variables parse

  // 4. Bind Event Listeners
  // Notare: passiamo (state, elems, ctx) dove serve
  
  // Canvas / Control events
  window.addEventListener("resize", () => Handlers.onResize(state, elems, ctx));
  elems.startBtn.addEventListener('click', () => Handlers.onStartClick(state, elems, ctx));
  elems.pauseBtn.addEventListener('click', () => Handlers.onPauseClick(state, elems, ctx));
  elems.resetBtn.addEventListener('click', () => Handlers.onResetClick(state, elems, ctx));
  elems.backgroundColorInput.addEventListener('change', () => handleBackgroundColor(ctx, elems.backgroundColorInput));

  // Variable Configuration events
  elems.axiomInput.addEventListener('input', () => Handlers.onAxiomInput(state, elems));
  
  elems.varsContainer.addEventListener('change', (e) => Handlers.onVarsContainerChange(e, state, elems));
  elems.varsContainer.addEventListener('click', (e) => Handlers.onVarsContainerClick(e, state, elems));
  
  // Variable Modal events
  elems.addVarBtn.addEventListener('click', () => elems.varModal.classList.remove("hidden"));
  elems.discardVarBtn.addEventListener('click', () => elems.varModal.classList.add("hidden"));
  elems.confirmVarBtn.addEventListener('click', () => Handlers.onConfirmVarClick(state, elems));
  elems.newVarInput.addEventListener('input', (e) => { if (e.target.value.length > 1) e.target.value = e.target.value[0]; });

  // Fullscreen
  document.addEventListener('keydown', (e) => {
    if (e.key === "F11") { e.preventDefault(); ctx.canvas.requestFullscreen(); }
    else if (e.key === "Escape") { document.exitFullscreen().catch(()=>{}); elems.varModal.classList.add("hidden"); }
  });

  // Auth & Data events
  elems.registerForm.addEventListener('submit', (e) => Handlers.onRegisterSubmit(e, state, elems));
  elems.loginForm.addEventListener('submit', (e) => Handlers.onLoginSubmit(e, state, elems));
  elems.saveForm.addEventListener('submit', (e) => Handlers.onSaveSubmit(e, state, elems));
  
  // Modals Open/Close
  elems.showSaveModalBtn.addEventListener('click', () => elems.saveModal.classList.remove('hidden'));
  elems.showLoadModalBtn.addEventListener('click', () => Handlers.onLoadListOpen(state, elems));
  
  elems.drawingListContainer.addEventListener('click', (e) => Handlers.onDrawingListClick(e, state, elems, ctx));
  
  document.querySelectorAll('.modalDiscardBtn').forEach(btn => {
    btn.addEventListener('click', () => btn.closest('.modalBackground').classList.add('hidden'));
  });

  // 5. Initial Session Check
  (async () => {
    try {
      const data = await checkSession();
      if (data) state.currentUser = data.username;
    } catch (err) {
      state.currentUser = null;
    }
    Handlers.updateUserUI(state, elems);
  })();
});