const {spawn} = require('child_process');
const Proc = require('./proc');

const path = require('path');
const tpPath = path.resolve(__dirname, 'thoughts-pandoc');

module.exports = function(source) {
    const cb = this.async();

    const proc = new Proc(tpPath, [], {stdin: true, stdout: true, stderr: true});
    proc.promise.then((code) => {
        if (code == 0) {
            let output = proc.getStdout().toString();
            let doc = JSON.parse(output);

            let css = '';
            if (doc.meta && doc.meta.css) {
                css = doc.meta.css.map((f) => `import ${JSON.stringify(f)};\n`).join('');
            }
            output = css + "export default " + output;
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
