# deltaconvert

Convert [quill delta](https://quilljs.com/docs/delta/) objects to and from plain text, HTML, and 
[NPF](https://github.com/tumblr/docs/blob/master/npf-spec.md).

## Installation

TBA

## Example

```javascript
const {deltaToHtml} = require('deltaconvert');
deltaToHtml({
    ops: [
        {insert: 'Gandalf', attributes: {bold: true}},
        {insert: ' the '},
        {insert: 'Grey', attributes: {color: '#cccccc'}},
        {insert: '\n'}
    ]
});
/** 
 * Returns
 * <p><b>Gandalf</b> the <span style="color:#cccccc;">Grey</span></p>
 */
```
