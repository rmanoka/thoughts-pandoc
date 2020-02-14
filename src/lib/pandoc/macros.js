const {metaToObject} = require('./utils.js');

const SIMPLE_TEX_REGEX = /\\([a-zA-Z]+)\{(.*)\}/;
const ADD_CLASS_ARG_REGEX = /([a-zA-Z-0-9]+):(.*)/;

const render = require('../render.js');

module.exports = function(P) {
    return class extends P {
        constructor({includes, blockMacros, inlineMacros, ...rest}) {
            super(rest);
            if (blockMacros) {
                this.blockMacros = metaToObject(blockMacros);
            } else {
                this.blockMacros = {};
            }
            if (inlineMacros) {
                this.inlineMacros = metaToObject(inlineMacros);
            } else {
                this.inlineMacros = {};
            }
            if (includes) {
                this.includes = includes;
            }
        }

        renderBlockMacrotex(data) {
            const matches = SIMPLE_TEX_REGEX.exec(data);
            if (!matches) {
                console.warn(`Warning: unknown block macro invocation: ${data}`);
                return;
            }
            const macro = matches[1];
            const arg = matches[2];
            if (macro === 'newcommand') {
                return;
            } else if (macro === 'include') {
                const ast = this.includes[arg];
                if (!ast) {
                    console.warn(`Warning: no include ${arg} found.`);
                    return;
                }
                render(ast, this.element, this);
            } else if (macro === 'addClass') {
                this.macroTexaddClass(arg);
            } else {
                console.warn(`Warning: unknown block macro: ${macro}`);
            }
        }

        renderInlineMacrotex(data) {
            const matches = SIMPLE_TEX_REGEX.exec(data);
            if (!matches) {
                console.warn(`Warning: unknown inline macro invocation: ${data}`);
                return;
            }
            const macro = matches[1];
            const arg = matches[2];
            if (macro === 'addClass') {
                this.macroTexaddClass(arg);
            } else {
                console.warn(`Warning: unknown inline macro: ${macro}`);

            }
        }

        macroTexaddClass(arg) {
            let el = this.element;
            let idx = this.stack.length;

            const matches = ADD_CLASS_ARG_REGEX.exec(arg);
            if (!matches) {
                console.warn(`Warning: can't parse addClass arg: ${arg}`);
                return;
            }
            const sel = matches[1];
            const exp = matches[2];
            while (el) {
                if (el.matches(sel)) {
                    break;
                }
                idx = idx - 1;
                if (idx >= 0)
                    el = this.stack[idx];
                else
                    el = null;
            }
            if (!el) {
                console.warn(`Warning: addClass: no element matched selector: ${sel}`);
                return;
            }
            for(let cl of exp.split(' ')) {
                if (!cl) continue;
                if (cl[0] === '.') {
                    el.classList.add(cl.slice(1));
                } else if (cl[0] === '#') {
                    el.setAttribute('id', cl.slice(1));
                } else {
                    console.warn(`Warning: addClass only supports classes ('.class') or ids ('#id') at present.`);
                    console.warn(`Got argument: '${cl}'`);
                }
            }
        }
    };
};
