// ============================================================
//  HANGMAN PARTY – game.js
// ============================================================

// ── State ──────────────────────────────────────────────────
let currentWord = "";
let currentHint = "";
let guessedLetters = [];
let wrongGuesses = 0;
let score = 0;
let hintsLeft = 3;
let hintUsed = false;
let currentCategory = "";
let gameMode = ""; // "single" | "multi"
let gameActive = false;

const MAX_WRONG = 6;
const BODY_PARTS = ["h-head","h-body","h-larm","h-rarm","h-lleg","h-rleg"];
const FACE_PARTS = ["h-eye1","h-eye2","h-mouth"];
const LOSE_PARTS = ["h-eye1x","h-eye2x","h-sad","xl1","xl2","xl3","xl4"];

// ── Keyboard layout ─────────────────────────────────────────
const KEYBOARD_ROWS = [
  ["Q","W","E","R","T","Y","U","I","O","P"],
  ["A","S","D","F","G","H","J","K","L"],
  ["Z","X","C","V","B","N","M"]
];

// ============================================================
//  SINGLE PLAYER INIT
// ============================================================
function initSinglePlayer() {
  gameMode = "single";
  buildCategoryGrid();
}

function buildCategoryGrid() {
  const grid = document.getElementById("categoryGrid");
  if (!grid) return;
  grid.innerHTML = "";
  Object.entries(WORD_DATA).forEach(([key, cat]) => {
    const card = document.createElement("div");
    card.className = "cat-card";
    card.style.setProperty("--cat-color", cat.color);
    card.innerHTML = `<div class="cat-emoji">${cat.icon}</div><div class="cat-label">${cat.label}</div>`;
    card.onclick = () => selectCategory(key);
    grid.appendChild(card);
  });
}

function selectCategory(key) {
  currentCategory = key;
  showScreen("screen-game");
  const badge = document.getElementById("categoryBadge");
  if (badge) badge.textContent = `${WORD_DATA[key].icon} ${WORD_DATA[key].label}`;
  newWord();
}

// ============================================================
//  MULTIPLAYER INIT
// ============================================================
function initMultiPlayer() {
  gameMode = "multi";
  buildMiniCategoryGrid();
}

function buildMiniCategoryGrid() {
  const grid = document.getElementById("miniCategoryGrid");
  if (!grid) return;
  grid.innerHTML = "";
  // "Any" option
  const any = document.createElement("div");
  any.className = "mini-cat-card active";
  any.dataset.key = "";
  any.textContent = "🎲 Any";
  any.onclick = () => selectMiniCat("", any);
  grid.appendChild(any);

  Object.entries(WORD_DATA).forEach(([key, cat]) => {
    const card = document.createElement("div");
    card.className = "mini-cat-card";
    card.dataset.key = key;
    card.textContent = `${cat.icon} ${cat.label}`;
    card.onclick = () => selectMiniCat(key, card);
    grid.appendChild(card);
  });
}

function selectMiniCat(key, el) {
  currentCategory = key;
  document.querySelectorAll(".mini-cat-card").forEach(c => c.classList.remove("active"));
  el.classList.add("active");
}

// Voice input
let recognition = null;

function startVoiceInput() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    document.getElementById("voiceStatus").textContent = "❌ Voice not supported in this browser. Try Chrome!";
    return;
  }
  recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  const btn = document.getElementById("micBtn");
  const status = document.getElementById("voiceStatus");
  const result = document.getElementById("voiceResult");

  btn.textContent = "🔴 Listening...";
  btn.classList.add("mic-active");
  status.textContent = "Speak the secret word now!";

  recognition.onresult = (e) => {
    const spoken = e.results[0][0].transcript.trim().toUpperCase().replace(/[^A-Z]/g,"");
    document.getElementById("secretWordInput").value = spoken;
    result.textContent = `✅ Heard: "${spoken}"`;
    status.textContent = "Word captured! Check it above.";
    btn.textContent = "🎤 Speak Again";
    btn.classList.remove("mic-active");

    // Auto-add to word bank if category selected
    if (currentCategory && spoken.length >= 2) {
      addWordToCategory(currentCategory, spoken, "Added via voice input");
    }
  };

  recognition.onerror = (e) => {
    status.textContent = "❌ Couldn't hear clearly. Try again!";
    btn.textContent = "🎤 Press to Speak";
    btn.classList.remove("mic-active");
  };

  recognition.onend = () => {
    btn.classList.remove("mic-active");
  };

  recognition.start();
}

