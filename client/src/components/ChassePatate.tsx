import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
// @ts-expect-error: JS woordenlijst
import { validCyclingWords } from "../data/cycling_words.js";

const MAX_WRONG = 9;

const AZERTY_KEYS = [
  ["A", "Z", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["Q", "S", "D", "F", "G", "H", "J", "K", "L", "M"],
  ["W", "X", "C", "V", "B", "N"],
];

const BELLE = {
  cream: "#F5E6C4",
  yellow: "#F4C430",
  ochre: "#D4840A",
  teal: "#2A7B8E",
  rust: "#C44B2B",
  ink: "#1A1A2E",
  sage: "#7BAE7F",
  sky: "#87CEEB",
};

function pickWord(): string {
  const idx = Math.floor(Math.random() * validCyclingWords.length);
  return validCyclingWords[idx];
}

function isWordComplete(word: string, guessed: Set<string>): boolean {
  return word.split("").every((ch) => guessed.has(ch));
}

export default function ChassePatate() {
  const [solution, setSolution] = useState("");
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [wrongCount, setWrongCount] = useState(0);
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">("playing");
  const [ridesAway, setRidesAway] = useState(false);

  const startNewGame = useCallback(() => {
    setSolution(pickWord());
    setGuessedLetters(new Set());
    setWrongCount(0);
    setGameStatus("playing");
    setRidesAway(false);
  }, []);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  const wrongLetters = Array.from(guessedLetters).filter((l) => !solution.includes(l)).sort();

  const handleLetter = useCallback(
    (key: string) => {
      if (gameStatus !== "playing" || ridesAway) return;
      const letter = key.toUpperCase();
      if (!/^[A-Z]$/.test(letter)) return;
      if (guessedLetters.has(letter)) return;

      const next = new Set(guessedLetters);
      next.add(letter);
      setGuessedLetters(next);

      if (!solution.includes(letter)) {
        const newWrong = wrongCount + 1;
        setWrongCount(newWrong);
        if (newWrong >= MAX_WRONG) {
          setGameStatus("lost");
          setTimeout(() => setRidesAway(true), 600);
        }
      } else if (isWordComplete(solution, next)) {
        setGameStatus("won");
      }
    },
    [gameStatus, ridesAway, guessedLetters, solution, wrongCount]
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.length === 1) handleLetter(e.key);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleLetter]);

  const getKeyStyle = (key: string) => {
    if (!guessedLetters.has(key)) {
      return "bg-[#F5E6C4] text-[#1A1A2E] border-b-4 border-[#D4840A]/40 hover:bg-[#F4C430]/60";
    }
    if (solution.includes(key)) {
      return "bg-[#7BAE7F] text-white border-b-4 border-[#5A8F5E] opacity-90";
    }
    return "bg-[#C44B2B] text-white border-b-4 border-[#8B2E1A] opacity-50";
  };

  const remaining = MAX_WRONG - wrongCount;

  return (
    <div
      className="flex flex-col items-center w-full max-w-md mx-auto p-4 select-none"
      style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
    >
      {/* Titel */}
      <div className="text-center mb-1">
        <h2 className="text-3xl font-black tracking-tight uppercase" style={{ color: BELLE.ink }}>
          Chasse{" "}
          <span className="italic font-normal" style={{ color: BELLE.rust }}>
            Patate
          </span>
        </h2>
        <p className="text-[9px] font-bold uppercase tracking-[0.35em] mt-1" style={{ color: BELLE.teal }}>
          Le jeu du vélo
        </p>
      </div>

      {/* Woord */}
      <div className="flex flex-wrap justify-center gap-2 my-5 min-h-[3rem]">
        {solution.split("").map((ch, i) => (
          <motion.div
            key={`${ch}-${i}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.03 }}
            className="w-10 h-12 sm:w-11 sm:h-14 border-[3px] rounded-lg flex items-center justify-center text-xl sm:text-2xl font-black uppercase shadow-sm"
            style={{
              borderColor: BELLE.ink,
              backgroundColor: guessedLetters.has(ch) || gameStatus !== "playing" ? BELLE.yellow : BELLE.cream,
              color: BELLE.ink,
            }}
          >
            {(guessedLetters.has(ch) || gameStatus !== "playing") && ch}
          </motion.div>
        ))}
      </div>

      {/* Foute letters */}
      <div
        className="w-full rounded-2xl border-[3px] px-4 py-3 mb-4 min-h-[3.5rem]"
        style={{ borderColor: BELLE.ink, backgroundColor: "rgba(255,255,255,0.45)" }}
      >
        <p className="text-[8px] font-black uppercase tracking-[0.3em] mb-2" style={{ color: BELLE.rust }}>
          Mauvaises lettres
        </p>
        <div className="flex flex-wrap gap-2 min-h-[1.5rem]">
          {wrongLetters.length === 0 ? (
            <span className="text-[10px] italic opacity-40" style={{ color: BELLE.ink }}>
              —
            </span>
          ) : (
            wrongLetters.map((l) => (
              <span
                key={l}
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-white border-2"
                style={{ backgroundColor: BELLE.rust, borderColor: BELLE.ink }}
              >
                {l}
              </span>
            ))
          )}
        </div>
      </div>

      {/* Fiets-scène */}
      <div
        className="w-full rounded-3xl border-[3px] overflow-hidden mb-5 relative"
        style={{ borderColor: BELLE.ink, backgroundColor: BELLE.sky }}
      >
        {/* Heuvels Belleville */}
        <svg viewBox="0 0 320 200" className="w-full block" aria-hidden>
          <rect width="320" height="200" fill={BELLE.sky} />
          <ellipse cx="80" cy="175" rx="120" ry="40" fill={BELLE.sage} opacity="0.7" />
          <ellipse cx="260" cy="180" rx="100" ry="35" fill="#6B9B6E" opacity="0.6" />
          <path d="M0 160 Q60 130 120 155 T240 150 T320 165 L320 200 L0 200Z" fill={BELLE.sage} />
        </svg>

        <motion.div
          className="absolute inset-0 flex items-end justify-center pb-6"
          animate={ridesAway ? { x: 500, opacity: 0 } : { x: 0, opacity: 1 }}
          transition={{ duration: 2.2, ease: "easeIn" }}
        >
          <BellevilleBike parts={wrongCount} won={gameStatus === "won"} />
        </motion.div>

        {/* Beurten teller */}
        <div
          className="absolute top-3 right-3 px-3 py-1 rounded-full border-2 text-[10px] font-black uppercase tracking-wider"
          style={{ borderColor: BELLE.ink, backgroundColor: BELLE.yellow, color: BELLE.ink }}
        >
          {remaining} {remaining === 1 ? "chance" : "chances"}
        </div>
      </div>

      {/* Toetsenbord */}
      {gameStatus === "playing" && !ridesAway && (
        <div className="w-full space-y-2">
          {AZERTY_KEYS.map((row, i) => (
            <div key={i} className="flex justify-center gap-1.5">
              {row.map((key) => (
                <button
                  key={key}
                  type="button"
                  disabled={guessedLetters.has(key)}
                  onClick={() => handleLetter(key)}
                  className={`h-11 w-9 sm:w-10 text-sm font-black rounded-xl flex items-center justify-center active:scale-90 transition-all disabled:cursor-default ${getKeyStyle(key)}`}
                  style={{ borderColor: BELLE.ink }}
                >
                  {key}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Resultaat */}
      <AnimatePresence>
        {gameStatus !== "playing" && !ridesAway && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(26,26,46,0.55)" }}
          >
            <div
              className="rounded-[2.5rem] shadow-2xl border-[3px] p-8 w-full max-w-sm text-center"
              style={{ borderColor: BELLE.ink, backgroundColor: BELLE.cream }}
            >
              <p className="text-4xl mb-2">{gameStatus === "won" ? "🏆" : "🚴💨"}</p>
              <p
                className="font-black text-2xl uppercase mb-1"
                style={{ color: gameStatus === "won" ? BELLE.teal : BELLE.rust }}
              >
                {gameStatus === "won" ? "Bravo!" : "Parti!"}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-6" style={{ color: BELLE.ink }}>
                {gameStatus === "won"
                  ? "Tu as sauvé le vélo!"
                  : `Le mot était : ${solution}`}
              </p>
              <button
                type="button"
                onClick={startNewGame}
                className="w-full font-black py-4 px-6 rounded-2xl uppercase text-xs tracking-[0.2em] shadow-lg active:scale-95 transition-all border-[3px]"
                style={{ backgroundColor: BELLE.yellow, borderColor: BELLE.ink, color: BELLE.ink }}
              >
                Nouvelle partie
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Verlies: fiets rijdt weg — daarna modal */}
      <AnimatePresence>
        {ridesAway && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(26,26,46,0.55)" }}
          >
            <div
              className="rounded-[2.5rem] shadow-2xl border-[3px] p-8 w-full max-w-sm text-center"
              style={{ borderColor: BELLE.ink, backgroundColor: BELLE.cream }}
            >
              <p className="text-4xl mb-2">🥔</p>
              <p className="font-black text-2xl uppercase mb-1" style={{ color: BELLE.rust }}>
                Chasse patate!
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-6" style={{ color: BELLE.ink }}>
                Le mot était : <span className="text-lg">{solution}</span>
              </p>
              <button
                type="button"
                onClick={startNewGame}
                className="w-full font-black py-4 px-6 rounded-2xl uppercase text-xs tracking-[0.2em] shadow-lg active:scale-95 transition-all border-[3px]"
                style={{ backgroundColor: BELLE.yellow, borderColor: BELLE.ink, color: BELLE.ink }}
              >
                Nouvelle partie
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** 9 onderdelen — Belleville-stijl racefiets met renner */
function BellevilleBike({ parts, won }: { parts: number; won: boolean }) {
  const stroke = BELLE.ink;
  const sw = 3.5;

  const show = (n: number) => parts >= n;

  return (
    <svg viewBox="0 0 200 130" width="220" height="143" aria-label="Fiets">
      {/* 1 — Achterwiel */}
      {show(1) && (
        <g>
          <circle cx="55" cy="95" r="28" fill="none" stroke={stroke} strokeWidth={sw} />
          <circle cx="55" cy="95" r="22" fill="none" stroke={stroke} strokeWidth={1.5} strokeDasharray="4 6" />
          <circle cx="55" cy="95" r="4" fill={BELLE.ochre} stroke={stroke} strokeWidth={1.5} />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <line
              key={deg}
              x1="55"
              y1="95"
              x2={55 + 22 * Math.cos((deg * Math.PI) / 180)}
              y2={95 + 22 * Math.sin((deg * Math.PI) / 180)}
              stroke={stroke}
              strokeWidth={1}
            />
          ))}
        </g>
      )}

      {/* 2 — Voorwiel */}
      {show(2) && (
        <g>
          <circle cx="155" cy="95" r="28" fill="none" stroke={stroke} strokeWidth={sw} />
          <circle cx="155" cy="95" r="22" fill="none" stroke={stroke} strokeWidth={1.5} strokeDasharray="4 6" />
          <circle cx="155" cy="95" r="4" fill={BELLE.ochre} stroke={stroke} strokeWidth={1.5} />
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <line
              key={deg}
              x1="155"
              y1="95"
              x2={155 + 22 * Math.cos((deg * Math.PI) / 180)}
              y2={95 + 22 * Math.sin((deg * Math.PI) / 180)}
              stroke={stroke}
              strokeWidth={1}
            />
          ))}
        </g>
      )}

      {/* 3 — Frame */}
      {show(3) && (
        <g fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          <polygon
            points="55,95 105,55 155,95 105,75"
            fill={BELLE.teal}
            fillOpacity={0.35}
            stroke={stroke}
            strokeWidth={sw}
          />
          <line x1="105" y1="55" x2="105" y2="75" />
        </g>
      )}

      {/* 4 — Vork */}
      {show(4) && (
        <g fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round">
          <line x1="155" y1="95" x2="145" y2="60" />
          <line x1="145" y1="60" x2="135" y2="55" />
          <line x1="145" y1="60" x2="155" y2="55" />
        </g>
      )}

      {/* 5 — Zadel + zadelpen */}
      {show(5) && (
        <g>
          <line x1="105" y1="75" x2="98" y2="48" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
          <ellipse cx="96" cy="44" rx="14" ry="5" fill={BELLE.rust} stroke={stroke} strokeWidth={2} />
        </g>
      )}

      {/* 6 — Stuur */}
      {show(6) && (
        <g fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round">
          <line x1="145" y1="60" x2="148" y2="42" />
          <path d="M130 38 Q148 28 166 38" strokeWidth={sw} />
          <line x1="130" y1="38" x2="128" y2="44" />
          <line x1="166" y1="38" x2="168" y2="44" />
        </g>
      )}

      {/* 7 — Pedalen & crank */}
      {show(7) && (
        <g fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round">
          <circle cx="105" cy="75" r="10" />
          <line x1="105" y1="75" x2="92" y2="88" />
          <line x1="105" y1="75" x2="118" y2="88" />
          <rect x="88" y="86" width="8" height="4" rx="1" fill={BELLE.ochre} stroke={stroke} strokeWidth={1.5} />
          <rect x="114" y="86" width="8" height="4" rx="1" fill={BELLE.ochre} stroke={stroke} strokeWidth={1.5} />
        </g>
      )}

      {/* 8 — Ketting */}
      {show(8) && (
        <path
          d="M95 82 Q75 90 55 95"
          fill="none"
          stroke={stroke}
          strokeWidth={2}
          strokeDasharray="3 3"
        />
      )}

      {/* 9 — Renner (Belleville: vierkante schouders, gele trui) */}
      {show(9) && (
        <g>
          {/* Benen */}
          <path
            d="M100 75 L88 95 M108 75 L120 88"
            fill="none"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap="round"
          />
          {/* Lichaam */}
          <rect x="92" y="38" width="26" height="38" rx="4" fill={BELLE.yellow} stroke={stroke} strokeWidth={sw} />
          {/* Schouders — Belleville vierkant */}
          <rect x="86" y="36" width="38" height="12" rx="2" fill={BELLE.yellow} stroke={stroke} strokeWidth={sw} />
          {/* Hoofd */}
          <circle cx="105" cy="28" r="10" fill={BELLE.cream} stroke={stroke} strokeWidth={sw} />
          {/* Helm */}
          <path d="M95 24 Q105 14 115 24" fill={BELLE.rust} stroke={stroke} strokeWidth={2} />
          {/* Armen op stuur */}
          <path
            d="M88 48 L128 42"
            fill="none"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap="round"
          />
        </g>
      )}

      {/* Win: confetti-sterretjes */}
      {won && (
        <g>
          {[
            [30, 30], [170, 25], [100, 15], [180, 70], [20, 80],
          ].map(([x, y], i) => (
            <text key={i} x={x} y={y} fontSize="14" fill={BELLE.yellow}>
              ✦
            </text>
          ))}
        </g>
      )}
    </svg>
  );
}
