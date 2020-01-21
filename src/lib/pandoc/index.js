const nullAttr = [null, [], []];
const math = require('./math.js');
const refs = require('./references.js');

const { inlineToString } = require('./utils.js');

class Pandoc {
    constructor({simpleInlines, deps}={}) {
        simpleInlines = Object.assign({
            Emph: 'em',
            Strong: 'strong',
            Strikeout: 's',
            Superscript: 'sup',
            Subscript: 'sub',
        }, simpleInlines);
        for(let key of Object.keys(simpleInlines)) {
           this[`renderInline${key}`] =
                (child) => this.renderInlineSimpleTag(
                    simpleInlines[key], child);
        }
        this.deps = deps;
    }

    render(blocks, dom) {
        this.stack = [];
        this.footnotes = [];
        this.element = dom;

        this.renderBlocks(blocks);
        if (this.footnotes.length) {
            this.renderFootnotes();
        }
    }

    // renderAst(ast) {
    //     this.renderBlocks(ast.blocks);
    // }
    renderBlocks(blocks) {
        for(const block of blocks) {
            this.renderBlock(block);
        }
    }
    renderBlock(block) {
        const ty = block.t;
        const child = block.c;
        const handler = this[`renderBlock${ty}`];
        if (!handler) {
            console.warn(`Warning: unhandled block type: ${ty}`);
            console.warn('Child: ', child);
            return;
        }
        handler.call(this, child);
    }
    renderBlockDiv(child) {
        this.pushElement('div', child[0]);
        this.renderBlocks(child[1]);
        this.popElement();
    }
    renderBlockHeader(child) {
        const level = child[0];
        this.pushElement(`h${level}`, child[1]);
        this.element.setAttribute('data-header-level', String(level));
        this.renderInlines(child[2]);
        this.popElement();
    }
    renderBlockPara(child) {
        this.pushElement('p', nullAttr);
        this.currentParagraph = this.element;
        this.renderInlines(child);
        this.popElement();
    }
    renderBlockPlain(child) {
        this.renderInlines(child);
    }
    renderBlockOrderedList(child) {
        // TODO: parse list attributes
        this.pushElement('ol', nullAttr);
        this.renderListItems(child[1]);
        this.popElement();
    }
    renderBlockBulletList(child) {
        this.pushElement('ul', nullAttr);
        this.renderListItems(child);
        this.popElement();
    }
    renderBlockHorizontalRule() {
        this.element.appendChild(
            this.createElement('hr', nullAttr));
    }
    renderBlockBlockQuote(child) {
        this.pushElement('blockquote');
        this.renderBlocks(child);
        this.popElement();
    }
    renderBlockCodeBlock(child) {
        this.pushElement('pre');
        this.pushElement('code', child[0]);
        this.appendSimpleText(child[1]);
        this.popElement();
        this.popElement();
    }
    renderBlockRawBlock(child) {
        const type = child[0];
        const key = `renderBlockMacro${type}`;
        if (!(typeof this[key] === 'function')) {
            console.warn(
                `Warning: unsupported raw block type: ${type}`);
            console.warn(child[1]);
            return;
        }
        this[key](child[1]);
    }
    renderListItems(items, itemCb) {
        let idx = 0;
        for(let i of items) {
            this.pushElement('li', nullAttr);
            if (!itemCb)
                this.renderBlocks(i);
            else
                itemCb.call(this, i, idx);
            this.popElement();
            idx += 1;
        }
    }
    renderFootnotes() {
        this.renderBlockHorizontalRule();
        this.pushElement('section', [null, ['footnotes'], []]);
        this.pushElement('ol', nullAttr);
        this.renderListItems(
            this.footnotes, (blocks, idx) => {
                let cp = this.currentParagraph;
                this.renderBlocks(blocks);
                const a = this.createElement('a', [
                    null,
                    ["backref"],
                    [["href", `#tfn-backref-${idx+1}`]]]);
                const txt = document.createTextNode('↩');
                a.appendChild(txt);
                if (this.currentParagraph
                    && (cp !== this.currentParagraph)) {

                    this.currentParagraph.appendChild(a);
                }
            });
        this.popElement();
        this.popElement();
    }

