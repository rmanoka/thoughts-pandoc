const Proc = require('../proc');
const DepsParse = require('./deps.js');

const { metaToString } = require('../../lib/pandoc/utils.js');
const {isUrlRequest} = require('loader-utils');

module.exports = function(source) {
    const cb = this.async();

    const proc = new Proc('pandoc',
                          ['-f', 'markdown+latex_macros', '-t', 'json'],
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

            if (meta.renderer) {
                const renderDep = metaToString(meta.renderer);
                const req = JSON.stringify(renderDep);
                output.push(`ast.meta.renderer = require(${req});\n`);
            }

            const cssDeps = dp.collectCSS(meta);
            if (cssDeps) {
                output.push(`const cssDeps = {};\n`);
                requireDeps(cssDeps, 'cssDeps', output);
                output.push(`ast.meta.css = cssDeps;\n`);
            }

            const incDeps = dp.collectIncludes(meta);
            if (incDeps) {
                output.push(`const incDeps = {};\n`);
                requireDeps(incDeps, 'incDeps', output);
                output.push(`ast.meta.includes = incDeps\n`);
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
    const isArray = Array.isArray(deps);
    let keys;
    if (isArray)
        keys = deps;
    else
        keys = Object.keys(deps);

    for(let k of keys) {
        let d;
        if (isArray)
            d = k;
        else
            d = deps[k];

        if (isUrlRequest(d)) {
            let req = JSON.stringify(decodeURIComponent(d));
            if (isArray)
                k = req;
            else
                k = JSON.stringify(k);
            if (name) {
                output.push(`${name}[${k}] = require(${req});\n`);
            }
        }
    }
}
