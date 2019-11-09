const Proc = require('../proc');
const DepsParse = require('./deps.js');

const {isUrlRequest} = require('loader-utils');

module.exports = function(source) {
    const cb = this.async();

    const proc = new Proc('pandoc',
                          ['-f', 'markdown', '-t', 'json'],
                          {stdin: true, stdout: true, stderr: true});
    proc.promise.then((code) => {
        if (code == 0) {
            const src = proc.getStdout().toString();
            const {meta, blocks} = JSON.parse(src);

            const dp = new DepsParse();
            dp.collectArray(blocks);

            const output = [];
            output.push(`const ast = ${src};\n`);
            output.push(`const deps = {};\n`);
            for(let d of dp.deps) {
                if (isUrlRequest(d)) {
                    let req = JSON.stringify(decodeURIComponent(d));
                    output.push(`deps[${req}] = require(${req});\n`);
                }
            }
            output.push(`ast.meta.deps = deps;\n`);
            output.push(`module.exports = ast;\n`);
            cb(null, output.join(''));
        } else {
            const error = new Error(proc.getStderr().toString());
            error.code = code;
            cb(error);
        }
    });
    proc.stdin.write(source);
    proc.stdin.end();
};
