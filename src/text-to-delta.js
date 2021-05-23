/**
 * Convert plain text to a delta object with no formatting.
 * @param text {string}
 * @returns {DeltaObj}
 */
function textToDelta(text) {
    if (!text.endsWith('\n')) {
        text += '\n';
    }
    return {ops: [{insert: text}]};
}

module.exports = textToDelta;
