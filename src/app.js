// Browser controller for the typing test. All the testable maths lives in
// typing.js; this file only handles DOM wiring, timing and rendering.

import {
  generateWords,
  compareInput,
  computeWpm,
  computeAccuracy,
} from './typing.js';

const els = {
  words: document.getElementById('words'),
  typing: document.getElementById('typing-area'),
  hint: document.getElementById('hint'),
  statWpm: document.getElementById('stat-wpm'),
  statAccuracy: document.getElementById('stat-accuracy'),
  statTime: document.getElementById('stat-time'),
  result: document.getElementById('result'),
  resultWpm: document.getElementById('result-wpm'),
  resultAccuracy: document.getElementById('result-accuracy'),
  resultTime: document.getElementById('result-time'),
  restart: document.getElementById('restart'),
  wordCountOptions: document.getElementById('word-count-options'),
  themeOptions: document.getElementById('theme-options'),
};

const state = {
  target: '',
  typed: '',
  wordCount: 25,
  startedAt: null,
  finished: false,
  tick: null,
};

function newTest() {
  if (state.tick) {
    clearInterval(state.tick);
    state.tick = null;
  }
  state.target = generateWords(state.wordCount).join(' ');
  state.typed = '';
  state.startedAt = null;
  state.finished = false;
  els.result.hidden = true;
  els.typing.classList.remove('is-active');
  render();
  updateStats(0);
  els.typing.focus();
}

function render() {
  const { chars } = compareInput(state.target, state.typed);
  const cursor = Math.min(state.typed.length, state.target.length);
  const html = chars
    .map((c, i) => {
      const classes = ['char', `char--${c.status}`];
      if (i === cursor) classes.push('char--cursor');
      return `<span class="${classes.join(' ')}">${escapeHtml(c.char)}</span>`;
    })
    .join('');
  els.words.innerHTML = html;
}

function escapeHtml(ch) {
  if (ch === ' ') return '&nbsp;';
  if (ch === '&') return '&amp;';
  if (ch === '<') return '&lt;';
  if (ch === '>') return '&gt;';
  return ch;
}

function elapsedMs() {
  return state.startedAt === null ? 0 : Date.now() - state.startedAt;
}

function updateStats(ms) {
  const { correct, incorrect } = compareInput(state.target, state.typed);
  els.statWpm.textContent = String(computeWpm(correct, ms));
  els.statAccuracy.innerHTML = `${computeAccuracy(correct, correct + incorrect)}<span class="stat__unit">%</span>`;
  els.statTime.innerHTML = `${(ms / 1000).toFixed(1)}<span class="stat__unit">s</span>`;
}

function handleKey(event) {
  if (state.finished) return;

  const { key } = event;

  // Ignore modifier combinations and non-typing keys.
  if (event.ctrlKey || event.metaKey || event.altKey) return;

  if (key === 'Backspace') {
    event.preventDefault();
    state.typed = state.typed.slice(0, -1);
  } else if (key.length === 1) {
    event.preventDefault();
    if (state.startedAt === null) startTimer();
    if (state.typed.length < state.target.length) {
      state.typed += key;
    }
  } else {
    return;
  }

  render();
  updateStats(elapsedMs());

  const { complete } = compareInput(state.target, state.typed);
  if (complete) finish();
}

function startTimer() {
  state.startedAt = Date.now();
  els.typing.classList.add('is-active');
  state.tick = setInterval(() => updateStats(elapsedMs()), 100);
}

function finish() {
  state.finished = true;
  if (state.tick) {
    clearInterval(state.tick);
    state.tick = null;
  }
  const ms = elapsedMs();
  updateStats(ms);
  const { correct, incorrect } = compareInput(state.target, state.typed);
  els.resultWpm.textContent = String(computeWpm(correct, ms));
  els.resultAccuracy.textContent = `${computeAccuracy(correct, correct + incorrect)}%`;
  els.resultTime.textContent = `${(ms / 1000).toFixed(1)}s`;
  els.result.hidden = false;
}

function selectFromGroup(container, button, apply) {
  for (const chip of container.querySelectorAll('.chip')) {
    chip.classList.toggle('is-active', chip === button);
  }
  apply();
}

// --- Event wiring -----------------------------------------------------------

els.typing.addEventListener('keydown', handleKey);
els.typing.addEventListener('focus', () => els.typing.classList.add('is-focused'));
els.typing.addEventListener('blur', () => els.typing.classList.remove('is-focused'));

els.restart.addEventListener('click', () => newTest());

document.addEventListener('keydown', (event) => {
  if (event.key === 'Tab') {
    event.preventDefault();
    newTest();
  }
});

els.wordCountOptions.addEventListener('click', (event) => {
  const button = event.target.closest('.chip');
  if (!button) return;
  selectFromGroup(els.wordCountOptions, button, () => {
    state.wordCount = Number(button.dataset.words);
    newTest();
  });
});

els.themeOptions.addEventListener('click', (event) => {
  const button = event.target.closest('.chip');
  if (!button) return;
  selectFromGroup(els.themeOptions, button, () => {
    document.documentElement.dataset.theme = button.dataset.theme;
  });
});

// Default theme + first test.
document.documentElement.dataset.theme = 'dark';
newTest();
