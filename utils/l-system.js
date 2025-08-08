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


function animateDrawing(ctx) {
  if (!isAnimating || curStep >= instr.length) {
    isAnimating = false;
    curStep = 0;
    return true;
  }

  const cmd = instr[curStep];
  const angle = parseInt(angleInput.value) * Math.PI / 180;

  ctx.lineWidth = 2;

  switch (cmd) {
    case 'F':
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(stepSize, 0);
      ctx.strokeStyle = '#0f0'; // green
      ctx.stroke();
      ctx.translate(stepSize, 0);
      break;

    case 'G':
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(stepSize, 0);
      ctx.strokeStyle = '#f00'; // red
      ctx.stroke();
      ctx.translate(stepSize, 0);
      break;

    case 'X':
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(stepSize, 0);
      ctx.strokeStyle = '#ff0'; // yellow
      ctx.stroke();
      ctx.translate(stepSize, 0);
      break;

    case 'f':
      ctx.translate(stepSize, 0);
      break;

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

    case '.':
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#f00';
      ctx.fill();
      break;
  }

  curStep++;
}


function autoCenter(ctx) {
  let instr, axiom = axiomInput.value, rules = parseRules(rulesInput.value), depth = parseInt(depthInput.value);
  let angle = parseInt(angleInput.value) || 0;
  try {
    instr = generateLSystem(axiom, rules, depth);
  } catch (e) {
    console.error("autoCenter: error generating L-system", e);
    return [parseInt(startxInput.value) || 0, parseInt(startyInput.value) || 0];
  }

  // auto centering logic
  
  // calcola dimensioni canvas come le avrai al momento del draw (seguendo la tua logica in startBtn)
  let effW = ctx.canvas.clientWidth;
  let effH = ctx.canvas.clientHeight;
  const scaleSetting = parseFloat(scaleInput.value) || 5;
  if (scaleSetting !== 5) {
    effW = ctx.canvas.clientWidth / (scaleSetting / 5);
    effH = ctx.canvas.clientHeight / (scaleSetting / 5);
  }

  // Simula il percorso e calcola bbox, applicando anche la rotazione finale (rot) perché tu ruoti
  // il contesto dopo aver tradotto: dobbiamo ruotare i punti per prevedere l'ingombro finale.
  const rad = a => a * Math.PI / 180;
  const rot = parseInt(rotInput.value) * Math.PI / 180; 
  let tx = 0, ty = 0, dir = 0;
  let minX = 0, maxX = 0, minY = 0, maxY = 0;
  const stack = [];

  for (let i = 0; i < instr.length; i++) {
    const c = instr[i];
    if (c === 'F' || c === 'f') {
      // movimento in coordinate turtle (y positivo verso il basso come canvas)
      const dx = Math.cos(dir * Math.PI / 180) * stepSize;
      const dy = Math.sin(dir * Math.PI / 180) * stepSize;
      tx += dx; ty += dy;

      // ruota il punto attuale intorno all'origine di disegno (rot)
      const xr = tx * Math.cos(rot) - ty * Math.sin(rot);
      const yr = tx * Math.sin(rot) + ty * Math.cos(rot);

      if (xr < minX) minX = xr; if (xr > maxX) maxX = xr;
      if (yr < minY) minY = yr; if (yr > maxY) maxY = yr;
    } else if (c === '+') {
      dir += angle;
    } else if (c === '-') {
      dir -= angle;
    } else if (c === '[') {
      stack.push({ tx, ty, dir });
    } else if (c === ']') {
      const s = stack.pop();
      if (s) { tx = s.tx; ty = s.ty; dir = s.dir; }
      // aggiorna bbox anche sul punto di ritorno perché potremmo spostarci lì
      const xr = tx * Math.cos(rot) - ty * Math.sin(rot);
      const yr = tx * Math.sin(rot) + ty * Math.cos(rot);
      if (xr < minX) minX = xr; if (xr > maxX) maxX = xr;
      if (yr < minY) minY = yr; if (yr > maxY) maxY = yr;
    }
  
  }

  // Se non ci sono spostamenti, niente da fare: ritorno 0,0
  if (minX === 0 && maxX === 0 && minY === 0 && maxY === 0) {
    return [0, 0];
  }

  // bbox dimensioni in turtle-space già ruotate
  const widthT = Math.max(1e-9, maxX - minX);
  const heightT = Math.max(1e-9, maxY - minY);

  // calcola scale uniforme per "fit" come fai nel demo 
  const availW = Math.max(1, effW - 2);
  const availH = Math.max(1, effH - 2);
  const uniformScale = Math.min(availW / widthT, availH / heightT);

  // centro del bbox (in turtle-space ruotato)
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  // traduzione che porta il centro del bbox al centro del canvas (in pixel)
  const targetOffsetX = effW / 2 - centerX * uniformScale;
  const targetOffsetY = effH / 2 - centerY * uniformScale;

  // la tua startBtn fa: ctx.translate(effW/2 + startX, effH*15/16 - startY)
  // vogliamo trovare startX e startY tali che:
  //   effW/2 + startX == targetOffsetX  => startX = targetOffsetX - effW/2
  //   effH*15/16 - startY == targetOffsetY => startY = effH*15/16 - targetOffsetY
  const startX = targetOffsetX - effW / 2; // = -centerX * uniformScale
  const startY = effH * 15 / 16 - targetOffsetY;

  return [Math.trunc(startX), Math.trunc(startY)];



}