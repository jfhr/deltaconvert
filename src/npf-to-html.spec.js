const test = require("ava");
const npfToHtml = require("./npf-to-html");

test('empty string', t => {
    const expected = '';
    const actual = npfToHtml({content: []});
    t.deepEqual(actual, expected);
});

test('plain text', t => {
    const expected = '<p>Hello, world!</p>';
    const actual = npfToHtml({content: [{type: 'text', text: 'Hello, world!'}]});
    t.deepEqual(actual, expected);
});

test(`heading 1`, t => {
    const expected = `<h1>what a great conversation</h1>`;
    const actual = npfToHtml({
        content: [
            {
                "type": "text",
                "subtype": "heading1",
                "text": "what a great conversation"
            }
        ]
    });
    t.deepEqual(actual, expected);
});

test(`heading 2`, t => {
    const expected = `<h2>what a great conversation</h2>`;
    const actual = npfToHtml({
        content: [
            {
                "type": "text",
                "subtype": "heading2",
                "text": "what a great conversation"
            }
        ]
    });
    t.deepEqual(actual, expected);
});

test('bold text', t => {
    const expected = '<p><b>Gandalf</b></p>';
    const actual = npfToHtml({
        content: [
            {
                type: "text",
                text: "Gandalf",
                formatting: [
                    {
                        start: 0,
                        end: 7,
                        type: "bold"
                    }
                ]
            }
        ]
    });
    t.deepEqual(actual, expected);
});

test('italic text', t => {
    const expected = '<p><i>Gandalf</i></p>';
    const actual = npfToHtml({
        content: [
            {
                type: "text",
                text: "Gandalf",
                formatting: [
                    {
                        start: 0,
                        end: 7,
                        type: "italic"
                    }
                ]
            }
        ]
    });
    t.deepEqual(actual, expected);
});

