const test = require("ava");
const npfToDelta = require("./npf-to-delta");

test('empty string', t => {
    const actual = npfToDelta({content: []});
    const expected = {ops: [{insert: '\n'}]};
    t.deepEqual(actual, expected);
});

test('hello world', t => {
    const actual = npfToDelta({content: [{type: 'text', text: 'Hello, world!'}]});
    const expected = {ops: [{insert: 'Hello, world!\n'}]};
    t.deepEqual(actual, expected);
});

test('image', t => {
    const actual = npfToDelta({
        content: [
            {type: 'image/jpg', url: 'https://69.media.tumblr.com/path/to/image.jpg'},
        ]
    });
    const expected = {
        ops: [
            {insert: {image: "https://69.media.tumblr.com/path/to/image.jpg"}},
            {insert: '\n'},
        ]
    };
    t.deepEqual(actual, expected);
});

test('heading', t => {
    const actual = npfToDelta({
        content: [
            {
                type: "text",
                subtype: "heading1",
                text: "New Post Forms Manifesto"
            },
            {
                type: "text",
                text: "There comes a moment in every company's life that they must redefine the rules..."
            },
            {
                type: "text",
                text: "We can choose to embrace this moment courageously, or we may choose to cower in fear."
            }
        ]
    });
    const expected = {
        ops: [
            {insert: "New Post Forms Manifesto"},
            {insert: "\n", attributes: {header: 1}},
            {
                insert: "There comes a moment in every company's life that they must redefine the rules...\n" +
                    "We can choose to embrace this moment courageously, or we may choose to cower in fear.\n"
            }
        ]
    };
    t.deepEqual(actual, expected);
});

test('heading 2', t => {
    const actual = npfToDelta({
        content: [
            {
                "type": "text",
                "subtype": "heading2",
                "text": "what a great conversation"
            }
        ]
    });
    const expected = {
        ops: [
            {insert: "what a great conversation"},
            {insert: "\n", attributes: {header: 2}}
        ]
    };
    t.deepEqual(actual, expected);
});

test('list', t => {
    const actual = npfToDelta({
        content: [
            {
                type: "text",
                subtype: "heading1",
                text: "Sward's Shopping List"
            },
            {
                type: "text",
                subtype: "ordered-list-item",
                text: "Sword"
            },
            {
                type: "text",
                subtype: "ordered-list-item",
                text: "Candy"
            },
            {
                type: "text",
                text: "But especially don't forget:"
            },
            {
                type: "text",
                subtype: "unordered-list-item",
                text: "Death, which is uncountable on this list."
            }
        ]
    });
    const expected = {
        ops: [
            {insert: "Sward's Shopping List"},
            {insert: "\n", attributes: {header: 1}},
            {insert: "Sword"},
            {insert: "\n", attributes: {list: "ordered"}},
            {insert: "Candy"},
            {insert: "\n", attributes: {list: "ordered"}},
            {insert: "But especially don't forget:\nDeath, which is uncountable on this list."},
            {insert: "\n", attributes: {list: "bullet"}},
        ]
    };
    t.deepEqual(actual, expected);
});

test('blockquotes', t => {
    const actual = npfToDelta({
        content: [
            {
                type: "text",
                subtype: "indented",
                text: "1: blockquote, not nested"
            },
            {
                type: "text",
                subtype: "indented",
                text: "2: blockquote, nested",
                indent_level: 1
            },
        ]
    });
    const expected = {
        ops: [
            {insert: "1: blockquote, not nested"},
            {insert: "\n", attributes: {blockquote: true}},
            {insert: "2: blockquote, nested"},
            {insert: "\n", attributes: {blockquote: true, indent: 1}},
        ]
    };
    t.deepEqual(actual, expected);
});

test('inline', t => {
    const actual = npfToDelta({
        content: [
            {
                type: "text",
                text: "supercalifragilisticexpialidocious",
                formatting: [
                    {
                        start: 0,
                        end: 20,
                        type: "bold"
                    },
                    {
                        start: 9,
                        end: 34,
                        type: "italic"
                    }
                ]
            }
        ]
    });
    const expected = {
        ops: [
            {insert: "supercali", attributes: {bold: true}},
            {insert: "fragilistic", attributes: {bold: true, italic: true}},
            {insert: "expialidocious", attributes: {italic: true}},
            {insert: "\n"},
        ]
    };
    t.deepEqual(actual, expected);
});

test('inline 2', t => {
    const actual = npfToDelta({
        content: [
            {
                type: "text",
                text: "some bold and italic text",
                formatting: [
                    {
                        start: 5,
                        end: 9,
                        type: "bold"
                    },
                    {
                        start: 14,
                        end: 20,
                        type: "italic"
                    }
                ]
            }
        ]
    });
    const expected = {
        ops: [
            {insert: "some "},
            {insert: "bold", attributes: {bold: true}},
            {insert: " and "},
            {insert: "italic", attributes: {italic: true}},
            {insert: " text\n"},
        ]
    };
    t.deepEqual(actual, expected);
});

test('link', t => {
    const actual = npfToDelta({
        content: [
            {
                type: "text",
                text: "Found this link for you",
                formatting: [
                    {
                        start: 6,
                        end: 10,
                        type: "link",
                        url: "https://www.nasa.gov"
                    }
                ]
            }
        ]
    });
    const expected = {
        ops: [
            {insert: "Found "},
            {insert: "this", attributes: {link: "https://www.nasa.gov"}},
            {insert: " link for you\n"},
        ]
    };
    t.deepEqual(actual, expected);
});

test('color', t => {
    const actual = npfToDelta({
        content: [
            {
                type: "text",
                text: "Celebrate Pride Month",
                formatting: [
                    {
                        start: 10,
                        end: 15,
                        type: "color",
                        hex: "#ff492f"
                    }
                ]
            }
        ]
    });
    const expected = {
        ops: [
            {insert: "Celebrate "},
            {insert: "Pride", attributes: {color: "#ff492f"}},
            {insert: " Month\n"},
        ]
    };
    t.deepEqual(actual, expected);
});

test('video with url', t => {
    const actual = npfToDelta({
        "content": [
            {
                "type": "video",
                "url": "https://example.com/video.mp4",
            }
        ]
    });
    const expected = {
        ops: [
            {insert: {video: 'https://example.com/video.mp4'}},
            {insert: '\n'},
        ]
    };
    t.deepEqual(actual, expected);
});

test('video with embed_url', t => {
    const actual = npfToDelta({
        "content": [
            {
                "type": "video",
                "embed_url": "https://example.com/video.mp4",
                "embed_iframe": "<iframe src=\"https://example.com/video.mp4\"></iframe>",
            }
        ]
    });
    const expected = {
        ops: [
            {insert: {video: 'https://example.com/video.mp4'}},
            {insert: '\n'},
        ]
    };
    t.deepEqual(actual, expected);
});

test('video with media object', t => {
    const actual = npfToDelta({
        "content": [
            {
                "type": "video",
                "media": {
                    "type": "video/mp4",
                    "url": "https://example.com/video.mp4",
                }
            }
        ]
    });
    const expected = {
        ops: [
            {insert: {video: 'https://example.com/video.mp4'}},
            {insert: '\n'},
        ]
    };
    t.deepEqual(actual, expected);
});
