// const {createStyle} = require('dom-utils');
const {metaToObject} = require('./utils');
const katex = require('katex');

module.exports = function(P) {
    return class extends P {
        constructor({mathMacros, ...rest}) {
            super(rest);
            if (mathMacros) {
                mathMacros = metaToObject(mathMacros);
            }
            if (mathMacros) {
                mathMacros = normalizeMacros(mathMacros);
            }
            this.mathMacros = mathMacros || {};
        }
        render(...args) {
            super.render(...args);
            if (this.usesMath) {
                require('katex/dist/katex.min.css');
            }
        }

        renderInlineMath(child) {
            this.usesMath = true;
            const code = child[1];
            const displayMode = child[0].t !== 'InlineMath';
            this.pushElement('span');
            katex.render(code, this.element, {
                displayMode,
                strict: false,
                trust: true,
                macros: this.mathMacros || {},
                throwOnError: false,
            });
            this.popElement();
        }
    };
};

function normalizeMacros(macros) {
    return Object.keys(macros).reduce((acc, key) => {
        let okey = key;
        if (!key.startsWith('\\')) key = '\\' + key;
        acc[key] = macros[okey];
        return acc;
    }, {});
}
