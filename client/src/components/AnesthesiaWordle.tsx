import React, { useState, useEffect } from 'react';
// Importeer de woordenlijst uit jouw data-map
// @ts-ignore
import { validWords } from '../data/puzzle_words_5.js';

// --- JOUW WINNENDE WOORDEN LIJST ---
const DAILY_SOLUTIONS = [
  "BLOCK", "JOERI", "BARTH", "TUBES", "GLIDE", 
  "SERUM", "BLOED", "FLUIM", "BLAAS", "DRAIN",
  "TUMOR", "NAALD", "ADERS", "PROBE", "SPIER",
  "HOOFT", "ANOUK", "CARLO", "MARIE", "ELINE",
  "JORNE", "LOUIS", "WACHT", "SPOED", "KAMER",
  "LIJST", "DRAMA", "SNOEP", "CHIPS", "SPUIT"
];

const AZERTY_KEYS = [
  ["A", "Z", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["Q", "S", "D", "F", "G", "H", "J", "K", "L", "M"],
  ["ENTER", "W", "X", "C", "V", "B", "N", "⌫"]
];

export default function AnesthesiaWordle() {
  const [solution, setSolution] = useState('');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');

  // 1. Initialiseer het woord van de dag
  useEffect(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const word = DAILY_SOLUTIONS[dayOfYear % DAILY_SOLUTIONS.length];
    setSolution(word.toUpperCase());
  }, []);

  // 2. De Deel-functie (Emoji grid genereren)
  const shareResult = () => {
    const emojiGrid = guesses.map(guess => {
      return guess.split('').map((letter, i) => {
        if (letter === solution[i]) return '🟩';
        if (solution.includes(letter)) return '🟨';
        return '⬜';
      }).join('');
    }).join('\n');

    const shareText = `Anesthesie-dle ${new Date().toLocaleDateString('nl-BE', {day: '2-digit', month: '2-digit'})}\n${emojiGrid}\nScore: ${guesses.length}/6`;

    if (navigator.share) {
      navigator.share({ title: 'Anesthesie-dle', text: shareText }).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareText);
      alert("Resultaat gekopieerd naar klembord!");
    }
  };

  // 3. Logica voor toetsaanslagen (virtueel en fysiek)
  const handleKeyPress = (key: string) => {
  if (gameStatus !== 'playing') return;

  // We normaliseren de input naar hoofdletters
  const k = key.toUpperCase();

  if (k === 'ENTER') {
    if (currentGuess.length !== 5) return;
    
    const lowerGuess = currentGuess.toLowerCase();
    if (!validWords.includes(lowerGuess) && !DAILY_SOLUTIONS.map(w => w.toLowerCase()).includes(lowerGuess)) {
      alert("Geen geldig woord");
      return;
    }

    const newGuesses = [...guesses, currentGuess.toUpperCase()];
    setGuesses(newGuesses);
    setCurrentGuess('');

    if (currentGuess.toUpperCase() === solution) setGameStatus('won');
    else if (newGuesses.length >= 6) setGameStatus('lost');
  } 
  else if (k === '⌫' || k === 'BACKSPACE' || k === 'DELETE') {
    setCurrentGuess(prev => prev.slice(0, -1));
  } 
  // Belangrijk: check of het exact 1 letter is en GEEN 'ENTER'
  else if (/^[A-Z]$/.test(k) && k !== 'ENTER') {
    if (currentGuess.length < 5) {
      setCurrentGuess(prev => prev + k);
    }
  }
};

  useEffect(() => {
    const onPhysicalKeyDown = (e: KeyboardEvent) => handleKeyPress(e.key);
    window.addEventListener('keydown', onPhysicalKeyDown);
    return () => window.removeEventListener('keydown', onPhysicalKeyDown);
  }, [currentGuess, gameStatus]);

  // Toetsenbord kleur-logica
  const getKeyStyle = (key: string) => {
    const allGuessedLetters = guesses.join("");
    if (!allGuessedLetters.includes(key)) return "bg-slate-200 text-slate-900 border-b-4 border-slate-300";
    
    const isCorrect = guesses.some(g => g.split("").some((l, i) => l === key && solution[i] === key));
    if (isCorrect) return "bg-emerald-500 text-white border-b-4 border-emerald-700";

    const isPresent = solution.includes(key);
    if (isPresent) return "bg-amber-400 text-white border-b-4 border-amber-600";

    return "bg-slate-400 text-white opacity-40";
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto p-4 select-none">
      <h2 className="text-3xl font-black text-slate-900 mb-6 tracking-tighter uppercase italic">
        Anesthesie<span className="text-teal-600 font-light">dle</span>
      </h2>
      
      {/* HET RASTER */}
      <div className="grid grid-rows-6 gap-2 mb-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="grid grid-cols-5 gap-2">
            {[...Array(5)].map((_, j) => {
              const guess = guesses[i] || (i === guesses.length ? currentGuess : "");
              const isFinal = i < guesses.length;
              let style = "bg-white border-slate-200 text-slate-900";
              
              if (isFinal) {
                if (guess[j] === solution[j]) style = "bg-emerald-500 border-emerald-600 text-white";
                else if (solution.includes(guess[j])) style = "bg-amber-400 border-amber-500 text-white";
                else style = "bg-slate-400 border-slate-500 text-white";
              }

              return (
                <div key={j} className={`w-14 h-14 border-2 flex items-center justify-center text-2xl font-black rounded-2xl uppercase transition-all duration-500 shadow-sm ${style}`}>
                  {guess[j]}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* VIRTUEEL AZERTY TOETSENBORD */}
      <div className="w-full space-y-2">
        {AZERTY_KEYS.map((row, i) => (
          <div key={i} className="flex justify-center gap-1.5">
            {row.map(key => (
              <button
              key={key}
              type="button" // Voorkom form submission trekjes
              onClick={(e) => {
                e.preventDefault();
                handleKeyPress(key);
              }}
              className={`h-12 ${key.length > 1 ? 'px-3 text-[10px]' : 'w-8 text-sm'} ...`}
  >
    {key}
  </button>
            ))}
          </div>
        ))}
      </div>

      {/* GAME OVER SECTIE MET DEELKNOP */}
      {gameStatus !== 'playing' && (
        <div className="mt-8 p-6 bg-white rounded-[2.5rem] shadow-2xl border-2 border-teal-500 text-center animate-in zoom-in duration-300 w-full">
          <p className="font-black text-teal-600 text-2xl uppercase mb-1">
            {gameStatus === 'won' ? "🥇 GEWELDIG!" : "Helaas!"}
          </p>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-6">
            Het woord was: <span className="text-slate-900">{solution}</span>
          </p>
          
          <button
            onClick={shareResult}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all uppercase text-xs tracking-[0.2em] shadow-lg shadow-teal-100 active:scale-95"
          >
            <span className="text-xl">📤</span> Deel Resultaat
          </button>
        </div>
      )}
    </div>
  );
}