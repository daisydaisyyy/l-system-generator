// regole da assegnare ai simboli

class Movement {
    constructor(label) {
        this.label = label;
    }

    static findByLabel(movements, label) {
        return movements.find(m => m.label === label);
    }

    apply(ctx, stepSize) {
        throw new Error("apply must be implemented");
    }
}

class DrawLine extends Movement {
    apply(ctx, stepSize) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(stepSize, 0);
        ctx.stroke();
        ctx.translate(stepSize, 0);
    }
}

class MoveTo extends Movement {
    apply(ctx, stepSize) {
        ctx.translate(stepSize, 0);
    }
}

class DrawDot extends Movement {
    apply(ctx, stepSize) {
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#f00';
        ctx.fill();
    }
}

class NoOp extends Movement {
    apply(ctx, stepSize) {
        // do nothing
    }
}
