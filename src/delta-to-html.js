const he = require("he");
const deltaToIntermediate = require("./delta-to-intermediate");

/**
 * Convert a delta object to HTML.
 * @param delta {DeltaObj}
 * @returns {string}
 */
function deltaToHtml(delta) {
    /** @type {BlockInsert[]} */
    const blocks = deltaToIntermediate(delta);

    // Now we have all formatting info in the right place
    /** @type {string} */
    let html = '';
    /** @type {('ordered'|'bullet'|undefined)} */
    let listType = undefined;

    for (const block of blocks) {
        // Skip blocks with no children and no formatting
        if (block.children.length === 0 && Object.keys(block.attributes).length === 0) {
            continue;
        }

        html += renderListTagsIfRequired(block);
        const tags = renderBlockHtmlTags(block);
        html += tags.open;

        for (let i = 0; i < block.children.length; i++) {
            const inline = block.children[i];
            const inlineTags = renderInlineHtmlTags(inline);
            html += inlineTags.open;

            if (typeof inline.insert === 'string') {
                html += he.escape(inline.insert);
                // In code blocks, we preserve newlines since they're wrapped in <pre> tags
                if (block.attributes['code-block'] && i !== block.children.length - 1) {
                    html += '\n';
                }
            }

            html += inlineTags.close;
        }

        html += tags.close;
    }

    if (lastBlock() !== null) {
        html += renderListTagsIfRequired(lastBlock());
    }

    return html;


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

    /**
     * Render list open/close tags if necessary. Call this before rendering the current block's children.
     * @param block {BlockInsert}
     * @return {string}
     */
    function renderListTagsIfRequired(block) {
        const newListType = block.attributes.list;
        if (newListType === listType) {
            return '';
        }
        let result = '';
        if (listType === 'ordered') {
            result += '</ol>';
        } else if (listType === 'bullet') {
            result += '</ul>';
        }
        if (newListType === 'ordered') {
            result += '<ol>';
        } else if (newListType === 'bullet') {
            result += '<ul>';
        }
        listType = newListType;
        return result;
    }
}

/**
 * Render block-level html open and close tags.
 * @param block {BlockInsert}
 * @return {{open: string, close: string}}
 */
function renderBlockHtmlTags(block) {
    const tagName = getBlockTagName(block);
    const style = getInlineStyle(block.attributes, tagName);
    const attrs = getBlockHtmlAttributes(block);

    return renderHtmlTagsGeneric(tagName, style, attrs);
}

/**
 * Render inline html open and close tags.
 * @param inline {InlineInsert}
 * @return {{open: string, close: string}}
 */
function renderInlineHtmlTags(inline) {
    const tagName = getInlineTagName(inline);
    const style = getInlineStyle(inline.attributes, tagName);
    const attrs = getInlineHtmlAttributes(inline);

    // Instead of a <span> with no attributes, we render only its content
    if (tagName === 'span' && style === '' && Object.keys(attrs).length === 0) {
        return {open: '', close: ''};
    }

    return renderHtmlTagsGeneric(tagName, style, attrs);
}

/**
 * Render HTML open/close tags. Generic function for scenarios where block-level
 * or inline makes no difference.
 * @param tagName {string|string[]}
 * @param style {string}
 * @param attrs {Object.<string, string>}
 * @return {{open: string, close: string}}
 */
