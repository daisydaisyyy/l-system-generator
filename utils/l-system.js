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

function autoCenter(ctx, offsetX = 0, offsetY = 0) {
  // leggi parametri UI
  const axiom = axiomInput.value;
  const rules = parseRules(rulesInput.value);
  const depth = parseInt(depthInput.value, 10) || 0;
  const angle = parseFloat(angleInput.value) || 0;
  const rotDeg = parseFloat(rotInput.value) || 0;

  let instr;
  try {
    instr = generateLSystem(axiom, rules, depth);
    instr = instr.replace(/\s+/g, ''); // rimuove spazi/newline
  } catch (e) {
    console.error("autoCenter: error generating L-system", e);
    return [parseInt(startxInput.value) || 0, parseInt(startyInput.value) || 0];
  }

  const canvasW = ctx.canvas.width;
  const canvasH = ctx.canvas.height;

  const step = parseFloat(scaleInput.value) || 5;

  // rotazione (converti in radianti)
  const rot = (rotDeg * Math.PI) / 180;
  const rad = d => (d * Math.PI) / 180;

  let tx = 0, ty = 0, dir = 0; // dir in gradi
  let minX = 0, maxX = 0, minY = 0, maxY = 0;
  const stack = [];

  for (let i = 0; i < instr.length; i++) {
    const c = instr[i];
    if (c === 'F' || c === 'f') {
      const dx = Math.cos(dir * Math.PI / 180) * step;
      const dy = Math.sin(dir * Math.PI / 180) * step;
      tx += dx;
      ty += dy;

      const xr = tx * Math.cos(rot) - ty * Math.sin(rot);
      const yr = tx * Math.sin(rot) + ty * Math.cos(rot);

      if (xr < minX) minX = xr;
      if (xr > maxX) maxX = xr;
      if (yr < minY) minY = yr;
      if (yr > maxY) maxY = yr;

    } else if (c === '+') {
      dir += angle;
    } else if (c === '-') {
      dir -= angle;
    } else if (c === '[') {
      stack.push({ tx, ty, dir });
    } else if (c === ']') {
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
      // ignora altri simboli
    }
  }

  if (minX === 0 && maxX === 0 && minY === 0 && maxY === 0) {
    return [0, 0];
  }

  const widthT = Math.max(1e-9, maxX - minX);
  const heightT = Math.max(1e-9, maxY - minY);

  const availW = Math.max(1, canvasW - 2);
  const availH = Math.max(1, canvasH - 2);
  const uniformScale = Math.min(availW / widthT, availH / heightT);

  // centro del bbox 
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  const targetOffsetX = canvasW / 2 - centerX * uniformScale;
  const targetOffsetY = canvasH / 2 - centerY * uniformScale;

  
  const startX = targetOffsetX - canvasW / 2;              // = - centerX * uniformScale
  const startY = canvasH /2 - targetOffsetY;

  return [Math.round(startX), Math.round(startY)];
}
