const test = require("ava");
const htmlToDelta = require("./html-to-delta");


test('empty string', t => {
    const actual = htmlToDelta('');
    const expected = {
        ops: [{insert: '\n'}]
    };
    t.deepEqual(actual, expected);
});

test('plain text', t => {
    const actual = htmlToDelta('Hello, world!');
    const expected = {
        ops: [
            {insert: 'Hello, world!\n'}
        ]
    };
    t.deepEqual(actual, expected);
});

test('ignored elements', t => {
    const actual = htmlToDelta('<head><title>foo</title><style>*{}</style></head>');
    const expected = {
        ops: [{insert: '\n'}]
    };
    t.deepEqual(actual, expected);
});

for (let i = 1; i < 7; i++) {
    test(`header ${i}`, t => {
        const actual = htmlToDelta(`<h${i}>Hello, world!</h${i}>`);
        const expected = {
            ops: [
                {insert: 'Hello, world!'},
                {insert: '\n', attributes: {header: i}},
            ]
        };
        t.deepEqual(actual, expected);
    });
}

test('bold text', t => {
    const actual = htmlToDelta('<b>Gandalf</b>');
    const expected = {
        ops: [
            {insert: 'Gandalf', attributes: {bold: true}},
            {insert: '\n'},
        ]
    };
    t.deepEqual(actual, expected);
});

test('italic text', t => {
    const actual = htmlToDelta('<i>Gandalf</i>');
    const expected = {
        ops: [
            {insert: 'Gandalf', attributes: {italic: true}},
            {insert: '\n'},
        ]
    };
    t.deepEqual(actual, expected);
});

test('nested element styles', t => {
    const actual = htmlToDelta('<strong>Gandalf <i>the</i></strong> <i>Grey</i>');
    const expected = {
        ops: [
            {insert: 'Gandalf ', attributes: {bold: true}},
            {insert: 'the', attributes: {bold: true, italic: true}},
            {insert: ' '},
            {insert: 'Grey', attributes: {italic: true}},
            {insert: '\n'},
        ]
    };
    t.deepEqual(actual, expected);
});

test('inline styles', t => {
    const actual = htmlToDelta('<span style="font-weight:bold;">Gandalf</span>' +
        '<span> the </span><span style="color:#cccccc">Grey</span>');
    const expected = {
        ops: [
            {insert: 'Gandalf', attributes: {bold: true}},
            {insert: ' the '},
            {insert: 'Grey', attributes: {color: '#cccccc'}},
            {insert: '\n'},
        ]
    };
    t.deepEqual(actual, expected);
});

test('bold link', t => {
    const actual = htmlToDelta('<p><a href="https://example.com" style="font-weight:bold;">' +
        'found this</a> for you</p>');
    const expected = {
        ops: [
            {
                insert: 'found this',
                attributes: {link: 'https://example.com', bold: true}
            },
            {insert: ' for you\n\n'}
        ]
    };
    t.deepEqual(actual, expected);
});

test('italic link', t => {
    const actual = htmlToDelta('<p><a href="https://example.com" style="font-style:italic;">' +
        'found this</a> for you</p>');
    const expected = {
        ops: [
            {
                insert: 'found this',
                attributes: {link: 'https://example.com', italic: true}
            },
            {insert: ' for you\n\n'}
        ]
    };
    t.deepEqual(actual, expected);
});

test('bold and italic link', t => {
    const actual = htmlToDelta('<p><a href="https://example.com" style="font-weight:bold;font-style:italic;">' +
        'found this</a> for you</p>');
    const expected = {
        ops: [
            {
                insert: 'found this',
                attributes: {link: 'https://example.com', bold: true, italic: true}
            },
            {insert: ' for you\n\n'}
        ]
    };
    t.deepEqual(actual, expected);
});

test('link without href', t => {
    const actual = htmlToDelta('<p><a>found nothing</a> for you</p>');
    const expected = {
        ops: [
            {
                insert: 'found nothing for you\n\n'}
        ]
    };
    t.deepEqual(actual, expected);
});

test('image', t => {
    const actual = htmlToDelta('<img src="https://example.com/image.png" alt="Alt text goes here.">');
    const expected = {
        ops: [
            {
                insert: {image: 'https://example.com/image.png'},
                attributes: {alt: 'Alt text goes here.'}
            },
            {
                insert: '\n'
            }
        ]
    };
    t.deepEqual(actual, expected);
});

test('image link', t => {
    const actual = htmlToDelta('<a href="https://example.com">' +
        '<img src="https://example.com/image.png" alt="Alt text goes here.">' +
        '</a>');
    const expected = {
        ops: [
            {
                insert: {image: 'https://example.com/image.png'},
                attributes: {alt: 'Alt text goes here.', link: 'https://example.com'}
            },
            {
                insert: '\n'
            }
        ]
    };
    t.deepEqual(actual, expected);
});

test('paragraphs', t => {
    const actual = htmlToDelta(
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
        ops: [{
            insert:
                'It is a truth universally acknowledged, that a single man in ' +
                'possession of a good fortune, must be in want of a wife.' +
                '\n\n' +
                'However little known the feelings or views of such a man may be ' +
                'on his first entering a neighbourhood, this truth is so well ' +
                'fixed in the minds of the surrounding families, that he is ' +
                'considered the rightful property of some one or other of their ' +
                'daughters.' +
                '\n\n' +
                '“My dear Mr. Bennet,” said his lady to him one day, “have you ' +
                'heard that Netherfield Park is let at last?”' +
                '\n\n' +
                'Mr. Bennet replied that he had not.\n\n'
        }]
    };
    t.deepEqual(actual, expected);
});

