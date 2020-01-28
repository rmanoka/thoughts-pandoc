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
}
