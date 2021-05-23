/**
 * Convert a tumblr NPF object to a quill delta.
 * @param npf {NpfObj}
 * @return {DeltaObj}
 */
function npfToDelta(npf) {
    /** @type {DeltaInsertOperation[]} */
    const ops = [];

    for (const content of npf.content) {
        if (content.type === 'text') {
            for (const op of splitFormattedText(content)) {
                pushOp(op);
            }
            const block = formatBlock(content);
            if (block.attributes === lastOp().attributes) {
                lastOp().insert += '\n';
            } else {
                pushOp(block);
            }
        } else if (content.type.startsWith('image')) {
            pushOp({insert: {image: content.url}});
        }
    }

    if (lastOp() === null || typeof lastOp().insert !== 'string' || !lastOp().insert.endsWith('\n')) {
        pushOp({insert: '\n'});
    }

    return {ops};

    /**
     * @return {null|DeltaInsertOperation}
     */
    function lastOp() {
        if (ops.length === 0) {
            return null;
        }
        return ops[ops.length - 1];
    }

    /**
     * Add a new operation to the list. If it is a text insert with the same attributes as the last operation,
     * the two will be merged together.
     * @param op {DeltaInsertOperation}
     */
    function pushOp(op) {
        const previous = lastOp();
        if (previous !== null && typeof previous.insert === 'string' && typeof op.insert === 'string'
            && areAttributesEqual(previous.attributes, op.attributes)) {
            if (previous.insert.endsWith('\n') || op.insert.startsWith('\n')) {
                previous.insert += op.insert;
            } else {
                previous.insert += '\n' + op.insert;
            }
        } else {
            ops.push(op);
        }
    }

    /**
     * Determines whether two delta attribute objects are equal (shallow comparison).
     * * @return {boolean}
     */
    function areAttributesEqual(a1, a2) {
        if (a1 === undefined || a2 === undefined) {
            return a1 === a2;
        } else {
            return Object.keys(a1)
                .concat(Object.keys(a2))
                .every(key => a1[key] === a2[key]);
        }
    }
}


/**
 * Return a quill delta newline insert with the same formatting as the NPF content item.
 * @param content {NpfContent}
 * @return {?DeltaInsertOperation}
 */
function formatBlock(content) {
    if (content.subtype === 'heading1') {
        return {insert: '\n', attributes: {header: 1}};
    } else if (content.subtype === 'heading2') {
        return {insert: '\n', attributes: {header: 2}};
    } else if (content.subtype === 'indented') {
        const result = {insert: '\n', attributes: {blockquote: true}};
        if (content.indent_level) {
            result.attributes.indent = content.indent_level;
        }
        return result;
    } else if (content.subtype === 'ordered-list-item') {
        return {insert: '\n', attributes: {list: 'ordered'}};
    } else if (content.subtype === 'unordered-list-item') {
        return {insert: '\n', attributes: {list: 'bullet'}};
    }
    return {insert: '\n'};
}

/**
 * Convert a single NPF content item of type=text into one or more quill delta inserts.
 * @param content {NpfContent}
 * @return {DeltaInsertOperation[]}
 */
function splitFormattedText(content) {
    if (content.formatting === undefined) {
        return [{insert: content.text}];
    }

    /** @type number[] */
    const indexes = [0, content.text.length];

    // Get all indexes where formatting changes
    for (const f of content.formatting) {
        if (!indexes.includes(f.start)) {
            indexes.push(f.start);
        }
        if (!indexes.includes(f.end)) {
            indexes.push(f.end);
        }
    }

    indexes.sort((a, b) => a - b);

    /** @type {DeltaInsertOperation[]} */
    const ops = [];

    for (let i = 1; i < indexes.length; i++) {
        const start = indexes[i - 1];
        const end = indexes[i];
        const formatHere = content.formatting.filter(f => f.start <= start && f.end >= end);

        /** @type {DeltaInsertOperation} */
        const op = {insert: content.text.substring(start, end)};
        const attributes = getAttributesFromFormatting(formatHere);
        if (Object.keys(attributes).length > 0) {
            op.attributes = attributes;
        }
        ops.push(op);
    }

    return ops;
}

/**
 * Convert a list of NPF formatting to a quill delta attributes object.
 * @param formatting {NpfFormatting[]}
 * @returns {object}
 */
function getAttributesFromFormatting(formatting) {
    const attributes = {};
    for (const format of formatting) {
        if (format.type === 'bold') {
            attributes.bold = true;
        } else if (format.type === 'italic') {
            attributes.italic = true;
        } else if (format.type === 'color') {
            attributes.color = format.hex;
        } else if (format.type === 'link') {
            attributes.link = format.url;
        }
    }
    return attributes;
}

module.exports = npfToDelta;
