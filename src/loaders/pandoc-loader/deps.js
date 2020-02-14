const { metaToString, metaToObject } = require('../../lib/pandoc/utils.js');

module.exports = class PandocDeps {
    constructor() {
        this.deps = [];
    }

    collectCSS(meta) {
        if (!meta.css) return null;
        return metaToObject(meta.css);
    }

    collectIncludes(meta) {
        if (!meta.includes) return null;
        return metaToObject(meta.includes);
    }

    collectArray(items) {
        if (!items) return;
        items.forEach((i) => this.collectItem(i));
    }

    collectItem(item) {
        const ty = item.t;
        if (
            !ty
                || (ty.startsWith("Raw")) || (ty === "Str")
                || (ty === "Space") || (ty === "HorizontalRule")
                || (ty === "Null")
                || (ty.endsWith("Math"))
                || (ty.endsWith("Break"))
        ) return;

        let scanArray = this.collectArray.bind(this);
        if ((ty === "LineBlock") || (ty === "BulletList")) {
            item.c.forEach(scanArray);
            return;
        }
        if ((ty === "OrderedList") || (ty === "Cite")) {
            item.c[1].forEach(scanArray);
            return;
        }
        if (ty === "DefinitionList") {
            item.c.forEach(([inlines, bbls]) => {
                scanArray(inlines);
                bbls.forEach(scanArray);
            });
            return;
        }
        if ((ty === "CodeBlock")
            || (ty === "Code")) {
            this.collectAttr(item.c[0]);
            return;
        }
        if (ty === "Header") {
            this.collectAttr(item.c[1]);
            scanArray(item.c[2]);
            return;
        }
        if ((ty === "Div") || (ty === "Span")) {
            this.collectAttr(item.c[0]);
            scanArray(item.c[1]);
            return;
        }
        if ((ty === "Link") || (ty === "Image")) {
            this.collectAttr(item.c[0]);
            scanArray(item.c[1]);
            this.deps.push(item.c[2][0]);
            return;
        }

        // Handles
        // Para, Plain, BlockQuote
        // Emph, Strong, Strikeout, Superscript, Smallcaps,
        scanArray(item.c);
    }

    collectAttr(attr) {
        let src = attr[2].find(([lab, val]) => (lab === 'src'));
        if (src) {
            this.deps.push(src[2]);
        }
    }
}