function showWord() {
  const input = document.getElementById("secretWordInput");
  if (input) input.type = "text";
}
function hideWord() {
  const input = document.getElementById("secretWordInput");
  if (input) input.type = "password";
}

function startMultiGame() {
  const input = document.getElementById("secretWordInput");
  const hintInput = document.getElementById("hintInput");
  const word = input.value.trim().toUpperCase().replace(/[^A-Z]/g,"");

  if (word.length < 2) {
    shakeElement(input);
    input.placeholder = "⚠️ Enter at least 2 letters!";
    return;
  }

  currentWord = word;
  currentHint = hintInput ? hintInput.value.trim() : "";

  // Save to word bank
  if (currentCategory && word.length >= 2) {
    addWordToCategory(currentCategory, word, currentHint || "No hint");
  }

  showScreen("screen-game");
  startGame();
}

// ============================================================
//  CORE GAME
// ============================================================
function startGame() {
  guessedLetters = [];
  wrongGuesses = 0;
  hintUsed = false;

  if (gameMode === "single") {
    hintsLeft = 3;
    const cat = WORD_DATA[currentCategory];
    const randomEntry = cat.words[Math.floor(Math.random() * cat.words.length)];
    currentWord = randomEntry.word;
    currentHint = randomEntry.hint;
    updateHintCount();
  }

  gameActive = true;
  resetHangman();
  renderWordDisplay();
  buildKeyboard();
  updateWrongCount();

  // Set initial hint box
  const hintBox = document.getElementById("hintBox");
  const hintText = document.getElementById("hintText");
  if (hintText) hintText.textContent = "Click the hint button for a clue!";
  if (hintBox) hintBox.classList.remove("hint-revealed");

  document.getElementById("winOverlay")?.classList.add("hidden");
  document.getElementById("loseOverlay")?.classList.add("hidden");
}

function newWord() {
  if (gameMode === "single" && currentCategory) {
    startGame();
  } else if (gameMode === "single") {
    showScreen("screen-category");
  }
}

// ── Word Display ─────────────────────────────────────────────
function renderWordDisplay() {
  const display = document.getElementById("wordDisplay");
  if (!display) return;
  display.innerHTML = "";
  [...currentWord].forEach(letter => {
    const box = document.createElement("div");
    box.className = "letter-box";
    if (guessedLetters.includes(letter)) {
      box.textContent = letter;
      box.classList.add("revealed");
    } else {
      box.textContent = "";
    }
    display.appendChild(box);
  });

  // Word length
  const meta = document.getElementById("wordLength");
  if (meta) meta.textContent = `${currentWord.length} letters`;
}

// ── Keyboard ─────────────────────────────────────────────────
function buildKeyboard() {
  const kb = document.getElementById("keyboard");
  if (!kb) return;
  kb.innerHTML = "";
  KEYBOARD_ROWS.forEach(row => {
    const rowDiv = document.createElement("div");
    rowDiv.className = "kb-row";
    row.forEach(letter => {
      const btn = document.createElement("button");
      btn.className = "kb-key";
      btn.textContent = letter;
      btn.id = `key-${letter}`;
      btn.onclick = () => guessLetter(letter);
      rowDiv.appendChild(btn);
    });
    kb.appendChild(rowDiv);
  });
}

// ── Physical keyboard support ─────────────────────────────────
document.addEventListener("keydown", (e) => {
  if (!gameActive) return;
  const letter = e.key.toUpperCase();
  if (/^[A-Z]$/.test(letter)) guessLetter(letter);
});

// ── Guess logic ───────────────────────────────────────────────
function guessLetter(letter) {
  if (!gameActive) return;
  if (guessedLetters.includes(letter)) return;

  guessedLetters.push(letter);

  const btn = document.getElementById(`key-${letter}`);

  if (currentWord.includes(letter)) {
    if (btn) { btn.classList.add("correct"); btn.disabled = true; }
    renderWordDisplay();
    bounceLetters(letter);
    checkWin();
  } else {
    wrongGuesses++;
    if (btn) { btn.classList.add("wrong"); btn.disabled = true; }
    revealBodyPart();
    shakeHangman();
    updateWrongCount();
    checkLose();
  }
}

// ── Hangman drawing ───────────────────────────────────────────
function resetHangman() {
  BODY_PARTS.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add("hidden");
  });
  FACE_PARTS.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add("hidden");
  });
  LOSE_PARTS.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add("hidden");
  });
}

