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

            requireDeps(dp.deps, 'deps', output);
            output.push(`ast.meta.deps = deps;\n`);

            const cssDeps = dp.collectCSS(meta);
            if (cssDeps) {
                output.push(`const cssDeps = {};\n`);
                requireDeps(cssDeps, 'cssDeps', output);
                output.push(`ast.meta.css = cssDeps;\n`);
            }

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

function requireDeps(deps, name, output) {
    for(let d of deps) {
        if (isUrlRequest(d)) {
            let req = JSON.stringify(decodeURIComponent(d));
            if (name) {
                output.push(`${name}[${req}] = require(${req});\n`);
            }
        }
    }
}
