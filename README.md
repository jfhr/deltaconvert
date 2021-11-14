# deltaconvert

[![Node.js CI](https://github.com/jfhr/deltaconvert/actions/workflows/build_and_test.yml/badge.svg)](https://github.com/jfhr/deltaconvert/actions/workflows/build_and_test.yml)

Convert [quill delta](https://quilljs.com/docs/delta/) objects to and from plain text, HTML, and 
[NPF](https://github.com/tumblr/docs/blob/master/npf-spec.md).

## Installation

```shell
npm install deltaconvert
```

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

## Reference

### `deltaToHtml`

Convert a delta object to html. The resulting HTML can be inserted into an existing website, it will have no `<html>`, 
`<body>`, etc. tags. `{insert: {divider:true}}` objects will be converted to `<hr>` tags.

### `deltaToNpf`

Convert a delta object to tumblr's NPF format. Headings of level >2 will be converted to bold text. Images will be
inserted without any size information. Videos will be inserted as `media` object if we can guess the mime type from the
url, otherwise as plain links. Code blocks will be converted to text objects with subtype `chat`, which should be rendered
with a monospace font.

### `deltaToText`

Convert a delta object to plain text. Formatting, images, etc. will be ignored.

### `deltaToSsml`

Convert a delta object to the [Speech Synthesis Markup Language](https://cloud.google.com/text-to-speech/docs/ssml#p).
Images will be converted to elements containing the alt text. Other media and special elements will be ignored.

### `htmlToDelta`

Convert a html document or snippet to a quill delta document. Note that **only inline styles are supported**. 
`<style>` tags and external stylesheets will be ignored. `<hr>` tags will be converted to `{insert: {divider: true}}`
objects. `<iframe>`s with the `ql-video` class will be treated as videos.

### `npfToDelta`

Convert a tumblr NPF to a quill delta. **Blog references aren't supported yet**.

### `textToDelta`

Convert plain text to a delta object with no formatting information.

## Contributing

If you want to request a feature, report a bug, or contribute in some other way, please file an issue here.
Thanks!