function renderHtmlTagsGeneric(tagName, style, attrs) {
    if (style !== '') {
        attrs.style = style;
    }

    // If there are multiple tag names, take the
    // first one and put the rest away for later
    /** @type string[] */
    let additionalTagNames = [];
    if (Array.isArray(tagName)) {
        // noinspection JSValidateTypes
        additionalTagNames = tagName.slice(1);
        tagName = tagName[0];
    }

    /** @type string */
    let open;
    /** @type string */
    let close;

    if (Object.keys(attrs).length === 0) {
        open = `<${tagName}>`;
    } else {
        let attrString = '';
        for (const name of Object.keys(attrs)) {
            const value = he.escape(attrs[name], {isAttributeValue: true});
            attrString += ` ${name}="${value}"`;
        }
        open = `<${tagName}${attrString}>`;
    }

    // Add close tag, unless the tag is self-closing
    const standalone = ['hr', 'br', 'img'];
    if (standalone.includes(tagName)) {
        close = '';
    } else {
        close = `</${tagName}>`;
    }

    // Handle additional tag names, if there are any
    for (const additionalTagName of additionalTagNames) {
        open += `<${additionalTagName}>`;
        if (!standalone.includes(tagName)) {
            close = `</${additionalTagName}>` + close;
        }
    }

    return {open, close};
}


/**
 * Get the correct HTML tag name(s) for a block-level insert.
 * @param op {BlockInsert}
 * @return {string|string[]}
 */
function getBlockTagName(op) {
    if (op.attributes.blockquote) {
        return 'blockquote';
    } else if (op.attributes.list) {
        return 'li';
    } else if (op.attributes.header === 1) {
        return 'h1';
    } else if (op.attributes.header === 2) {
        return 'h2';
    } else if (op.attributes.header === 3) {
        return 'h3';
    } else if (op.attributes.header === 4) {
        return 'h4';
    } else if (op.attributes.header === 5) {
        return 'h5';
    } else if (op.attributes.header === 6) {
        return 'h6';
    } else if (op.attributes.link) {
        return 'a';
    } else if (op.attributes['code-block']) {
        return ['pre', 'code'];
    } else {
        return 'p';
    }
}

/**
 * Get the correct HTML tag name(s) for an inline insert.
 * @param op {InlineInsert}
 * @return {string|string[]}
 */
function getInlineTagName(op) {
    if (op.insert.image) {
        return 'img';
    } else if (op.insert.video) {
        return 'video';
    } else if (op.insert.divider) {
        return 'hr';
    } else if (op.attributes.link) {
        return 'a';
    } else if (op.attributes.bold) {
        return 'b';
    } else if (op.attributes.italic) {
        return 'i';
    } else if (op.attributes.code) {
        return 'code';
    } else {
        return 'span';
    }
}

/**
 * Get the necessary HTML inline styles for an insert.
 *
 * @description
 * We take the tagName as an extra parameter to avoid redundant styles.
 * E.g. if we have bold text, and the tagName is 'b', we don't need extra
 * inline styles, but the tagName is something else, we add 'font-weight:bold'
 *
 * @param attributes {Object.<string, *>}
 * @param tagName {string}
 * @return {string}
 */
function getInlineStyle(attributes, tagName) {
    let style = '';
    if (attributes.bold && tagName !== 'b') {
        style += 'font-weight:bold;';
    }
    if (attributes.italic && tagName !== 'i') {
        style += 'font-style:italic;';
    }
    if (attributes.color) {
        style += `color:${attributes.color};`;
    }
    if (attributes.underline && attributes.strike) {
        style += 'text-decoration:underline line-through;';
    } else if (attributes.underline) {
        style += 'text-decoration:underline;';
    } else if (attributes.strike) {
        style += 'text-decoration:line-through;';
    }
    return style;
}

/**
 *
 * @param op {BlockInsert}
 * @return {Object.<string, string>}
 */
function getBlockHtmlAttributes(op) {
    let result = {};
    if (op.attributes.link) {
        result.href = op.attributes.link;
    }
    return result;
}

/**
 *
 * @param op {InlineInsert}
 * @return {Object.<string, string>}
 */
function getInlineHtmlAttributes(op) {
    let result = {};
    if (op.insert.image) {
        result.src = op.insert.image;
    } else if (op.insert.video) {
        result.src = op.insert.video;
    } else if (op.attributes.link) {
        result.href = op.attributes.link;
    }
    if (op.attributes.alt) {
        result.alt = op.attributes.alt;
    }
    return result;
}


module.exports = deltaToHtml;
