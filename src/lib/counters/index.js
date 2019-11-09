const {stackedTraversal, positionCmp, moveChildren} = require('../dom-utils.js');
const Counter = require('./counter.js').default;

module.exports = function(dom, counters) {
    if (!counters) return;
    if (Array.isArray(counters)) {
        counters = counters.reduce((acc, c) => {
            if (typeof c === 'string') {
                acc[c] = new Counter({name: c});
            } else {
                acc[c.name] = c;
            }
            return acc;
        }, {});
    }

    // Collect all relevant elements from dom.
    const els = Object.keys(counters).reduce((acc, key) => {
        const sel = counters[key].selector || key;
        dom.querySelectorAll(sel).forEach(
            (el) => acc.push({key, element: el})
        );
            return acc;
    }, []).sort(positionCmp);


    // Create root counters of each type
    const root = {counters};
    Object.keys(counters).forEach(
        (k) => counters[k].create(dom, root)
    );

    // Collect referenced elements
    const refMap = new WeakMap();
    dom.querySelectorAll('t-reference').forEach((el) => {
        let ctx;
        const label = el.getAttribute('data-label');
        if (!label) {
            console.warn('No label found: ', el);
            return;
        }

        const labelEl = dom.querySelector([`[id="${label}"]`]);
        if (!labelEl) {
            console.log(`Element #${label} not found`);
            return;
        }

        let refs = refMap.get(labelEl);
        if (!refs) {
            refs = [];
            refs.label = label;
            refMap.set(labelEl, refs);
        }
        refs.push(el);
    });

    // Maintain el -> counter map
    const map = new WeakMap();
    stackedTraversal(els, ({element, key}, stack) => {
        let ctx;
        let parentEl;
        if (stack.length) {
            parentEl = stack[stack.length-1];
            parentEl = parentEl.element;
            ctx = map.get(parentEl);
        } else {
            ctx = root;
        }

        let cnt = counters[key];
        cnt.inc(element, ctx);
        cnt.print(element, ctx);

        let el = element;
        while (el) {
            let refs = refMap.get(el);
            if (refs) {
                for(let ref of refs) {
                    cnt.printRef(ref, ctx);
                    let parentEl = ref.parentElement;
                    if (parentEl) {
                        const a = document.createElement('a');
                        a.setAttribute('href', `#${refs.label}`);
                        moveChildren(a, ref);
                        ref.appendChild(a);
                    }
                }
                refMap.delete(el);
            }
            el = el.parentElement || el.parentNode;
        }

        let newCtx = Object.create(ctx);
        cnt.create(element, newCtx);
        map.set(element, newCtx);
    });
};
