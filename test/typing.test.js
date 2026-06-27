import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_WORDS,
  createRng,
  generateWords,
  compareInput,
  computeWpm,
  computeAccuracy,
  summarize,
} from '../src/typing.js';

test('DEFAULT_WORDS is a non-empty list of lowercase words', () => {
  assert.ok(Array.isArray(DEFAULT_WORDS));
  assert.ok(DEFAULT_WORDS.length > 0);
  for (const w of DEFAULT_WORDS) {
    assert.equal(typeof w, 'string');
    assert.equal(w, w.toLowerCase());
    assert.ok(w.length > 0);
  }
});

test('createRng is deterministic for a given seed', () => {
  const a = createRng(42);
  const b = createRng(42);
  for (let i = 0; i < 100; i++) {
    assert.equal(a(), b());
  }
});

test('createRng yields values within [0, 1)', () => {
  const rng = createRng(7);
  for (let i = 0; i < 1000; i++) {
    const v = rng();
    assert.ok(v >= 0 && v < 1, `value out of range: ${v}`);
  }
});

test('createRng produces different streams for different seeds', () => {
  const a = createRng(1);
  const b = createRng(2);
  assert.notEqual(a(), b());
});

test('generateWords returns the requested count', () => {
  assert.equal(generateWords(0).length, 0);
  assert.equal(generateWords(5).length, 5);
  assert.equal(generateWords(25).length, 25);
});

test('generateWords is deterministic with a seed', () => {
  const first = generateWords(10, { seed: 123 });
  const second = generateWords(10, { seed: 123 });
  assert.deepEqual(first, second);
});

test('generateWords only uses words from the pool', () => {
  const pool = ['alpha', 'beta', 'gamma'];
  const words = generateWords(50, { pool, seed: 9 });
  for (const w of words) {
    assert.ok(pool.includes(w));
  }
});

test('generateWords rejects invalid counts', () => {
  assert.throws(() => generateWords(-1), RangeError);
  assert.throws(() => generateWords(1.5), RangeError);
});

test('generateWords rejects an empty pool', () => {
  assert.throws(() => generateWords(3, { pool: [] }), RangeError);
});

test('compareInput marks all characters pending when nothing is typed', () => {
  const result = compareInput('hello', '');
  assert.equal(result.correct, 0);
  assert.equal(result.incorrect, 0);
  assert.equal(result.typed, 0);
  assert.equal(result.remaining, 5);
  assert.equal(result.complete, false);
  assert.ok(result.chars.every((c) => c.status === 'pending'));
});

test('compareInput detects correct characters', () => {
  const result = compareInput('hello', 'hel');
  assert.equal(result.correct, 3);
  assert.equal(result.incorrect, 0);
  assert.equal(result.typed, 3);
  assert.equal(result.remaining, 2);
  assert.deepEqual(
    result.chars.map((c) => c.status),
    ['correct', 'correct', 'correct', 'pending', 'pending'],
  );
});

test('compareInput detects incorrect characters', () => {
  const result = compareInput('hello', 'hxllo');
  assert.equal(result.correct, 4);
  assert.equal(result.incorrect, 1);
  assert.equal(result.chars[1].status, 'incorrect');
  assert.equal(result.complete, false);
});

test('compareInput reports completion only when fully and correctly typed', () => {
  assert.equal(compareInput('hello', 'hello').complete, true);
  assert.equal(compareInput('hello', 'helxo').complete, false);
});

test('compareInput ignores characters typed beyond the target length', () => {
  const result = compareInput('hi', 'hithere');
  assert.equal(result.typed, 2);
  assert.equal(result.remaining, 0);
  assert.equal(result.correct, 2);
  assert.equal(result.complete, true);
});

test('compareInput throws on non-string input', () => {
  assert.throws(() => compareInput('hi', 5), TypeError);
  assert.throws(() => compareInput(null, 'hi'), TypeError);
});

test('computeWpm uses 5 chars per word', () => {
  // 25 correct chars in 60s => 5 words / 1 min => 5 wpm
  assert.equal(computeWpm(25, 60000), 5);
  // 100 correct chars in 30s => 20 words / 0.5 min => 40 wpm
  assert.equal(computeWpm(100, 30000), 40);
});

test('computeWpm returns 0 when no time has elapsed', () => {
  assert.equal(computeWpm(50, 0), 0);
});

test('computeWpm rejects negative input', () => {
  assert.throws(() => computeWpm(-1, 1000), RangeError);
  assert.throws(() => computeWpm(10, -1), RangeError);
});

test('computeAccuracy computes percentage', () => {
  assert.equal(computeAccuracy(9, 10), 90);
  assert.equal(computeAccuracy(1, 3), 33);
  assert.equal(computeAccuracy(10, 10), 100);
});

test('computeAccuracy returns 100 when nothing typed', () => {
  assert.equal(computeAccuracy(0, 0), 100);
});

test('computeAccuracy rejects invalid input', () => {
  assert.throws(() => computeAccuracy(-1, 10), RangeError);
  assert.throws(() => computeAccuracy(5, -1), RangeError);
  assert.throws(() => computeAccuracy(11, 10), RangeError);
});

test('summarize combines metrics for a perfect run', () => {
  // "the quick" = 9 chars, all correct, typed in 6 seconds
  const result = summarize({ target: 'the quick', typed: 'the quick', elapsedMs: 6000 });
  assert.equal(result.correct, 9);
  assert.equal(result.incorrect, 0);
  assert.equal(result.accuracy, 100);
  // 9 chars / 5 = 1.8 words in 0.1 min => 18 wpm
  assert.equal(result.wpm, 18);
  assert.equal(result.elapsedMs, 6000);
});

test('summarize reflects mistakes in accuracy', () => {
  const result = summarize({ target: 'hello world', typed: 'hxllo world', elapsedMs: 60000 });
  assert.equal(result.incorrect, 1);
  assert.equal(result.correct, 10);
  assert.equal(result.accuracy, 91);
});
