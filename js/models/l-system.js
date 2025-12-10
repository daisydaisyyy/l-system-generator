import { Variable, DrawLine, MoveTo } from './Variable.js';
const UPPER_BOUND = 200000;

export function generateLSystem(axiom, varObjList, depth) {
  let cur = axiom;
  for (let i = 0; i < depth; i++) {
    let next = '';
    for (const ch of cur) {
      // cerca l'oggetto e prende la rule se esiste
      next += (Variable.findByLabel(varObjList, ch)?.rule) || ch;
    }

    if(next.length > UPPER_BOUND) { // lancio eccezione se si supera il massimo numero di istruzioni consentite
      throw new Error();
    }
    cur = next;
  }
  return cur;
}

export function animateDrawing(ctx, stepSize, varObjList, angle, state) {

  if (!state.isAnimating || state.curStep >= state.instr.length) {
    // console.log(`Step ${state.curStep + 1}/${state.instr.length}`);

    state.isAnimating = false;
    state.curStep = 0;
    return true;
  }

  const cmd = state.instr[state.curStep];
  const angle_rad = angle * Math.PI / 180;

  switch (cmd) {

    case '+':
      ctx.rotate(-angle_rad);
      break;

    case '-':
      ctx.rotate(angle_rad);
      break;

    case '[':
      ctx.save();
      break;

    case ']':
      ctx.restore();
      break;

    default: // e' una variabile, esegui il movimento associato
      const mov = Variable.findByLabel(varObjList, cmd);
      if (mov) {
        mov.apply(ctx, stepSize);
      }
      break;
  }
  // console.log(`Step ${state.curStep + 1}/${state.instr.length}: ${cmd}`);
  state.curStep++;
  return false;
}


function getBoundingBox(scale = 1, axiom, depth, angle, rotDeg, varObjList) {

  let instr;
  try {
    instr = generateLSystem(axiom, varObjList, depth).replace(/\s+/g, ''); // generate l-system
  } catch (e) {
    return [0, 0];
  }

  const stroke_lenght = 5 * scale;
  const rot = (rotDeg * Math.PI) / 180;

  let tx = 0, ty = 0, dir = 0; // tx, ty = posizione attuale, dir = direzione in gradi
  let minX = tx, maxX = tx, minY = ty, maxY = ty;
  const stack = [];

  // simula il disegno per trovare il "bounding box" = quadrilatero che contiene il disegno
  for (let i = 0; i < instr.length; i++) {
    const c = instr[i];
    if (c === '+') {
      dir -= angle;
    } else if (c === '-') {
      dir += angle;
    } else if (c === '[') {
      stack.push({ tx, ty, dir });
    } else if (c === ']') { // restore state
      const s = stack.pop();
      if (s) {
        tx = s.tx; ty = s.ty; dir = s.dir;
        const xr = tx * Math.cos(rot) - ty * Math.sin(rot);
        const yr = tx * Math.sin(rot) + ty * Math.cos(rot);
        if (xr < minX) minX = xr;
        if (xr > maxX) maxX = xr;
        if (yr < minY) minY = yr;
        if (yr > maxY) maxY = yr;
      }
    } else {
      const mov = Variable.findByLabel(varObjList, c);
      if (mov && (mov instanceof MoveTo || mov instanceof DrawLine)) { // se esiste l'oggetto e ha un movimento di traslazione
        // calcola nuova posizione
        const dx = Math.cos(dir * Math.PI / 180) * stroke_lenght;
        const dy = Math.sin(dir * Math.PI / 180) * stroke_lenght;
        tx += dx; ty += dy;
        const xr = tx * Math.cos(rot) - ty * Math.sin(rot); // ruota x
        const yr = tx * Math.sin(rot) + ty * Math.cos(rot); // ruota y

        // aggiorna bounding box
        if (xr < minX) minX = xr;
        if (xr > maxX) maxX = xr;
        if (yr < minY) minY = yr;
        if (yr > maxY) maxY = yr;
      }
    }
  }

  // console.log(`Bounding Box: (${Math.round(minX)}, ${Math.round(minY)}) to (${Math.round(maxX)}, ${Math.round(maxY)})`);
  return [Math.round(minX), Math.round(minY), Math.round(maxX), Math.round(maxY)];
}

function autoScale(canvasW, canvasH, width, height) {
  const scaleX = (canvasW * 0.4) / (width);
  const scaleY = (canvasH * 0.4) / (height);
  const autoScale = Math.min(scaleX, scaleY)
  return autoScale;
}


// auto center drawing
export function autoCenter(scale = 1, axiom, depth, angle, rot, varObjList, canvasW, canvasH) {
  let [minX, minY, maxX, maxY] = getBoundingBox(scale, axiom, depth, angle, rot, varObjList);
  const width = maxX - minX;
  const height = maxY - minY;

  let zoom = 1;
  zoom = autoScale(canvasW, canvasH, width, height);
  // console.log(`Auto Scale: ${zoom}`);

  maxX *= zoom;
  maxY *= zoom;
  minX *= zoom;
  minY *= zoom;

  const centerX = (maxX + minX);
  const centerY = (maxY + minY);
  // console.log(`Auto Center coords: (${-centerX}, ${centerY})`);
  return [Math.round(-centerX), Math.round(-centerY), zoom];
}