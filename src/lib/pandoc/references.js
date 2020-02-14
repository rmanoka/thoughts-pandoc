const counterTransform = require('../counters');
const Counter = require('../counters/counter.js');
const sectioning = require('../sectioning');

const {metaToObject, metaToString} = require('./utils.js');

module.exports = function(P) {
    return class extends P {
        constructor({counters, sectioning, ...rest} = {}) {
            super(rest);
            // if (typeof this.meta.attr === 'undefined') {
            //     this.meta.attr = this.appendAttrs.bind(this);
            // }
            if (counters &&
                ((counters = metaToObject(counters, true))))
                this.counters = counters;

            if (!sectioning
                || metaToObject(sectioning))
                this.sectioning = true;
            else
                this.sectioning = false;
        }

        render(ast, dom) {
            super.render(ast, dom);
            if (!this.parent) {
                if (this.sectioning)
                    sectioning(dom);
                if (this.counters)
                    counterTransform(dom, this.counters);
            }
        }

        renderInlineCite([cites, inlines]) {
            for(let c of cites) {
                this.renderInlines(c.citationPrefix);
                this.appendReference(c.citationId);
                this.renderInlines(c.citationSuffix);
            }
        }

        // appendAttrs(lbl) {
        //     const {selector, attrs} = parseAttrs(lbl);
        //     if (!selector) {
        //         this.addAttrs(this.element, attrs);
        //         return;
        //     }
        //     let el = this.element, idx = this.stack.length;
        //     while (el) {
        //         if (el.matches(selector)) break;
        //         idx -= 1;
        //         if (idx >= 0) el = this.stack[idx];
        //         else el = null;
        //     }
        //     if (el)
        //         this.addAttrs(el, attrs);
        // }

        appendReference(label) {
            const lbl = this.createElement('t-reference');
            if (label)
                lbl.setAttribute('data-label', label);
            this.element.appendChild(lbl);
        }
    };
};
