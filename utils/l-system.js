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
  const axiom = axiomInput.value;
  const rules = parseRules(rulesInput.value);
  const depth = parseInt(depthInput.value, 10) || 0;
  const angle = parseFloat(angleInput.value) || 0;
  const rotDeg = parseFloat(rotInput.value) || 0;
  const scale = parseFloat(scaleInput.value) || 5;

  let instr;
  try {
    instr = generateLSystem(axiom, rules, depth).replace(/\s+/g, '');
  } catch (e) {
    return [Math.round(parseInt(startxInput.value) || 0), Math.round(parseInt(startyInput.value) || 0)];
  }

  if (scale !== 5) {
    effW = ctx.canvas.clientWidth / (scale / 5);
    effH = ctx.canvas.clientHeight / (scale / 5);
  }

  const step = scale;
  const rot = (rotDeg * Math.PI) / 180;

  let tx = offsetX, ty = offsetY, dir = 0;
  let minX = tx, maxX = tx, minY = ty, maxY = ty;
  const stack = [];

  for (let i = 0; i < instr.length; i++) {
    const c = instr[i];
    if (c === 'F' || c === 'f') {
      const dx = Math.cos(dir * Math.PI / 180) * step;
      const dy = Math.sin(dir * Math.PI / 180) * step;
      tx += dx; ty += dy;
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
    }
  }

  if (minX === maxX && minY === maxY) {
    return [Math.round(parseInt(startxInput.value) || 0), Math.round(parseInt(startyInput.value) || 0)];
  }

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const startX = -centerX;
  const startY = centerY;

  return [Math.round(startX), Math.round(startY)];
}
