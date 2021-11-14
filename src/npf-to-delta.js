/**
 * Convert a tumblr NPF object to a quill delta.
 * @param npf {NpfObj}
 * @return {DeltaObj}
 */
const Delta = require("quill-delta");

function npfToDelta(npf) {
    let delta = new Delta();

    for (const content of npf.content) {
        if (content.type === 'text') {
            delta = insertTextWithFormatting(content, delta);
            delta = insertNewlineWithFormatting(content, delta);
        } else if (content.type.startsWith('image')) {
            delta = delta.insert({image: content.url});
        } else if (content.type.startsWith('video')) {
            if (content.url) {
                delta = delta.insert({video: content.url});
            } else if (content.embed_url) {
                delta = delta.insert({video: content.embed_url});
            } else if (content.media) {
                delta = delta.insert({video: content.media.url});
            }
        }
    }

    if (lastOp() === null || typeof lastOp().insert !== 'string' || !lastOp().insert.endsWith('\n')) {
        delta = delta.insert('\n');
    }

    return {ops: delta.ops};

    /**
     * @return {null|DeltaInsertOperation}
     */
    function lastOp() {
        if (delta.ops.length === 0) {
            return null;
        }
        return delta.ops[delta.ops.length - 1];
    }
}


/**
 * Add a newline insert with the same formatting as the NPF content item to the given delta,
 * and return the resulting delta
 * @param content {NpfContent}
 * @param delta {Delta}
 * @return {Delta}
 */
function insertNewlineWithFormatting(content, delta) {
    if (content.subtype === 'heading1') {
        return delta.insert('\n', {header: 1});
    } else if (content.subtype === 'heading2') {
        return delta.insert('\n', {header: 2});
    } else if (content.subtype === 'indented') {
        const result = {blockquote: true};
        if (content.indent_level) {
            result.indent = content.indent_level;
        }
        return delta.insert('\n', result);
    } else if (content.subtype === 'ordered-list-item') {
        return delta.insert('\n', {list: 'ordered'});
    } else if (content.subtype === 'unordered-list-item') {
        return delta.insert('\n', {list: 'bullet'});
    }
    return delta.insert('\n');
}

/**
 * Convert a single NPF content item of type=text into one or more quill delta inserts,
 * add them to the given delta and return the resulting delta.
 * @param content {NpfContent}
 * @param delta {Delta}
 * @return {Delta}
 */
function insertTextWithFormatting(content, delta) {
    if (content.formatting === undefined) {
        return delta.insert(content.text);
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

    for (let i = 1; i < indexes.length; i++) {
        const start = indexes[i - 1];
        const end = indexes[i];
        const formatHere = content.formatting.filter(f => f.start <= start && f.end >= end);
        const attributes = getAttributesFromFormatting(formatHere);
        delta = delta.insert(content.text.substring(start, end), attributes);
    }

    return delta;
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
