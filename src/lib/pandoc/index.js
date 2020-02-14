const math = require('./math.js');
const refs = require('./references.js');
const scripts = require('./scripts.js');
const macros = require('./macros.js');
const Pandoc = require('./base.js');

function mixin(klass, ...mixins) {
    for(let m of mixins) {
        klass = m(klass);
    }
    return klass;
}

module.exports = mixin(Pandoc, math, refs, scripts, macros);
