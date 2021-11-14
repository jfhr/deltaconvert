const htmlparser2 = require("htmlparser2");
const Delta = require("quill-delta");

/**
 * Convert html to a quill delta.
 * @param html {string}
 * @returns {DeltaObj}
 */
function htmlToDelta(html) {
    let delta = new Delta();
    let attributeStack = [];
    let listType = null;
    let lookForVideoSource = false;
    // Some HTML elements should be skipped entirely (e.g. head, style)
    // In this case, ignore will be set to the tagname of the ignored element
    /** @type {?string} */
    let ignore = null;

    const parser = new htmlparser2.Parser({
        onopentag(tagname, elementAttributes) {
            if (ignore !== null) {
                return;
            }

            /** Contains the text attributes coming from this particular tag. */
            const deltaAttributes = {};

            switch (tagname) {
                // Ignored HTML elements
                case 'head':
                case 'style':
                case 'script':
                case 'link':
                case 'meta':
                case 'title':
                    ignore = tagname;
                    return;

                // Singleton tags (with no closing tags) should return immediately.
                case 'hr':
                    delta = delta.insert({divider: true});
                    return;
                case 'br':
                    delta = ensureNewline(delta, merge(attributeStack));
                    return;
                case 'img':
                    if (elementAttributes.src !== undefined) {
                        const imgAttributes = merge(attributeStack);
                        if (elementAttributes.alt !== undefined) {
                            imgAttributes.alt = elementAttributes.alt;
                        }
                        delta = delta.insert({image: elementAttributes.src}, imgAttributes);
                    }
                    return;
                case 'video':
                    // Case 1: video with inline src attribute
                    if (elementAttributes.src !== undefined) {
                        delta = delta.insert({video: elementAttributes.src}, merge(attributeStack));
                        return;
                    }
                    // Case 2: video with <source> subelement
                    lookForVideoSource = true;
                    break;
                case 'iframe':
                    // Iframe containing video
                    if (elementAttributes.class?.includes('ql-video')) {
                        delta = delta.insert({video: elementAttributes.src}, merge(attributeStack));
                    }
                    return;
                case 'source':
                    if (lookForVideoSource && elementAttributes.src !== undefined) {
                        delta = delta.insert({video: elementAttributes.src}, merge(attributeStack));
                        lookForVideoSource = false;
                        return;
                    }
                    break;

                // Non-singleton tags set certain variables here that will be used later
                case 'ol':
                    listType = 'ordered';
                    break;
                case 'ul':
                    listType = 'bullet';
                    break;

                case 'li':
                    // This is for the newline *before* a list, the list type itself is set when the <li> tag closes
                    delta = ensureNewline(delta, {});
                    break;

                case 'b':
                case 'strong':
                    deltaAttributes.bold = true;
                    break;
                case 'i':
                case 'em':
                    deltaAttributes.italic = true;
                    break;
                case 'a':
                    if (elementAttributes.href !== undefined) {
                        deltaAttributes.link = elementAttributes.href;
                    }
                    break;
                case 'code':
                    deltaAttributes.code = true;
                    break;
            }

            const style = elementAttributes.style;
            if (style !== undefined) {
                const fontWeight = parseStyle(style, 'font-weight');
                if (fontWeight === 'bold' || fontWeight === 'bolder') {
                    deltaAttributes.bold = true;
                }

                const fontStyle = parseStyle(style, 'font-style');
                if (fontStyle === 'italic' || fontStyle === 'oblique') {
                    deltaAttributes.italic = true;
                }

                const textDecoration = parseStyle(style, 'text-decoration');
                if (textDecoration !== null) {
                    if (textDecoration.includes('underline')) {
                        deltaAttributes.underline = true;
                    }
                    if (textDecoration.includes('line-through')) {
                        deltaAttributes.strike = true;
                    }
                }

                const color = parseStyle(style, 'color');
                if (color !== null) {
                    deltaAttributes.color = color;
                }
            }

            // We always push an object to the stack, even if it is empty.
            // This allows us to always do a pop() in the onclosetag() method.
            attributeStack.push(deltaAttributes);
        },
        ontext(text) {
            /*
             * Fires whenever a section of text was processed.
             *
             * Note that this can fire at any point within text and you might
             * have to stich together multiple pieces.
             */
            if (ignore !== null) {
                return;
            }

            delta = delta.insert(text, merge(attributeStack));
        },
        onclosetag(tagname) {
            /*
             * Fires when a tag is closed.
             *
             * You can rely on this event only firing when you have received an
             * equivalent opening tag before. Closing tags without corresponding
             * opening tags will be ignored.
             */

            if (ignore !== null) {
                if (tagname === ignore) {
                    ignore = null;
                }
                return;
            }

            switch (tagname) {
                case 'h1':
                    delta = ensureNewline(delta, {header: 1});
                    break;
                case 'h2':
                    delta = ensureNewline(delta, {header: 2});
                    break;
                case 'h3':
                    delta = ensureNewline(delta, {header: 3});
                    break;
                case 'h4':
                    delta = ensureNewline(delta, {header: 4});
                    break;
                case 'h5':
                    delta = ensureNewline(delta, {header: 5});
                    break;
                case 'h6':
                    delta = ensureNewline(delta, {header: 6});
                    break;
                case 'li':
                    if (listType !== null) {
                        delta = ensureNewline(delta, {list: listType});
                    }
                    break;
                case 'p':
                    delta = ensureDoubleNewline(delta, {});
                    break;

                case 'ol':
                case 'ul':
                    listType = null;
                    break;
                case 'video':
                    lookForVideoSource = false;
                    break;
            }

            // Pop the attributes that were pushed by the corresponding opening tag.
            attributeStack.pop();
        },
    });

    parser.write(html);
    parser.end();

    delta = ensureNewline(delta, {});
    return {ops: delta.ops};
}


