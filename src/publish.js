const {JSDOM} = require('jsdom');
const vm = require('vm');
const fs = require('fs');

function vmExecute(id, source, context) {
    const vmContext = vm.createContext(Object.create(context));
    vmContext.exports = {};
    vmContext.module = {exports: vmContext.exports, id};
    vmContext.__filename = id;
    vm.runInContext(source, vmContext, {filename: id});
    return vmContext.module.exports;
}

function browserContext(html) {
    html = html || '<!DOCTYPE HTML>\n<html></html>';
    const jsdom = new JSDOM(html);
    const window = jsdom.window;
    const document = window.document;
    const ctx = {
        document, window,
        process, console,
    };
    return ctx;
}

function render(src, code) {
    const ctx = browserContext(src);
    vmExecute('__main__', code, ctx);
    return ctx.document.documentElement.innerHTML;
}

function renderFile(jsPath, destPath, srcPath) {
    const src = srcPath ? fs.readFileSync(srcPath) : null;
    const code = fs.readFileSync(jsPath);

    const output = render(src, code);
    fs.writeFileSync(destPath, `<!DOCTYPE HTML>\n<html>${output}</html>`);
}

module.exports = {browserContext, vmExecute, render, renderFile};
