import { useState, useEffect, useCallback, useRef } from 'react';
import Bubble from './Bubble';

const GAME_DURATION = 30;
const SPAWN_INTERVAL = 800;
const MIN_SIZE = 40;
const MAX_SIZE = 90;

function createBubble() {
  const size = MIN_SIZE + Math.random() * (MAX_SIZE - MIN_SIZE);
  return {
    id: crypto.randomUUID(),
    x: 5 + Math.random() * 85,
    y: 5 + Math.random() * 85,
    size,
    colorIndex: Math.floor(Math.random() * 10),
    isPopping: false,
  };
}

export default function App() {
  const [gameState, setGameState] = useState('idle'); // idle | playing | ended
  const [bubbles, setBubbles] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const spawnRef = useRef(null);
  const timerRef = useRef(null);

  const stopGame = useCallback(() => {
    clearInterval(spawnRef.current);
    clearInterval(timerRef.current);
    setGameState('ended');
    setBubbles([]);
  }, []);

  const startGame = useCallback(() => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setBubbles([createBubble()]);
    setGameState('playing');
  }, []);

  useEffect(() => {
    if (gameState !== 'playing') return;

    spawnRef.current = setInterval(() => {
      setBubbles((prev) => [...prev, createBubble()]);
    }, SPAWN_INTERVAL);

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          stopGame();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      clearInterval(spawnRef.current);
      clearInterval(timerRef.current);
    };
  }, [gameState, stopGame]);

  const handlePop = useCallback((id) => {
    setBubbles((prev) =>
      prev.map((b) => (b.id === id ? { ...b, isPopping: true } : b))
    );
    setScore((s) => s + 1);
    setTimeout(() => {
      setBubbles((prev) => prev.filter((b) => b.id !== id));
    }, 150);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-900 via-indigo-900 to-purple-900 flex flex-col items-center">
      {/* Header */}
      <header className="w-full flex items-center justify-between px-8 py-4 bg-black/30 backdrop-blur-sm">
        <h1 className="text-3xl font-bold text-white tracking-wide">
          🫧 Bubble Rush
        </h1>
        <div className="flex gap-6 items-center">
          {gameState === 'playing' && (
            <>
              <div className="text-center">
                <p className="text-xs text-sky-300 uppercase tracking-widest">Score</p>
                <p className="text-2xl font-bold text-white">{score}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-sky-300 uppercase tracking-widest">Time</p>
                <p className={`text-2xl font-bold ${timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                  {timeLeft}s
                </p>
              </div>
            </>
          )}
          {gameState !== 'playing' && score > 0 && (
            <div className="text-center">
              <p className="text-xs text-sky-300 uppercase tracking-widest">Last Score</p>
              <p className="text-2xl font-bold text-white">{score}</p>
            </div>
          )}
        </div>
      </header>

      {/* Game area */}
      <div className="relative flex-1 w-full overflow-hidden">
        {gameState === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
            <div className="text-center">
              <p className="text-6xl mb-4">🫧</p>
              <h2 className="text-4xl font-bold text-white mb-2">Welcome to Bubble Rush!</h2>
              <p className="text-sky-300 text-lg">Click the bubbles as fast as you can before time runs out!</p>
            </div>
            <button
              onClick={startGame}
              className="px-10 py-4 bg-sky-500 hover:bg-sky-400 text-white font-bold text-xl rounded-full shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Start Game
            </button>
          </div>
        )}

        {gameState === 'ended' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-10 text-center shadow-2xl border border-white/20">
              <p className="text-5xl mb-4">🎉</p>
              <h2 className="text-4xl font-bold text-white mb-2">Time&apos;s Up!</h2>
              <p className="text-sky-300 text-lg mb-6">You popped</p>
              <p className="text-7xl font-black text-yellow-400 mb-2">{score}</p>
              <p className="text-2xl text-white mb-8">
                {score === 1 ? 'bubble' : 'bubbles'}!
              </p>
              <button
                onClick={startGame}
                className="px-10 py-4 bg-sky-500 hover:bg-sky-400 text-white font-bold text-xl rounded-full shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Play Again
              </button>
            </div>
          </div>
        )}

        {gameState === 'playing' &&
          bubbles.map((bubble) => (
            <Bubble key={bubble.id} {...bubble} onPop={handlePop} />
          ))}
      </div>
    </div>
  );
}