/**
 * Merge a list of objects, later objects overwrite earlier ones.
 * @param objects {Object[]}
 * @returns {Object}
 */
function merge(objects) {
    let result = {};
    for (const obj of objects) {
        result = {...result, ...obj};
    }
    return result;
}


/**
 * Parse a single property value from the inline style string of an HTML element.
 * @param style {string} Raw inline style string.
 * @param name {string} Name of the property to parse.
 * @returns {string|null} Property value, or null if unspecified.
 */
function parseStyle(style, name) {
    const styleFinder = new RegExp(`${name}\w*:\w*(?<value>.*?)(;|$)`);
    const match = styleFinder.exec(style);
    if (match === null) {
        return null;
    }
    return match[1];
}


/**
 * Returns true if the given delta ends with a newline.
 * @param delta {DeltaObj}
 * @returns {boolean}
 */
function endsWithNewline(delta) {
    if (delta.ops.length > 0) {
        const lastInsert = delta.ops[delta.ops.length - 1].insert;
        if (typeof lastInsert === 'string' && lastInsert.endsWith('\n')) {
            return true;
        }
    }
    return false;
}

/**
 * Adds a newline with the given attributes to the delta unless it already ends with a newline.
 * @param delta {Delta}
 * @param attributes {Object.<string, *>}
 * @return {Delta}
 */
function ensureNewline(delta, attributes) {
    if (!endsWithNewline(delta)) {
        delta = delta.insert('\n', attributes);
    }
    return delta;
}

/**
 * Returns true if the given delta ends with two newlines.
 * @param delta {DeltaObj}
 * @returns {boolean}
 */
function endsWithDoubleNewline(delta) {
    if (delta.ops.length > 0) {
        const lastInsert = delta.ops[delta.ops.length - 1].insert;
        if (typeof lastInsert === 'string' && lastInsert.endsWith('\n\n')) {
            return true;
        }
    }
    return false;
}

/**
 * Adds up to two newlines with the given attributes to the delta, ensuring that it ends with two newlines.
 * @param delta {Delta}
 * @param attributes {Object.<string, *>}
 * @return {Delta}
 */
function ensureDoubleNewline(delta, attributes) {
    delta = ensureNewline(delta, attributes);
    if (!endsWithDoubleNewline(delta)) {
        delta = delta.insert('\n', attributes);
    }
    return delta;
}


module.exports = htmlToDelta;
