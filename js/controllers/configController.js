import { getRandColor, REGEX, showMsg } from '../utils.js';
import { getVariablesFromDOM, renderVarsContainer, updateVarsConfigFromDOM } from '../views/ui.js';
import { Variable, DrawLine } from '../models/Variable.js';

// variables and UI handlers
export function onAxiomInput(state, elems) {
  state.axiom = elems.axiomInput.value.replace(/\s+/g, ""); // rimuovo gli spazi
  handleObjChange(state, elems);
}

export function handleObjChange(state, elems) {
  let newVars = getVariablesFromDOM(state.axiom);
  let objLabels = state.varObjList.map(m => m.label);
  
  let hasChanged = false;

  // controllo rimozioni
  if (objLabels.some(label => !newVars.includes(label))) {
    let toRemove = objLabels.filter(label => !newVars.includes(label));
    state.varObjList = state.varObjList.filter(m => !toRemove.includes(m.label));
    hasChanged = true;
  }

  // controllo aggiunte
  if (newVars.some(label => !objLabels.includes(label))) {
    const added = newVars.filter(label => !objLabels.includes(label));
    state.varObjList.push(...added.map(v => new DrawLine(v, "", getRandColor(elems.backgroundColorInput.value))));
    hasChanged = true;
  }

  if (hasChanged) {
    renderVarsContainer(elems.varsContainer, state.varObjList);
  }
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
    if (obj) obj.rule = e.target.value.replace(/\s+/g, "") || "";
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
    showMsg("Variable cannot be empty!");
  } else if (label.match(REGEX)) {
    showMsg("Variable cannot be a special character.");
  } else if (state.varObjList.map(obj => obj.label).includes(label)) {
    showMsg("Variable already exists.");
  } else {
    state.varObjList.push(new DrawLine(label, "", getRandColor(elems.backgroundColorInput.value)));
    renderVarsContainer(elems.varsContainer, state.varObjList);
    elems.varModal.classList.add("hidden");
  }
}
