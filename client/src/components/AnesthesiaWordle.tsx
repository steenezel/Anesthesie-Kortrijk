import React, { useState, useEffect } from 'react';
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialiseer het woord van de dag
  useEffect(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const word = DAILY_SOLUTIONS[dayOfYear % DAILY_SOLUTIONS.length];
    setSolution(word.toUpperCase());
  }, []);

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(null), 2000);
  };

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
      showError("Gekopieerd naar klembord!");
    }
  };

  const handleKeyPress = (key: string) => {
    if (gameStatus !== 'playing') return;
    const k = key.toUpperCase();

    if (k === 'ENTER') {
      if (currentGuess.length !== 5) return;
      
      const lowerGuess = currentGuess.toLowerCase();
      const isValid = validWords.includes(lowerGuess) || 
                      DAILY_SOLUTIONS.map(w => w.toLowerCase()).includes(lowerGuess);

      if (!isValid) {
        showError("Niet in woordenlijst");
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
    else if (/^[A-Z]$/.test(k) && k !== 'ENTER') {
      if (currentGuess.length < 5) {
        setCurrentGuess(prev => prev + k);
      }
    }
  };

  // Luister naar fysiek toetsenbord
  useEffect(() => {
    const onPhysicalKeyDown = (e: KeyboardEvent) => handleKeyPress(e.key);
    window.addEventListener('keydown', onPhysicalKeyDown);
    return () => window.removeEventListener('keydown', onPhysicalKeyDown);
  }, [currentGuess, gameStatus, guesses, solution]);

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
    <div className="flex flex-col items-center w-full max-w-md mx-auto p-4 select-none animate-in fade-in duration-500">
      <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tighter uppercase italic text-center">
        Anesthesie<span className="text-teal-600 font-light">dle</span>
      </h2>
      
      {/* FOUTMELDING OVERLAY */}
      <div className="h-10 flex items-center justify-center mb-2">
        {errorMessage && (
          <div className="bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg animate-in fade-in zoom-in duration-200 shadow-lg">
            {errorMessage}
          </div>
        )}
      </div>

      {/* HET RASTER */}
      <div className="grid grid-rows-6 gap-2 mb-8">
        {[...Array(6)].map((_, i) => (
          <WordRow 
            key={i} 
            guess={guesses[i] || (i === guesses.length ? currentGuess : "")} 
            isFinal={i < guesses.length}
            solution={solution}
          />
        ))}
      </div>

      {/* VIRTUEEL AZERTY TOETSENBORD */}
      <div className="w-full space-y-2">
        {AZERTY_KEYS.map((row, i) => (
          <div key={i} className="flex justify-center gap-1.5">
            {row.map(key => (
              <button
                key={key}
                type="button"
                onClick={() => handleKeyPress(key)}
                className={`h-12 ${key.length > 1 ? 'px-3 text-[10px]' : 'w-8 text-sm'} font-black rounded-xl flex items-center justify-center active:scale-90 transition-all ${getKeyStyle(key)}`}
              >
                {key}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* WIN/LOSE MODAL */}
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

function WordRow({ guess, isFinal, solution }: { guess: string, isFinal: boolean, solution: string }) {
  const getLetterStyles = () => {
    const styles = Array(5).fill("bg-white border-slate-200 text-slate-900");
    if (!isFinal) return styles;

    const solChars = solution.split('');
    const guessChars = guess.split('');
    const usedIndices = Array(5).fill(false);

    // Groen
    guessChars.forEach((char, i) => {
      if (char === solChars[i]) {
        styles[i] = "bg-emerald-500 border-emerald-600 text-white";
        usedIndices[i] = true;
      }
    });

    // Geel
    guessChars.forEach((char, i) => {
      if (styles[i].includes("bg-emerald-500")) return;
      const solIndex = solChars.findIndex((sChar, idx) => sChar === char && !usedIndices[idx]);
      if (solIndex !== -1) {
        styles[i] = "bg-amber-400 border-amber-500 text-white";
        usedIndices[solIndex] = true;
      } else {
        styles[i] = "bg-slate-400 border-slate-500 text-white";
      }
    });

    return styles;
  };

  const letterStyles = getLetterStyles();

  return (
    <div className="grid grid-cols-5 gap-2">
      {[...Array(5)].map((_, i) => (
        <div 
          key={i} 
          className={`w-14 h-14 border-2 flex items-center justify-center text-2xl font-black rounded-2xl uppercase transition-all duration-500 shadow-sm ${
            isFinal ? letterStyles[i] : (guess[i] ? "bg-white border-slate-400 text-slate-900 scale-105 shadow-md" : "bg-white border-slate-200 text-slate-900")
          }`}
        >
          {guess[i]}
        </div>
      ))}
    </div>
  );
}