// L-System implementation
function generateLSystem(axiom, rules, depth) {
  let current = axiom;
  for (let i = 0; i < depth; i++) {
    let next = '';
    for (const ch of current) {
      next += rules[ch] || ch;
    }
    current = next;
  }
  return current;
}


function animateDrawing(ctx) {
  if (!isAnimating || currentStep >= instructions.length) {
    isAnimating = false;
    return;
  }

  const cmd = instructions[currentStep];
  const angle = parseInt(angleInput.value);
  const stepSize = 10;

  switch (cmd) {
    case 'F':
      ctx.beginPath();
      ctx.moveTo(animationState.x, animationState.y);
      animationState.x += Math.cos(animationState.angle * Math.PI/180) * stepSize;
      animationState.y += Math.sin(animationState.angle * Math.PI/180) * stepSize;
      ctx.lineTo(animationState.x, animationState.y);
      ctx.stroke();
      break;

    case 'f':
      animationState.x += Math.cos(animationState.angle * Math.PI/180) * stepSize;
      animationState.y += Math.sin(animationState.angle * Math.PI/180) * stepSize;
      break;

    case '+':
      animationState.angle += angle;
      break;

    case '-':
      animationState.angle -= angle;
      break;

    case '[':
      animationState.stack.push({
        x: animationState.x,
        y: animationState.y,
        angle: animationState.angle
      });
      break;

    case ']':
      if (animationState.stack.length > 0) {
        const saved = animationState.stack.pop();
        animationState.x = saved.x;
        animationState.y = saved.y;
        animationState.angle = saved.angle;
        ctx.beginPath();
        ctx.moveTo(animationState.x, animationState.y);
      }
      break;

    case '.':
      ctx.beginPath();
      ctx.arc(animationState.x, animationState.y, 3, 0, Math.PI*2);
      ctx.fillStyle = '#f00';
      ctx.fill();
      break;
  }

  currentStep++;
  animId = requestAnimationFrame(() => animateDrawing(ctx));
}