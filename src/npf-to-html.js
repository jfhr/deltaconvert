const deltaToHtml = require('./delta-to-html');
const npfToDelta = require('./npf-to-delta');

/**
 * Convert HTML to tumblr NPF
 * @param {NpfObj} npf
 * @returns {string}
 */
function npfToHtml(npf) {
    return deltaToHtml(npfToDelta(npf));
}

module.exports = npfToHtml;
