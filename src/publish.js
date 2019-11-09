const {JSDOM} = require('jsdom');
const vm = require('vm');

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

const fs = require('fs');
function renderFile(srcPath, jsPath, destPath) {
    const src = fs.readFileSync(srcPath);
    const code = fs.readFileSync(jsPath);
    if (!destPath) destPath = srcPath;

    const output = render(src, code);
    fs.writeFileSync(destPath, `<!DOCTYPE HTML>\n<html>${output}</html>`);
}

module.exports = {browserContext, vmExecute, render, renderFile};
