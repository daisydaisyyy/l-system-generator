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
function setRot(instructions, angleDeg) {
  const MOVE_CHARS = new Set(['F','G','f','X','A','B']); // estendi se serve

  // 1) helper per gli alberi (c’è almeno un '[')
  function treeRot(s) {
    // prendi solo il tronco (fino al primo '[')
    const trunk = s.split('[')[0];
    console.log("trunk: " + trunk);
    let dx = 0, dy = 0, ang = 0;
    const aRad = angleDeg * Math.PI/180;
    console.log("angle: " + aRad);
    for (const cmd of trunk) {
      if (MOVE_CHARS.has(cmd)) {
        dx += Math.cos(ang);
        dy += Math.sin(ang);
        console.log(dy);
      } else if (cmd === '+') {
        ang += aRad;
      } else if (cmd === '-') {
        ang -= aRad;
      }
      
    }
    // angolo del vettore tronco rispetto all'asse X
    console.log(dy,dx);
    const treeAng = Math.atan2(dy, dx) * 180/Math.PI;
    console.log("tree angle: " + treeAng);
    // vogliamo che il tronco punti verso l'alto (90°)
    return 90 - treeAng;
  }

  // 2) helper per frattali generali (no '[')
  function generalRot(str) {
    let dx = 0, dy = 0, ang = 0;
    const aRad = angleDeg * Math.PI/180;

    for (const cmd of str) {
      if ("FGfX".includes(cmd)) {
        dx += Math.cos(ang);
        dy += Math.sin(ang);
      } else if (cmd === '+') {
        ang += aRad;
      } else if (cmd === '-') {
        ang -= aRad;
      }
    }
   
    console.log(dy,dx);
    const meanAng = Math.atan2(dy, dx) * 180/Math.PI;
    console.log("gen angle: " + meanAng);
   
    return -meanAng;
  }

  if (instructions.includes('[')) {
    console.log("TREE");
    return -treeRot(instructions);
  } else {
    console.log("GENERAL");
    //return (generalRotation(instructions));
    let a = (generalRot(instructions) > 0) ? 180 : 0;
    return a;
  }
}
