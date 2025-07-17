
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

// disegna sul canvas
function drawInstructions(ctx, instructions, angle) {
  const stack = [];
  let x = 0, y = 0;
  let currentAngle = -90 * Math.PI/180;
  ctx.save();
  ctx.translate(canvas.width/2, canvas.height);
  ctx.strokeStyle = '#0f0';
  ctx.lineWidth = 2;

  for (const cmd of instructions) {
    switch(cmd) {
      case 'F':
        ctx.beginPath();
        ctx.moveTo(x, y);
        x += Math.cos(currentAngle) * 10;
        y += Math.sin(currentAngle) * 10;
        ctx.lineTo(x, y);
        ctx.stroke();
        break;
      case '+':
        currentAngle += angle * Math.PI/180;
        break;
      case '-':
        currentAngle -= angle * Math.PI/180;
        break;
      case '[':
        stack.push({x, y, currentAngle});
        break;
      case ']':
        ({x, y, currentAngle} = stack.pop());
        ctx.moveTo(x, y);
        break;
    }
  }

  ctx.restore();
}