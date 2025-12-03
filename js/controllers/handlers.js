import { getRandColor, REGEX } from '../utils.js';
import { getVariablesFromDOM, renderVarsContainer, updateVarsConfigFromDOM, updateUserUI } from '../views/ui.js';
import { Variable, DrawLine } from '../models/Variable.js';
import { resetCanvas, handleBackgroundColor } from '../views/canvas.js';
import { generateLSystem, autoCenter, animateDrawing } from '../models/l-system.js';
import * as API from '../api.js';
import { resetAnimationState } from './state.js';

function setConfigState(disabled) {
  document.querySelectorAll('.config').forEach(el => el.disabled = disabled);
}

// Canvas and animation handler

export function onResize(state, elems, ctx) {
  elems.canvas.width = elems.canvas.clientWidth * (parseInt(elems.depthInput.value) + 1);
  elems.canvas.height = elems.canvas.clientHeight * (parseInt(elems.depthInput.value) + 1);
  // on resize, ridisegna per aggiustare la figura
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
      state.animId = setInterval(() => {
        if (animateDrawing(ctx, state.stepSize, state.varObjList, parseInt(elems.angleInput.value), state)) {
          finishAnimation(state, elems);
        }
      }, 0);
    } else {
      while (!animateDrawing(ctx, state.stepSize, state.varObjList, parseInt(elems.angleInput.value), state))
      finishAnimation(state, elems);
    }
  } catch (e) {
    resetAnimationState(state);
    console.error(e);
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

// Variable, UI handlers

export function onAxiomInput(state, elems) {
  state.axiom = elems.axiomInput.value;
  handleObjChange(state, elems);
}

export function handleObjChange(state, elems) {
  let newVars = getVariablesFromDOM(state.axiom);
  let objLabels = state.varObjList.map(m => m.label);

  if (objLabels.some(label => !newVars.includes(label))) {
    let toRemove = objLabels.filter(label => !newVars.includes(label));
    state.varObjList = state.varObjList.filter(m => !toRemove.includes(m.label));
  }

  if (newVars.some(label => !objLabels.includes(label))) {
    state.varObjList.push(...newVars.filter(label => !objLabels.includes(label))
      .map(v => new DrawLine(v, "", getRandColor(elems.backgroundColorInput.value))));
  }

  renderVarsContainer(elems.varsContainer, state.varObjList);
}

export function onVarsContainerChange(e, state, elems) {
  if (e.target && e.target.tagName === 'SELECT') {
    state.varObjList = updateVarsConfigFromDOM(state.varObjList);
    renderVarsContainer(elems.varsContainer, state.varObjList);
    
    if (e.target.value === "moveTo" || e.target.value === "noOp") {
      document.getElementById(`colorInput_${e.target.id.split('_')[1]}`).classList.add("hidden");
    } else {
      document.getElementById(`colorInput_${e.target.id.split('_')[1]}`).classList.remove("hidden");
    }
  }
  
  if (e.target && e.target.tagName === 'INPUT' && e.target.id.startsWith('ruleInput_')) {
    const v = e.target.id.split('_')[1];
    const obj = Variable.findByLabel(state.varObjList, v);
    if (obj) obj.rule = e.target.value || "";
    handleObjChange(state, elems);
  }
}

export function onVarsContainerClick(e, state, elems) {
  if (e.target && e.target.tagName === 'BUTTON') {
    const label = e.target.parentElement.querySelector('label').innerText;
    e.target.parentElement.remove();
    state.varObjList = state.varObjList.filter(m => m.label !== label);
  }
}

export function onConfirmVarClick(state, elems) {
  const label = elems.newVarInput.value.trim();
  if (label.length === 0) {
    alert("Variable cannot be empty!");
  } else if (label.match(REGEX)) {
    alert("Variable cannot be a special character.");
  } else if (state.varObjList.map(obj => obj.label).includes(label)) {
    alert("Variable already exists.");
  } else {
    state.varObjList.push(new DrawLine(label, "", getRandColor(elems.backgroundColorInput.value)));
    renderVarsContainer(elems.varsContainer, state.varObjList);
    elems.varModal.classList.add("hidden");
  }
}

// Auth handlers

export { updateUserUI } from '../views/ui.js'; 

export async function onRegisterSubmit(e, state, elems) {
  e.preventDefault();
  elems.registerError.textContent = '';
  try {
    const data = await API.register(elems.registerUser.value, elems.registerPass.value);
    state.currentUser = data.username;
    updateUserUI(state, elems, () => onLogout(state, elems));
    elems.registerModal.classList.add('hidden');
    elems.registerForm.reset();
  } catch (err) {
    elems.registerError.textContent = err.message;
  }
}

export async function onLoginSubmit(e, state, elems) {
  e.preventDefault();
  elems.loginError.textContent = '';
  try {
    const data = await API.login(elems.loginUser.value, elems.loginPass.value);
    state.currentUser = data.username;
    updateUserUI(state, elems, () => onLogout(state, elems));
    elems.loginModal.classList.add('hidden');
    elems.loginForm.reset();
  } catch (err) {
    elems.loginError.textContent = err.message;
  }
}

export async function onLogout(state, elems) {
  try { await API.logout(); } catch (err) { console.error(err); }
  state.currentUser = null;
  updateUserUI(state, elems, () => onLogout(state, elems));
}

export async function onSaveSubmit(e, state, elems) {
  e.preventDefault();
  elems.saveError.textContent = '';
  const payload = {
    name: elems.drawingNameInput.value,
    axiom: elems.axiomInput.value,
    is_public: elems.drawingPublicInput.checked ? 1 : 0,
    depth: parseInt(elems.depthInput.value),
    angle: parseFloat(elems.angleInput.value),
    starting_rot: parseFloat(elems.rotInput.value),
    line_width: parseFloat(elems.lineWInput.value),
    scale: state.currentScale,
    rules: state.varObjList.map(obj => ({
      variable: obj.label,
      replacement: obj.rule,
      movement_type: obj.constructor.name.charAt(0).toLowerCase() + obj.constructor.name.slice(1),
      color: obj.color || '#000000'
    }))
  };
  try {
    await API.saveDrawing(payload);
    alert('Saved!');
    elems.saveModal.classList.add('hidden');
    elems.saveForm.reset();
  } catch (err) {
    elems.saveError.textContent = err.message;
  }
}

export async function onLoadListOpen(state, elems) {
  elems.loadModal.classList.remove('hidden');
  elems.drawingListContainer.innerHTML = '<p>Loading...</p>';
  try {
    const data = await API.getDrawingsList();
    if (!data.drawings || data.total === 0) {
      elems.drawingListContainer.innerHTML = '<p>No drawings found.</p>';
      return;
    }
    
    elems.drawingListContainer.innerHTML = '<ul>' + data.drawings.map(d => {
      const deleteBtn = d.owner === state.currentUser 
        ? `<button class="delete-item-btn" data-name="${d.name}">🗑️</button>` : '';
      return `<li>
        <span>${d.name} (${d.owner})</span>
        <div class="drawing-item-actions">
          <button class="load-item-btn" data-name="${d.name}" data-owner="${d.owner}">Load</button>
          ${deleteBtn}
        </div>
      </li>`;
    }).join('') + '</ul>';
  } catch (err) {
    elems.drawingListContainer.innerHTML = `<p class="modalError">${err.message}</p>`;
  }
}

export async function onDrawingListClick(e, state, elems, ctx) {
  const target = e.target;
  
  if (target.classList.contains('load-item-btn')) {
    try {
      const data = await API.loadDrawing(target.dataset.name, target.dataset.owner);
      loadDrawingData(data, state, elems, ctx);
      elems.loadModal.classList.add('hidden');
    } catch (err) { alert(err.message); }
  }
  
  if (target.classList.contains('delete-item-btn')) {
    if (!confirm("Delete?")) return;
    try {
      await API.deleteDrawing(target.dataset.name);
      onLoadListOpen(state, elems); 
    } catch (err) { alert(err.message); }
  }
}

function loadDrawingData(data, state, elems, ctx) {
  onResetClick(state, elems, ctx);
  
  elems.axiomInput.value = data.axiom;
  state.axiom = data.axiom;
  elems.depthInput.value = data.depth;
  elems.angleInput.value = data.angle;
  elems.rotInput.value = data.starting_rot;
  elems.lineWInput.value = data.line_width;
  state.currentScale = data.scale;

  const { DrawLine, DrawDot, MoveTo, NoOp } = require('../models/Variable.js');

  state.varObjList = data.rules.map(rule => {
    switch (rule.movement_type) {
      case 'drawLine': return new DrawLine(rule.variable, rule.replacement, rule.color);
      case 'drawDot': return new DrawDot(rule.variable, rule.replacement, rule.color); 
      case 'moveTo': return new MoveTo(rule.variable, rule.replacement); 
      case 'noOp': return new NoOp(rule.variable, rule.replacement); 
      default: return new DrawLine(rule.variable, rule.replacement, getRandColor(elems.backgroundColorInput.value));
    }
  });

  renderVarsContainer(elems.varsContainer, state.varObjList);
  handleObjChange(state, elems);
}