test('paragraphs with <br> breaks', t => {
    const actual = htmlToDelta(
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
        ops: [{
            insert:
                'It is a truth universally acknowledged, that a single man in ' +
                'possession of a good fortune, must be in want of a wife.' +
                '\n\n' +
                'However little known the feelings or views of such a man may be ' +
                'on his first entering a neighbourhood, this truth is so well ' +
                'fixed in the minds of the surrounding families, that he is ' +
                'considered the rightful property of some one or other of their ' +
                'daughters.' +
                '\n\n' +
                '“My dear Mr. Bennet,” said his lady to him one day, “have you ' +
                'heard that Netherfield Park is let at last?”' +
                '\n\n' +
                'Mr. Bennet replied that he had not.\n\n',
        }]
    };
    t.deepEqual(actual, expected);
});

test('lists', t => {
    const actual = htmlToDelta(
        '<h1>Sward\'s Shopping List</h1>' +
        '<ol>' +
        '<li>Sword</li>' +
        '<li>Candy</li>' +
        '</ol>' +
        'But especially don\'t forget:' +
        '<ul>' +
        '<li>Death, which is uncountable on this list.</li>' +
        '</ul>'
    );
    const expected = {
        ops: [
            {insert: "Sward's Shopping List"},
            {insert: "\n", attributes: {header: 1}},
            {insert: "Sword"},
            {insert: "\n", attributes: {list: "ordered"}},
            {insert: "Candy"},
            {insert: "\n", attributes: {list: "ordered"}},
            {insert: "But especially don't forget:\nDeath, which is uncountable on this list."},
            {insert: "\n", attributes: {list: "bullet"}}
        ]
    };
    t.deepEqual(actual, expected);
});

test('#16 <em> tags', t => {
    const actual = htmlToDelta('<p><em>Hello</em></p>');
    const expected = {
        ops: [
            {insert: 'Hello', attributes: {italic: true}},
            {insert: '\n\n'}
        ]
    };
    t.deepEqual(actual, expected);
});

// noinspection HtmlRequiredTitleElement
test('#17 ignore <head>', t => {
    const actual = htmlToDelta('' +
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
        ops: [
            {insert: 'Hello\n\n'},
        ]
    };
    t.deepEqual(actual, expected);
});

test('#17 ignore <style>', t => {
    const actual = htmlToDelta('' +
        '<style>' +
        'body {' +
        '    color: green;' +
        '}' +
        '</style>' +
        '<p>Hello</p>');
    const expected = {
        ops: [
            {insert: 'Hello\n\n'},
        ]
    };
    t.deepEqual(actual, expected);
});

test('<hr>', t => {
    const actual = htmlToDelta('<p>Line 1</p><hr><p>Line 2</p>');
    const expected = {
        ops: [
            {insert: 'Line 1\n\n'},
            {insert: {divider: true}},
            {insert: 'Line 2\n\n'},
        ]
    };
    t.deepEqual(actual, expected);
});

test('italic + oblique', t => {
    const actual = htmlToDelta(
        '<span style="font-style:italic;">Aperture </span>' +
        '<span style="font-style:oblique;">Science</span>');
    const expected = {
        ops: [
            {insert: 'Aperture Science', attributes: {italic: true}},
            {insert: '\n'},
        ]
    };
    t.deepEqual(actual, expected);
});

test('underline + line-through', t => {
    const actual = htmlToDelta(
        '<span style="text-decoration:underline;">The cake </span>' +
        '<span style="text-decoration:underline line-through;">is </span>' +
        '<span style="text-decoration:line-through;">a lie</span>');
    const expected = {
        ops: [
            {insert: 'The cake ', attributes: {underline: true}},
            {insert: 'is ', attributes: {underline: true, strike: true}},
            {insert: 'a lie', attributes: {strike: true}},
            {insert: '\n'},
        ]
    };
    t.deepEqual(actual, expected);
});

test('video with <source> subelement', t => {
    const actual = htmlToDelta('<video><source src="https://example.com/video.mp4" type="video/mp4"></video>');
    const expected = {
        ops: [
            {insert: {video: 'https://example.com/video.mp4'}},
            {insert: '\n'},
        ]
    };
    t.deepEqual(actual, expected);
});

test('video with src attribute', t => {
    const actual = htmlToDelta('<video src="https://example.com/video.mp4"></video>');
    const expected = {
        ops: [
            {insert: {video: 'https://example.com/video.mp4'}},
            {insert: '\n'},
        ]
    };
    t.deepEqual(actual, expected);
});

test('<iframe> with ql-video class', t => {
    const actual = htmlToDelta('<iframe class="ql-video" src="https://example.com/video.mp4"></iframe>');
    const expected = {
        ops: [
            {insert: {video: 'https://example.com/video.mp4'}},
            {insert: '\n'},
        ]
    };
    t.deepEqual(actual, expected);
});

test('code', t => {
    const actual = htmlToDelta('<p><code>console.log("<3");</code></p>');
    const expected = {
        ops: [
            {insert: 'console.log("<3");', attributes: {code: true}},
            {insert: '\n\n'},
        ]
    };
    t.deepEqual(actual, expected);
});

test('multiline code', t => {
    const actual = htmlToDelta('<p><code>let a;\nlet b;\nlet c;</code></p>');
    const expected = {
        ops: [
            {insert: 'let a;\nlet b;\nlet c;', attributes: {code: true}},
            {insert: '\n\n'},
        ]
    };
    t.deepEqual(actual, expected);
});


