function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

module.exports = function(doc) {
    const root = document.getElementById("content") || document.body;
    const element = document.createElement('div');
    element.innerHTML = doc.content;
    root.appendChild(element);

    if (doc.meta && doc.meta.title) {
        let title = '';
        if (document.title) {
            title = `${document.title} - `;
        }
        title += doc.meta.title;
        document.title = title;

        const el = document.getElementById("title");
        if (el) {
            el.innerHTML = doc.meta.title;
        }
    }

    const el = document.createElement('pre');
    const code = document.createElement('code');
    code.innerHTML = escapeHtml(JSON.stringify(doc, null, 2));
    el.appendChild(code);
    root.appendChild(el);
};
