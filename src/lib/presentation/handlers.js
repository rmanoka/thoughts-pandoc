const {scrollTo, setupLocation} = require('../dom-utils.js');

function clickHandler(sm) {
  return (ev) => {
    sm.gotoElement(ev.target);
    ev.stopPropagation();
  };
}

function scrollHandler(ev) {
    const {element, state} = ev.detail;
    if (state !== 'active') return;
    if (element)
        scrollTo(element);
}

function locationHashHandler(ev) {
    const {element, node, state} = ev.detail;
    if (state !== 'active') return;
    if (element.id)
        setupLocation(element.id);
    else if (!node.parent)
        setupLocation(null);
}

function gotoLocation(sm, hash) {
    if (!hash) { hash = location.hash; }
    let el;
    if (location.hash && (el = document.querySelector(location.hash))) {
        sm.gotoElement(el);
    } else {
        sm.gotoState(sm.rootState);
    }
}

function classListHandler(ev) {
    const {element, node, state} = ev.detail;
    const classList = element.classList;
    ['present', 'past', 'future', 'active'].forEach(
        (t) => (t == state) || classList.remove(t)
    );
    classList.add(state);
}

function defaultStateHandler(ev) {
    classListHandler(ev);
    const {element, node, state} = ev.detail;
    if (state !== 'active') return;
    locationHashHandler(ev);
    if (!element.classList.contains('no-scroll'))
        scrollHandler(ev);
}



module.exports = {
    clickHandler,
    scrollHandler, locationHashHandler, classListHandler,
    defaultStateHandler,
    gotoLocation,
};
