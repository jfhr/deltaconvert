const test = require("ava");
const deltaToSsml = require("./delta-to-ssml");


test('plain text', t => {
    const expected = '<speak><p>Hello, world!</p></speak>';
    const actual = deltaToSsml({
        ops: [
            {insert: 'Hello, world!\n'}
        ]
    });
    t.deepEqual(actual, expected);
});

test('inline text with emphasis', t => {
    const expected = ('<speak><p><emphasis>Gandalf</emphasis> the Grey</p></speak>');
    const actual = deltaToSsml({
        ops: [
            {insert: 'Gandalf', attributes: {bold: true}},
            {insert: ' the '},
            {insert: 'Grey', attributes: {color: '#cccccc'}},
            {insert: '\n'}
        ]
    });
    t.deepEqual(actual, expected);
});

test('inline text with emphasis 2', t => {
    const expected = ('<speak><p><emphasis>Gandalf</emphasis> the Grey</p></speak>');
    const actual = deltaToSsml({
        ops: [
            {insert: 'Gandalf', attributes: {bold: true}},
            {insert: ' the Grey\n'},
        ]
    });
    t.deepEqual(actual, expected);
});

test('image', t => {
    const expected = ('<speak><p>Alt text goes here.</p></speak>');
    const actual = deltaToSsml({
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
    const expected = ('<speak><p>Alt text goes here.</p></speak>');
    const actual = deltaToSsml({
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
        '<speak><p>It is a truth universally acknowledged, that a single man ' +
        'in possession of a good fortune, must be in want of a wife.</p>' +
        '<p>However little known the feelings or views of such a man may be ' +
        'on his first entering a neighbourhood, this truth is so well ' +
        'fixed in the minds of the surrounding families, that he is ' +
        'considered the rightful property of some one or other of their ' +
        'daughters.</p>' +
        '<p>“My dear Mr. Bennet,” said his lady to him one day, “have you ' +
        'heard that Netherfield Park is let at last?”</p>' +
        '<p>Mr. Bennet replied that he had not.</p></speak>'
    );
    const actual = deltaToSsml({
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
        '<speak>' +
        '<p>Sward\'s Shopping List</p>' +
        '<p>Sword</p>' +
        '<p>Candy</p>' +
        '<p>But especially don\'t forget:</p>' +
        '<p>Death, which is uncountable on this list.</p>' +
        '</speak>'
    );
    const actual = deltaToSsml({
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

test('blockquote', t => {
    const expected = (
        '<speak><p>' +
        'You want to tell me, and I have no objection to hearing it.' +
        '</p></speak>'
    );
    const actual = deltaToSsml({
        ops: [
            {insert: "You", attributes: {italic: true}},
            {insert: " want to tell me, and I have no objection to hearing it."},
            {insert: "\n", attributes: {blockquote: true}},
        ]
    });
    t.deepEqual(actual, expected);
});

