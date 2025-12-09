// funzioni per gestire l'interfaccia utente

import { REGEX } from '../utils.js';
import { DrawLine, DrawDot, MoveTo, NoOp } from '../models/Variable.js';

export function getVariablesFromDOM(axiom) {
    const vars = new Set();
    axiom.split("").map(c => {
        if (!c.match(REGEX)) vars.add(c);
    });

    let rules = "";
    document.querySelectorAll('.varConfig input[type="text"]').forEach(el => {
        if (el.id.startsWith('ruleInput_')) rules += el.value;
    });
    document.querySelectorAll('.varConfig label').forEach(el => {
        if (el.htmlFor.startsWith('ruleInput_')) rules += el.innerText;
    });

    rules.split("").map(c => {
        if (!c.match(REGEX)) vars.add(c);
    });

    return [...vars.values()];
}

export function renderVarsContainer(container, varObjList) {
    container.textContent = '';

    varObjList.forEach(obj => {
        // variable container
        const div = document.createElement('div');
        div.id = `varContainer_${obj.label}`;
        div.className = 'varConfig';

        // label
        const label = document.createElement('label');
        label.htmlFor = `ruleInput_${obj.label}`;
        label.textContent = obj.label;

        // rule input
        const inputRule = document.createElement('input');
        inputRule.type = 'text';
        inputRule.id = `ruleInput_${obj.label}`;
        inputRule.className = 'config';
        inputRule.placeholder = 'rule';
        inputRule.value = obj && obj.rule ? obj.rule : "";

        // movement type
        const select = document.createElement('select');
        select.id = `ruleSelect_${obj.label}`;
        select.className = 'config';

        const options = [
            { val: 'drawLine', text: 'Draw Line', selected: obj instanceof DrawLine },
            { val: 'drawDot', text: 'Draw Dot', selected: obj instanceof DrawDot },
            { val: 'moveTo', text: 'Move To', selected: obj instanceof MoveTo },
            { val: 'noOp', text: 'Do nothing', selected: obj instanceof NoOp }
        ];

        options.forEach(optData => {
            const opt = document.createElement('option');
            opt.value = optData.val;
            opt.textContent = optData.text;
            if (optData.selected) opt.selected = true;
            select.appendChild(opt);
        });

        // input color
        const inputColor = document.createElement('input');
        inputColor.type = 'color';
        inputColor.id = `colorInput_${obj.label}`;
        inputColor.className = 'config';
        if (obj instanceof NoOp || obj instanceof MoveTo) {
            inputColor.classList.add('hidden');
        }
        inputColor.value = obj ? obj.color : "#00ff00";

        // button
        const btn = document.createElement('button');
        btn.className = 'config';
        btn.type = 'button';
        btn.textContent = '-';

        div.appendChild(label);
        div.appendChild(inputRule);
        div.appendChild(select);
        div.appendChild(inputColor);
        div.appendChild(btn);

        container.appendChild(div);
    });
}

export function updateVarsConfigFromDOM(varObjList) {
    const configsList = [];
    varObjList.map(obj => {
        const sel = document.getElementById(`ruleSelect_${obj.label}`).value;
        const color = document.getElementById(`colorInput_${obj.label}`).value;
        const rule = document.getElementById(`ruleInput_${obj.label}`).value == undefined ? obj.rule : document.getElementById(`ruleInput_${obj.label}`).value;

        switch (sel) {
            case 'drawLine': configsList.push(new DrawLine(obj.label, rule, color)); break;
            case 'drawDot': configsList.push(new DrawDot(obj.label, rule, color)); break;
            case 'moveTo': configsList.push(new MoveTo(obj.label, rule)); break;
            case 'noOp': configsList.push(new NoOp(obj.label, rule)); break;
            default: configsList.push(new NoOp(obj.label, rule)); break;
        }
    });
    return configsList;
}
