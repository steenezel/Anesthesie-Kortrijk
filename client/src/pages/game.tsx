import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Syringe, Play, RotateCcw, Trophy } from "lucide-react";
import { Link } from "wouter";

const GRAVITY = 0.6;
const JUMP_STRENGTH = -8;
const GAME_SPEED = 3.5;
const PIPE_WIDTH = 60;
const PIPE_GAP = 170; 
const BIRD_SIZE = 40;
const GAME_HEIGHT = 500;

export default function GamePage() {
  const [birdPos, setBirdPos] = useState(GAME_HEIGHT / 2);
  const [birdVelocity, setBirdVelocity] = useState(0);
  const [pipes, setPipes] = useState<{ x: number; topHeight: number }[]>([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameState, setGameState] = useState<"start" | "playing" | "gameover">("start");

  // Laad High Score bij het opstarten
  useEffect(() => {
    const saved = localStorage.getItem("flappy_ane_highscore");
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const jump = useCallback(() => {
    if (gameState === "playing") {
      setBirdVelocity(JUMP_STRENGTH);
    } else if (gameState === "start") {
      setGameState("playing");
      setBirdVelocity(JUMP_STRENGTH);
    }
  }, [gameState]);

  const resetGame = () => {
    setBirdPos(GAME_HEIGHT / 2);
    setBirdVelocity(0);
    setPipes([]);
    setScore(0);
    setGameState("start");
  };

  // Game Loop
  useEffect(() => {
    let timeId: NodeJS.Timeout;
    if (gameState === "playing") {
      timeId = setInterval(() => {
        setBirdPos((pos) => pos + birdVelocity);
        setBirdVelocity((vel) => vel + GRAVITY);

        setPipes((currentPipes) => {
          let newPipes = currentPipes
            .map((pipe) => ({ ...pipe, x: pipe.x - GAME_SPEED }))
            .filter((pipe) => pipe.x > -PIPE_WIDTH);

          if (newPipes.length === 0 || newPipes[newPipes.length - 1].x < 250) {
            const randomHeight = Math.random() * (GAME_HEIGHT - PIPE_GAP - 100) + 50;
            newPipes.push({ x: 500, topHeight: randomHeight });
          }
          return newPipes;
        });

        setPipes((currentPipes) => {
           currentPipes.forEach(pipe => {
             if (pipe.x + GAME_SPEED >= 50 && pipe.x < 50) {
                setScore(s => s + 1);
             }
           });
           return currentPipes;
        });
      }, 24);
    }
    return () => clearInterval(timeId);
  }, [gameState, birdVelocity]);

  // Collision & High Score Update
  useEffect(() => {
    if (gameState !== "playing") return;

    if (birdPos < 0 || birdPos > GAME_HEIGHT - BIRD_SIZE) {
      triggerGameOver();
    }

    pipes.forEach((pipe) => {
      const birdLeft = 50;
      const birdRight = 50 + BIRD_SIZE;
      if (birdRight > pipe.x && birdLeft < pipe.x + PIPE_WIDTH) {
        if (birdPos < pipe.topHeight || birdPos + BIRD_SIZE > pipe.topHeight + PIPE_GAP) {
          triggerGameOver();
        }
      }
    });
  }, [birdPos, pipes, gameState]);

  const triggerGameOver = () => {
    setGameState("gameover");
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem("flappy_ane_highscore", score.toString());
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center overflow-hidden touch-none select-none" onClick={jump}>
      <div className="relative w-full max-w-lg bg-slate-900 border-y-4 border-teal-500/30 overflow-hidden" style={{ height: GAME_HEIGHT }}>
        
        {/* De Vogel */}
        <div
          className="absolute left-[50px] z-20 transition-transform"
          style={{ 
            top: birdPos, 
            width: BIRD_SIZE, 
            height: BIRD_SIZE,
            transform: `rotate(${birdVelocity * 3}deg)`
          }}
        >
         <Syringe className="w-full h-full -rotate-90 text-teal-400 drop-shadow-[0_0_8px_rgba(45,212,191,0.6)]" />
        </div>

        {/* De Obstakels */}
        {pipes.map((pipe, i) => (
          <div key={i} className="z-10">
            <div className="absolute top-0 bg-slate-100 border-b-8 border-slate-300 rounded-b-2xl" style={{ left: pipe.x, width: PIPE_WIDTH, height: pipe.topHeight }} />
            <div className="absolute bottom-0 bg-slate-100 border-t-8 border-slate-300 rounded-t-2xl" style={{ left: pipe.x, width: PIPE_WIDTH, height: GAME_HEIGHT - pipe.topHeight - PIPE_GAP }} />
          </div>
        ))}

        {/* Score Display */}
        {gameState === "playing" && (
          <div className="absolute top-10 left-1/2 -translate-x-1/2 text-6xl font-black text-white/20 pointer-events-none z-0">
            {score}
          </div>
        )}

        {/* Start scherm */}
        {gameState === "start" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 text-white z-30 text-center p-6">
             <Syringe className="w-16 h-16 mb-4 text-teal-400 -rotate-90 animate-bounce" />
             <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-2">Flappy Anesthetist</h1>
             <p className="text-xs uppercase tracking-[0.2em] text-teal-500 mb-8 font-bold">AZ Groeninge Edition</p>
             
             {highScore > 0 && (
               <div className="mb-8 flex items-center gap-2 text-orange-400 font-black uppercase text-sm border border-orange-400/30 px-4 py-2 rounded-full">
                 <Trophy className="h-4 w-4" /> Record: {highScore}
               </div>
             )}

             <Button size="lg" className="bg-teal-600 hover:bg-teal-700 font-bold px-12 py-6 text-xl rounded-2xl" onClick={(e) => { e.stopPropagation(); jump(); }}>
                START
             </Button>
          </div>
        )}

        {/* Game Over scherm */}
        {gameState === "gameover" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/90 text-white z-30 text-center p-6 animate-in fade-in zoom-in-95">
             <h2 className="text-4xl font-black uppercase mb-2 text-red-400 italic">DESATURATIE!</h2>
             <p className="text-lg font-bold mb-8 text-red-200/70 uppercase tracking-widest text-xs">Intubatie mislukt</p>
             
             <div className="grid grid-cols-2 gap-4 mb-8 w-full max-w-xs">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                   <p className="text-[10px] uppercase tracking-widest opacity-50 mb-1">Score</p>
                   <p className="text-4xl font-black">{score}</p>
                </div>
                <div className="bg-orange-500/10 p-4 rounded-2xl border border-orange-500/20">
                   <p className="text-[10px] uppercase tracking-widest text-orange-400 mb-1">Record</p>
                   <p className="text-4xl font-black text-orange-400">{highScore}</p>
                </div>
             </div>

             {score >= highScore && score > 0 && (
               <p className="mb-6 text-orange-400 font-black animate-bounce uppercase text-sm italic">🎉 Nieuw Dienst-Record!</p>
             )}

             <div className="flex flex-col gap-3 w-full max-w-xs">
                <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 font-black rounded-xl py-6" onClick={(e) => { e.stopPropagation(); resetGame(); }}>
                  <RotateCcw className="w-5 h-5 mr-2"/> OPNIEUW PROBEREN
                </Button>
                <Button variant="ghost" className="text-white/50 hover:text-white" asChild>
                    <Link href="/">TERUG NAAR OK-PROGRAMMA</Link>
                </Button>
             </div>
          </div>
        )}
      </div>
      <p className="text-slate-600 text-[10px] mt-4 uppercase font-bold tracking-[0.2em]">High Score wordt lokaal bewaard</p>
    </div>
  );
}