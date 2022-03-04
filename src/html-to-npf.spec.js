const test = require("ava");
const htmlToNpf = require("./html-to-npf");

test('empty string', t => {
    const actual = htmlToNpf('');
    const expected = {content: []};
    t.deepEqual(actual, expected);
});

test('plain text', t => {
    const actual = htmlToNpf('Hello, world!');
    const expected = {content: [{type: 'text', text: 'Hello, world!'}]};
    t.deepEqual(actual, expected);
});

test('ignored elements', t => {
    const actual = htmlToNpf('<head><title>foo</title><style>*{}</style></head>');
    const expected = {content: []};
    t.deepEqual(actual, expected);
});

test(`heading 1`, t => {
    const actual = htmlToNpf(`<h1>what a great conversation</h1>`);
    const expected = {
        content: [
            {
                "type": "text",
                "subtype": "heading1",
                "text": "what a great conversation"
            }
        ]
    };
    t.deepEqual(actual, expected);
});

test(`heading 2`, t => {
    const actual = htmlToNpf(`<h2>what a great conversation</h2>`);
    const expected = {
        content: [
            {
                "type": "text",
                "subtype": "heading2",
                "text": "what a great conversation"
            }
        ]
    };
    t.deepEqual(actual, expected);
});

test('heading 3', t => {
    const actual = htmlToNpf('<h3>The cake is a lie</h3>');
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
    t.deepEqual(actual, expected);
});

test('bold text', t => {
    const actual = htmlToNpf('<b>Gandalf</b>');
    const expected = {
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
    };
    t.deepEqual(actual, expected);
});

test('italic text', t => {
    const actual = htmlToNpf('<i>Gandalf</i>');
    const expected = {
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
    };
    t.deepEqual(actual, expected);
});

test('inline', t => {
    const actual = htmlToNpf('<b>supercali<i>fragilistic</i></b><i>expialidocious</i>');
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
    t.deepEqual(actual, expected);
});

test('inline 2', t => {
    const actual = htmlToNpf('some <b>bold</b> and <i>italic</i> text');
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
    t.deepEqual(actual, expected);
});

test('link', t => {
    const actual = htmlToNpf('Found <a href="https://www.nasa.gov">this</a> link for you');
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
    t.deepEqual(actual, expected);
});

test('adjacent links', t => {
    const actual = htmlToNpf('<a href="https://tumblr.com">to be</a><a href="https://myspace.com"> or not to be</a>');
    const expected = {
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
    };
    t.deepEqual(actual, expected);
});

test('color', t => {
    const actual = htmlToNpf(
        'Celebrate <span style="color:#ff492f">Pride</span> Month'
    );
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
    t.deepEqual(actual, expected);
});

test('multiple color', t => {
    const actual = htmlToNpf(
        '<span style="color:#2d70f6">Celebrate </span>' +
        '<span style="color:#3bf62d">Pride</span>' +
        '<span style="color:#ff492f"> Month</spanstyle>'
    );
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
                    },
                ]
            }
        ]
    };
    t.deepEqual(actual, expected);
});

test('video', t => {
    const actual = htmlToNpf('<video src="https://example.com/video.mp4"></video>')
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
    t.deepEqual(actual, expected);
});

test('video type detection', t => {
    const actual = htmlToNpf(
        '<video src="https://example.com/video.mp4"></video>' +
        '<video src="https://example.com/video.webp"></video>' +
        '<video src="https://example.com/video.ogg"></video>' +
        '<video src="https://example.com/video"></video>'
    );
    const expected = {
        "content": [
            {"type": "video", "media": { "type": "video/mp4", "url": "https://example.com/video.mp4" }},
            {"type": "video", "media": { "type": "video/webp", "url": "https://example.com/video.webp" }},
            {"type": "video", "media": { "type": "video/ogg", "url": "https://example.com/video.ogg" }},
            {"type": "video", "url": "https://example.com/video" },
        ]
    };
    t.deepEqual(actual, expected);
});

test('code', t => {
    const actual = htmlToNpf('<code>console.log("<3");</code>');
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
    t.deepEqual(actual, expected);
});

test('code block', t => {
    const actual = htmlToNpf(
        '<pre><code>' +
        'let a;\n' +
        'let b;\n' +
        'let c;' +
        '</code></pre>'
    );
    const expected = {
        content: [
            {
                type: "text",
                subtype: "chat",
                text: 'let a;'
            },
            {
                type: "text",
                subtype: "chat",
                text: 'let b;'
            },
            {
                type: "text",
                subtype: "chat",
                text: 'let c;'
            },
        ]
    };
    t.deepEqual(actual, expected);
});

test('bold link', t => {
    const actual = htmlToNpf('<p><a href="https://example.com" style="font-weight:bold;">' +
        'found this</a> for you</p>');
    const expected = {
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
    };
    t.deepEqual(actual, expected);
});

test('italic link', t => {
    const actual = htmlToNpf('<p><a href="https://example.com" style="font-style:italic;">' +
        'found this</a> for you</p>');
    const expected = {
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
    };
    t.deepEqual(actual, expected);
});

