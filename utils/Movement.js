// regole da assegnare ai simboli

class Movement {
    constructor(label) {
        this.label = label;
    }

    static findByLabel(movements, label) {
        return movements.find(m => m.label === label);
    }

    static fromVarsList(variables) {
        return variables.map(v => {
            switch (v.movement) {
                case 'DrawLine': return new DrawLine(v.label);
                case 'MoveTo': return new MoveTo(v.label);
                case 'DrawDot': return new DrawDot(v.label);
                default: return new NoOp(v.label);
            };
        });
    }

    apply(ctx, state) {
        throw new Error("apply must be implemented");
    }
}

class DrawLine extends Movement {
    apply(ctx, state) {
        ctx.beginPath();
        ctx.moveTo(state.x, state.y);
        state.x += Math.cos(state.angle) * state.step;
        state.y += Math.sin(state.angle) * state.step;
        ctx.lineTo(state.x, state.y);
        ctx.stroke();
    }
}

class MoveTo extends Movement {
    apply(ctx, state) {
        state.x += Math.cos(state.angle) * state.step;
        state.y += Math.sin(state.angle) * state.step;
    }
}

class DrawDot extends Movement {
    apply(ctx, state) {
        ctx.beginPath();
        ctx.arc(state.x, state.y, 2, 0, 2 * Math.PI);
        ctx.fill();
    }
}

class NoOp extends Movement {
    apply(ctx, state) {
        // do nothing
    }
}
