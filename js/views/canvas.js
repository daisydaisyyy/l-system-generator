export function resetCanvas(ctx) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
  
  export function handleBackgroundColor(ctx, colorInput) {
    document.querySelector('body').style.backgroundColor = colorInput.value || "#ffffff";
    resetCanvas(ctx);
    ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = colorInput.value || '#ffffff';
    ctx.fill();
  }