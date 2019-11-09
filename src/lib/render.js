function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

module.exports = function(ast) {
    const root = document.getElementById("content") || document.body;

    const R = ast.meta.renderer || require('./pandoc');
    const renderer = new R(ast.meta);
    renderer.render(ast.blocks, root);
    // const element = document.createElement('div');
    // element.innerHTML = doc;
    // root.appendChild(element);

    // if (meta && meta.title) {
    //     let title = '';
    //     if (document.title) {
    //         title = `${document.title} - `;
    //     }
    //     title += meta.title;
    //     document.title = title;

    //     const el = document.getElementById("title");
    //     if (el) {
    //         el.innerHTML = meta.title;
    //     }
    // }

    // const el = document.createElement('pre');
    // const code = document.createElement('code');
    // code.innerHTML = escapeHtml(JSON.stringify(ast.meta, null, 2));
    // el.appendChild(code);
    // root.appendChild(el);
};
