const test = require("ava");
const deltaToNpf = require("./delta-to-npf");

test('empty string', t => {
    const expected = {content: []};
    const actual = deltaToNpf({ops: [{insert: '\n'}]});
    t.deepEqual(actual, expected);
});

test('hello world', t => {
    const expected = {content: [{type: 'text', text: 'Hello, world!'}]};
    const actual = deltaToNpf({ops: [{insert: 'Hello, world!\n'}]});
    t.deepEqual(actual, expected);
});

test('image', t => {
    const expected = {
        content: [
            {type: 'image/jpg', url: 'https://69.media.tumblr.com/path/to/image.jpg'},
        ]
    };
    const actual = deltaToNpf({
        ops: [
            {insert: {image: "https://69.media.tumblr.com/path/to/image.jpg"}},
        ]
    });
    t.deepEqual(actual, expected);
});

test('image type detection', t => {
    const expected = {
        content: [
            {type: 'image/jpg', url: 'https://example.com/image.jpg'},
            {type: 'image/png', url: 'https://example.com/image.png'},
            {type: 'image/gif', url: 'https://example.com/image.gif'},
            {type: 'image', url: 'https://example.com/image'},
        ]
    };
    const actual = deltaToNpf({
        ops: [
            {insert: {image: "https://example.com/image.jpg"}},
            {insert: {image: "https://example.com/image.png"}},
            {insert: {image: "https://example.com/image.gif"}},
            {insert: {image: "https://example.com/image"}},
        ]
    });
    t.deepEqual(actual, expected);
});

test('heading', t => {
    const expected = {
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
    };
    const actual = deltaToNpf({
        ops: [
            {insert: "New Post Forms Manifesto"},
            {insert: "\n", attributes: {header: 1}},
            {
                insert: "There comes a moment in every company's life that they must redefine the rules...\n" +
                    "We can choose to embrace this moment courageously, or we may choose to cower in fear."
            }
        ]
    });
    t.deepEqual(actual, expected);
});

test('heading 2', t => {
    const expected = {
        content: [
            {
                "type": "text",
                "subtype": "heading2",
                "text": "what a great conversation"
            }
        ]
    };
    const actual = deltaToNpf({
        ops: [
            {insert: "what a great conversation"},
            {insert: "\n", attributes: {header: 2}}
        ]
    });
    t.deepEqual(actual, expected);
});

test('list', t => {
    const expected = {
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
    };
    const actual = deltaToNpf({
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
    });
    t.deepEqual(actual, expected);
});

test('blockquotes', t => {
    const expected = {
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
    };
    const actual = deltaToNpf({
        ops: [
            {insert: "1: blockquote, not nested"},
            {insert: "\n", attributes: {blockquote: true}},
            {insert: "2: blockquote, nested"},
            {insert: "\n", attributes: {blockquote: true, indent: 1}},
        ]
    });
    t.deepEqual(actual, expected);
});

test('inline', t => {
    const expected = {
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
    };
    const actual = deltaToNpf({
        ops: [
            {insert: "supercali", attributes: {bold: true}},
            {insert: "fragilistic", attributes: {bold: true, italic: true}},
            {insert: "expialidocious", attributes: {italic: true}},
        ]
    });
    t.deepEqual(actual, expected);
});

test('inline 2', t => {
    const expected = {
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
    };
    const actual = deltaToNpf({
        ops: [
            {insert: "some "},
            {insert: "bold", attributes: {bold: true}},
            {insert: " and "},
            {insert: "italic", attributes: {italic: true}},
            {insert: " text"},
        ]
    });
    t.deepEqual(actual, expected);
});

test('link', t => {
    const expected = {
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
    };
    const actual = deltaToNpf({
        ops: [
            {insert: "Found "},
            {insert: "this", attributes: {link: "https://www.nasa.gov"}},
            {insert: " link for you"},
        ]
    });
    t.deepEqual(actual, expected);
});