test('bold and italic link', t => {
    const actual = htmlToNpf('<p><a href="https://example.com" style="font-weight:bold;font-style:italic;">' +
        'found this</a> for you</p>');
    const expected = {
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
    };
    t.deepEqual(actual, expected);
});

test('link without href', t => {
    const actual = htmlToNpf('<p><a>found nothing</a> for you :(</p>');
    const expected = {
        content: [
            {
                type: "text",
                text: "found nothing for you :("
            }
        ]
    };
    t.deepEqual(actual, expected);
});

test('image', t => {
    const actual = htmlToNpf('<img src="https://69.media.tumblr.com/path/to/image.jpg">');
    const expected = {
        content: [
            {type: 'image/jpg', url: 'https://69.media.tumblr.com/path/to/image.jpg'},
        ]
    };
    t.deepEqual(actual, expected);
});

test('image type detection', t => {
    const actual = htmlToNpf(
        '<img src="https://69.media.tumblr.com/path/to/image.jpg">' +
        '<img src="https://69.media.tumblr.com/path/to/image.png">' +
        '<img src="https://69.media.tumblr.com/path/to/image.gif">' +
        '<img src="https://69.media.tumblr.com/path/to/image">'
    );
    const expected = {
        content: [
            {type: 'image/jpg', url: 'https://69.media.tumblr.com/path/to/image.jpg'},
            {type: 'image/png', url: 'https://69.media.tumblr.com/path/to/image.png'},
            {type: 'image/gif', url: 'https://69.media.tumblr.com/path/to/image.gif'},
            {type: 'image', url: 'https://69.media.tumblr.com/path/to/image'},
        ]
    };
    t.deepEqual(actual, expected);
});

test('npf', t => {
    const actual = htmlToNpf(
        '<h1>New Post Forms Manifesto</h1>' +
        '<p>There comes a moment in every company\'s life that they must redefine the rules...</p>' +
        '<p>We can choose to embrace this moment courageously, or we may choose to cower in fear.</p>'
    );
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
    t.deepEqual(actual, expected);
});

test('list', t => {
    const actual = htmlToNpf(
        "<h1>Sward's Shopping List</h1>" +
        '<ol>' +
        '<li>Sword</li>' +
        '<li>Candy</li>' +
        '</ol>' +
        "<p>But especially don't forget:</p>" +
        '<ul>' +
        '<li>Death, which is uncountable on this list.</li>' +
        '</ul>'
    );
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
    t.deepEqual(actual, expected);
});

test('blockquotes', t => {
    const actual = htmlToNpf(
        '<blockquote>' +
        '1: blockquote, not nested' +
        '<blockquote>' +
        '2: blockquote, nested' +
        '</blockquote>' +
        '</blockquote>'
    )
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
    t.deepEqual(actual, expected);
});

test('image without src', t => {
    const actual = htmlToNpf('<img>');
    const expected = {
        content: []
    };
    t.deepEqual(actual, expected);
});

test('paragraphs', t => {
    const actual = htmlToNpf(
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
    );
    const expected = {
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
    };
    t.deepEqual(actual, expected);
});

test('paragraphs with <br> breaks', t => {
    const actual = htmlToNpf(
        '<p>It is a truth universally acknowledged, that a single man in ' +
        'possession of a good fortune, must be in want of a wife.</p>' +
        '<p><br></p>' +
        '<p>However little known the feelings or views of such a man may be ' +
        'on his first entering a neighbourhood, this truth is so well ' +
        'fixed in the minds of the surrounding families, that he is ' +
        'considered the rightful property of some one or other of their ' +
        'daughters.</p>' +
        '<p><br></p>' +
        '<p>“My dear Mr. Bennet,” said his lady to him one day, “have you ' +
        'heard that Netherfield Park is let at last?”</p>' +
        '<p><br></p>' +
        '<p>Mr. Bennet replied that he had not.</p>'
    );
    const expected = {
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
    };
    t.deepEqual(actual, expected);
});

test('#16 <em> tags', t => {
    const actual = htmlToNpf('<p><em>Hello</em></p>');
    const expected = {
        content: [
            {
                type: "text",
                text: "Hello",
                formatting: [
                    {
                        start: 0,
                        end: 5,
                        type: "italic"
                    }
                ]
            }
        ]
    };
    t.deepEqual(actual, expected);
});

test('#17 ignore <head>', t => {
    const actual = htmlToNpf('' +
        '<head>' +
        '<title>Any old HTML doc</title>' +
        '<script src="index.js"></script>' +
        '<style>' +
        'body {' +
        '    color: green;' +
        '}' +
        '</style>' +
        '</head>' +
        '<body>' +
        '<p>Hello</p>' +
        '</body>');
    const expected = {
        content: [
            {
                type: "text",
                text: "Hello",
            }
        ]
    };
    t.deepEqual(actual, expected);
});

test('#17 ignore <style>', t => {
    const actual = htmlToNpf('' +
        '<style>' +
        'body {' +
        '    color: green;' +
        '}' +
        '</style>' +
        '<p>Hello</p>');
    const expected = {
        content: [
            {
                type: "text",
                text: "Hello",
            }
        ]
    };
    t.deepEqual(actual, expected);
});
