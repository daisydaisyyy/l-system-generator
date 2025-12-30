import { getRandColor, showMsg } from '../utils.js';
import { renderVarsContainer } from '../views/ui.js';
import { DrawLine, DrawDot, MoveTo, NoOp } from '../models/Variable.js';
import * as API from '../api.js';
import { onResetClick } from './canvasController.js';
import { handleObjChange } from './configController.js';

// load
function createDrawingRow(drawing, isOwner) {
  const li = document.createElement('li');

  const span = document.createElement('span');
  span.textContent = `${drawing.name} (${drawing.owner})`;

  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'drawing-item-actions';

  const loadBtn = document.createElement('button');
  loadBtn.textContent = 'Load';
  loadBtn.className = 'load-item-btn';
  loadBtn.dataset.name = drawing.name;
  loadBtn.dataset.owner = drawing.owner;
  actionsDiv.appendChild(loadBtn);

  if (isOwner) {
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑️';
    deleteBtn.className = 'delete-item-btn';
    deleteBtn.dataset.name = drawing.name;
    actionsDiv.appendChild(deleteBtn);
  }

  li.appendChild(span);
  li.appendChild(actionsDiv);
  return li;
}

function renderDrawings(container, list, currentUser) {
  container.textContent = '';

  if (!list || list.length === 0) {
    const p = document.createElement('p');
    p.textContent = 'No drawings in this category.';
    container.appendChild(p);
    return;
  }

  const ul = document.createElement('ul');
  list.forEach(drawing => {
    const li = createDrawingRow(drawing, drawing.owner === currentUser);
    ul.appendChild(li);
  });
  container.appendChild(ul);
}
 
function resetTabButtons(btnMine, btnPublic) {
  const newMine = btnMine.cloneNode(true);
  const newPublic = btnPublic.cloneNode(true);
  
  btnMine.parentNode.replaceChild(newMine, btnMine);
  btnPublic.parentNode.replaceChild(newPublic, btnPublic);
  
  return [newMine, newPublic];
}

function updateTabActiveState(tabMine, tabPublic, isMineActive) {
  if (isMineActive) {
    tabMine.classList.add('active');
    tabPublic.classList.remove('active');
  } else {
    tabMine.classList.remove('active');
    tabPublic.classList.add('active');
  }
}


export async function onLoadListOpen(state, elems) {
  elems.loadModal.classList.remove('hidden');
  const listContainer = elems.drawingListContainer;

  let [tabMine, tabPublic] = resetTabButtons(
    document.getElementById('tabMine'), 
    document.getElementById('tabPublic')
  );

  listContainer.textContent = '';
  const loadingP = document.createElement('p');
  loadingP.textContent = 'Loading...';
  listContainer.appendChild(loadingP);

  try {
    const data = await API.getDrawingsList();
    
    listContainer.textContent = '';

    const allDrawings = data.drawings || [];

    const myDrawings = allDrawings.filter(d => d.owner === state.currentUser);
    const publicDrawings = allDrawings.filter(d => d.owner !== state.currentUser);
    
    tabMine.addEventListener('click', () => {
      updateTabActiveState(tabMine, tabPublic, true);
      renderDrawings(listContainer, myDrawings, state.currentUser);
    });

    tabPublic.addEventListener('click', () => {
      updateTabActiveState(tabMine, tabPublic, false);
      renderDrawings(listContainer, publicDrawings, state.currentUser);
    });

    updateTabActiveState(tabMine, tabPublic, true);
    renderDrawings(listContainer, myDrawings, state.currentUser);

  } catch (err) {
    showMsg("Failed to show drawing list.");
  }
}

export async function onDrawingListClick(e, state, elems, ctx) {
  const target = e.target;
  const msg = "Action failed";
  if (target.classList.contains('load-item-btn')) {
    try {
      const data = await API.loadDrawing(target.dataset.name, target.dataset.owner);
      loadDrawingData(data, state, elems, ctx);
      showMsg(target.dataset.name + " loaded!", true);
      elems.loadModal.classList.add('hidden');
    } catch (err) { showMsg(msg); }
  }
  
  if (target.classList.contains('delete-item-btn')) {
    try {
      await API.deleteDrawing(target.dataset.name);
      showMsg(target.dataset.name + " deleted!", true);
      onLoadListOpen(state, elems); 
    } catch (err) { showMsg(msg); }
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

export async function onSaveSubmit(e, state, elems) {
  e.preventDefault();
  if(!elems.axiomInput.value.trim()) {
    showMsg("Axiom field can't be empty!");
    return;
  }
  
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
    showMsg("Saved!", true);
    elems.saveModal.classList.add('hidden');
    elems.saveForm.reset();
  } catch (err) {
    showMsg("Failed to save. You already own a drawing with this name or connection failed.");
  }

}