    renderInlines(inls) {
        for(const inline of inls) {
            this.renderInline(inline);
        }
    }
    renderInline(inline) {
        const ty = inline.t;
        const child = inline.c;
        const handler = this[`renderInline${ty}`];
        if (!handler) {
            console.warn(`Warning: unhandled inline type: ${ty}`);
            console.warn('Child: ', child);
            return;
        }
        handler.call(this, child);

    }
    renderInlineStr(child) {
        this.appendSimpleText(child);
    }
    renderInlineSoftBreak() {
        this.appendSimpleText('\n');
    }
    renderInlineSpace() {
        this.appendSimpleText(' ');
    }
    renderInlineSimpleTag(tagName, child) {
        this.pushElement(tagName, nullAttr);
        this.renderInlines(child);
        this.popElement();
    }
    renderInlineImage(child) {
        const alt = child[1].map(inlineToString).join('');
        const src = decodeURIComponent(child[2][0]);
        child[0][2].push(['src', this.deps[src]]);
        child[0][2].push(['alt', alt]);
        this.pushElement('img', child[0]);
        this.popElement();
    }
    renderInlineRawInline(child) {
        const type = child[0];
        const key = `renderInlineMacro${type}`;
        if (!(typeof this[key] === 'function')) {
            console.warn(
                `Warning: unsupported raw inline type: ${type}`);
            console.warn(child[1]);
            return;
        }
        this[key](child[1]);
    }
    renderInlineCode(child) {
        this.pushElement('code', child[0]);
        this.appendSimpleText(child[1]);
        this.popElement();
    }
    renderInlineLink(child) {
        this.pushElement('a', child[0]);
        this.element.setAttribute('href', child[2][0]);
        this.element.setAttribute('title', child[2][1]);
        this.renderInlines(child[1]);
        this.popElement();
    }
    renderInlineNote(child) {
        this.footnotes.push(child);
        const num = this.footnotes.length;
        const id = `tfn-backref-${num}`;
        const classes = ['t-footnotes'];
        const attrs = [['href', `#tfn-${num}`]];
        this.pushElement('a', [id, classes, attrs]);
        this.pushElement('sup', nullAttr);
        this.appendSimpleText(`${num}`);
        this.popElement();
        this.popElement();
    }
    renderInlineQuoted(child) {
        const ty = child[0].t;
        if (ty !== 'SingleQuote')
            this.appendSimpleText("\u201C");
        else {
            this.appendSimpleText('\u2018');
        }

        this.renderInlines(child[1]);
        if (ty !== 'SingleQuote')
            this.appendSimpleText('\u201d');
        else
            this.appendSimpleText('\u2019');
    }
    renderInlineLineBreak() {
        this.element.appendChild(this.createElement('br'));
    }
    renderInlineSpan([attr, inlines]) {
        this.pushElement('span', attr);
        this.renderInlines(inlines);
        this.popElement();
    }

    createElement(tag, attrs=nullAttr) {
        const el = document.createElement(tag);
        this.addAttrs(el, attrs);
        return el;
    }
    addAttrs(el, attrs) {
        if (attrs[0])
            el.setAttribute('id', attrs[0]);
        for(let cl of attrs[1]) {
            el.classList.add(cl);
        }
        for(let cl of attrs[2]) {
            el.setAttribute(cl[0], cl[1]);
        }

    }
    pushElement(tag, attrs, func) {
        // console.log("Pushing for ", tag, this.stack.length);
        // console.log("Current element: ", this.element.tagName);
        const el = this.createElement(tag, attrs);
        this.stack.push(this.element);
        this.element = el;
    }
    popElement(drop) {
        const el = this.stack.pop();
        // console.log("Popped ", el.tagName, this.stack.length);
        // this.stack.forEach((el) => console.log(el.tagName));
        if (!drop)
            el.appendChild(this.element);
        this.element = el;
    }
    appendSimpleText(txt) {
        txt = document.createTextNode(txt);
        this.element.appendChild(txt);
    }
    appendError(txt) {
        this.pushElement('span', nullAttr);
        this.element.classList.add('error');
        this.appendSimpleText(txt);
        this.popElement();
    }
};

module.exports = refs(math(Pandoc));
