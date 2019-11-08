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

const htmlPath = require.resolve("../dist/index.html");
const srcPath = require.resolve("../dist/render/index.js");

const fs = require('fs');
const path = require('path');
const ctx = browserContext(fs.readFileSync(htmlPath));
const destPath = path.join(path.dirname(htmlPath), 'generated.html');
console.log('destination: ', destPath);

vmExecute(srcPath, fs.readFileSync(srcPath), ctx);
const htmlOutput = `<!DOCTYPE HTML>\n<html>${ctx.document.documentElement.innerHTML}</html>`;

fs.writeFileSync(destPath, htmlOutput);
