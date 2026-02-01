import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Syringe, Play, RotateCcw } from "lucide-react";
import { Link } from "wouter";

// --- GAME CONSTANTEN (Pas deze aan om het moeilijker/makkelijker te maken) ---
const GRAVITY = 0.6;
const JUMP_STRENGTH = -10;
const GAME_SPEED = 3;
const PIPE_WIDTH = 60;
const PIPE_GAP = 180; // Ruimte tussen boven en onder tand
const BIRD_SIZE = 40;
const GAME_HEIGHT = 500; // Vaste hoogte voor consistentie
// ---------------------------------------------------------------------------

export default function GamePage() {
  const [birdPos, setBirdPos] = useState(GAME_HEIGHT / 2);
  const [birdVelocity, setBirdVelocity] = useState(0);
  const [pipes, setPipes] = useState<{ x: number; topHeight: number }[]>([]);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<"start" | "playing" | "gameover">("start");

  // Functie om te springen (tap screen)
  const jump = useCallback(() => {
    if (gameState === "playing") {
      setBirdVelocity(JUMP_STRENGTH);
    } else if (gameState === "start") {
      setGameState("playing");
      setBirdVelocity(JUMP_STRENGTH);
    }
  }, [gameState]);

  // Start / Reset de game
  const resetGame = () => {
    setBirdPos(GAME_HEIGHT / 2);
    setBirdVelocity(0);
    setPipes([]);
    setScore(0);
    setGameState("start");
  };

  // De "Game Loop" - draait elke ~24ms
  useEffect(() => {
    let timeId: NodeJS.Timeout;
    if (gameState === "playing") {
      timeId = setInterval(() => {
        // 1. Update vogel positie & zwaartekracht
        setBirdPos((pos) => pos + birdVelocity);
        setBirdVelocity((vel) => vel + GRAVITY);

        // 2. Beweeg pijpen naar links
        setPipes((currentPipes) => {
          let newPipes = currentPipes
            .map((pipe) => ({ ...pipe, x: pipe.x - GAME_SPEED }))
            .filter((pipe) => pipe.x > -PIPE_WIDTH);

          // Nieuwe pijp toevoegen als de laatste ver genoeg weg is
          if (newPipes.length === 0 || newPipes[newPipes.length - 1].x < window.innerWidth - 250) {
            const randomHeight = Math.random() * (GAME_HEIGHT - PIPE_GAP - 100) + 50;
            newPipes.push({ x: window.innerWidth, topHeight: randomHeight });
          }
          return newPipes;
        });

        // 3. Score bijhouden
        setPipes((currentPipes) => {
           currentPipes.forEach(pipe => {
             // Check if bird just passed the middle of a pipe
             if (pipe.x + GAME_SPEED >= PIPE_WIDTH/2 && pipe.x < PIPE_WIDTH/2) {
                setScore(s => s + 1);
             }
           })
           return currentPipes;
        })

      }, 24);
    }
    return () => clearInterval(timeId);
  }, [gameState, birdVelocity]);

  // Collision Detection (Botsingen checken)
  useEffect(() => {
    if (gameState !== "playing") return;

    // Raak plafond of vloer
    if (birdPos < 0 || birdPos > GAME_HEIGHT - BIRD_SIZE) {
      setGameState("gameover");
    }

    // Raak een pijp
    pipes.forEach((pipe) => {
      const birdLeft = 50; // Vogel vaste X positie
      const birdRight = 50 + BIRD_SIZE;
      const birdTop = birdPos;
      const birdBottom = birdPos + BIRD_SIZE;

      const pipeLeft = pipe.x;
      const pipeRight = pipe.x + PIPE_WIDTH;
      const topPipeBottom = pipe.topHeight;
      const bottomPipeTop = pipe.topHeight + PIPE_GAP;

      // Is de vogel binnen de horizontale breedte van de pijp?
      if (birdRight > pipeLeft && birdLeft < pipeRight) {
        // Raakt hij de bovenste OF onderste pijp?
        if (birdTop < topPipeBottom || birdBottom > bottomPipeTop) {
          setGameState("gameover");
        }
      }
    });
  }, [birdPos, pipes, gameState]);


  return (
    <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center overflow-hidden touch-none select-none" onClick={jump}>
      {/* HET SPEELVELD */}
      <div className="relative w-full max-w-lg bg-teal-900/20 border-y-4 border-teal-700 overflow-hidden" style={{ height: GAME_HEIGHT }}>
        
        {/* De Vogel (Spuitje) */}
        <div
          className="absolute left-[50px] text-white drop-shadow-[0_0_10px_rgba(20,184,166,0.8)] transition-transform"
          style={{ 
            top: birdPos, 
            width: BIRD_SIZE, 
            height: BIRD_SIZE,
            transform: `rotate(${birdVelocity * 3}deg)` // Kantel effect bij vallen/stijgen
          }}
        >
         <Syringe className="w-full h-full -rotate-90 text-teal-400 fill-teal-400/50" />
        </div>

        {/* De Obstakels (Tanden/Pijpen) */}
        {pipes.map((pipe, i) => (
          <div key={i}>
            {/* Bovenste tand */}
            <div 
               className="absolute top-0 bg-gradient-to-b from-slate-100 to-slate-300 border-b-4 border-slate-400 rounded-b-xl shadow-lg"
               style={{ left: pipe.x, width: PIPE_WIDTH, height: pipe.topHeight }}
            />
             {/* Onderste tand */}
             <div 
               className="absolute bottom-0 bg-gradient-to-t from-slate-100 to-slate-300 border-t-4 border-slate-400 rounded-t-xl shadow-lg"
               style={{ left: pipe.x, width: PIPE_WIDTH, height: GAME_HEIGHT - pipe.topHeight - PIPE_GAP }}
            />
          </div>
        ))}

        {/* SCORE */}
        {gameState === "playing" && (
          <div className="absolute top-10 left-1/2 -translate-x-1/2 text-6xl font-black text-white opacity-50 pointer-events-none z-10">
            {score}
          </div>
        )}

        {/* START SCHERM */}
        {gameState === "start" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white z-20">
             <Syringe className="w-16 h-16 mb-4 text-teal-400 -rotate-90 animate-bounce" />
             <h1 className="text-3xl font-black uppercase italic tracking-tighter">Flappy Anesthetist</h1>
             <p className="text-sm mb-6 opacity-80">Tap om te intuberen</p>
             <Button size="lg" className="bg-teal-600 hover:bg-teal-700 font-bold gap-2 pointer-events-auto" onClick={(e) => { e.stopPropagation(); jump(); }}>
                <Play className="w-5 h-5"/> Start
             </Button>
          </div>
        )}

        {/* GAME OVER SCHERM */}
        {gameState === "gameover" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/80 text-white z-20 text-center p-6 animate-in zoom-in-90">
             <h2 className="text-3xl font-black uppercase mb-2 text-red-300">Sat &lt; 90%!</h2>
             <p className="text-xl font-bold mb-6">Intubatie mislukt.</p>
             
             <div className="bg-white/10 p-4 rounded-xl mb-6 w-full max-w-xs">
                <p className="text-sm uppercase tracking-widest opacity-70">Score</p>
                <p className="text-5xl font-black">{score}</p>
             </div>

             <div className="flex gap-4 pointer-events-auto">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/20 gap-2" asChild>
                    <Link href="/">Stop</Link>
                </Button>
                <Button size="lg" className="bg-red-600 hover:bg-red-700 font-bold gap-2" onClick={(e) => { e.stopPropagation(); resetGame(); }}>
                  <RotateCcw className="w-5 h-5"/> Opnieuw
                </Button>
             </div>
          </div>
        )}
      </div>
      <p className="text-slate-500 text-xs mt-4 italic">Voor gebruik tijdens stabiele onderhoudsfase only.</p>
    </div>
  );
}