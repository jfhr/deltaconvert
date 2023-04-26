const test = require("ava");
const textToDelta = require("./text-to-delta");

test('text to delta', t => {
    const expected = {
        ops: [
            {
                insert: 'The cake is a lie!\n'
            }
        ]
    };
    const actual = textToDelta('The cake is a lie!');
    t.deepEqual(actual, expected);
});
