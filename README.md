# Keyboard-Typing

A minimalistic and customizable typing test.

## Features

- Clean, distraction-free typing UI with a live caret.
- Live **WPM**, **accuracy** and **time** as you type.
- Customizable word count (10 / 25 / 50 / 100) and theme (dark / light / solar).
- Restart any time with the `Tab` key (or the restart button).
- Zero runtime dependencies — pure HTML/CSS/JS.

## Running the app

Open `index.html` in any modern browser, or serve the folder:

```bash
npx serve .
```

## Project layout

- `index.html`, `styles.css` — the UI.
- `src/typing.js` — pure, DOM-free core logic (word generation, input
  comparison, WPM/accuracy maths). This is what the unit tests cover.
- `src/app.js` — browser controller that wires the DOM to the core logic.
- `test/typing.test.js` — unit tests.

## Tests

Unit tests run on Node's built-in test runner (no dependencies to install):

```bash
npm test
```
