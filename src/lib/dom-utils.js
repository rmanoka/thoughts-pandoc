const Node = window.Node;

module.exports = {
    createScript(src, target='head', type='text/javascript', defer="defer") {
        const script = document.createElement('script');
        Object.assign(script, {src, type, defer});
        if (target == 'head') {
            document.head.appendChild(script);
        } else if (target == 'body') {
            document.body.appendChild(script);
        } else {
            target.appendChild(script);
        }
    },

    createStyle(css) {
        if (css.href) {
            return createLink(css.href);
        } else {
            if (typeof css !== 'string') css = css.css;
            const style = document.createElement('style');
            style.type = 'text/css';
            style.appendChild(document.createTextNode(css));
            return style;
        }
    },

    createLink(href, rel='stylesheet', type='text/css') {
        const link = document.createElement('link');
        Object.assign(link, {href, rel, type});
        return link;
    },

    createTitle(title) {
        var titleElement = document.createElement('title');
        titleElement.textContent = title;
        return titleElement;
    },

    stackedTraversal(elements, func) {
        const stack = [];

        elements.forEach((el) => {
            while (stack.length) {
                let top = stack[stack.length - 1];
                top = top.element || el;
                let domEl = el.element || el;
                if (closest.call(domEl, top)) {
                    break;
                }
                stack.pop();
            }
            func(el, stack);
            stack.push(el);
        });
    },

    closest(tgt, el) {
        el = el || this;
        if (!el) return null;
        do {
            let out;
            if (typeof tgt === 'function') {
                out = tgt(el);
            } else if (typeof tgt === 'string') {
                out = el.matches(tgt);
            } else if (el === tgt) {
                out = el;
            }
            if (out) return out;
            el = el.parentElement || el.parentNode;
        } while (el !== null && el.nodeType === 1);
        return null;
    },

    positionCmp (a, b) {
        if (a.element) a = a.element;
        if (b.element) b = b.element;
        if (a === b) {
            return 0;
        }
        var position = a.compareDocumentPosition(b);

        if (position & Node.DOCUMENT_POSITION_FOLLOWING || position & Node.DOCUMENT_POSITION_CONTAINED_BY) {
            return -1;
        } else if (position & Node.DOCUMENT_POSITION_PRECEDING || position & Node.DOCUMENT_POSITION_CONTAINS) {
            return 1;
        } else {
            return 0;
        }
    },

    moveChildren(target, src) {
        while(src.childNodes.length > 0) {
            target.appendChild(src.childNodes[0]);
        }
    },

    copyChildren(target, src) {
        let idx = 0;
        while(src.childNodes.length > idx) {
            target.appendChild(src.childNodes[idx].cloneNode(true));
        }
    },

    copyAttrs(src, target) {
        for (var i = 0; i < src.attributes.length; i++) {
            var attr = src.attributes.item(i);
            target.setAttribute(attr.nodeName, attr.nodeValue);
        }

    },

    scrollTo(e, opts) {
        if (!opts) {
            opts = {
                block: 'start',
                inline: 'nearest',
                behavior: 'smooth',
            };
        }
        setTimeout(() => e.scrollIntoView(opts));
    },

    setupLocation(id) {
        if (id) {
            history.replaceState(id, null, `#${id}`);
        } else {
            history.replaceState('root', null, '#');
        }
    },
};
