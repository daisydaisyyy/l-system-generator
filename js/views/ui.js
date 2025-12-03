import { REGEX } from '../utils.js';
import { DrawLine, DrawDot, MoveTo, NoOp } from '../models/Variable.js';

// --- Variable Configuration Helpers ---

export function getVariablesFromDOM(axiom) {
    const vars = new Set();
    axiom.split("").map(c => {
        if (!c.match(REGEX)) vars.add(c);
    });

    let rules = "";
    document.querySelectorAll('.varConfig input[type="text"]').forEach(el => {
        if (el.id.startsWith('ruleInput_')) rules += el.value;
    });
    document.querySelectorAll('.varConfig label').forEach(el => {
        if (el.htmlFor.startsWith('ruleInput_')) rules += el.innerText;
    });

    rules.split("").map(c => {
        if (!c.match(REGEX)) vars.add(c);
    });

    return [...vars.values()];
}

export function renderVarsContainer(container, varObjList) {
    let dynamicElems = '';
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
    container.innerHTML = dynamicElems;
}

export function updateVarsConfigFromDOM(varObjList) {
    const configsList = [];
    varObjList.map(obj => {
        const sel = document.getElementById(`ruleSelect_${obj.label}`).value;
        const color = document.getElementById(`colorInput_${obj.label}`).value;
        const rule = document.getElementById(`ruleInput_${obj.label}`).value == undefined ? obj.rule : document.getElementById(`ruleInput_${obj.label}`).value;

        switch (sel) {
            case 'drawLine': configsList.push(new DrawLine(obj.label, rule, color)); break;
            case 'drawDot': configsList.push(new DrawDot(obj.label, rule, color)); break;
            case 'moveTo': configsList.push(new MoveTo(obj.label, rule)); break;
            case 'noOp': configsList.push(new NoOp(obj.label, rule)); break;
            default: configsList.push(new NoOp(obj.label, rule)); break;
        }
    });
    return configsList;
}

// --- User Interface Helpers ---

export function updateUserUI(state, elems, onLogout) {
  if (state.currentUser) {
    elems.userArea.innerHTML = `
      <span>Welcome, <strong>${state.currentUser}</strong></span>
      <button id="logoutBtn" type="button">Logout</button>
    `;
    elems.showSaveModalBtn.disabled = false;
    elems.showLoadModalBtn.disabled = false;
    document.getElementById('logoutBtn').addEventListener('click', onLogout);
  } else {
    elems.userArea.innerHTML = `
      <button id="showLoginBtn" type="button">Login</button>
      <button id="showRegisterBtn" type="button">Register</button>
    `;
    elems.showSaveModalBtn.disabled = true;
    elems.showLoadModalBtn.disabled = true;
    document.getElementById('showLoginBtn').addEventListener('click', () => elems.loginModal.classList.remove('hidden'));
    document.getElementById('showRegisterBtn').addEventListener('click', () => elems.registerModal.classList.remove('hidden'));
  }
}