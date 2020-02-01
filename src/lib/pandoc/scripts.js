const {createScript} = require('../dom-utils.js');
const {metaToObject} = require('./utils');


module.exports = function(P) {
    return class extends P {
        constructor({scripts, ...rest}) {
            super(rest);
            if (scripts) {
                this.scripts = metaToObject( scripts );
            }
        }
        render(...args) {
            super.render(...args);
            if (this.scripts) {
                for(let src of this.scripts) {
                    createScript(src, 'body');
                }
            }
        }
    };
};
