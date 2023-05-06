# Changelog

# v1.1.2

- Properly handle extra whitespace in inline CSS styles in `htmlToDelta`
e.g. `<span style=" color: #f5abb9 ">pink</span>` is correctly converted to
`{insert: 'pink', attributes: {color: '#f5abb9'}},`

# v1.1.1

- Fix a bug where a `deltaToIntermediate` would forget a paragraph break
if the preceding paragraph has no formatting, but the succeeding paragraph does. 
See https://github.com/jfhr/deltaconvert/issues/11

# v1.1.0

- Add `htmlToNpf` and `npfToHtml`

# v1.0.0

- This version prevents HTML injection through malformed deltas
  - Add HTML entity and attribute encoding
  - Add SSML entity encoding
  - Adds a dependency on the `he` library (no second-level dependencies)

# v0.2.3

- Add `deltaToSsml` 

# v0.2.2

- Fix handling of inline link insert ops

# v0.2.1

- Slight changes to improve compatibility

# v0.2.0

- Added video support

# v0.1.1

- No changes

# v0.1.0

- Initial version
