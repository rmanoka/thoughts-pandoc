const {scrollTo, setupLocation} = require('../dom-utils.js');

function clickHandler(sm) {
  return (ev) => {
    sm.gotoElement(ev.target);
    ev.stopPropagation();
  };
}

function defaultActiveHandler(ev) {
    const {element, state} = ev.detail;
    scrollTo(element);
    if (element.id)
        setupLocation(element.id);
    else if (!state.parent)
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

module.exports = {
    clickHandler,
    defaultActiveHandler,
    gotoLocation,
};
