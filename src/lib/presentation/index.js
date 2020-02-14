const State = require('./state');
const SM = require('./machine');

const {scrollTo, setupLocation} = require('../dom-utils.js');

module.exports = function(selector, rootElement) {
    if (!rootElement)
        rootElement = document.body;

    const rootState = new State({
        parent: null,
        element: rootElement,
    });

    /* eslint-disable-next-line no-undef */
    const secMap = new WeakMap();
    const sm = new SM(rootState);

    rootElement.querySelectorAll(selector).forEach((sec) => {
        if (sec.closest('slide-notes,.no-presentation')) return;

        const parentElement = sec.parentElement.closest(selector);
        const parentObj = parentElement ? secMap.get(parentElement) : rootState;

        const detail = {element: sec, parent: parentObj};
        sec.dispatchEvent(
            new CustomEvent('presentationBeforeCreate', {
                bubbles: true,
                detail,
            })
        );

        if (detail.ignore) return;

        const state = new State(detail);
        secMap.set(sec, state);

        detail.state = state;

        sec.dispatchEvent(
            new CustomEvent('presentationAfterCreate', {
                bubbles: true,
                detail,
            })
        );
    });

    return sm;
};
