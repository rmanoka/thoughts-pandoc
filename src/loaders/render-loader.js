const renderPath = require.resolve('../lib/render.js');
const {stringifyRequest} = require('loader-utils');

module.exports = function(source) {
    return source;
};

module.exports.pitch = function(remainingRequest, precedingRequest, data) {
    return `const render = require(${stringifyRequest(this, renderPath)});
const doc = require('!!${remainingRequest}');
module.exports = render(doc);
`;
};
