module.exports = function(P) {
    return P;
    // return class extends P {
    //     constructor({meta, ...rest}={}) {
    //         super(rest);
    //         this.meta = meta || {};
    //     }

    //     // renderAst(ast) {
    //     //     let oldMeta = this.meta;
    //     //     this.meta = Object.create(this.meta);
    //     //     this.mergeMetadata(ast.meta);

    //     //     super.renderAst(ast);
    //     //     this.meta = oldMeta;
    //     // }

    //     mergeMetadata(meta) {
    //         Object.assign(this.meta, meta);
    //     }
    // };
};
