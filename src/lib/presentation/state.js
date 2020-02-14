module.exports = class State {
    constructor(opts) {
        Object.assign(this, opts);
        if (this.parent)
            this.parent._addChild(this);
        this.children = [];
    }

    nextState() {
        if (this.state === 'past') return null;
        if (this.state === 'future') {
            this._setState('present', 0);
            return this;
        }
        this.childIndex = this.childIndex + 1;
        if (this.childIndex > this.children.length) {
            this._setState('past');
            return null;
        }
        this._setupElement();
        return this.children[this.childIndex-1].nextState();
    }
    previousState(recurse=true) {
        if (this.state === 'future') return null;
        if (this.state === 'past') {
            if (recurse)
                this._setState('present', this.children.length);
            else
                this._setState('present', 0, true);
            if (this.childIndex == 0)
                return this;
            else
                return this.children[this.childIndex-1].previousState();
        }
        this.childIndex = this.childIndex - 1;
        if (this.childIndex < 0) {
            this._setState('future');
            return null;
        }
        this._setupElement();
        if (this.childIndex > 0)
            return this.children[this.childIndex-1].previousState(recurse);
        else
            return this;
    }

    rewind() {
        this._setState('future', null, true);
    }
    forward() {
        this._setState('past', null, true);
    }

    isParent(element) {
        if (!this.element) return false;
        while (element != null) {
            if (element === this.element) return true;
            element = element.parentElement;
        }
        return false;
    }
    isParentState(state) {
        while (state != null) {
            if (state == this) return true;
            state = state.parent;
        }
        return false;
    }

    findState(element, exact) {
        if (!this.isParent(element)) return null;

        if (this.element === element) {
            return this;
        }

        for (let c of this.children) {
            let done = c.findState(element, exact);
            if (done) return done;
        }
        return exact ? null : this;
    }
    gotoState(state) {
        if (!this.isParentState(state)) return null;
        let index, finalState;
        if (state === this) {
            finalState = this;
            index = 0;
        } else {
            let idx=0;
            for (let c of this.children) {
                if ((finalState = c.gotoState(state))) {
                    index = idx + 1;
                    break;
                }
                idx = idx + 1;
            }
        }
        this._setState('present', index, true);
        return finalState;
    }

    _addChild(s) {
        this.children.push(s);
    }
    _setupElement() {
        if (!this.element) return;

        let state = this.state;
        if (this.state === 'present' && this.childIndex == 0) {
            state = 'active';
        }

        this.element.dispatchEvent(
            new CustomEvent('presentationState', {
                bubbles: true,
                detail: {
                    element: this.element,
                    state: state,
                    node: this,
                },
            })
        );
    }


    _setState(state, index, propogate=false) {
        this.state = state;
        this.childIndex = index;
        if (propogate) {
            if (this.state !== 'present') {
                this.children.forEach((c) => c._setState(state, index, propogate));
            } else {
                this.children.forEach((c, idx) => {
                    if (idx >= index) {
                        c._setState('future', null, propogate);
                    } else if (idx < index - 1) {
                        c._setState('past', null, propogate);
                    }
                });
            }
        }
        this._setupElement();
    }
};
