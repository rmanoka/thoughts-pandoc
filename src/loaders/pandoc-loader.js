const {spawn} = require('child_process');
const Proc = require('./proc');

const path = require('path');
const tpPath = path.resolve(__dirname, 'thoughts-pandoc');

const attrParser = require('./attr-parser.js');

function relevantAttrs(tag, attr) {
    if (attr === 'src') {
        if (tag === 'img') {
            return true;
        }
    }
    return false;
}

function parseAttrs(doc) {
    const attrs = attrParser(doc, relevantAttrs);
    let idx = 0;
    let output = '';
    for(let attr of attrs) {
        console.log(attr);
        output += JSON.stringify(doc.slice(idx, attr.start));
        idx = attr.start + attr.length;
        output += ` + require(${JSON.stringify(attr.value)}) + `;
        console.log(output);
    }
    output += JSON.stringify(doc.slice(idx));
    return output;
}

module.exports = function(source) {
    const cb = this.async();

    const proc = new Proc(tpPath, [], {stdin: true, stdout: true, stderr: true});
    proc.promise.then((code) => {
        if (code == 0) {
            let output = proc.getStdout().toString();
            let doc = JSON.parse(output);
            doc.content = parseAttrs(doc.content);

            let css = '';
            if (doc.meta && doc.meta.css) {
                css = doc.meta.css.map((f) => `import ${JSON.stringify(f)};\n`).join('');
            }
            output = css + "export default " + doc.content + ';\n';
            output += 'export const metadata = ' + JSON.stringify(doc.meta) + ';\n';
            cb(null, output);
        } else {
            const error = new Error(proc.getStderr().toString());
            error.code = code;
            cb(error);
        }
    });
    proc.stdin.write(source);
    proc.stdin.end();
};
