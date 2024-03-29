const test = require("ava");
const deltaToHtml = require("./delta-to-html");

test('empty', t => {
    const expected = '';
    const actual = deltaToHtml({
        ops: []
    });
    t.deepEqual(actual, expected);
});

test('plain text', t => {
    const expected = '<p>Hello, world!</p>';
    const actual = deltaToHtml({
        ops: [
            {insert: 'Hello, world!\n'}
        ]
    });
    t.deepEqual(actual, expected);
});

test('inline styles', t => {
    const expected = ('<p><b>Gandalf</b> the <span style="color:#cccccc;">Grey</span></p>');
    const actual = deltaToHtml({
        ops: [
            {insert: 'Gandalf', attributes: {bold: true}},
            {insert: ' the '},
            {insert: 'Grey', attributes: {color: '#cccccc'}},
            {insert: '\n'}
        ]
    });
    t.deepEqual(actual, expected);
});

test('inline styles 2', t => {
    const expected = ('<p><b>Gandalf</b> the Grey</p>');
    const actual = deltaToHtml({
        ops: [
            {insert: 'Gandalf', attributes: {bold: true}},
            {insert: ' the Grey\n'},
        ]
    });
    t.deepEqual(actual, expected);
});

test('color and italic', t => {
    const expected = '<p><i style="color:#cccccc;">Hello, world!</i></p>';
    const actual = deltaToHtml({
        ops: [
            {insert: 'Hello, world!', attributes: {italic: true, color: '#cccccc'}},
            {insert: '\n'}
        ]
    });
    t.deepEqual(actual, expected);
});

test('underline and line-through', t => {
    const expected = '<p>' +
        '<span style="text-decoration:underline;">The cake </span>' +
        '<span style="text-decoration:underline line-through;">is </span>' +
        '<span style="text-decoration:line-through;">a lie</span>' +
        '</p>';
    const actual = deltaToHtml({
        ops: [
            {insert: 'The cake ', attributes: {underline: true}},
            {insert: 'is ', attributes: {underline: true, strike: true}},
            {insert: 'a lie', attributes: {strike: true}},
            {insert: '\n'}
        ]
    });
    t.deepEqual(actual, expected);
});

test('link', t => {
    const expected = ('<p><a href="https://example.com">found this</a> for you</p>');
    const actual = deltaToHtml({
        ops: [
            {
                insert: 'found this',
                attributes: {link: 'https://example.com'}
            },
            {insert: ' for you\n'}
        ]
    });
    t.deepEqual(actual, expected);
});

test('bold link', t => {
    const expected = ('<p><a href="https://example.com" style="font-weight:bold;">found this</a> for you</p>');
    const actual = deltaToHtml({
        ops: [
            {
                insert: 'found this',
                attributes: {link: 'https://example.com', bold: true}
            },
            {insert: ' for you\n'}
        ]
    });
    t.deepEqual(actual, expected);
});

test('italic link', t => {
    const expected = ('<p><a href="https://example.com" style="font-style:italic;">found this</a> for you</p>');
    const actual = deltaToHtml({
        ops: [
            {
                insert: 'found this',
                attributes: {link: 'https://example.com', italic: true}
            },
            {insert: ' for you\n'}
        ]
    });
    t.deepEqual(actual, expected);
});

test('bold and italic link', t => {
    const expected = ('<p><a href="https://example.com" style="font-weight:bold;font-style:italic;">found this</a> for you</p>');
    const actual = deltaToHtml({
        ops: [
            {
                insert: 'found this',
                attributes: {link: 'https://example.com', bold: true, italic: true}
            },
            {insert: ' for you\n'}
        ]
    });
    t.deepEqual(actual, expected);
});

test('image', t => {
    const expected = ('<p><img src="https://example.com/image.png" alt="Alt text goes here."></p>');
    const actual = deltaToHtml({
        ops: [
            {
                insert: {image: 'https://example.com/image.png'},
                attributes: {alt: 'Alt text goes here.'}
            },
            {insert: '\n'}
        ]
    });
    t.deepEqual(actual, expected);
});

