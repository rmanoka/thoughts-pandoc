function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

module.exports = function(ast, root, parent) {
    root = root || document.getElementById("content") || document.body;
    const R = ast.meta.renderer || require('./pandoc');
    const renderer = new R(Object.assign({}, ast.meta, {parent}));
    renderer.render(ast.blocks, root);
};
