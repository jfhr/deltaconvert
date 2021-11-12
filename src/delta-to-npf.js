/**
 * Tumblr NPF object.
 * @typedef {{content: NpfContent[]}} NpfObj
 */

/**
 * Tumblr NPF content object.
 * @typedef {{
 *     type: string,
 *     subtype?: string,
 *     text?: string,
 *     url?: string,
 *     indent_level?: number,
 *     formatting?: NpfFormatting[]
 * }} NpfContent
 */

/**
 * Tumblr NPF formatting object.
 * @typedef {{start: number, end: number, type: string, url?: string, hex?: string}} NpfFormatting
 */

const deltaToIntermediate = require("./delta-to-intermediate");

/**
 * @summary Convert a quill delta to tumblr's NPF format.
 *
 * @description Converts formatted text, links, images.
 *
 * For images, extra attributes like original_size are ignored,
 * only the image url is used.
 *
 * Videos and other embeds aren't currently supported.
 *
 * Tumblr NPF only supports heading levels 1 and 2. Headings
 * of level >= 3 will be converted to bold text.
 *
 * @param delta {DeltaObj}
 * @return {NpfObj}
 */
function deltaToNpf(delta) {
    /** @type {BlockInsert[]} */
    const blocks = deltaToIntermediate(delta);

    /** @type NpfContent[] */
    const npf = [];

    for (const block of blocks) {
        // Skip blocks with no children and no formatting
        if (block.children.length === 0 && Object.keys(block.attributes).length === 0) {
            continue;
        }

        let text = '';
        /** @type NpfFormatting[] */
        let formatting = [];
        /** @type 'code' */
        let subtypeFromInline = null;

        for (const inline of block.children) {
            // Handle text with inline formatting
            if (typeof inline.insert === 'string') {
                const start = text.length;
                text += inline.insert;
                const end = text.length;

                if (inline.attributes.bold) {
                    formatting.push({start, end, type: 'bold'});
                }
                if (inline.attributes.italic) {
                    formatting.push({start, end, type: 'italic'});
                }
                if (inline.attributes.color) {
                    formatting.push({start, end, type: 'color', hex: inline.attributes.color});
                }
                if (inline.attributes.link) {
                    formatting.push({start, end, type: 'link', url: inline.attributes.link});
                }
                if (inline.attributes.code) {
                    formatting.push({start, end, color: '#e83e8c'});
                }
            }

            // Handle embeds (e.g. images) directly
            else if (inline.insert.image) {
                npf.push({
                    url: inline.insert.image,
                    type: guessImageMimeType(inline.insert.image),
                });
            }
            else if (inline.insert.video) {
                const type = guessVideoMimeType(inline.insert.video);
                // Can't determine type, use the url directly instead
                if (type === 'video') {
                    npf.push({
                        type: 'video',
                        url: inline.insert.video
                    });
                } else {
                    npf.push({
                        type: 'video',
                        media: {
                            url: inline.insert.video,
                            type,
                        }
                    });
                }
            }
        }

        if (text !== '') {
            /** @type {NpfContent} */
            const content = {type: 'text', text};

            // Tumblr only supports heading 1 and 2
            if (block.attributes.header === 1) {
                content.subtype = 'heading1';
            } else if (block.attributes.header === 2) {
                content.subtype = 'heading2';
            } else if (block.attributes.header > 2) {
                // Lower levels are converted to bold text. Use
                // unshift() here instead of push() bc we expect
                // formatting to be ordered by start index.
                formatting.unshift({
                    start: 0,
                    end: text.length,
                    type: 'bold',
                });
            } else if (block.attributes.blockquote) {
                content.subtype = 'indented';
            } else if (block.attributes.list === 'ordered') {
                content.subtype = 'ordered-list-item';
            } else if (block.attributes.list === 'bullet') {
                content.subtype = 'unordered-list-item';
            }

            if (block.attributes.indent) {
                content.indent_level = block.attributes.indent;
            }

            mergeFormatting(formatting);
            if (formatting.length > 0) {
                content.formatting = formatting;
            }

            npf.push(content);
        }
    }

    return {content: npf};

}


/**
 * Guess image MIME type based on url file extension.
 * If unsuccessful, returns 'image'
 * @param url {string}
 * @return {string}
 */
function guessImageMimeType(url) {
    url = url.toLowerCase();
    if (url.endsWith('.jpg') || url.endsWith('.jpeg')) {
        return 'image/jpg'
    }
    if (url.endsWith('.png')) {
        return 'image/png';
    }
    if (url.endsWith('.gif')) {
        return 'image/gif';
    }
    return 'image';
}

/**
 * Guess video MIME type based on url file extension.
 * If unsuccessful, returns 'video'
 * @param url {string}
 * @return {string}
 */
function guessVideoMimeType(url) {
    url = url.toLowerCase();
    if (url.endsWith('.mp4')) {
        return 'video/mp4'
    }
    if (url.endsWith('.webp')) {
        return 'video/webp';
    }
    if (url.endsWith('.ogg')) {
        return 'video/ogg';
    }
    return 'video';
}


/**
 * Looks for multiple equivalent overlapping formatting entries
 * and merges them into one.
 *
 * This assumes that entries are ordered by start index.
 *
 * @param formatting {NpfFormatting[]}
 */
function mergeFormatting(formatting) {
    for (let i = 0; i < formatting.length; i++) {
        for (let j = i + 1; j < formatting.length; j++) {
            if (formatting[i].end >= formatting[j].start && areEquivalent(formatting[i], formatting[j])) {
                formatting[i].end = Math.max(formatting[i].end, formatting[j].end);
                formatting.splice(j, 1);
                j--;
            }
        }
    }
}

/**
 * @param f1 {NpfFormatting}
 * @param f2 {NpfFormatting}
 * @return {boolean}
 */
function areEquivalent(f1, f2) {
    if (f1.type !== f2.type) {
        return false;
    }
    if (f1.type === 'link' && f1.url !== f2.url) {
        return false;
    }
    if (f1.type === 'mention' && f1.blog.uuid !== f2.blog.uuid) {
        return false;
    }
    // noinspection RedundantIfStatementJS
    if (f1.type === 'color' && f1.hex !== f2.hex) {
        return false;
    }
    return true;
}

module.exports = deltaToNpf;
