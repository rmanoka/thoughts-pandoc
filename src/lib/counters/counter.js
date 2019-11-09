export default class Counter {
    constructor({name,
                 selector, childSelector,
                 mark, markRef,
                 increment, initial}) {
        this.name = name || 'generic-counter';
        this.increment = increment || 1;
        this.initial = initial || 0;

        this.selector = selector || `.${this.name}`;
        this.childSelector = childSelector;

        if (mark) {
            this.mark = mark;
        }
        if (markRef) {
            this.markRef = markRef;
        }
    }

    get(ctx) {
        return ctx[this.name];
    }
    create(el, ctx) {
        ctx[this.name] = new Value({
            value: this.initial,
            parent: ctx[this.name],
        });
    }

    inc(el, ctx) {
        this.get(ctx).value += this.increment;
    }
    getValue(ctx) {
        return this.get(ctx).valueFull().join('.');
    }

    mark(el, val) {
        return val;
    }
    markRef(el, val) {
        return this.mark(el, val);
    }
    print(dom, ctx) {
        if (!dom) return;

        if (typeof this.childSelector === 'function') {
            dom = this.childSelector(dom);
        } else if (typeof this.childSelector === 'string') {
            dom = dom.querySelector(this.childSelector);
        }
        if (!dom) return;

        const el = document.createElement('t-counter');
        this.printMark(el, ctx);
        dom.insertBefore(el, dom.firstChild);
    }

    printRef(el, ctx) {
        let val = this.getValue(ctx);
        el.setAttribute('data-counter-name', this.name);
        el.setAttribute('data-counter-value', val);
        val = this.markRef(el, val);
        el.setAttribute('data-counter-mark', val);
        el.textContent = val;
    }
    printMark(el, ctx) {
        let val = this.getValue(ctx);
        el.setAttribute('data-counter-name', this.name);
        el.setAttribute('data-counter-value', val);
        val = this.mark(el, val);
        el.setAttribute('data-counter-mark', val);
        el.textContent = val;
    }
}

export class Value {
    constructor({value, parent}) {
        this.value = value || 0;
        this.parent = parent;
    }

    valueFull() {
        if (!this.parent) return [this.value];
        return this.parent.valueFull().concat(this.value);
    }
}
