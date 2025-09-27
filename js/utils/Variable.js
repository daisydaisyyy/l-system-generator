// regole da assegnare ai simboli

class Variable {
    constructor(label, rule = "", color = getRandColor()) {
        this.label = label;
        this.color = color;
        this.rule = rule;
    }

    static findByLabel(variables, label) {
        return variables.find(m => m.label === label);
    }

    apply(ctx) {
        throw new Error("apply must be implemented");
    }
}

class DrawLine extends Variable {
    apply(ctx, stepSize) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(stepSize, 0);
        ctx.strokeStyle = this.color || '#000';
        ctx.lineCap = 'round';
        ctx.stroke();
        ctx.translate(stepSize, 0);
    }
}

class MoveTo extends Variable {
    apply(ctx, stepSize) {
        ctx.translate(stepSize, 0);
    }
}

class DrawDot extends Variable {
    apply(ctx) {
        ctx.beginPath();
        ctx.arc(0, 0, ctx.lineWidth / 2, 0, Math.PI * 2);
        ctx.fillStyle = this.color || '#000';
        ctx.fill();
    }
}

class NoOp extends Variable {
    apply() {
        // do nothing
    }
}
