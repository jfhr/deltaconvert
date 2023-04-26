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
 * @property {InlineInsert[]} children
 * @property {Object.<string, *>} attributes
 */
class BlockInsert {
    constructor(attributes) {
        this.children = [];
        this.attributes = attributes || {};
    }
}

/**
 * Represents some inline content (text or embed) with formatting.
 * An inline insert is always the child of a block insert.
 * @property {(string|Object.<string, *>)} insert
 * @property {Object.<string, *>} attributes
 */
class InlineInsert {
    constructor(insert, attributes) {
        this.insert = insert;
        this.attributes = attributes || {};
    }
}

/**
 * @typedef {{mergeAdjacentCodeBlocks: boolean}} DeltaToIntermediateOptions
 */

/**
 * @type {DeltaToIntermediateOptions}
 */
const DEFAULT_OPTIONS = {
    mergeAdjacentCodeBlocks: true
};

/**
 * Convert a quill delta to our intermediate format.
 * @param delta
 * @param options {DeltaToIntermediateOptions}
 * @return {BlockInsert[]}
 */
function deltaToIntermediate(delta, options = DEFAULT_OPTIONS) {
    const blocks = [];

    for (let opIndex = 0; opIndex < delta.ops.length; opIndex++) {
        const op = delta.ops[opIndex];

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
                // Note that the following insert might include additional block-level formatting for the last paragraph
                const paras = op.insert.split('\n');

                // First paragraph might still belong to previous block
                if (paras[0] !== '' && lastBlock() !== null) {
                    lastBlock().children.push(new InlineInsert(paras.shift(), op.attributes));
                }

                for (let paraIndex = 0; paraIndex < paras.length; paraIndex++){
                    const paragraph = paras[paraIndex];
                    if (paragraph !== '') {
                        blocks.push(new BlockInsert(op.attributes));
                        lastBlock().children.push(new InlineInsert(paragraph, op.attributes));
                    }
                    // Fix #11: if this block insert ends in newlines, add a newline to the start of the next block
                    // to make sure there's a paragraph break between the two blocks.
                    else if (paraIndex === paras.length - 1 && typeof delta.ops[opIndex + 1]?.insert === 'string') {
                        delta.ops[opIndex + 1].insert = '\n' + delta.ops[opIndex + 1].insert;
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

    // Normally we need block-level tags (e.h. <p>) to create linebreaks.
    // But code blocks are wrapped in the <pre> tag, meaning that plain newlines are preserved.
    // So two adjacent <pre> blocks can be merged in one with a newline in between.
    if (options.mergeAdjacentCodeBlocks) {
        mergeAdjacentCodeBlocks(blocks);
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

/**
 * @param blocks {BlockInsert[]}
 */
function mergeAdjacentCodeBlocks(blocks) {
    for (let i = 0; i < blocks.length - 1; i++){
        if (blocks[i].attributes['code-block'] && blocks[i + 1].attributes['code-block']) {
            blocks[i].children.push(...blocks[i + 1].children);
            blocks.splice(i + 1, 1);
            // Decrement index since the array has been changed
            i--;
        }
    }
}

module.exports = deltaToIntermediate;
