const WORDS = [
  'the','be','to','of','and','a','in','that','have','it','for','not','on','with',
  'he','as','you','do','at','this','but','his','by','from','they','we','say','her',
  'she','or','an','will','my','one','all','would','there','their','what','so','up',
  'out','if','about','who','get','which','go','me','when','make','can','like','time',
  'no','just','him','know','take','people','into','year','your','good','some','could',
  'them','see','other','than','then','now','look','only','come','its','over','think',
  'also','back','after','use','two','how','our','work','first','well','way','even',
  'new','want','because','any','these','give','day','most','us','great','between',
  'need','large','often','hand','high','place','hold','turn','without','move',
  'live','run','try','stop','set','change','end','home','game','left','real','life',
  'few','north','open','seem','together','next','white','children','begin','got',
  'walk','example','ease','paper','always','music','those','both','mark','book',
  'letter','until','mile','river','car','feet','care','second','enough','plain',
  'girl','usual','young','ready','above','ever','red','list','though','feel','talk',
  'bird','soon','body','dog','family','direct','pose','leave','song','measure',
];

let testWords = [];
let typedChars = 0;
let correctChars = 0;
let incorrectWords = 0;
let correctWords = 0;
let currentWordIdx = 0;
let currentInput = '';
let timerDuration = 15;
let timeLeft = 15;
let timerInterval = null;
let started = false;
let finished = false;

const wordsEl = document.getElementById('words');
const inputEl = document.getElementById('input');
const timerEl = document.getElementById('timer');
const resultEl = document.getElementById('result');
const testAreaEl = document.getElementById('test-area');

function randomWords(count) {
  const arr = [];
  for (let i = 0; i < count; i++) {
    arr.push(WORDS[Math.floor(Math.random() * WORDS.length)]);
  }
  return arr;
}

function buildWords() {
  testWords = randomWords(200);
  wordsEl.innerHTML = '';
  testWords.forEach((word, wi) => {
    const wordEl = document.createElement('span');
    wordEl.className = 'word';
    wordEl.dataset.index = wi;
    word.split('').forEach(ch => {
      const span = document.createElement('span');
      span.className = 'letter';
      span.textContent = ch;
      wordEl.appendChild(span);
    });
    wordsEl.appendChild(wordEl);
    if (wi < testWords.length - 1) {
      wordsEl.appendChild(document.createTextNode(' '));
    }
  });
  currentWordIdx = 0;
  markActiveWord();
  updateCaret(0);
}

function getWordEl(idx) {
  return wordsEl.querySelector(`[data-index="${idx}"]`);
}

function markActiveWord() {
  wordsEl.querySelectorAll('.word.active').forEach(el => el.classList.remove('active'));
  const wEl = getWordEl(currentWordIdx);
  if (wEl) wEl.classList.add('active');
  scrollIntoView(wEl);
}

function scrollIntoView(wEl) {
  if (!wEl) return;
  const containerTop = wordsEl.getBoundingClientRect().top;
  const wordTop = wEl.getBoundingClientRect().top;
  const lineHeight = parseFloat(getComputedStyle(wordsEl).lineHeight);
  if (wordTop - containerTop >= lineHeight * 2) {
    const currentOffset = parseInt(wordsEl.style.marginTop || '0');
    wordsEl.style.marginTop = (currentOffset - lineHeight) + 'px';
  }
}

function updateCaret(charIdx) {
  const wEl = getWordEl(currentWordIdx);
  if (!wEl) return;
  const letters = wEl.querySelectorAll('.letter');
  letters.forEach(l => {
    l.classList.remove('caret', 'caret-after');
  });
  wEl.querySelectorAll('.extra').forEach(e => e.remove());

  if (charIdx < letters.length) {
    letters[charIdx].classList.add('caret');
  } else {
    const last = letters[letters.length - 1];
    if (last) last.classList.add('caret-after');
  }
}