test('inline', t => {
    const expected = '<p><b>supercali</b><b style="font-style:italic;">fragilistic</b><i>expialidocious</i></p>';
    const actual = npfToHtml({
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
    t.deepEqual(actual, expected);
});

test('inline 2', t => {
    const expected = '<p>some <b>bold</b> and <i>italic</i> text</p>';
    const actual = npfToHtml({
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
    t.deepEqual(actual, expected);
});

test('link', t => {
    const expected = '<p>Found <a href="https://www.nasa.gov">this</a> link for you</p>';
    const actual = npfToHtml({
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
    t.deepEqual(actual, expected);
});

test('adjacent links', t => {
    const expected = '<p><a href="https://tumblr.com">to be</a><a href="https://myspace.com"> or not to be</a></p>';
    const actual = npfToHtml({
        content: [
            {
                type: "text",
                text: "to be or not to be",
                formatting: [
                    {
                        start: 0,
                        end: 5,
                        type: "link",
                        url: "https://tumblr.com"
                    },
                    {
                        start: 5,
                        end: 18,
                        type: "link",
                        url: "https://myspace.com"
                    }
                ]
            }
        ]
    });
    t.deepEqual(actual, expected);
});

test('color', t => {
    const expected = '<p>Celebrate <span style="color:#ff492f;">Pride</span> Month</p>';
    const actual = npfToHtml({
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
    t.deepEqual(actual, expected);
});

test('multiple color', t => {
    const expected =
        '<p>' +
        '<span style="color:#2d70f6;">Celebrate </span>' +
        '<span style="color:#3bf62d;">Pride</span>' +
        '<span style="color:#ff492f;"> Month</span>' +
        '</p>'
    ;
    const actual = npfToHtml({
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
                    },
                ]
            }
        ]
    });
    t.deepEqual(actual, expected);
});

test('video', t => {
    const expected = '<p><video src="https://example.com/video.mp4"></video></p>'
    const actual = npfToHtml({
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
    t.deepEqual(actual, expected);
});

test('video type detection', t => {
    const expected =
        '<p><video src="https://example.com/video.mp4"></video></p>' +
        '<p><video src="https://example.com/video.webp"></video></p>' +
        '<p><video src="https://example.com/video.ogg"></video></p>' +
        '<p><video src="https://example.com/video"></video></p>'
    ;
    const actual = npfToHtml({
        "content": [
            {"type": "video", "media": { "type": "video/mp4", "url": "https://example.com/video.mp4" }},
            {"type": "video", "media": { "type": "video/webp", "url": "https://example.com/video.webp" }},
            {"type": "video", "media": { "type": "video/ogg", "url": "https://example.com/video.ogg" }},
            {"type": "video", "url": "https://example.com/video" },
        ]
    });
    t.deepEqual(actual, expected);
});

test('bold link', t => {
    const expected = '<p><a href="https://example.com" style="font-weight:bold;">' +
        'found this</a> for you</p>';
    const actual = npfToHtml({
        content: [
            {
                type: "text",
                text: "found this for you",
                formatting: [
                    {
                        start: 0,
                        end: 10,
                        type: "bold"
                    },
                    {
                        start: 0,
                        end: 10,
                        type: "link",
                        url: "https://example.com"
                    },
                ]
            }
        ]
    });
    t.deepEqual(actual, expected);
});

test('italic link', t => {
    const expected = '<p><a href="https://example.com" style="font-style:italic;">' +
        'found this</a> for you</p>';
    const actual = npfToHtml({
        content: [
            {
                type: "text",
                text: "found this for you",
                formatting: [
                    {
                        start: 0,
                        end: 10,
                        type: "italic"
                    },
                    {
                        start: 0,
                        end: 10,
                        type: "link",
                        url: "https://example.com"
                    },
                ]
            }
        ]
    });
    t.deepEqual(actual, expected);
});

test('bold and italic link', t => {
    const expected = '<p><a href="https://example.com" style="font-weight:bold;font-style:italic;">' +
        'found this</a> for you</p>';
    const actual = npfToHtml({
        content: [
            {
                type: "text",
                text: "found this for you",
                formatting: [
                    {
                        start: 0,
                        end: 10,
                        type: "bold"
                    },
                    {
                        start: 0,
                        end: 10,
                        type: "italic"
                    },
                    {
                        start: 0,
                        end: 10,
                        type: "link",
                        url: "https://example.com"
                    },
                ]
            }
        ]
    });
    t.deepEqual(actual, expected);
});

test('image', t => {
    const expected = '<p><img src="https://69.media.tumblr.com/path/to/image.jpg"></p>';
    const actual = npfToHtml({
        content: [
            {type: 'image/jpg', url: 'https://69.media.tumblr.com/path/to/image.jpg'},
        ]
    });
    t.deepEqual(actual, expected);
});

test('image type detection', t => {
    const expected =
        '<p><img src="https://69.media.tumblr.com/path/to/image.jpg"></p>' +
        '<p><img src="https://69.media.tumblr.com/path/to/image.png"></p>' +
        '<p><img src="https://69.media.tumblr.com/path/to/image.gif"></p>' +
        '<p><img src="https://69.media.tumblr.com/path/to/image"></p>'
    ;
    const actual = npfToHtml({
        content: [
            {type: 'image/jpg', url: 'https://69.media.tumblr.com/path/to/image.jpg'},
            {type: 'image/png', url: 'https://69.media.tumblr.com/path/to/image.png'},
            {type: 'image/gif', url: 'https://69.media.tumblr.com/path/to/image.gif'},
            {type: 'image', url: 'https://69.media.tumblr.com/path/to/image'},
        ]
    });
    t.deepEqual(actual, expected);
});

test('npf', t => {
    const expected =
        '<h1>New Post Forms Manifesto</h1>' +
        '<p>There comes a moment in every company&#x27;s life that they must redefine the rules...</p>' +
        '<p>We can choose to embrace this moment courageously, or we may choose to cower in fear.</p>'
    ;
    const actual = npfToHtml({
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
    t.deepEqual(actual, expected);
});

test('list', t => {
    const expected =
        "<h1>Sward&#x27;s Shopping List</h1>" +
        '<ol>' +
        '<li>Sword</li>' +
        '<li>Candy</li>' +
        '</ol>' +
        "<p>But especially don&#x27;t forget:</p>" +
        '<ul>' +
        '<li>Death, which is uncountable on this list.</li>' +
        '</ul>'
    ;
    const actual = npfToHtml({
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
    t.deepEqual(actual, expected);
});

test('paragraphs', t => {
    const expected =
        '<p>It is a truth universally acknowledged, that a single man in ' +
        'possession of a good fortune, must be in want of a wife.</p>' +
        '<p>However little known the feelings or views of such a man may be ' +
        'on his first entering a neighbourhood, this truth is so well ' +
        'fixed in the minds of the surrounding families, that he is ' +
        'considered the rightful property of some one or other of their ' +
        'daughters.</p>' +
        '<p>“My dear Mr. Bennet,” said his lady to him one day, “have you ' +
        'heard that Netherfield Park is let at last?”</p>' +
        '<p>Mr. Bennet replied that he had not.</p>'
    ;
    const actual = npfToHtml({
        content: [
            {
                type: "text",
                text:
                    'It is a truth universally acknowledged, that a single man in ' +
                    'possession of a good fortune, must be in want of a wife.'
            },
            {
                type: "text",
                text:
                    'However little known the feelings or views of such a man may be ' +
                    'on his first entering a neighbourhood, this truth is so well ' +
                    'fixed in the minds of the surrounding families, that he is ' +
                    'considered the rightful property of some one or other of their ' +
                    'daughters.'
            },
            {
                type: "text",
                text:
                    '“My dear Mr. Bennet,” said his lady to him one day, “have you ' +
                    'heard that Netherfield Park is let at last?”'
            },
            {
                type: "text",
                text:
                    'Mr. Bennet replied that he had not.'
            },
        ]
    });
    t.deepEqual(actual, expected);
});
