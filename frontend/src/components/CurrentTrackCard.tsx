import React, { useState } from 'react';
import { Play, Pause, SkipForward, Volume2, MoreHorizontal, Radio } from 'lucide-react';

export default function CurrentTrackCard({ track }) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!track) {
    return (
      <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm">
          <Radio size={20} className="text-slate-200" />
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
          Эфир пуст
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm relative overflow-hidden">
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-red-50 text-[9px] font-black text-[#ff4d3d] uppercase tracking-wider mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d3d] mr-1.5 animate-pulse" />
            В эфире
          </div>
          <h3 className="text-xl font-bold text-black leading-tight tracking-tight">
            {track.title}
          </h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
            Стриминговый поток активно
          </p>
        </div>
        <button className="text-slate-300 hover:text-slate-600 transition-colors">
          <MoreHorizontal size={20} />
        </button>
      </div>

      <div className="space-y-2 mb-6">
        <div className="relative w-full h-1.5 bg-slate-100 rounded-full overflow-hidden cursor-pointer group">
          <div 
            className="absolute top-0 left-0 h-full bg-[#62c5a5] transition-all duration-300 group-hover:bg-[#50a88d]" 
            style={{ width: '35%' }} 
          />
        </div>
        <div className="flex justify-between text-[10px] font-bold text-slate-400 tabular-nums uppercase tracking-tighter">
          <span>01:14</span>
          <span>{track.duration}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-black/10"
          >
            {isPlaying ? (
              <Pause size={20} fill="currentColor" />
            ) : (
              <Play size={20} className="ml-1" fill="currentColor" />
            )}
          </button>
          
          <button className="w-10 h-10 border border-slate-100 text-slate-400 rounded-full flex items-center justify-center hover:bg-slate-50 hover:text-black transition-colors">
            <SkipForward size={18} />
          </button>
        </div>

        <div className="flex items-center space-x-2 group cursor-pointer">
          <Volume2 size={18} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
          <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
            <div className="w-2/3 h-full bg-slate-300 group-hover:bg-[#62c5a5] transition-colors" />
          </div>
        </div>
      </div>

      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#62c5a5]/5 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}