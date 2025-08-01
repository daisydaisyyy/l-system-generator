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


// TODO: optimize?
function animateDrawing(ctx) {
  if (!isAnimating || curStep >= instr.length) {
    isAnimating = false;
    curStep = 0;
    return;
  }

  const cmd = instr[curStep];
  const angle = parseInt(angleInput.value) * Math.PI/180; // in radianti
  const stepSize = 10;

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
      ctx.arc(0, 0, 3, 0, Math.PI*2);
      ctx.fillStyle = '#f00';
      ctx.fill();
      break;
  }

  curStep++;
}


// TODO: fix rotation if not a tree but [ is in the string
// TODO: find starting drawing coords automatically??
function setRotation(instructions, rot) {
  // if tree, goes until first '['
  function treeRot(str, aDeg) {
    const trunk = str.split('[')[0];
    let dx = 0, dy = 0, ang = 0;
    const aRad = aDeg * Math.PI/180;
    for (const cmd of trunk) {
      if ("FGfX".includes(cmd)) {
        dx += Math.cos(ang);
        dy += Math.sin(ang);
      } else if (cmd === '+') {
        ang += aRad;
      } else if (cmd === '-') {
        ang -= aRad;
      }
    }
    // current angle
    const tree_res = Math.atan2(dy, dx) * 180/Math.PI;
    
    return (90 - tree_res);
  }

  // general drawing helper: vectorial sum on entire string
  function generalRot(s, aDeg) {
    let dx = 0, dy = 0, ang = 0;
    const aRad = aDeg * Math.PI/180;
    for (const cmd of s) {
      if ("FGfX".includes(cmd)) {
        dx += Math.cos(ang);
        dy += Math.sin(ang);
      } else if (cmd === '+') {
        ang += aRad;
      } else if (cmd === '-') {
        ang -= aRad;
      }
    }
    // align vector horizontally
    console.log(dx,dy);
    return Math.atan2(dy, dx) * 180/Math.PI;
  }

  
  let result = 0;
  if (instructions.includes('[')) {
    console.log("TREE");
    return -treeRot(instructions, rot);
  } else { 
    console.log("GENERAL");
    return generalRot(instructions, rot);
  }

}