test('image link', t => {
    const expected = ('<a href="https://example.com">' +
        '<img src="https://example.com/image.png" alt="Alt text goes here.">' +
        '</a>');
    const actual = deltaToHtml({
        ops: [
            {
                insert: {image: 'https://example.com/image.png'},
                attributes: {alt: 'Alt text goes here.', link: 'https://example.com'}
            },
            {insert: '\n'}
        ]
    });
    t.deepEqual(actual, expected);
});

test('paragraphs', t => {
    const expected = (
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
    const actual = deltaToHtml({
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
    });
    t.deepEqual(actual, expected);
});

test('lists', t => {
    const expected = (
        '<h1>Sward&#x27;s Shopping List</h1>' +
        '<ol>' +
        '<li>Sword</li>' +
        '<li>Candy</li>' +
        '</ol>' +
        '<p>But especially don&#x27;t forget:</p>' +
        '<ul>' +
        '<li>Death, which is uncountable on this list.</li>' +
        '</ul>'
    );
    const actual = deltaToHtml({
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
    });
    t.deepEqual(actual, expected);
});

test('headings 1-6', t => {
    const expected = (
        '<h1>Level one</h1>' +
        '<h2>Level two</h2>' +
        '<h3>Level three</h3>' +
        '<h4>Level four</h4>' +
        '<h5>Level five</h5>' +
        '<h6>Final level!</h6>'
    );
    const actual = deltaToHtml({
        ops: [
            {insert: "Level one"},
            {insert: "\n", attributes: {header: 1}},
            {insert: "Level two"},
            {insert: "\n", attributes: {header: 2}},
            {insert: "Level three"},
            {insert: "\n", attributes: {header: 3}},
            {insert: "Level four"},
            {insert: "\n", attributes: {header: 4}},
            {insert: "Level five"},
            {insert: "\n", attributes: {header: 5}},
            {insert: "Final level!"},
            {insert: "\n", attributes: {header: 6}},
        ]
    });
    t.deepEqual(actual, expected);
});

test('blockquote', t => {
    const expected = (
        '<blockquote>' +
        '<i>You</i> ' +
        'want to tell me, and I have no objection to hearing it.' +
        '</blockquote>'
    );
    const actual = deltaToHtml({
        ops: [
            {insert: "You", attributes: {italic: true}},
            {insert: " want to tell me, and I have no objection to hearing it."},
            {insert: "\n", attributes: {blockquote: true}},
        ]
    });
    t.deepEqual(actual, expected);
});

test('#12 multiline separated formatted paragraphs', t => {
    const expected = '<p><i>Para 1</i></p><p><i>Para 2</i></p>';
    const actual = deltaToHtml({
        "ops": [{
            "insert": "Para 1",
            "attributes": {"italic": true}
        }, {
            "insert": "\n\n"
        }, {
            "insert": "Para 2",
            "attributes": {"italic": true}
        }, {
            "insert": "\n\n"
        }]
    });
    t.deepEqual(actual, expected);
});

test('html injection via text', t => {
    const expected = '<p>&lt;script&gt;alert(&quot;&lt;3&quot;);&lt;/script&gt;</p>';
    const actual = deltaToHtml({
        ops: [
            {insert: '<script>alert("<3");</script>'},
        ]
    });
    t.deepEqual(actual, expected);
});

test('html injection via header attribute', t => {
    const expected = '<p>Hello World</p>';
    const actual = deltaToHtml({
        ops: [
            {insert: 'Hello World', attributes: {header: '"><script>alert("<3");</script>'}},
        ]
    });
    t.deepEqual(actual, expected);
});

test('html injection via color attribute', t => {
    const expected = '<p><span style="color:&quot;&gt;&lt;script&gt;alert(&quot;&lt;3&quot;);&lt;/script&gt;;">Hello World</span></p>';
    const actual = deltaToHtml({
        ops: [
            {insert: 'Hello World', attributes: {color: '"><script>alert("<3");</script>'}},
        ]
    });
    t.deepEqual(actual, expected);
});

test('html injection via link target', t => {
    const expected = '<p><a href="&quot;&gt;&lt;script&gt;alert(&quot;&lt;3&quot;);&lt;/script&gt;">Hello World</a></p>';
    const actual = deltaToHtml({
        ops: [
            {insert: 'Hello World', attributes: {link: '"><script>alert("<3");</script>'}},
        ]
    });
    t.deepEqual(actual, expected);
});

test('html injection via image', t => {
    const expected = '<p><img src="&quot;&gt;&lt;script&gt;alert(&quot;&lt;3&quot;);&lt;/script&gt;"></p>';
    const actual = deltaToHtml({
        ops: [
            {insert: {image: '"><script>alert("<3");</script>'}},
        ]
    });
    t.deepEqual(actual, expected);
});

test('html injection via video', t => {
    const expected = '<p><video src="&quot;&gt;&lt;script&gt;alert(&quot;&lt;3&quot;);&lt;/script&gt;"></video></p>';
    const actual = deltaToHtml({
        ops: [
            {insert: {video: '"><script>alert("<3");</script>'}},
        ]
    });
    t.deepEqual(actual, expected);
});

test('html injection via alt text', t => {
    const expected = '<p><img src="https://example.com/image.png" alt="&quot;&gt;&lt;script&gt;alert(&quot;&lt;3&quot;);&lt;/script&gt;"></p>';
    const actual = deltaToHtml({
        ops: [
            {insert: {image: 'https://example.com/image.png'}, attributes: {alt: '"><script>alert("<3");</script>'}},
        ]
    });
    t.deepEqual(actual, expected);
});
test('#14 dividers', t => {
    const expected = '<p><hr></p>';
    const actual = deltaToHtml({
        ops: [
            {insert: {divider: true}},
            {insert: '\n'},
        ]
    });
    t.deepEqual(actual, expected);
});

test('video', t => {
    const expected = '<p><video src="https://example.com/video.mp4"></video></p>';
    const actual = deltaToHtml({
        ops: [
            {insert: {video: 'https://example.com/video.mp4'}},
            {insert: '\n'},
        ]
    });
    t.deepEqual(actual, expected);
});

test('code', t => {
    const expected = '<p><code>console.log(&quot;&lt;3&quot;);</code></p>';
    const actual = deltaToHtml({
        ops: [
            {insert: 'console.log("<3");\n', attributes: {code: true}},
        ]
    });
    t.deepEqual(actual, expected);
});

test('multiline code', t => {
    const expected = '<p><code>let a;</code></p><p><code>let b;</code></p><p><code>let c;</code></p>';
    const actual = deltaToHtml({
        ops: [
            {insert: 'let a;\nlet b;\nlet c;\n', attributes: {code: true}},
        ]
    });
    t.deepEqual(actual, expected);
});

test('code block', t => {
    const expected = '<pre><code>let a;\nlet b;\nlet c;</code></pre>';
    const actual = deltaToHtml({
        ops: [
            {insert: 'let a;'},
            {insert: '\n', attributes: {'code-block': true}},
            {insert: 'let b;'},
            {insert: '\n', attributes: {'code-block': true}},
            {insert: 'let c;'},
            {insert: '\n', attributes: {'code-block': true}},
        ]
    });
    t.deepEqual(actual, expected);
});

test('multiple code blocks', t => {
    const expected = '<pre><code>let a;\nlet b;</code></pre>' +
        '<p>Put here some text explaining the code</p>' +
        '<pre><code>let c;</code></pre>';
    const actual = deltaToHtml({
        ops: [
            {insert: 'let a;'},
            {insert: '\n', attributes: {'code-block': true}},
            {insert: 'let b;'},
            {insert: '\n', attributes: {'code-block': true}},
            {insert: 'Put here some text explaining the code\nlet c;'},
            {insert: '\n', attributes: {'code-block': true}},
        ]
    });
    t.deepEqual(actual, expected);
});

