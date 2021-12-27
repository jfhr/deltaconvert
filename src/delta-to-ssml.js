const he = require('he');
const deltaToIntermediate = require("./delta-to-intermediate");

/**
 * Convert a delta object to SSML.
 * @param delta {DeltaObj}
 * @returns {string}
 */
function deltaToSsml(delta) {
    /** @type {BlockInsert[]} */
    const blocks = deltaToIntermediate(delta);

    // Now we have all formatting info in the right place
    /** @type {string} */
    let ssml = '<speak>';

    for (const block of blocks) {
        // Skip blocks with no children and no formatting
        if (block.children.length === 0 && Object.keys(block.attributes).length === 0) {
            continue;
        }

        ssml += '<p>';
        for (const inline of block.children) {
            ssml += renderInline(inline);
        }
        ssml += '</p>';
    }

    ssml += '</speak>';
    return ssml;
}

/**
 * Render inline elements
 * @param inline {InlineInsert}
 * @return {string}
 */
function renderInline(inline) {
    if (typeof inline.insert === 'string') {
        const text = he.escape(inline.insert);
        if (inline.attributes.bold) {
            return `<emphasis>${text}</emphasis>`;
        }
        return text;
    } else if (typeof inline.attributes.alt === 'string') {
        return he.escape(inline.attributes.alt);
    }
    return '';
}


module.exports = deltaToSsml;