function revealBodyPart() {
  const partId = BODY_PARTS[wrongGuesses - 1];
  const el = document.getElementById(partId);
  if (el) {
    el.classList.remove("hidden");
    el.classList.add("part-pop");
    setTimeout(() => el.classList.remove("part-pop"), 500);
  }
  // Show face when head appears
  if (wrongGuesses === 1) {
    FACE_PARTS.forEach(id => {
      const f = document.getElementById(id);
      if (f) f.classList.remove("hidden");
    });
  }
}

function updateWrongCount() {
  const el = document.getElementById("wrongCount");
  if (el) el.textContent = wrongGuesses;
}

function shakeHangman() {
  const svg = document.getElementById("hangmanSVG");
  if (svg) {
    svg.classList.add("shake");
    setTimeout(() => svg.classList.remove("shake"), 400);
  }
}

// ── Win / Lose ────────────────────────────────────────────────
function checkWin() {
  const allRevealed = [...currentWord].every(l => guessedLetters.includes(l));
  if (!allRevealed) return;
  gameActive = false;
  score += 10;
  if (gameMode === "single") {
    const scoreEl = document.getElementById("scoreDisplay");
    if (scoreEl) scoreEl.textContent = score;
  }
  setTimeout(() => {
    const wr = document.getElementById("winWordReveal");
    if (wr) wr.textContent = `The word was: "${currentWord}"`;
    document.getElementById("winOverlay")?.classList.remove("hidden");
    launchConfetti();
  }, 400);
}

function checkLose() {
  if (wrongGuesses < MAX_WRONG) return;
  gameActive = false;

  // Switch to sad/lose face
  FACE_PARTS.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add("hidden");
  });
  LOSE_PARTS.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove("hidden");
  });

  setTimeout(() => {
    const lr = document.getElementById("loseWordReveal");
    const lh = document.getElementById("loseHintReveal");
    if (lr) lr.textContent = currentWord;
    if (lh && currentHint) lh.textContent = `Hint was: "${currentHint}"`;
    document.getElementById("loseOverlay")?.classList.remove("hidden");
  }, 600);
}

// ── Hint ─────────────────────────────────────────────────────
function useHint() {
  if (!gameActive) return;
  if (gameMode === "single" && hintsLeft <= 0) return;
  if (hintUsed && gameMode === "multi") return;

  const hintBox = document.getElementById("hintBox");
  const hintText = document.getElementById("hintText");

  if (gameMode === "single") hintsLeft--;
  hintUsed = true;

  if (hintText) hintText.textContent = currentHint || "No hint available for this word!";
  if (hintBox) {
    hintBox.classList.add("hint-revealed");
    hintBox.classList.add("hint-bounce");
    setTimeout(() => hintBox.classList.remove("hint-bounce"), 600);
  }

  updateHintCount();
}

function updateHintCount() {
  const el = document.getElementById("hintCount");
  if (el) el.textContent = `(${hintsLeft} left)`;
  const btn = document.getElementById("hintBtn");
  if (btn && hintsLeft <= 0) btn.classList.add("no-hints");
}

// ── Confetti ──────────────────────────────────────────────────
function launchConfetti() {
  const colors = ["#FFD93D","#FF6B9D","#6BCB77","#48DBFB","#A29BFE","#FF6348"];
  for (let i = 0; i < 80; i++) {
    const dot = document.createElement("div");
    dot.className = "confetti-dot";
    dot.style.cssText = `
      left:${Math.random()*100}vw;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      animation-delay:${Math.random()*1}s;
      width:${6+Math.random()*8}px;
      height:${6+Math.random()*8}px;
      border-radius:${Math.random()>0.5?'50%':'3px'};
    `;
    document.body.appendChild(dot);
    setTimeout(() => dot.remove(), 3000);
  }
}

// ── Animations ────────────────────────────────────────────────
function bounceLetters(letter) {
  document.querySelectorAll(".letter-box.revealed").forEach(box => {
    if (box.textContent === letter) {
      box.classList.add("letter-bounce");
      setTimeout(() => box.classList.remove("letter-bounce"), 500);
    }
  });
}

function shakeElement(el) {
  el.classList.add("shake");
  setTimeout(() => el.classList.remove("shake"), 400);
}

// ── Screen transitions ────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  const target = document.getElementById(id);
  if (target) {
    target.classList.add("active");
  }
}