# 🎉 Hangman Party!

A bright, playful, fully-featured Hangman game with Single Player and Two Player modes. Built with pure HTML, CSS & JavaScript — no frameworks, no backend, no installation needed.

## 🎮 Features

### Single Player
- 7 categories: Names, Flowers, Countries, Plants, Cars, Things, General
- Random word picked by the computer each game
- 💡 3 hints per game
- On-screen keyboard + physical keyboard support
- Animated hangman drawing (6 wrong guesses allowed)
- Win/lose overlays with confetti 🎊
- Score tracker

### Two Player
- Player 1 enters a secret word by **typing** or **speaking** (voice recognition)
- Word is auto-hidden from Player 2
- Optional hint for Player 2
- New words spoken via microphone are automatically added to the word bank
- Category tagging for Player 1's word

### Design
- Bright & playful cartoon style
- Smooth animations on every interaction
- Fully responsive — works on phones and desktops
- Custom on-screen + physical keyboard

## 🚀 Play Live

👉 **[Play on GitHub Pages](https://fatimasherwani04.github.io/hangman-game/)**

## 📁 File Structure

```
hangman-game/
├── index.html          ← Home / mode selection
├── singleplayer.html   ← Single player game
├── multiplayer.html    ← Two player game
├── style.css           ← All styles
├── game.js             ← All game logic
└── words.js            ← Word bank (7 categories × 15 words each)
```

## 🛠️ How to Deploy (GitHub Pages)

1. Create a new GitHub repository named `hangman-game`
2. Upload all 6 files
3. Go to **Settings → Pages → Source: main branch → / (root)**
4. Click **Save** — your site is live in ~1 minute!

## 🧠 Technologies Used

- HTML5 / CSS3 / Vanilla JavaScript
- Web Speech API (voice input)
- Google Fonts (Fredoka One + Nunito)
- CSS animations & transitions
- SVG hangman illustration

## 📝 License

MIT License — free to use, share, and modify!
