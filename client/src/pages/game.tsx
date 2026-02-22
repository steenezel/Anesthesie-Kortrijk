import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Syringe, RotateCcw, Trophy, Send, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";

const GRAVITY = 0.6;
const JUMP_STRENGTH = -8;
const GAME_SPEED = 3.5;
const PIPE_WIDTH = 60;
const PIPE_GAP = 170; 
const BIRD_SIZE = 40;
const GAME_HEIGHT = 500;

interface Pipe {
  x: number;
  topHeight: number;
  type: "teeth" | "slime";
  nextSpacing: number;
}

export default function GamePage() {
  const [birdPos, setBirdPos] = useState(GAME_HEIGHT / 2);
  const [birdVelocity, setBirdVelocity] = useState(0);
  const [pipes, setPipes] = useState<Pipe[]>([]);
  const [score, setScore] = useState(0);
  const [bgPos, setBgPos] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameState, setGameState] = useState<"start" | "playing" | "gameover">("start");
  const [globalCounter, setGlobalCounter] = useState(0);
  const [playerName, setPlayerName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [leaderboard, setLeaderboard] = useState<{member: string, score: number}[]>([]);

  // FETCH FUNCTIE: Haalt scores en globale teller op
  const fetchLeaderboard = useCallback(async () => {
    try {
      const resScores = await fetch("/api/highscores");
      if (resScores.ok) {
        const data = await resScores.json();
        setLeaderboard(Array.isArray(data) ? data : []);
      }
      const resStats = await fetch("/api/game-stats");
      if (resStats.ok) {
        const data = await resStats.json();
        setGlobalCounter(data.totalAttempts || 0);
      }
    } catch (err) {
      console.error("Data fetch error", err);
    }
  }, []);

  // INITIALISATIE: Bij het laden van de pagina
  useEffect(() => {
    const saved = localStorage.getItem("flappy_ane_highscore");
    if (saved) {
      setHighScore(parseInt(saved, 10));
    }
    fetchLeaderboard(); // Dit zorgt voor de 'Arcade' start
  }, [fetchLeaderboard]);

  // SCORE VERZENDEN: Enkel via de knop
  const submitScore = async () => {
    if (!playerName || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/highscores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: playerName.trim().toUpperCase(), 
          score: score 
        }),
      });

      if (res.ok) {
        setHasSubmitted(true);
        // Na verzenden direct de lijst verversen
        setTimeout(() => fetchLeaderboard(), 500); 
      }
    } catch (error) {
      console.error("Fout bij registreren:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerGameOver = useCallback(() => {
    setGameState("gameover");
    const savedScore = localStorage.getItem("flappy_ane_highscore");
    const currentBest = savedScore ? parseInt(savedScore, 10) : 0;

    if (score > currentBest) {
      setHighScore(score);
      localStorage.setItem("flappy_ane_highscore", score.toString());
    }

    fetch("/api/game-stats/increment", { method: "POST" }).then(() => fetchLeaderboard());
  }, [score, fetchLeaderboard]);

  const jump = useCallback(() => {
    if (gameState === "playing") {
      setBirdVelocity(JUMP_STRENGTH);
    } else if (gameState === "start") {
      setGameState("playing");
      setBirdVelocity(JUMP_STRENGTH);
      setHasSubmitted(false);
    }
  }, [gameState]);

  const resetGame = () => {
    setBirdPos(GAME_HEIGHT / 2);
    setBirdVelocity(0);
    setPipes([]);
    setScore(0);
    setGameState("start");
    setHasSubmitted(false);
    fetchLeaderboard(); // Update lijst bij terugkeer naar start
  };

  // GAME LOOP
  useEffect(() => {
    let timeId: NodeJS.Timeout;
    if (gameState === "playing") {
      timeId = setInterval(() => {
        setBirdPos((pos) => pos + birdVelocity);
        setBirdVelocity((vel) => vel + GRAVITY);
        setBgPos((prev) => (prev - (GAME_SPEED * 0.2)) % 1000); // Beweegt trager voor diepte
        setPipes((currentPipes) => {
          const movedPipes = currentPipes
            .map((pipe) => ({ ...pipe, x: pipe.x - GAME_SPEED }))
            .filter((pipe) => pipe.x > -PIPE_WIDTH);
          const lastPipe = movedPipes[movedPipes.length - 1];
          if (!lastPipe || lastPipe.x < (550 - lastPipe.nextSpacing)) {
            const randomHeight = Math.random() * (GAME_HEIGHT - PIPE_GAP - 100) + 50;
            movedPipes.push({ 
              x: 550, 
              topHeight: randomHeight, 
              type: Math.random() < 0.3 ? "slime" : "teeth",
              nextSpacing: Math.random() * 150 + 200 
            });
          }
          return movedPipes;
        });
        setPipes((currentPipes) => {
          currentPipes.forEach(pipe => {
            if (pipe.x + GAME_SPEED >= 50 && pipe.x < 50) setScore(s => s + 1);
          });
          return currentPipes;
        });
      }, 24);
    }
    return () => clearInterval(timeId);
  }, [gameState, birdVelocity]);

  // COLLISION
  useEffect(() => {
    if (gameState !== "playing") return;
    if (birdPos < 0 || birdPos > GAME_HEIGHT - BIRD_SIZE) triggerGameOver();
    pipes.forEach((pipe) => {
      if (70 > pipe.x && 50 < pipe.x + PIPE_WIDTH) {
        if (birdPos < pipe.topHeight || birdPos + BIRD_SIZE > pipe.topHeight + PIPE_GAP) triggerGameOver();
      }
    });
  }, [birdPos, pipes, gameState, triggerGameOver]);

  return (
  <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center overflow-hidden touch-none select-none" onClick={jump}>
    <div className="relative w-full max-w-lg bg-slate-900 border-y-4 border-teal-500/30 overflow-hidden shadow-2xl" style={{ height: GAME_HEIGHT }}>
      
      {/* PARALLAX ACHTERGROND (De "Luchtweg" wand) */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{ 
          backgroundImage: `radial-gradient(circle at 20px 20px, #334155 2px, transparent 0)`,
          backgroundSize: '40px 40px',
          transform: `translateX(${bgPos}px)`
        }}
      />
     {/* VAGE ECG-LIJNEN (Ononderbroken loop) */}
<div 
  className="absolute inset-0 opacity-15 pointer-events-none"
  style={{ 
    // We gebruiken bgPos om de lijn te verschuiven
    transform: `translateX(${bgPos % 500}px)`, 
    width: '200%', // Genoeg ruimte voor twee patronen
    display: 'flex'
  }}
>
  <svg width="1000" height="500" viewBox="0 0 1000 500" preserveAspectRatio="none" className="flex-none">
    <path 
      // Dit pad bevat nu TWEE keer hetzelfde ritme achter elkaar (0-500 en 500-1000)
      d="M0 300 L100 300 L110 280 L120 320 L130 300 L200 300 L210 200 L225 400 L240 300 L350 300 L360 290 L370 310 L380 300 L500 300 
         L600 300 L610 280 L620 320 L630 300 L700 300 L710 200 L725 400 L740 300 L850 300 L860 290 L870 310 L880 300 L1000 300" 
      stroke="#2dd4bf" strokeWidth="3" fill="none"
    />
  </svg>
</div>
      {/* De Spuit (De Bird) */}
      <div className="absolute left-[50px] z-30" style={{ top: birdPos, width: BIRD_SIZE, height: BIRD_SIZE, transform: `rotate(${birdVelocity * 3}deg)` }}>
        <Syringe className="w-full h-full -rotate-90 text-teal-400 drop-shadow-[0_0_12px_rgba(45,212,191,0.8)]" />
      </div>

      {/* ANATOMISCHE OBSTAKELS */}
      {pipes.map((pipe, i) => (
        <div key={i} className="z-20">
          {/* BOVEN: DE TANDEN */}
          <div 
            className="absolute top-0 bg-slate-100 border-b-4 border-slate-300 shadow-[inset_0_-10px_10px_rgba(0,0,0,0.1)]" 
            style={{ 
              left: pipe.x, 
              width: PIPE_WIDTH, 
              height: pipe.topHeight,
              clipPath: 'polygon(0% 0%, 100% 0%, 100% 93%, 85% 98%, 75% 92%, 65% 99%, 50% 91%, 35% 97%, 25% 94%, 15% 98%, 0% 90%)'
            }} 
          />
          
      {/* ONDER: NU OOK TANDEN (Gespiegeld) */}
          <div 
            className={`absolute bottom-0 shadow-lg ${pipe.type === "slime" ? "bg-teal-300 border-emerald-600" : "bg-rose-300 border-rose-500"}`} 
            style={{ 
              left: pipe.x, 
              width: PIPE_WIDTH, 
              height: GAME_HEIGHT - pipe.topHeight - PIPE_GAP,
              // Gespiegelde polygon voor de onderste tanden
              clipPath: 'polygon(0% 10%, 15% 2%, 25% 5%, 35% 3%, 50% 8%, 65% 2%, 75% 5%, 85% 2%, 100% 7%, 100% 100%, 0% 100%)'
            }} 
          />
        </div>
      ))}

      {/* Score-weergave tijdens spelen */}
      {gameState === "playing" && (
        <div className="absolute top-10 left-1/2 -translate-x-1/2 text-8xl font-black text-white/10 z-0">
          {score}
        </div>
      )}

        {/* START SCHERM (ARCADE STYLE) */}
        {gameState === "start" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/95 text-white z-30 text-center p-6 overflow-y-auto">
             <Syringe className="w-12 h-12 mb-4 text-teal-400 -rotate-90 animate-bounce" />
             <h1 className="text-3xl font-black uppercase italic tracking-tighter mb-6 text-teal-400">Flappy Anesthetist</h1>
             
             <Button size="lg" className="bg-teal-600 hover:bg-teal-700 font-bold px-12 py-6 text-xl rounded-2xl mb-8" onClick={(e) => { e.stopPropagation(); jump(); }}>
               START INTUBATIE
             </Button>

             <div className="w-full max-w-xs bg-black/30 rounded-2xl p-4 border border-white/5 shadow-xl">
               <div className="flex items-center gap-2 mb-3 justify-center text-orange-400">
                 <Trophy className="h-4 w-4" />
                 <span className="text-[10px] font-black uppercase tracking-[0.2em]">Dienst Top 5</span>
               </div>
               
               <div className="space-y-2 mb-4">
                 {leaderboard.length > 0 ? leaderboard.slice(0, 5).map((entry, idx) => (
                   <div key={idx} className="flex justify-between items-center text-xs border-b border-white/5 pb-1 last:border-0">
                     <span className="font-bold w-4 text-slate-400">{idx + 1}.</span>
                     <span className="flex-1 text-left px-2 font-medium truncate uppercase">{entry.member}</span>
                     <span className="font-black text-teal-400">{entry.score}</span>
                   </div>
                 )) : <p className="text-[10px] opacity-30 italic">Nog geen data in dossier...</p>}
               </div>

               <div className="pt-3 border-t border-white/10">
                 <p className="text-[8px] font-black uppercase tracking-[0.2em] text-teal-500/60 mb-1">Totaal OK-pogingen</p>
                 <p className="text-lg font-black text-teal-400">{globalCounter.toLocaleString('nl-BE')}</p>
               </div>
             </div>
          </div>
        )}

        {/* GAME OVER SCHERM */}
        {gameState === "gameover" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/95 text-white z-30 text-center p-6" onClick={(e) => e.stopPropagation()}>
             <h2 className="text-4xl font-black uppercase mb-2 text-red-400">Boeken Toe!</h2>
             <div className="grid grid-cols-2 gap-4 mb-6 w-full max-w-xs">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                   <p className="text-[10px] opacity-50 mb-1">Score</p>
                   <p className="text-4xl font-black">{score}</p>
                </div>
                <div className="bg-orange-500/10 p-4 rounded-2xl border border-orange-500/20">
                   <p className="text-[10px] text-orange-400 mb-1">Record</p>
                   <p className="text-4xl font-black text-orange-400">{highScore}</p>
                </div>
             </div>

             {!hasSubmitted && score > 0 ? (
               <div className="w-full max-w-xs bg-white/5 p-5 rounded-3xl border border-white/10 mb-6">
                 <p className="text-[10px] font-black uppercase tracking-widest text-teal-400 mb-3">Registreer in dossier</p>
                 <div className="flex gap-2">
                   <Input 
                    placeholder="Initialen" 
                    className="bg-black/20 border-white/10 text-white uppercase font-bold"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value.slice(0, 10))}
                   />
                   <Button className="bg-teal-600 hover:bg-teal-700" disabled={!playerName || isSubmitting} onClick={submitScore}>
                     {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                   </Button>
                 </div>
               </div>
             ) : hasSubmitted && (
               <div className="mb-6 py-3 px-6 bg-teal-500/20 border border-teal-500/30 rounded-full">
                 <p className="text-teal-400 text-xs font-black uppercase tracking-widest">✅ Geregistreerd</p>
               </div>
             )}

             <div className="flex flex-col gap-3 w-full max-w-xs">
                <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 font-black rounded-xl py-6" onClick={resetGame}>
                  <RotateCcw className="w-5 h-5 mr-2"/> NIEUWE POGING
                </Button>
                <Button variant="ghost" className="text-white/50 hover:text-white uppercase text-[10px] font-bold tracking-widest" asChild>
                    <Link href="/">Afsluiten</Link>
                </Button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}