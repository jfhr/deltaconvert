/**
 * @overview
 * Quill delta stores block-level formatting in a separate insert operation after the actual text.
 * That makes parsing difficult. So the first thing we do is "collapse" formatting information into the operation
 * that it actually belongs to, then we parse that list of collapsed inserts.
*/


/**
 * Quill delta insert operation.
 * @typedef {{insert: (string|object), attributes?: object}} DeltaInsertOperation
 */

/**
 * Quill delta object.
 * @typedef {{ops: DeltaInsertOperation[]}} DeltaObj
 */

/**
 * Represents a block-level insert element with formatting.
 */
class BlockInsert {
    /** @type {InlineInsert[]} */
    children = [];
    /** @type {Object.<string, *>} */
    attributes = {};

    constructor(attributes) {
        this.attributes = attributes || {};
    }
}

/**
 * Represents some inline content (text or embed) with formatting.
 * An inline insert is always the child of a block insert.
 */
class InlineInsert {
    /** @type {Object.<string, *>} */
    attributes = {};
    /** @type {(string|Object.<string, *>)} */
    insert;

    constructor(insert, attributes) {
        this.insert = insert;
        this.attributes = attributes || {};
    }
}

/**
 * Convert a quill delta to our intermediate format.
 * @param delta
 * @return {BlockInsert[]}
 */
function deltaToIntermediate(delta) {
    const blocks = [];

    for (const op of delta.ops) {
        if (typeof op.insert === 'string') {
            // Test if string is only newline characters
            if (/^\n+$/g.test(op.insert)) {
                // Handle block-level formatting for previous line of text
                if (blocks.length === 0) {
                    blocks.push(new BlockInsert(op.attributes));
                } else {
                    lastBlock().attributes = {...lastBlock().attributes, ...op.attributes};
                    blocks.push(new BlockInsert());
                }
            } else if (op.insert.includes('\n')) {
                // Handle one or multiple paragraphs of text.
                // Note that the following insert might include additional block-level formatting for the last paragraph.
                for (const paragraph of op.insert.split('\n')) {
                    if (paragraph !== '') {
                        blocks.push(new BlockInsert(op.attributes));
                        lastBlock().children.push(new InlineInsert(paragraph, op.attributes));
                    }
                }
            } else {
                // Handle pure inline text
                if (blocks.length === 0) {
                    blocks.push(new BlockInsert());
                }
                lastBlock().children.push(new InlineInsert(op.insert, op.attributes));
            }
        } else {
            // Handle embeds
            blocks.push(new BlockInsert(op.attributes));
            lastBlock().children.push(new InlineInsert(op.insert, op.attributes));
        }
    }
    return blocks;

    /**
     * Return the last block, or null if there are no blocks yet.
     * @return {BlockInsert|null}
     */
    function lastBlock() {
        if (blocks.length === 0) {
            return null;
        }
        return blocks[blocks.length - 1];
    }
}

module.exports = deltaToIntermediate;