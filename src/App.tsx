import React, { useState, useEffect } from 'react';
import SnakeGame from './components/SnakeGame';
import MusicPlayer from './components/MusicPlayer';
import { dummySynth } from './lib/audio';
import { Ghost, Terminal } from 'lucide-react';

export default function App() {
  const [activeTrackIndex, setActiveTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    // Sync external synth state changes if needed
  }, []);

  const handleTrackChange = (index: number) => {
    setActiveTrackIndex(index);
    dummySynth.setTrack(index);
  };

  const handlePlayToggle = () => {
    dummySynth.togglePlay();
    setIsPlaying(dummySynth.isPlaying);
  };

  const currentTrack = dummySynth.tracks[activeTrackIndex];

  return (
    <div className="min-h-screen bg-[var(--color-bg-deep)] text-[var(--color-text-main)] font-sans relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none z-0"></div>

      <div 
        className="relative z-10 w-full max-w-[1024px] h-[768px] grid p-[20px] gap-[20px] mx-auto"
        style={{
          gridTemplateColumns: 'minmax(200px, 280px) 1fr minmax(200px, 280px)',
          gridTemplateRows: '80px 1fr 100px',
        }}
      >
        {/* Header */}
        <header className="sleek-header col-span-1 md:col-span-3 flex items-center justify-between px-5">
          <div className="text-2xl font-[800] tracking-[2px] text-[var(--color-neon-cyan)] uppercase">
            NEON•SONIC
          </div>
          <div className="flex gap-[30px]">
            <div className="text-right flex flex-col justify-center">
              <p className="text-[10px] uppercase text-[var(--color-text-dim)] tracking-[1px] m-0">Score</p>
              <p className="font-mono text-2xl text-[var(--color-neon-lime)] m-0 drop-shadow-[0_0_5px_var(--color-neon-lime)]">
                {score.toString().padStart(5, '0')}
              </p>
            </div>
            <div className="text-right flex flex-col justify-center hidden sm:flex">
              <p className="text-[10px] uppercase text-[var(--color-text-dim)] tracking-[1px] m-0">Hi-Score</p>
              <p className="font-mono text-2xl text-[var(--color-neon-lime)] m-0 drop-shadow-[0_0_5px_var(--color-neon-lime)]">
                08,900
              </p>
            </div>
          </div>
        </header>

        {/* Left Sidebar: Playlist */}
        <aside className="sleek-panel p-5 flex flex-col gap-[15px] hidden md:flex">
          <p className="text-[12px] uppercase text-[var(--color-text-dim)] tracking-[2px] mb-[-5px]">Playlist</p>
          {dummySynth.tracks.map((track, i) => (
            <div 
              key={i}
              onClick={() => handleTrackChange(i)}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${activeTrackIndex === i ? 'bg-[rgba(0,243,255,0.05)] border-[var(--color-neon-cyan)]' : 'border-transparent hover:border-white/10'}`}
            >
              <p className="text-[14px] font-[600] mb-1">{track.title}</p>
              <p className="text-[11px] text-[var(--color-text-dim)]">Neon Algorithm • 3:42</p>
            </div>
          ))}
        </aside>

        {/* Center: Game Window */}
        <main className="sleek-game flex items-center justify-center p-2 relative h-[528px]">
          <SnakeGame 
            activeColor={currentTrack.color} 
            activeGlow={currentTrack.glow}
            snakeBg={currentTrack.snakeBg}
            onScoreUpdate={setScore} 
          />
        </main>

        {/* Right Sidebar: Stats & Viz */}
        <aside className="sleek-panel p-5 flex flex-col hidden md:flex">
          <p className="text-[12px] uppercase text-[var(--color-text-dim)] tracking-[2px] mb-2">Game Feed</p>
          <div className="text-[11px] text-[var(--color-text-dim)] leading-[1.6] mb-auto font-mono">
            <p className="mb-0.5">• Active Session</p>
            <p className="mb-0.5">• Grid: 20x20</p>
            <p className="mb-0.5">• Velocity: Standard</p>
          </div>

          <div className="h-[120px] flex items-end gap-[3px] mt-[20px]">
            {/* simple static visualizer for sidebar layout */}
            {[30, 60, 90, 40, 70, 20, 50, 80].map((h, i) => (
              <div key={i} className="flex-1 bg-[var(--color-neon-cyan)] opacity-70" style={{ height: `${h}%` }}></div>
            ))}
          </div>
          <p className="text-[9px] uppercase text-[var(--color-text-dim)] tracking-[2px] mt-[15px]">Frequency</p>
        </aside>

        {/* Bottom: Music Controls Container */}
        <footer className="sleek-panel col-span-1 md:col-span-3 flex items-center w-full px-[30px] overflow-hidden">
          <MusicPlayer 
            activeTrackIndex={activeTrackIndex}
            isPlaying={isPlaying}
            onTrackChange={handleTrackChange}
            onPlayToggle={handlePlayToggle}
          />
        </footer>
      </div>
    </div>
  );
}
