# preso

A super simple JSON-driven presentation implementation.

## Example
[My Japan Trip 2025](https://spiral9.com/preso/japan_2025)

## Usage
You can use this presentation app by simply including the built JS file in your HTML page. See `public/index.html` for a working example.

```html
<!-- Example usage in your HTML -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>preso</title> <!-- title can be set in JSON -->
  <link rel="stylesheet" href="preso_styles.css">
</head>
<body>
  <script src="preso_index.js"></script>
</body>
</html>
```

## Requirements
1. a `preso_index.json` file must be present in the same directory as your HTML file - it defines your slides, audio, and other presentation data.
2. a `preso_styles.css` file must be linked in your HTML file.

## How it works
- The app loads `preso_index.json` automatically and builds the presentation UI.
- Slides, background music, and other features are configured via the JSON file.

## Caveats
- The JS file mutates the page that it is hosted in to create the presentation.
  - A google font is loaded dynamically

## Example
See `public/index.html` and `preso_index.json` for a complete example setup.

## Features
- JSON-driven slides
- Optional background music (MP3 playlist that loops)
- Keyboard navigation (arrow keys, space, enter)
- Simple, minimal UI

## TODO
- turn on the description UX
- add accreditation for images and music

## License
MIT License
