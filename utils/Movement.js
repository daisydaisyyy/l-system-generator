// regole da assegnare ai simboli

class Movement {
    constructor(label, color) {
        this.label = label;
        this.color = color;
    }

    static findByLabel(movements, label) {
        return movements.find(m => m.label === label);
    }

    apply(ctx) {
        throw new Error("apply must be implemented");
    }
}

class DrawLine extends Movement {
    apply(ctx, stepSize) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(stepSize, 0);
        ctx.strokeStyle = this.color || '#000';
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
    apply(ctx) {
        ctx.beginPath();
        ctx.arc(0, 0, ctx.lineWidth / 2, 0, Math.PI * 2);
        ctx.fillStyle = this.color || '#000';
        ctx.fill();
    }
}

class NoOp extends Movement {
    apply() {
        // do nothing
    }
}
