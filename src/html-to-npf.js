const deltaToNpf = require("./delta-to-npf");
const htmlToDelta = require("./html-to-delta");

/**
 * Convert HTML to tumblr NPF
 * @param {string} html
 * @returns {NpfObj}
 */
function htmlToNpf(html) {
    return deltaToNpf(htmlToDelta(html));
}

module.exports = htmlToNpf;
