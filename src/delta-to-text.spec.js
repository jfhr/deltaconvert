const test = require("ava");
const deltaToText = require('./delta-to-text');

test('text to delta', t => {
    const actual = deltaToText({
        ops: [
            {
                insert: 'The cake is a lie!\n'
            }
        ]
    });
    const expected = 'The cake is a lie!\n';
    t.deepEqual(actual, expected);
});
