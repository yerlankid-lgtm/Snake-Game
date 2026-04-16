import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion } from 'motion/react';

type Point = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION: Direction = 'UP';
const SPEED = 120; // ms per tick

type Props = {
  activeColor: string;
  activeGlow: string;
  snakeBg: string;
  onScoreUpdate: (score: number) => void;
};

export default function SnakeGame({ activeColor, activeGlow, snakeBg, onScoreUpdate }: Props) {
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);

  const directionRef = useRef<Direction>(INITIAL_DIRECTION);
  const lastDirectionRef = useRef<Direction>(INITIAL_DIRECTION);

  const generateFood = useCallback((currentSnake: Point[]) => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      // eslint-disable-next-line no-loop-func
      if (!currentSnake.some((segment) => segment.x === newFood.x && segment.y === newFood.y)) {
        break;
      }
    }
    return newFood;
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    directionRef.current = INITIAL_DIRECTION;
    lastDirectionRef.current = INITIAL_DIRECTION;
    setFood(generateFood(INITIAL_SNAKE));
    setGameOver(false);
    setIsPaused(false);
    setScore(0);
    onScoreUpdate(0);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling behavior for arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === ' ' && gameOver) {
        resetGame();
        return;
      }

      if (e.key === ' ' && !gameOver) {
        setIsPaused((p) => !p);
        return;
      }

      if (isPaused || gameOver) return;

      switch (e.key) {
        case 'ArrowUp':
          if (lastDirectionRef.current !== 'DOWN') directionRef.current = 'UP';
          break;
        case 'ArrowDown':
          if (lastDirectionRef.current !== 'UP') directionRef.current = 'DOWN';
          break;
        case 'ArrowLeft':
          if (lastDirectionRef.current !== 'RIGHT') directionRef.current = 'LEFT';
          break;
        case 'ArrowRight':
          if (lastDirectionRef.current !== 'LEFT') directionRef.current = 'RIGHT';
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPaused, gameOver]);

  // Main game loop
  useEffect(() => {
    if (isPaused || gameOver) return;

    const timerId = setTimeout(() => {
      const head = snake[0];
      const newDirection = directionRef.current;
      lastDirectionRef.current = newDirection;

      const delta = {
        UP: { x: 0, y: -1 },
        DOWN: { x: 0, y: 1 },
        LEFT: { x: -1, y: 0 },
        RIGHT: { x: 1, y: 0 },
      }[newDirection];

      const newHead = { x: head.x + delta.x, y: head.y + delta.y };

      // Check walls
      if (
        newHead.x < 0 ||
        newHead.x >= GRID_SIZE ||
        newHead.y < 0 ||
        newHead.y >= GRID_SIZE
      ) {
        setGameOver(true);
        return;
      }

      // Check self collision
      if (snake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
        setGameOver(true);
        return;
      }

      const newSnake = [newHead, ...snake];

      // Check food collision
      if (newHead.x === food.x && newHead.y === food.y) {
        const newScore = score + 10;
        setScore(newScore);
        onScoreUpdate(newScore);
        setFood(generateFood(newSnake));
      } else {
        newSnake.pop(); // Remove tail
      }

      setSnake(newSnake);
    }, SPEED);

    return () => clearTimeout(timerId);
  }, [isPaused, gameOver, snake, food, score, onScoreUpdate, generateFood]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
      <div 
        className="relative w-full h-full max-w-[500px] max-h-[500px] sleek-grid mx-auto"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
        }}
      >
        {/* Render Background Grid Cells */}
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => (
          <div 
            key={`bg-${i}`} 
            className="sleek-cell w-full h-full"
            style={{
              gridColumnStart: (i % GRID_SIZE) + 1,
              gridRowStart: Math.floor(i / GRID_SIZE) + 1,
            }}
          />
        ))}

        {/* Render snake */}
        {snake.map((segment, index) => (
          <motion.div
            key={`${segment.x}-${segment.y}-${index}`}
            className={`w-full h-full ${index === 0 ? 'bg-[var(--color-neon-cyan)] shadow-[0_0_10px_var(--color-neon-cyan)] rounded-[2px]' : 'bg-[rgba(0,243,255,0.6)]'}`}
            style={{
              gridColumnStart: segment.x + 1,
              gridRowStart: segment.y + 1,
              zIndex: 10,
            }}
            layoutId={index === 0 ? 'snake-head' : undefined}
          />
        ))}

        {/* Render Food */}
        <div
          className="w-full h-full bg-[var(--color-neon-magenta)] shadow-[0_0_10px_var(--color-neon-magenta)] rounded-full"
          style={{
            gridColumnStart: food.x + 1,
            gridRowStart: food.y + 1,
            transform: 'scale(0.8)',
            zIndex: 5,
          }}
        />

        {gameOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-center p-6 backdrop-blur-md z-50">
            <h2 className="font-sans text-4xl font-bold uppercase mb-4 text-[var(--color-neon-cyan)] drop-shadow-[0_0_10px_var(--color-neon-cyan)]">
              System Failure
            </h2>
            <p className="font-mono text-[var(--color-text-dim)] mb-8">Score: {score}</p>
            <button
              onClick={resetGame}
              className="font-mono text-sm uppercase px-8 py-3 rounded border border-[var(--color-border-glow)] bg-transparent hover:bg-[rgba(0,243,255,0.1)] text-[var(--color-text-main)] transition-colors cursor-pointer"
            >
              Restart Sequence
            </button>
          </div>
        )}

        {isPaused && !gameOver && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-center backdrop-blur-sm z-50">
             <h2 className="font-sans text-3xl font-bold uppercase tracking-widest text-[var(--color-text-main)]">
              Paused
            </h2>
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-wrap gap-4 justify-center font-mono text-[10px] text-[var(--color-text-dim)] uppercase tracking-widest">
         <span>[Arrows] Steer</span>
         <span className="opacity-50">/</span>
         <span>[Space] Pause / Reload</span>
      </div>
    </div>
  );
}
