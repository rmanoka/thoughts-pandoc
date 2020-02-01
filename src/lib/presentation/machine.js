module.exports = class StateMachine {
    constructor(rootState) {
        this.currentState = this.rootState = rootState;
    }

    nextState() {
        let newState;
        let state = this.currentState;
        while (state && !(newState = state.nextState())) {
            state = state.parent;
        }
        this.currentState = newState || this.rootState;
    }
    nextPage() {
        let state = this.currentState;
        if (!state.parent) return null;
        state.forward();
        return this.nextState();
    }

    previousPage() {
        let state = this.currentState;
        if (!state.parent) return null;
        state.rewind();
        return this.previousState(false);
    }
    previousState(recurse=true) {
        let newState;
        let state = this.currentState;
        while (state && !(newState = state.previousState(recurse))) {
            state = state.parent;
        }
        this.currentState = newState || this.rootState;
    }

    gotoElement(element) {
        let state = this.rootState.findState(element, false);
        if (!state) return null;
        return this.gotoState(state);
    }
    gotoState(state) {
        return this.currentState = this.rootState.gotoState(state);
    }
    gotoParent() {
        if (this.currentState.parent) {
            return this.gotoState(this.currentState.parent);
        } else {
            return this.gotoState(this.rootState);
        }
    }

    onMessage(message) {
        if (!(typeof(message.data) === 'string')) return;
        const msg = message.data;
        /* eslint-disable-next-line no-console */
        if (msg.startsWith('#')) {
            let el;
            if ((el = document.querySelector(msg))) this.gotoElement(el);
        } else if ([
            'nextState',
            'previousState',
            'gotoParent',
            'previousPage',
            'nextPage'].includes(msg)
        ) {
            this[msg]();
        }
    }
    onKeyUp(ev) {
        if (ev.code === 'ArrowRight') {
            this.nextState();
        } else if (ev.code === 'ArrowLeft') {
            this.previousState();
        } else if (ev.code === 'ArrowUp') {
            this.gotoParent();
        } else if (ev.code === 'PageUp') {
            this.previousPage();
        } else if (ev.code === 'PageDown') {
            this.nextPage();
        } else { return; }
        ev.stopPropagation();
    }
};
