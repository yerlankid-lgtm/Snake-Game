import React, { useEffect, useState } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2 } from 'lucide-react';
import { dummySynth } from '../lib/audio';

type Props = {
  activeTrackIndex: number;
  isPlaying: boolean;
  onTrackChange: (index: number) => void;
  onPlayToggle: () => void;
};

export default function MusicPlayer({ activeTrackIndex, isPlaying, onTrackChange, onPlayToggle }: Props) {
  const currentTrack = dummySynth.tracks[activeTrackIndex];

  return (
    <div className="w-full h-full py-2 flex items-center justify-between gap-[20px] md:gap-[40px]">
      
      {/* Now Playing info */}
      <div className="w-[200px] md:w-[250px] flex items-center gap-[15px]">
        <div 
          className="w-[50px] min-w-[50px] h-[50px] rounded-[4px]"
          style={{ background: `linear-gradient(45deg, var(--color-neon-cyan), var(--color-neon-magenta))` }}
        />
        <div className="overflow-hidden whitespace-nowrap">
          <p className="text-[14px] font-[600] m-0 mb-1 truncate text-white">{currentTrack.title}</p>
          <p className="text-[11px] text-[var(--color-text-dim)] m-0">AI • Sequential</p>
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex-1 flex flex-col items-center gap-[10px]">
        <div className="flex items-center gap-[25px]">
          <button
            onClick={() => {
              const nextIdx = (activeTrackIndex - 1 + dummySynth.tracks.length) % dummySynth.tracks.length;
              onTrackChange(nextIdx);
            }}
            className="bg-transparent border-none text-[var(--color-text-main)] cursor-pointer outline-none hover:text-[var(--color-neon-cyan)] transition-colors"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          <button
            onClick={onPlayToggle}
            className={`w-[44px] h-[44px] rounded-full flex items-center justify-center font-bold outline-none cursor-pointer border-none transition-transform hover:scale-105 active:scale-95 ${currentTrack.bg} ${currentTrack.glow} border border-[var(--color-neon-cyan)] text-[var(--color-neon-cyan)]`}
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
          </button>

          <button
            onClick={() => {
              const nextIdx = (activeTrackIndex + 1) % dummySynth.tracks.length;
              onTrackChange(nextIdx);
            }}
            className="bg-transparent border-none text-[var(--color-text-main)] cursor-pointer outline-none hover:text-[var(--color-neon-cyan)] transition-colors"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>
        </div>

        {/* Progress */}
        <div className="w-full flex flex-col hidden sm:flex">
          <div className="w-full h-[4px] bg-[#333] rounded-[2px] relative overflow-hidden">
            <div 
              className={`h-full ${currentTrack.snakeBg} shadow-[0_0_10px_${currentTrack.color}]`}
              style={{ width: isPlaying ? '65%' : '0%', transition: 'width 2s linear' }}
            />
          </div>
          <div className="w-full flex justify-between text-[10px] text-[var(--color-text-dim)] mt-1 tracking-[1px] font-mono">
            <span>{isPlaying ? '0:42' : '0:00'}</span>
            <span>3:42</span>
          </div>
        </div>
      </div>

      {/* Volume (mock) */}
      <div className="w-[100px] md:w-[150px] flex items-center gap-[10px] text-[12px] text-[var(--color-text-dim)] hidden sm:flex">
        <Volume2 className="w-4 h-4" />
        <div className="flex-1 h-[4px] bg-[#333] rounded-[2px] relative">
          <div className="h-full w-[70%] bg-[var(--color-text-dim)] rounded-[2px]"></div>
        </div>
      </div>

    </div>
  );
}
