const test = require("ava");
const deltaToIntermediate = require("./delta-to-intermediate");

/**
 * Calls `deltaToIntermediate`, then removes object prototypes from the result.
 * Without this, comparing the output to a plain object with `deepEqual` would
 * fail, because `deepEqual` views prototypes as significant.
 */
function deltaToIntermediateNormalized(delta, options) {
    const intermediate = deltaToIntermediate(delta, options);
    return JSON.parse(JSON.stringify(intermediate));
}


test('plain text', t => {
    const expected = [{
        attributes: {},
        children: [{
            attributes: {},
            insert: 'Hello, world!',
        }],
    }];
    const actual = deltaToIntermediateNormalized({
        ops: [
            {insert: 'Hello, world!\n'}
        ]
    });
    t.deepEqual(actual, expected);
});

test('code block', t => {
    const expected = [
        {
            attributes: {
                'code-block': true,
            },
            children: [
                {
                    attributes: {},
                    insert: 'let a;',
                },
                {
                    attributes: {},
                    insert: 'let b;',
                },
            ],
        },
        {
            attributes: {},
            children: [],
        },
    ];
    const actual = deltaToIntermediateNormalized({
        ops: [
            {insert: 'let a;'},
            {insert: '\n', attributes: {'code-block': true}},
            {insert: 'let b;'},
            {insert: '\n', attributes: {'code-block': true}},
        ]
    });
    t.deepEqual(actual, expected);
});

test('code block (merge disabled)', t => {
    const expected = [
        {
            attributes: {
                'code-block': true,
            },
            children: [
                {
                    attributes: {},
                    insert: 'let a;',
                },
            ],
        },
        {
            attributes: {
                'code-block': true,
            },
            children: [
                {
                    attributes: {},
                    insert: 'let b;',
                },
            ],
        },
        {
            attributes: {},
            children: [],
        },
    ];
    const actual = deltaToIntermediateNormalized({
        ops: [
            {insert: 'let a;'},
            {insert: '\n', attributes: {'code-block': true}},
            {insert: 'let b;'},
            {insert: '\n', attributes: {'code-block': true}},
        ]
    }, {mergeAdjacentCodeBlocks: false});
    t.deepEqual(actual, expected);
});

test('code block and text', t => {
    const expected = [
        {
            attributes: {
                'code-block': true,
            },
            children: [
                {
                    attributes: {},
                    insert: 'let a;',
                },
                {
                    attributes: {},
                    insert: 'let b;',
                },
            ],
        },
        {
            attributes: {},
            children: [
                {
                    attributes: {},
                    insert: 'plain text',
                }
            ],
        },
    ];
    const actual = deltaToIntermediateNormalized({
        ops: [
            {insert: 'let a;'},
            {insert: '\n', attributes: {'code-block': true}},
            {insert: 'let b;'},
            {insert: '\n', attributes: {'code-block': true}},
            {insert: 'plain text\n'},
        ]
    });
    t.deepEqual(actual, expected);
});

test('#11 break between an un-formatted and a formatted paragraph', t => {
    const expected = [
        {
            children: [ { insert: 'found this for you:', attributes: {} } ],
            attributes: {}
        },
        {
            children: [
                {
                    insert: 'nasa.gov',
                    attributes: { link: 'https://www.nasa.gov' }
                }
            ],
            attributes: { link: 'https://www.nasa.gov' }
        },
        { children: [], attributes: {} }
    ];
    const actual = deltaToIntermediateNormalized({
        ops: [
            { insert: 'found this for you:\n\n' },
            {
                insert: 'nasa.gov',
                attributes: { link: 'https://www.nasa.gov' }
            },
            { insert: '\n\n' }
        ]
    });
    t.deepEqual(actual, expected);
});

