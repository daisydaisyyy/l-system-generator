
// L-System implementation
function generateLSystem(axiom, rules, depth) {
  let cur = axiom;
  for (let i = 0; i < depth; i++) {
    let next = '';
    for (const ch of cur) {
      next += rules[ch] || ch;
    }
    cur = next;
  }
  return cur;
}


function animateDrawing(ctx, stepSize, movList) {
  if (!isAnimating || curStep >= instr.length) {
    isAnimating = false;
    curStep = 0;
    return true;
  }

  const cmd = instr[curStep];
  const angle = parseInt(angleInput.value) * Math.PI / 180;

  switch (cmd) {

    case '+':
      ctx.rotate(angle);
      break;

    case '-':
      ctx.rotate(-angle);
      break;

    case '[':
      ctx.save();
      break;

    case ']':
      ctx.restore();
      break;

    default: // e' una variabile, esegui il movimento associato
      const mov = Movement.findByLabel(movList, cmd);
      if (mov) {
        mov.apply(ctx, stepSize);
      }
      break;
  }

  curStep++;
}


function getBoundingBox(scale = 1, axiom, rules) {
  const depth = parseInt(depthInput.value, 10) || 0;
  const angle = parseFloat(angleInput.value) || 0;
  const rotDeg = parseFloat(rotInput.value) || 0;

  let instr;
  try {
    instr = generateLSystem(axiom, rules, depth).replace(/\s+/g, ''); // generate l-system
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
      dir += angle;
    } else if (c === '-') {
      dir -= angle;
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
      const mov = Movement.findByLabel(movList, c);
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
function autoCenter(scale = 1, axiom, rules, canvasW, canvasH) {
  let [minX, minY, maxX, maxY] = getBoundingBox(scale, axiom, rules);
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
