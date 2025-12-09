import { initialState } from './controllers/state.js';
import { getDOMElements } from './views/dom.js';
import { handleBackgroundColor } from './views/canvas.js';

import * as CanvasCtrl from './controllers/canvasController.js';
import * as ConfigCtrl from './controllers/configController.js';

const state = { ...initialState };

document.addEventListener('DOMContentLoaded', () => {
  const elems = getDOMElements();

  // setup context
  const ctx = elems.canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  elems.canvas.width = elems.canvas.clientWidth;
  elems.canvas.height = elems.canvas.clientHeight;

  // init state
  handleBackgroundColor(ctx, elems.backgroundColorInput);
  state.axiom = elems.axiomInput.value;
  ConfigCtrl.handleObjChange(state, elems);

  // canvas events
  window.addEventListener("resize", () => CanvasCtrl.onResize(state, elems, ctx));
  elems.startBtn.addEventListener('click', () => CanvasCtrl.onStartClick(state, elems, ctx));
  elems.pauseBtn.addEventListener('click', () => CanvasCtrl.onPauseClick(state, elems, ctx));
  elems.resetBtn.addEventListener('click', () => CanvasCtrl.onResetClick(state, elems, ctx));
  elems.backgroundColorInput.addEventListener('change', () => handleBackgroundColor(ctx, elems.backgroundColorInput));

  // variables events
  elems.axiomInput.addEventListener('input', () => ConfigCtrl.onAxiomInput(state, elems));
  
  elems.varsContainer.addEventListener('change', (e) => ConfigCtrl.onVarsContainerChange(e, state, elems));
  elems.varsContainer.addEventListener('click', (e) => ConfigCtrl.onVarsContainerClick(e, state, elems));
  
  // modal events
  elems.addVarBtn.addEventListener('click', () => elems.varModal.classList.remove("hidden"));
  elems.discardVarBtn.addEventListener('click', () => elems.varModal.classList.add("hidden"));
  elems.confirmVarBtn.addEventListener('click', () => ConfigCtrl.onConfirmVarClick(state, elems));
  elems.newVarInput.addEventListener('input', (e) => { if (e.target.value.length > 1) e.target.value = e.target.value[0]; });

  // fullscreen
  document.addEventListener('keydown', (e) => {
    const skip = 'input[type="text"], input[type="password"]'; 
    if (e.key === "f" && !e.target.matches(skip)) { e.preventDefault(); ctx.canvas.requestFullscreen(); }
    else if (e.key === "Escape") { document.exitFullscreen().catch(()=>{}); elems.varModal.classList.add("hidden"); }
  });
});