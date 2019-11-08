const renderPath = require.resolve('../lib/render.js');
const {stringifyRequest} = require('loader-utils');

module.exports = function(source) {
    return source;
};

module.exports.pitch = function(remainingRequest, precedingRequest, data) {
    return `import render from ${stringifyRequest(this, renderPath)};
import src from '!!${remainingRequest}';
export default render(src);
`;
};
