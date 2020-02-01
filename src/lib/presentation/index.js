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

        const state = new State({parent: parentObj, element: sec, scrollParent: rootElement});
        secMap.set(sec, state);
    });

    return sm;
};
