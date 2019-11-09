function metaToObject(meta) {
    if (meta.t === 'Str')
        return metaToString(meta);

    if (meta.t === 'MetaInlines')
        return metaToString(meta);

    if (meta.t === 'MetaBool')
        return meta.c;

    if (meta.t === 'MetaList') {
        return meta.c.map((o) => metaToObject(o));
    }
    if (meta.t === 'MetaMap') {
        return Object.keys(meta.c).reduce((acc, key) => {
            acc[key] = metaToObject(meta.c[key]);
            return acc;
        }, {});
    }

    // We do not process MetaBlocks
    return meta;
}

function metaToString(meta) {
    if ((meta.t === 'MetaInlines')
        || (meta.t === 'Str')) {
        return meta.c.map(inlineToString)
            .join('');
    } else if (typeof meta === 'string') {
        return meta;
    }
    console.warn('Only inlines or raw str can be converted to string.');
    console.warn(meta);
    return null;
}

function inlineToString(inl) {
    if (inl.t === 'RawInline') {
        return inl.c[1];
    } else if (inl.t === 'Space') {
        return ' ';
    } else {
        return inl.c;
    }
}

module.exports = {
    inlineToString,
    metaToString,
    metaToObject,
};