function applyTypingToCurrentWord(typed) {
  const wEl = getWordEl(currentWordIdx);
  if (!wEl) return;
  const word = testWords[currentWordIdx];
  const letters = wEl.querySelectorAll('.letter:not(.extra)');

  letters.forEach((l, i) => {
    l.classList.remove('correct', 'incorrect');
    if (i < typed.length) {
      l.classList.add(typed[i] === word[i] ? 'correct' : 'incorrect');
    }
  });

  // remove old extras
  wEl.querySelectorAll('.extra').forEach(e => e.remove());

  // extra characters beyond word length
  if (typed.length > word.length) {
    const extra = typed.slice(word.length);
    extra.split('').forEach(ch => {
      const span = document.createElement('span');
      span.className = 'letter extra';
      span.textContent = ch;
      wEl.appendChild(span);
    });
  }

  updateCaret(typed.length);
}

function commitWord() {
  const word = testWords[currentWordIdx];
  const typed = currentInput;
  const wEl = getWordEl(currentWordIdx);

  let correct = true;
  const letters = wEl ? wEl.querySelectorAll('.letter:not(.extra)') : [];
  letters.forEach((l, i) => {
    if (i < typed.length) {
      if (typed[i] !== word[i]) correct = false;
    } else {
      correct = false; // incomplete
    }
  });
  if (typed.length > word.length) correct = false;

  if (correct) {
    correctWords++;
    correctChars += word.length + 1; // +1 for space
  } else {
    incorrectWords++;
  }

  currentWordIdx++;
  currentInput = '';

  if (currentWordIdx >= testWords.length) {
    buildWords(); // shouldn't happen at 200 words, but just in case
  }

  markActiveWord();
  updateCaret(0);
}

function startTimer() {
  started = true;
  timerInterval = setInterval(() => {
    timeLeft--;
    timerEl.textContent = timeLeft;
    if (timeLeft <= 5) timerEl.classList.add('urgent');
    if (timeLeft <= 0) endTest();
  }, 1000);
}

function endTest() {
  clearInterval(timerInterval);
  finished = true;
  inputEl.blur();

  const wpm = Math.round((correctChars / 5) / (timerDuration / 60));
  const totalTyped = correctChars + (incorrectWords > 0 ? incorrectWords * 5 : 0);
  const acc = totalTyped === 0 ? 100 : Math.round((correctChars / (correctChars + incorrectWords * 5)) * 100);

  testAreaEl.style.opacity = '0.3';
  resultEl.classList.remove('hidden');
  document.getElementById('res-wpm').textContent = wpm;
  document.getElementById('res-acc').textContent = acc + '%';
  document.getElementById('res-correct').textContent = correctWords;
  document.getElementById('res-incorrect').textContent = incorrectWords;
}

function reset() {
  clearInterval(timerInterval);
  timerInterval = null;
  started = false;
  finished = false;
  timeLeft = timerDuration;
  currentWordIdx = 0;
  currentInput = '';
  correctChars = 0;
  correctWords = 0;
  incorrectWords = 0;
  typedChars = 0;

  timerEl.textContent = timeLeft;
  timerEl.classList.remove('urgent');
  resultEl.classList.add('hidden');
  testAreaEl.style.opacity = '1';
  wordsEl.style.marginTop = '0';

  buildWords();
  inputEl.focus();
}

inputEl.addEventListener('input', (e) => {
  if (finished) return;

  const val = inputEl.value;

  if (val.endsWith(' ')) {
    if (currentInput.trim() !== '') {
      if (!started) startTimer();
      commitWord();
    }
    inputEl.value = '';
    currentInput = '';
    return;
  }

  currentInput = val;

  if (!started && val.length > 0) startTimer();

  applyTypingToCurrentWord(val);
});

inputEl.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    e.preventDefault();
    reset();
    return;
  }
  // prevent going back to previous word
  if (e.key === 'Backspace' && currentInput === '') {
    e.preventDefault();
  }
});

document.querySelectorAll('.opt[data-time]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.opt[data-time]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    timerDuration = parseInt(btn.dataset.time);
    reset();
  });
});

document.getElementById('restart-btn').addEventListener('click', reset);

// focus input on click anywhere in test area
testAreaEl.addEventListener('click', () => inputEl.focus());
wordsEl.addEventListener('click', () => inputEl.focus());

reset();