test('color', t => {
    const expected = {
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
    };
    const actual = deltaToNpf({
        ops: [
            {insert: "Celebrate "},
            {insert: "Pride", attributes: {color: "#ff492f"}},
            {insert: " Month"},
        ]
    });
    t.deepEqual(actual, expected);
});

test('multiple color', t => {
    const expected = {
        content: [
            {
                type: "text",
                text: "Celebrate Pride Month",
                formatting: [
                    {
                        start: 0,
                        end: 10,
                        type: "color",
                        hex: "#2d70f6"
                    },
                    {
                        start: 10,
                        end: 15,
                        type: "color",
                        hex: "#3bf62d"
                    },
                    {
                        start: 15,
                        end: 21,
                        type: "color",
                        hex: "#ff492f"
                    }
                ]
            }
        ]
    };
    const actual = deltaToNpf({
        ops: [
            {insert: "Celebrate ", attributes: {color: "#2d70f6"}},
            {insert: "Pride", attributes: {color: "#3bf62d"}},
            {insert: " Month", attributes: {color: "#ff492f"}},
        ]
    });
    t.deepEqual(actual, expected);
});

test('heading 3', t => {
    const expected = {
        content: [
            {
                type: "text",
                text: "The cake is a lie",
                formatting: [
                    {
                        start: 0,
                        end: 17,
                        type: "bold"
                    }
                ]
            }
        ]
    };
    const actual = deltaToNpf({
        ops: [
            {insert: "The cake is a lie\n", attributes: {header: 3}}
        ]
    });
    t.deepEqual(actual, expected);
});

test('video', t => {
    const expected = {
        "content": [
            {
                "type": "video",
                "media": {
                    "type": "video/mp4",
                    "url": "https://example.com/video.mp4",
                }
            }
        ]
    };
    const actual = deltaToNpf({
        ops: [
            {insert: {video: 'https://example.com/video.mp4'}},
            {insert: '\n'},
        ]
    });
    t.deepEqual(actual, expected);
});

test('video type detection', t => {
    const expected = {
        "content": [
            {"type": "video", "media": { "type": "video/mp4", "url": "https://example.com/video.mp4" }},
            {"type": "video", "media": { "type": "video/webp", "url": "https://example.com/video.webp" }},
            {"type": "video", "media": { "type": "video/ogg", "url": "https://example.com/video.ogg" }},
            {"type": "video", "url": "https://example.com/video" },
        ]
    };
    const actual = deltaToNpf({
        ops: [
            {insert: {video: 'https://example.com/video.mp4'}},
            {insert: {video: 'https://example.com/video.webp'}},
            {insert: {video: 'https://example.com/video.ogg'}},
            {insert: {video: 'https://example.com/video'}},
            {insert: '\n'},
        ]
    });
    t.deepEqual(actual, expected);
});

test('code', t => {
    const expected = {
        content: [
            {
                type: "text",
                text: 'console.log("<3");',
                formatting: [
                    {
                        start: 0,
                        end: 18,
                        color: '#e83e8c'
                    }
                ]
            },
        ]
    };
    const actual = deltaToNpf({
        ops: [
            {insert: 'console.log("<3");\n', attributes: {code: true}},
        ]
    });
    t.deepEqual(actual, expected);
});

test('multiline code', t => {
    const expected = {
        content: [
            {
                type: "text",
                text: 'let a;', 
                formatting: [
                    {
                        start: 0,
                        end: 6,
                        color: '#e83e8c'
                    }
                ]
            },
            {
                type: "text",
                text: 'let b;',
                formatting: [
                    {
                        start: 0,
                        end: 6,
                        color: '#e83e8c'
                    }
                ]
            },
            {
                type: "text",
                text: 'let c;',
                formatting: [
                    {
                        start: 0,
                        end: 6,
                        color: '#e83e8c'
                    }
                ]
            },
        ]
    };
    const actual = deltaToNpf({
        ops: [
            {insert: 'let a;\nlet b;\nlet c;\n', attributes: {code: true}},
        ]
    });
    t.deepEqual(actual, expected);
});
