import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Coins, Heart, ShieldAlert, ShoppingBag, Trophy } from 'lucide-react';
import Bubble from './Bubble';
import Shop from './Shop';
import { UPGRADES } from './upgrades';

const MIN_SIZE = 38;
const MAX_SIZE = 88;
const LEVEL_COUNT = 10;
const LEVEL_DURATION = 15;
const STAGE_PROGRESS_KEY = 'brStageProgress';
const STAGE_SELECTION_KEY = 'brSelectedStage';

const LEVEL_CONFIG = [
  { durationMult: 3.0, spawnMs: 1400 },
  { durationMult: 2.4, spawnMs: 1100 },
  { durationMult: 2.0, spawnMs: 880 },
  { durationMult: 1.6, spawnMs: 700 },
  { durationMult: 1.3, spawnMs: 560 },
  { durationMult: 1.05, spawnMs: 430 },
  { durationMult: 0.85, spawnMs: 330 },
  { durationMult: 0.65, spawnMs: 250 },
  { durationMult: 0.5, spawnMs: 195 },
  { durationMult: 0.38, spawnMs: 150 },
];

const DEFAULT_UPGRADES = { slow: 0, boost: 0, magnet: 0, auto: 0, factory: 0, lives: 0 };

const STAGES = [
  {
    id: 'lagoon',
    order: 1,
    name: 'Coral Lagoon',
    strap: 'Warm shallows with easy reads and bright glassy bubbles.',
    actionLabel: 'Enter Lagoon',
    background: 'linear-gradient(135deg, #082f49 0%, #0f766e 38%, #f97316 100%)',
    shellGlow: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.18), transparent 55%)',
    accents: [
      { size: 260, left: '-6%', top: '8%', color: 'rgba(45, 212, 191, 0.20)', blur: 0, delay: '0s' },
      { size: 320, right: '-8%', bottom: '-6%', color: 'rgba(251, 146, 60, 0.18)', blur: 0, delay: '1.6s' },
      { size: 180, left: '18%', bottom: '10%', color: 'rgba(125, 211, 252, 0.16)', blur: 8, delay: '0.8s' },
    ],
    bubbleModels: [
      {
        key: 'coral-glass',
        fill: 'radial-gradient(circle at 30% 28%, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.28) 18%, rgba(125,211,252,0.95) 48%, rgba(14,116,144,0.96) 100%)',
        glow: 'rgba(56, 189, 248, 0.46)',
        rim: 'rgba(255,255,255,0.34)',
        core: 'rgba(224, 242, 254, 0.58)',
        sparkle: 'rgba(255,255,255,0.85)',
      },
      {
        key: 'sunset-pearl',
        fill: 'radial-gradient(circle at 32% 28%, rgba(255,255,255,0.9) 0%, rgba(254,215,170,0.55) 22%, rgba(251,146,60,0.95) 58%, rgba(194,65,12,0.96) 100%)',
        glow: 'rgba(249, 115, 22, 0.42)',
        rim: 'rgba(255,255,255,0.26)',
        core: 'rgba(255,237,213,0.45)',
        sparkle: 'rgba(255,247,237,0.82)',
      },
      {
        key: 'mint-pearl',
        fill: 'radial-gradient(circle at 32% 28%, rgba(255,255,255,0.9) 0%, rgba(209,250,229,0.45) 20%, rgba(74,222,128,0.92) 52%, rgba(5,150,105,0.96) 100%)',
        glow: 'rgba(16, 185, 129, 0.42)',
        rim: 'rgba(255,255,255,0.28)',
        core: 'rgba(236,253,245,0.48)',
        sparkle: 'rgba(236,253,245,0.8)',
      },
    ],
  },
  {
    id: 'reef',
    order: 2,
    name: 'Neon Reef',
    strap: 'Electric currents, sharper contrast, and nightclub reflections.',
    actionLabel: 'Enter Reef',
    background: 'linear-gradient(135deg, #111827 0%, #312e81 34%, #1d4ed8 62%, #06b6d4 100%)',
    shellGlow: 'radial-gradient(circle at 15% 18%, rgba(255,255,255,0.14), transparent 58%)',
    accents: [
      { size: 240, left: '8%', top: '-4%', color: 'rgba(129, 140, 248, 0.22)', blur: 6, delay: '0.4s' },
      { size: 360, right: '-10%', top: '12%', color: 'rgba(6, 182, 212, 0.18)', blur: 10, delay: '1.2s' },
      { size: 220, right: '20%', bottom: '-6%', color: 'rgba(244, 114, 182, 0.16)', blur: 12, delay: '2s' },
    ],
    bubbleModels: [
      {
        key: 'neon-violet',
        fill: 'radial-gradient(circle at 28% 24%, rgba(255,255,255,0.88) 0%, rgba(233,213,255,0.28) 18%, rgba(168,85,247,0.94) 48%, rgba(76,29,149,0.98) 100%)',
        glow: 'rgba(168, 85, 247, 0.48)',
        rim: 'rgba(255,255,255,0.25)',
        core: 'rgba(243,232,255,0.52)',
        sparkle: 'rgba(250,245,255,0.88)',
        ring: 'rgba(244,114,182,0.38)',
      },
      {
        key: 'laser-cyan',
        fill: 'radial-gradient(circle at 34% 26%, rgba(255,255,255,0.9) 0%, rgba(165,243,252,0.32) 16%, rgba(34,211,238,0.94) 48%, rgba(8,47,73,0.98) 100%)',
        glow: 'rgba(34, 211, 238, 0.48)',
        rim: 'rgba(255,255,255,0.28)',
        core: 'rgba(236,254,255,0.46)',
        sparkle: 'rgba(236,254,255,0.88)',
        ring: 'rgba(56,189,248,0.34)',
      },
      {
        key: 'pulse-pink',
        fill: 'radial-gradient(circle at 30% 24%, rgba(255,255,255,0.9) 0%, rgba(251,207,232,0.3) 18%, rgba(244,114,182,0.95) 52%, rgba(131,24,67,0.98) 100%)',
        glow: 'rgba(244, 114, 182, 0.44)',
        rim: 'rgba(255,255,255,0.24)',
        core: 'rgba(253,242,248,0.42)',
        sparkle: 'rgba(255,241,242,0.86)',
        ring: 'rgba(251,146,60,0.3)',
      },
    ],
  },
  {
    id: 'trench',
    order: 3,
    name: 'Midnight Trench',
    strap: 'Heavy water, dim bioluminescence, and darker bubble silhouettes.',
    actionLabel: 'Enter Trench',
    background: 'linear-gradient(160deg, #020617 0%, #172554 34%, #0f172a 65%, #164e63 100%)',
    shellGlow: 'radial-gradient(circle at 18% 20%, rgba(255,255,255,0.12), transparent 56%)',
    accents: [
      { size: 280, left: '-2%', bottom: '-10%', color: 'rgba(14, 165, 233, 0.16)', blur: 10, delay: '0.6s' },
      { size: 340, right: '-8%', top: '-2%', color: 'rgba(20, 184, 166, 0.14)', blur: 14, delay: '1.7s' },
      { size: 190, left: '28%', top: '14%', color: 'rgba(59, 130, 246, 0.16)', blur: 6, delay: '2.4s' },
    ],
    bubbleModels: [
      {
        key: 'abyss-blue',
        fill: 'radial-gradient(circle at 28% 24%, rgba(255,255,255,0.82) 0%, rgba(191,219,254,0.22) 16%, rgba(30,64,175,0.9) 46%, rgba(2,6,23,0.98) 100%)',
        glow: 'rgba(37, 99, 235, 0.34)',
        rim: 'rgba(191,219,254,0.18)',
        core: 'rgba(219,234,254,0.3)',
        sparkle: 'rgba(255,255,255,0.74)',
        ring: 'rgba(34,211,238,0.22)',
      },
      {
        key: 'deep-teal',
        fill: 'radial-gradient(circle at 30% 26%, rgba(255,255,255,0.82) 0%, rgba(153,246,228,0.2) 18%, rgba(13,148,136,0.88) 50%, rgba(4,47,46,0.98) 100%)',
        glow: 'rgba(20, 184, 166, 0.3)',
        rim: 'rgba(204,251,241,0.16)',
        core: 'rgba(204,251,241,0.22)',
        sparkle: 'rgba(240,253,250,0.74)',
        ring: 'rgba(125,211,252,0.18)',
      },
      {
        key: 'ember-vent',
        fill: 'radial-gradient(circle at 32% 26%, rgba(255,255,255,0.82) 0%, rgba(254,215,170,0.16) 18%, rgba(249,115,22,0.82) 48%, rgba(67,20,7,0.98) 100%)',
        glow: 'rgba(249, 115, 22, 0.3)',
        rim: 'rgba(255,237,213,0.16)',
        core: 'rgba(255,237,213,0.18)',
        sparkle: 'rgba(255,247,237,0.72)',
        ring: 'rgba(251,191,36,0.14)',
      },
    ],
  },
];

function loadStageProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(STAGE_PROGRESS_KEY) || '{}');
    const completed = Array.isArray(saved.completed) ? saved.completed.filter((id) => typeof id === 'string') : [];
    return { completed };
  } catch {
    return { completed: [] };
  }
}

function getUnlockedStageIds(progress) {
  return STAGES.filter((stage, index) => index === 0 || progress.completed.includes(STAGES[index - 1].id)).map((stage) => stage.id);
}

function getStageById(stageId) {
  return STAGES.find((stage) => stage.id === stageId) || STAGES[0];
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function createCrossBubble(W, H) {
  const size = MIN_SIZE + Math.random() * (MAX_SIZE - MIN_SIZE);
  const sizeRatio = (size - MIN_SIZE) / (MAX_SIZE - MIN_SIZE);
  const basePoints = Math.max(1, Math.round(5 - sizeRatio * 4));
  const edge = Math.floor(Math.random() * 4);
  const safeH = Math.max(0, H - size);
  const spanW = W + size;
  const randomX = () => Math.random() * spanW - size;

  let startX;
  let startY;
  let endX;
  let endY;

  switch (edge) {
    case 0:
      startX = -size;
      startY = Math.random() * safeH;
      endX = W + size;
      endY = Math.random() * safeH;
      break;
    case 1:
      startX = W + size;
      startY = Math.random() * safeH;
      endX = -size;
      endY = Math.random() * safeH;
      break;
    case 2:
      startX = randomX();
      startY = -size;
      endX = randomX();
      endY = H + size;
      break;
    default:
      startX = randomX();
      startY = H + size;
      endX = randomX();
      endY = -size;
      break;
  }

  return { size, basePoints, startX, startY, endX, endY, motionType: 'cross' };
}

function createVerticalBubble(W, H, direction) {
  const size = MIN_SIZE + Math.random() * (MAX_SIZE - MIN_SIZE);
  const sizeRatio = (size - MIN_SIZE) / (MAX_SIZE - MIN_SIZE);
  const basePoints = Math.max(1, Math.round(5 - sizeRatio * 4));
  const startX = Math.random() * (W + size) - size;
  const driftX = randomBetween(-Math.min(120, W * 0.16), Math.min(120, W * 0.16));
  const clampedMidX = Math.min(Math.max(startX + driftX, -size), W);
  const endX = Math.min(Math.max(startX - driftX * 0.55, -size), W);

  if (direction === 'up') {
    return {
      size,
      basePoints,
      startX,
      startY: H + size,
      endX,
      endY: -size,
      midX: clampedMidX,
      midY: H * randomBetween(0.26, 0.58),
      motionType: 'drift',
    };
  }

  return {
    size,
    basePoints,
    startX,
    startY: -size,
    endX,
    endY: H + size,
    midX: clampedMidX,
    midY: H * randomBetween(0.42, 0.76),
    motionType: 'drift',
  };
}

function createBubble(durationMultiplier, W, H, stage) {
  const roll = Math.random();
  const path = roll < 0.2
    ? createVerticalBubble(W, H, 'up')
    : roll < 0.36
      ? createVerticalBubble(W, H, 'down')
      : createCrossBubble(W, H);

  const duration = (5 + Math.random() * 7) * durationMultiplier * (path.motionType === 'drift' ? 1.08 : 1);
  const totalRotation = Math.round((Math.random() - 0.5) * 540);
  const model = stage.bubbleModels[Math.floor(Math.random() * stage.bubbleModels.length)];

  return {
    id: crypto.randomUUID(),
    size: path.size,
    isPopping: false,
    basePoints: path.basePoints,
    startX: path.startX,
    startY: path.startY,
    endX: path.endX,
    endY: path.endY,
    midX: path.midX,
    midY: path.midY,
    totalRotation,
    duration,
    motionType: path.motionType,
    bobDelay: `${randomBetween(0, 1.8).toFixed(2)}s`,
    bubbleStyle: model,
  };
}

function StageCard({ stage, isSelected, isLocked, isCompleted, onSelect }) {
  return (
    <button
      type="button"
      disabled={isLocked}
      onClick={() => !isLocked && onSelect(stage.id)}
      className={`relative overflow-hidden rounded-4xl border text-left transition-all duration-200 ${
        isLocked
          ? 'cursor-not-allowed border-white/8 bg-black/20 opacity-65'
          : isSelected
            ? 'border-white/40 bg-white/[0.14] shadow-2xl shadow-black/30'
            : 'border-white/12 bg-white/[0.07] hover:bg-white/12'
      }`}
      style={{ minHeight: '13rem' }}
    >
      <div className="absolute inset-0" style={{ background: stage.background, opacity: isLocked ? 0.28 : 0.88 }} />
      <div className="absolute inset-0" style={{ background: stage.shellGlow }} />
      {stage.accents.map((accent, index) => (
        <div
          key={`${stage.id}-${index}`}
          className="absolute rounded-full"
          style={{
            width: accent.size,
            height: accent.size,
            left: accent.left,
            right: accent.right,
            top: accent.top,
            bottom: accent.bottom,
            background: accent.color,
            filter: `blur(${accent.blur}px)`,
            animation: `ambient-float 7.5s ease-in-out ${accent.delay} infinite`,
          }}
        />
      ))}
      <div className="relative flex h-full flex-col justify-between p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[0.7rem] font-black uppercase tracking-[0.35em] text-white/55">Stage {stage.order}</p>
            <h3 className="mt-2 text-2xl font-black text-white">{stage.name}</h3>
          </div>
          {isCompleted && <span className="rounded-full bg-emerald-400/18 px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-emerald-200">Cleared</span>}
          {isLocked && <span className="rounded-full bg-black/40 px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-white/75">Locked</span>}
        </div>

        <div>
          <p className="max-w-xs text-sm leading-relaxed text-white/82">{stage.strap}</p>
          <div className="mt-4 flex items-center justify-between text-sm font-semibold text-white/78">
            <span>{isLocked ? 'Complete the previous stage first' : stage.actionLabel}</span>
            {isSelected && !isLocked && <span className="rounded-full border border-white/24 px-3 py-1 text-[0.72rem] uppercase tracking-[0.24em]">Selected</span>}
          </div>
        </div>
      </div>
    </button>
  );
}

export default function App() {
  const [gameState, setGameState] = useState('idle');
  const [bubbles, setBubbles] = useState([]);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [levelTimer, setLevelTimer] = useState(LEVEL_DURATION);
  const [lifeFlash, setLifeFlash] = useState(false);
  const [points, setPoints] = useState(() => parseInt(localStorage.getItem('brPoints') || '0', 10));
  const [upgrades, setUpgrades] = useState(() => {
    try {
      return { ...DEFAULT_UPGRADES, ...JSON.parse(localStorage.getItem('brUpgrades') || '{}') };
    } catch {
      return { ...DEFAULT_UPGRADES };
    }
  });
  const [scorePopups, setScorePopups] = useState([]);
  const [shopOpen, setShopOpen] = useState(false);
  const [stageProgress, setStageProgress] = useState(() => loadStageProgress());
  const [selectedStageId, setSelectedStageId] = useState(() => {
    const saved = localStorage.getItem(STAGE_SELECTION_KEY);
    return saved || STAGES[0].id;
  });
  const [activeStageId, setActiveStageId] = useState(STAGES[0].id);

  const upgradesRef = useRef(upgrades);
  const pointsRef = useRef(points);
  const gameStateRef = useRef('idle');
  const levelRef = useRef(1);
  const levelTimerRef = useRef(LEVEL_DURATION);
  const selectedStageRef = useRef(STAGES[0].id);
  const gameAreaRef = useRef(null);

  useEffect(() => {
    upgradesRef.current = upgrades;
  }, [upgrades]);

  useEffect(() => {
    pointsRef.current = points;
  }, [points]);

  useEffect(() => {
    localStorage.setItem('brPoints', String(points));
  }, [points]);

  useEffect(() => {
    localStorage.setItem('brUpgrades', JSON.stringify(upgrades));
  }, [upgrades]);

  useEffect(() => {
    localStorage.setItem(STAGE_PROGRESS_KEY, JSON.stringify(stageProgress));
  }, [stageProgress]);

  const unlockedStageIds = useMemo(() => getUnlockedStageIds(stageProgress), [stageProgress]);
  const effectiveSelectedStageId = unlockedStageIds.includes(selectedStageId) ? selectedStageId : unlockedStageIds[0];
  const selectedStage = useMemo(() => getStageById(effectiveSelectedStageId), [effectiveSelectedStageId]);
  const activeStage = useMemo(() => getStageById(activeStageId), [activeStageId]);
  const displayStage = gameState === 'idle' ? selectedStage : activeStage;
  const hasNextStage = activeStage.order < STAGES.length;
  const maxLives = 3 + (upgrades.lives || 0);

  useEffect(() => {
    selectedStageRef.current = effectiveSelectedStageId;
  }, [effectiveSelectedStageId]);

  useEffect(() => {
    localStorage.setItem(STAGE_SELECTION_KEY, effectiveSelectedStageId);
  }, [effectiveSelectedStageId]);

  const getGameAreaSize = () => {
    const rect = gameAreaRef.current?.getBoundingClientRect();
    return { W: rect?.width ?? window.innerWidth, H: rect?.height ?? window.innerHeight - 80 };
  };

  const returnToMenu = useCallback(() => {
    gameStateRef.current = 'idle';
    setBubbles([]);
    setScorePopups([]);
    setLifeFlash(false);
    setGameState('idle');
  }, []);

  const startGame = useCallback(() => {
    const startingLives = 3 + (upgradesRef.current.lives || 0);
    const stageId = effectiveSelectedStageId;
    gameStateRef.current = 'playing';
    levelRef.current = 1;
    levelTimerRef.current = LEVEL_DURATION;

    setActiveStageId(stageId);
    setLevel(1);
    setLives(startingLives);
    setLevelTimer(LEVEL_DURATION);
    setLifeFlash(false);
    setBubbles([]);
    setScorePopups([]);
    setGameState('playing');
  }, [effectiveSelectedStageId]);

  useEffect(() => {
    if (gameState !== 'playing') return undefined;

    const id = setInterval(() => {
      levelTimerRef.current -= 1;
      setLevelTimer(levelTimerRef.current);

      if (levelTimerRef.current <= 0) {
        const nextLevel = levelRef.current + 1;

        if (nextLevel > LEVEL_COUNT) {
          const clearedStageId = selectedStageRef.current;
          const clearedStageIndex = STAGES.findIndex((stage) => stage.id === clearedStageId);
          const nextStage = STAGES[clearedStageIndex + 1];

          gameStateRef.current = 'victory';
          setBubbles([]);
          setScorePopups([]);
          setStageProgress((prev) => {
            if (prev.completed.includes(clearedStageId)) return prev;
            return { ...prev, completed: [...prev.completed, clearedStageId] };
          });
          if (nextStage) {
            setSelectedStageId(nextStage.id);
          }
          setGameState('victory');
        } else {
          levelRef.current = nextLevel;
          levelTimerRef.current = LEVEL_DURATION;
          setLevel(nextLevel);
          setLevelTimer(LEVEL_DURATION);
        }
      }
    }, 1000);

    return () => clearInterval(id);
  }, [gameState]);

  useEffect(() => {
    if (gameState !== 'playing') return undefined;

    const config = LEVEL_CONFIG[level - 1];
    const durationMult = config.durationMult * (1 + (upgrades.slow || 0) * 0.15);
    const spawnMs = Math.max(140, config.spawnMs + (upgrades.factory || 0) * 150);
    const stage = getStageById(selectedStageRef.current);

    const { W, H } = getGameAreaSize();
    setBubbles((prev) => [...prev, createBubble(durationMult, W, H, stage)]);

    const id = setInterval(() => {
      if (gameStateRef.current !== 'playing') return;
      const { W: width, H: height } = getGameAreaSize();
      setBubbles((prev) => [...prev, createBubble(durationMult, width, height, stage)]);
    }, spawnMs);

    return () => clearInterval(id);
  }, [gameState, level, upgrades.slow, upgrades.factory]);

  useEffect(() => {
    if (gameState !== 'playing' || upgrades.auto === 0) return undefined;
    const fireEveryMs = Math.round(1000 / upgrades.auto);

    const id = setInterval(() => {
      setBubbles((prev) => {
        const target = prev.find((bubble) => !bubble.isPopping);
        if (!target) return prev;

        const earned = Math.round(target.basePoints * Math.pow(1.5, upgradesRef.current.boost));
        pointsRef.current += earned;
        setPoints(pointsRef.current);

        setTimeout(() => setBubbles((current) => current.filter((bubble) => bubble.id !== target.id)), 220);
        return prev.map((bubble) => (bubble.id === target.id ? { ...bubble, isPopping: true } : bubble));
      });
    }, fireEveryMs);

    return () => clearInterval(id);
  }, [gameState, upgrades.auto]);

  const handlePop = useCallback((id, basePoints, clientX, clientY) => {
    setBubbles((prev) => {
      const bubble = prev.find((item) => item.id === id);
      if (!bubble || bubble.isPopping) return prev;
      return prev.map((item) => (item.id === id ? { ...item, isPopping: true } : item));
    });

    const earned = Math.round(basePoints * Math.pow(1.5, upgradesRef.current.boost));
    pointsRef.current += earned;
    setPoints(pointsRef.current);

    const popupId = crypto.randomUUID();
    setScorePopups((prev) => [...prev, { id: popupId, x: clientX, y: clientY, points: earned }]);
    setTimeout(() => setScorePopups((prev) => prev.filter((popup) => popup.id !== popupId)), 850);
    setTimeout(() => setBubbles((prev) => prev.filter((bubble) => bubble.id !== id)), 220);
  }, []);

  const handleExpire = useCallback((id) => {
    if (gameStateRef.current !== 'playing') return;
    setBubbles((prev) => prev.filter((bubble) => bubble.id !== id));

    setLives((prev) => {
      const next = prev - 1;
      if (next <= 0) {
        gameStateRef.current = 'gameover';
        setBubbles([]);
        setScorePopups([]);
        setGameState('gameover');
        return 0;
      }
      setLifeFlash(true);
      setTimeout(() => setLifeFlash(false), 600);
      return next;
    });
  }, []);

  const handleBuy = useCallback((key) => {
    const upgrade = UPGRADES.find((item) => item.key === key);
    if (!upgrade) return;
    const currentLevel = upgradesRef.current[key] || 0;
    if (currentLevel >= upgrade.maxLevel) return;
    const cost = upgrade.costs[currentLevel];
    if (pointsRef.current < cost) return;

    pointsRef.current -= cost;
    setPoints(pointsRef.current);
    setUpgrades((prev) => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
  }, []);

  const hoverRadius = (upgrades.magnet || 0) * 12;
  const runProgress = ((level - 1) + (LEVEL_DURATION - levelTimer) / LEVEL_DURATION) / LEVEL_COUNT;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: displayStage.background }}>
      <div className="relative flex min-h-screen flex-col overflow-hidden">
        <div className="absolute inset-0" style={{ background: displayStage.shellGlow }} />
        {displayStage.accents.map((accent, index) => (
          <div
            key={`shell-${displayStage.id}-${index}`}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: accent.size,
              height: accent.size,
              left: accent.left,
              right: accent.right,
              top: accent.top,
              bottom: accent.bottom,
              background: accent.color,
              filter: `blur(${accent.blur}px)`,
              animation: `ambient-float 9s ease-in-out ${accent.delay} infinite`,
            }}
          />
        ))}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 18%, transparent 42%, rgba(0,0,0,0.12) 100%)',
          }}
        />
        <div
          className="absolute inset-x-0 top-0 h-56 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at top, rgba(255,255,255,0.12), transparent 65%)',
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-64 pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.05) 32%, rgba(0,0,0,0.16) 100%)',
          }}
        />
        <div
          className="absolute left-[18%] top-[14%] h-64 w-64 rounded-full pointer-events-none blur-3xl"
          style={{ background: 'rgba(255,255,255,0.08)' }}
        />
        <div
          className="absolute right-[14%] bottom-[10%] h-72 w-72 rounded-full pointer-events-none blur-3xl"
          style={{ background: 'rgba(255,255,255,0.06)' }}
        />

        {(points > 0 || gameState === 'playing' || gameState === 'gameover' || gameState === 'victory') && (
          <div className="absolute right-5 top-5 z-30 md:right-7 md:top-6">
            <button
              onClick={() => setShopOpen(true)}
              className="pointer-events-auto group relative overflow-hidden rounded-full border border-white/20 bg-black/[0.24] px-5 py-3 text-sm font-black uppercase tracking-[0.22em] text-white shadow-[0_12px_36px_rgba(0,0,0,0.22)] backdrop-blur-md transition-all duration-200 hover:scale-[1.03] hover:border-white/35 active:scale-95"
            >
              <span
                className="absolute inset-0 opacity-70 transition-opacity duration-200 group-hover:opacity-100"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.02) 38%, rgba(250,204,21,0.12) 100%)',
                }}
              />
              <span className="relative flex items-center gap-2">
                <ShoppingBag size={16} strokeWidth={2.4} />
                <span>Shop</span>
              </span>
            </button>
          </div>
        )}

        <aside className="pointer-events-none relative z-20 px-5 py-5 md:absolute md:inset-y-0 md:left-0 md:w-72 md:px-6 md:py-7">
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-[0.7rem] font-black uppercase tracking-[0.34em] text-white/55">Bubble Rush</p>
              <h1 className="mt-2 text-3xl font-black text-white tracking-tight">Bubble Rush</h1>
              <p className="mt-1 text-xs uppercase tracking-[0.28em] text-white/55">{displayStage.name}</p>
            </div>

            {gameState === 'playing' && (
              <div>
                <div className="mb-2 flex justify-between text-xs uppercase tracking-[0.28em] text-sky-100/70">
                  <span>Run Pressure</span>
                  <span>{levelTimer}s</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-black/15">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-cyan-300 via-sky-400 to-orange-300 transition-[width] duration-1000"
                    style={{ width: `${Math.max(3, runProgress * 100)}%` }}
                  />
                </div>
              </div>
            )}

            {gameState === 'playing' && (
              <div>
                <p className="mb-3 text-xs uppercase tracking-[0.28em] text-white/55">Health</p>
                <div className="flex flex-wrap gap-1.5">
                  {Array.from({ length: maxLives }, (_, i) => (
                    <Heart
                      key={i}
                      size={18}
                      strokeWidth={2.3}
                      className={`transition-all duration-300 ${i < lives ? 'fill-rose-400 text-rose-200' : 'text-white/20'}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {points > 0 && (
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-sky-100/65">Pearls</p>
                <p className="mt-1 flex items-center gap-2 text-3xl font-black text-yellow-300">
                  <Coins size={26} strokeWidth={2.4} />
                  <span>{points.toLocaleString()}</span>
                </p>
              </div>
            )}
          </div>
        </aside>

        <div ref={gameAreaRef} className="absolute inset-0 z-10 overflow-hidden">
          {gameState === 'idle' && (
            <div className="absolute inset-0 overflow-y-auto px-5 py-10 md:ml-72 md:px-8">
              <div className="mx-auto flex max-w-6xl flex-col gap-8">
                <div className="max-w-2xl">
                  <p className="text-sm font-black uppercase tracking-[0.45em] text-cyan-100/65">Stage Select</p>
                  <h2 className="mt-3 text-5xl font-black text-white md:text-6xl">Three maps. One escalating run each.</h2>
                  <p className="mt-4 max-w-xl text-base leading-relaxed text-white/78 md:text-lg">
                    Difficulty still ramps across the full run, but the UI stays clean. Pick a stage, survive the pressure curve, and clear maps in order to unlock the next one.
                  </p>
                  {points > 0 && (
                    <p className="mt-5 flex items-center gap-2 text-xl font-bold text-yellow-300">
                      <Coins size={20} strokeWidth={2.4} />
                      <span>{points.toLocaleString()} pearls banked</span>
                    </p>
                  )}
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                  {STAGES.map((stage) => (
                    <StageCard
                      key={stage.id}
                      stage={stage}
                      isSelected={effectiveSelectedStageId === stage.id}
                      isLocked={!unlockedStageIds.includes(stage.id)}
                      isCompleted={stageProgress.completed.includes(stage.id)}
                      onSelect={setSelectedStageId}
                    />
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={startGame}
                    className="rounded-full bg-white px-8 py-4 text-lg font-black text-slate-950 shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
                    style={{ boxShadow: '0 18px 50px rgba(255,255,255,0.18), 0 10px 28px rgba(0,0,0,0.18)' }}
                  >
                    {selectedStage.actionLabel}
                  </button>
                </div>
              </div>
            </div>
          )}

          {gameState === 'gameover' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-4 md:ml-72">
              <div className="w-full max-w-md rounded-4xl border border-white/16 bg-black/[0.28] p-10 text-center backdrop-blur-md">
                <div className="mb-4 flex justify-center text-rose-200">
                  <ShieldAlert size={52} strokeWidth={2.1} />
                </div>
                <h2 className="mb-2 text-4xl font-black text-white">Run Ended</h2>
                <p className="mb-4 text-lg text-sky-100/80">{activeStage.name} pushed through. The pressure curve won this round.</p>
                <p className="mb-6 flex items-center justify-center gap-2 text-3xl font-black text-yellow-300">
                  <Coins size={26} strokeWidth={2.4} />
                  <span>{points.toLocaleString()}</span>
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    onClick={() => setShopOpen(true)}
                    className="rounded-full bg-white/10 px-6 py-3 font-bold text-white transition-all hover:bg-white/20"
                  >
                    Shop
                  </button>
                  <button
                    onClick={returnToMenu}
                    className="rounded-full bg-white/10 px-6 py-3 font-bold text-white transition-all hover:bg-white/20"
                  >
                    Stages
                  </button>
                  <button
                    onClick={startGame}
                    className="rounded-full bg-white px-8 py-3 font-black text-slate-950 shadow-xl transition-all hover:scale-105 active:scale-95"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          )}

          {gameState === 'victory' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-4 md:ml-72">
              <div className="w-full max-w-lg rounded-4xl border border-white/16 bg-black/[0.28] p-10 text-center backdrop-blur-md">
                <div className="mb-4 flex justify-center text-yellow-200">
                  <Trophy size={52} strokeWidth={2.1} />
                </div>
                <h2 className="mb-2 text-4xl font-black text-white">Stage Cleared</h2>
                <p className="mb-3 text-lg text-sky-100/80">{activeStage.name} is complete. {hasNextStage ? 'The next map is now available.' : 'All three maps are cleared.'}</p>
                <p className="mb-6 flex items-center justify-center gap-2 text-3xl font-black text-yellow-300">
                  <Coins size={26} strokeWidth={2.4} />
                  <span>{points.toLocaleString()}</span>
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    onClick={() => setShopOpen(true)}
                    className="rounded-full bg-white/10 px-6 py-3 font-bold text-white transition-all hover:bg-white/20"
                  >
                    Shop
                  </button>
                  <button
                    onClick={returnToMenu}
                    className="rounded-full bg-white/10 px-6 py-3 font-bold text-white transition-all hover:bg-white/20"
                  >
                    Stages
                  </button>
                  <button
                    onClick={startGame}
                    className="rounded-full bg-white px-8 py-3 font-black text-slate-950 shadow-xl transition-all hover:scale-105 active:scale-95"
                  >
                    Play Again
                  </button>
                </div>
              </div>
            </div>
          )}

          {gameState === 'playing' && bubbles.map((bubble) => (
            <Bubble
              key={bubble.id}
              {...bubble}
              hoverRadius={hoverRadius}
              onPop={handlePop}
              onExpire={handleExpire}
            />
          ))}

          {lifeFlash && (
            <div
              className="absolute inset-0 pointer-events-none z-10"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(239,68,68,0.4) 0%, rgba(239,68,68,0.15) 50%, transparent 80%)',
                animation: 'life-flash 0.6s ease-out forwards',
              }}
            />
          )}

          {scorePopups.map((popup) => (
            <div
              key={popup.id}
              className="fixed z-50 pointer-events-none select-none font-black text-yellow-200"
              style={{
                left: popup.x,
                top: popup.y,
                fontSize: '1.55rem',
                textShadow: '0 2px 8px rgba(0,0,0,0.7)',
                animation: 'score-float 0.85s ease-out forwards',
              }}
            >
              +{popup.points}
            </div>
          ))}
        </div>

        {shopOpen && (
          <Shop
            points={points}
            upgrades={upgrades}
            onBuy={handleBuy}
            onClose={() => setShopOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
