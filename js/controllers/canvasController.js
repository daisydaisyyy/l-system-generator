import {renderVarsContainer, updateVarsConfigFromDOM } from '../views/ui.js';
import { resetCanvas, handleBackgroundColor } from '../views/canvas.js';
import { generateLSystem, autoCenter, animateDrawing } from '../models/l-system.js';
import { resetAnimationState } from './state.js';

// canvas and animation handler
function setConfigState(disabled) {
  document.querySelectorAll('.config').forEach(el => el.disabled = disabled);
}

export function onResize(state, elems, ctx) {
  if(!elems.depthInput) return;
  elems.canvas.width = elems.canvas.clientWidth * (parseInt(elems.depthInput.value) + 1);
  elems.canvas.height = elems.canvas.clientHeight * (parseInt(elems.depthInput.value) + 1);
  onStartClick(state, elems, ctx);
}

export function onResetClick(state, elems, ctx) {
  resetAnimationState(state);
  resetCanvas(ctx);
  handleBackgroundColor(ctx, elems.backgroundColorInput);
  
  elems.pauseBtn.innerText = 'Pause';
  elems.startBtn.innerText = 'Start';
  setConfigState(false);
}

export function onStartClick(state, elems, ctx) {
  onResetClick(state, elems, ctx);
  setConfigState(true);
  elems.startBtn.innerText = 'Restart';

  state.varObjList = updateVarsConfigFromDOM(state.varObjList);
  renderVarsContainer(elems.varsContainer, state.varObjList);

  state.stepSize = state.STEP_SIZE;
  resetCanvas(ctx);
  handleBackgroundColor(ctx, elems.backgroundColorInput);

  ctx.translate(elems.canvas.width / 2, elems.canvas.height / 2);

  let [x, y, scale] = autoCenter(
    1, 
    elems.axiomInput.value, 
    parseInt(elems.depthInput.value), 
    parseInt(elems.angleInput.value), 
    parseInt(elems.rotInput.value), 
    state.varObjList, 
    elems.canvas.width, 
    elems.canvas.height
  );

  ctx.translate(x, y);
  state.stepSize = scale * state.STEP_SIZE;
  state.currentScale = scale;
  
  ctx.lineWidth = (elems.scaleLineWInput.checked ? scale * 1.2 : 1) * parseInt(elems.lineWInput.value) || 1;

  try {
    state.instr = generateLSystem(elems.axiomInput.value, state.varObjList, parseInt(elems.depthInput.value));
    let rot = parseInt(elems.rotInput.value);
    ctx.rotate(rot * Math.PI / 180);
    
    state.curStep = 0;
    state.isAnimating = true;

    if (elems.showAnimInput.checked) {
      // animation loop
      state.animId = setInterval(() => {
        if (animateDrawing(ctx, state.stepSize, state.varObjList, parseInt(elems.angleInput.value), state)) {
          
          finishAnimation(state, elems);
        }
      }, 0);
      
    } else {
      while (!animateDrawing(ctx, state.stepSize, state.varObjList, parseInt(elems.angleInput.value), state)) {
        // continua finché animateDrawing ritorna false 
      }
      // (= animazione finita)
      finishAnimation(state, elems);
    }
  } catch (e) {
    finishAnimation(state,elems);
    alert("Too many instructions. Retry with a lower depth.");
  }
}

function finishAnimation(state, elems) {
  state.isAnimating = false;
  state.curStep = 0;
  if(state.animId) clearInterval(state.animId);
  setConfigState(false);
  elems.startBtn.innerText = 'Start';
}

export function onPauseClick(state, elems, ctx) {
  if (state.curStep === 0) return;

  if (state.isAnimating) {
    state.isAnimating = false;
    setConfigState(true);
    elems.pauseBtn.innerText = 'Resume';
    clearInterval(state.animId);
  } else {
    state.isAnimating = true;
    elems.pauseBtn.innerText = 'Pause';
    state.animId = setInterval(() => {
      if (animateDrawing(ctx, state.stepSize, state.varObjList, parseInt(elems.angleInput.value), state)) {
        finishAnimation(state, elems);
      }
    }, 0);
  }
}

