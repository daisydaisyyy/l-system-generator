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
function drawInstructions(ctx, instructions, angle) {
  const canvas = ctx.canvas;           // grab the actual <canvas> element
  const stack = [];
  let x = 0, y = 0;
  let dir = -Math.PI/2;                // -90°

  ctx.save();
  // center origin at bottom‑center of the canvas
  ctx.translate(canvas.width/2, canvas.height);
  ctx.strokeStyle = '#0f0';
  ctx.lineWidth = 2;

  // OPTIONAL: clear any existing path
  ctx.beginPath();

  for (const cmd of instructions) {
    switch (cmd) {
      case 'F':
        // draw a forward line
        ctx.beginPath();
        ctx.moveTo(x, y);
        x += Math.cos(dir) * 10;
        y += Math.sin(dir) * 10;
        ctx.lineTo(x, y);
        ctx.stroke();
        break;

      case '+':
        dir += angle * Math.PI/180;
        break;

      case '-':
        dir -= angle * Math.PI/180;
        break;

      case '[':
        stack.push({ x, y, dir });
        break;

      case ']':
        // pop back to a branching point
        ({ x, y, dir } = stack.pop());
        // restart path from that point
        ctx.beginPath();
        ctx.moveTo(x, y);
        break;

      case 'X':
        // structural: do nothing
        break;

      default:
        // unknown symbol?
        console.warn('Unhandled symbol in drawInstructions:', cmd);
    }
  }

  ctx.restore();
}
