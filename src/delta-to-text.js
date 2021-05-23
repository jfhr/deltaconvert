/**
 * Convert a delta object to plain text.
 * @param delta {DeltaObj}
 * @returns {string}
 */
function deltaToText(delta) {
    let result = '';
    for (const op of delta.ops) {
        if (typeof op.insert === 'string') {
            result += op.insert;
        }
    }
    return result;
}

module.exports = deltaToText;
