// Core logic for the typing test.
//
// Everything in this module is intentionally pure and free of DOM access so it
// can be unit tested in isolation (see test/typing.test.js). The browser UI in
// index.html imports these helpers and wires them to the page.

/**
 * A small built-in pool of common English words. Kept short and lowercase so
 * the test stays "minimalistic"; the UI can pass a custom pool for variety.
 */
export const DEFAULT_WORDS = [
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'it',
  'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this',
  'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or',
  'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up',
  'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make',
  'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take', 'people', 'into',
  'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then',
  'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after',
];

/**
 * Deterministic pseudo-random generator (mulberry32). Returns a function that
 * yields floats in [0, 1). A fixed seed produces a repeatable word sequence,
 * which keeps the unit tests deterministic.
 *
 * @param {number} seed
 * @returns {() => number}
 */
export function createRng(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Pick `count` words from `pool`. When a `seed` is provided the selection is
 * deterministic; otherwise Math.random is used.
 *
 * @param {number} count
 * @param {object} [options]
 * @param {string[]} [options.pool=DEFAULT_WORDS]
 * @param {number} [options.seed]
 * @returns {string[]}
 */
export function generateWords(count, options = {}) {
  const pool = options.pool || DEFAULT_WORDS;
  if (!Number.isInteger(count) || count < 0) {
    throw new RangeError('count must be a non-negative integer');
  }
  if (pool.length === 0) {
    throw new RangeError('word pool must not be empty');
  }
  const rng = options.seed === undefined ? Math.random : createRng(options.seed);
  const words = [];
  for (let i = 0; i < count; i++) {
    words.push(pool[Math.floor(rng() * pool.length)]);
  }
  return words;
}

/**
 * Compare typed text against the target, character by character.
 *
 * @param {string} target - the prompt the user must type
 * @param {string} typed - what the user has typed so far
 * @returns {{
 *   chars: Array<{ char: string, status: 'correct'|'incorrect'|'pending' }>,
 *   correct: number,
 *   incorrect: number,
 *   typed: number,
 *   remaining: number,
 *   complete: boolean
 * }}
 */
export function compareInput(target, typed) {
  if (typeof target !== 'string' || typeof typed !== 'string') {
    throw new TypeError('target and typed must be strings');
  }
  const chars = [];
  let correct = 0;
  let incorrect = 0;

  for (let i = 0; i < target.length; i++) {
    const expected = target[i];
    if (i < typed.length) {
      const ok = typed[i] === expected;
      if (ok) correct++;
      else incorrect++;
      chars.push({ char: expected, status: ok ? 'correct' : 'incorrect' });
    } else {
      chars.push({ char: expected, status: 'pending' });
    }
  }

  const typedCount = Math.min(typed.length, target.length);
  return {
    chars,
    correct,
    incorrect,
    typed: typedCount,
    remaining: target.length - typedCount,
    complete: typed.length >= target.length && incorrect === 0,
  };
}

/**
 * Words-per-minute, using the standard convention of 5 characters per "word".
 *
 * @param {number} correctChars - number of correctly typed characters
 * @param {number} elapsedMs - elapsed time in milliseconds
 * @returns {number} WPM, rounded to the nearest integer (0 if no time elapsed)
 */
export function computeWpm(correctChars, elapsedMs) {
  if (correctChars < 0 || elapsedMs < 0) {
    throw new RangeError('correctChars and elapsedMs must be non-negative');
  }
  if (elapsedMs === 0) return 0;
  const minutes = elapsedMs / 60000;
  return Math.round((correctChars / 5) / minutes);
}

/**
 * Accuracy as a percentage of correctly typed characters.
 *
 * @param {number} correct
 * @param {number} total - total characters typed (correct + incorrect)
 * @returns {number} percentage rounded to the nearest integer (100 when nothing
 *   has been typed yet)
 */
export function computeAccuracy(correct, total) {
  if (correct < 0 || total < 0) {
    throw new RangeError('correct and total must be non-negative');
  }
  if (correct > total) {
    throw new RangeError('correct cannot exceed total');
  }
  if (total === 0) return 100;
  return Math.round((correct / total) * 100);
}

/**
 * Build a full result summary for a finished (or in-progress) test.
 *
 * @param {object} params
 * @param {string} params.target
 * @param {string} params.typed
 * @param {number} params.elapsedMs
 * @returns {{ wpm: number, accuracy: number, correct: number, incorrect: number, elapsedMs: number }}
 */
export function summarize({ target, typed, elapsedMs }) {
  const { correct, incorrect } = compareInput(target, typed);
  const totalTyped = correct + incorrect;
  return {
    wpm: computeWpm(correct, elapsedMs),
    accuracy: computeAccuracy(correct, totalTyped),
    correct,
    incorrect,
    elapsedMs,
  };
}
