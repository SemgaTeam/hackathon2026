import { useLocation } from "react-router-dom";
import { useEffect, useRef, useState, useCallback } from "react";
import Hls from "hls.js";
import { 
  Activity, Volume2, VolumeX, Maximize, MonitorPlay, RefreshCw 
} from 'lucide-react';

import defaultPreview from "../assets/default_music.jpg";

export default function GlobalPlayer() {
  const location = useLocation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null); // Для автофокуса
  const hlsRef = useRef<Hls | null>(null);
  
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(() => Number(localStorage.getItem('player-volume')) || 0.5);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const isPlayerPage = location.pathname === "/";

  const initPlayer = useCallback(() => {
    const video = videoRef.current;
    if (!video || !Hls.isSupported()) return;

    setError(null);
    setIsLoaded(false);

    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 30,
    });

    hlsRef.current = hls;
    hls.loadSource("http://10.165.4.144:8080/hls/stream/index.m3u8");
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      video.muted = false;
      video.play().catch(() => {
        video.muted = true;
        setIsMuted(true);
        video.play();
      });
    });

    video.onwaiting = () => setIsBuffering(true);
    video.onplaying = () => { setIsBuffering(false); setIsLoaded(true); };
  }, []);

  useEffect(() => {
    initPlayer();

    if (isPlayerPage && containerRef.current) {
      containerRef.current.focus();
    }

    const unlockAudio = () => {
      if (videoRef.current && videoRef.current.muted) {
        videoRef.current.muted = false;
        setIsMuted(false);
        videoRef.current.play().catch(() => {});
      }
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };

    document.addEventListener('click', unlockAudio);
    document.addEventListener('keydown', unlockAudio);

    return () => {
      hlsRef.current?.destroy();
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };
  }, [initPlayer, isPlayerPage]);

  const toggleMute = () => {
    if (videoRef.current) {
      const newState = !isMuted;
      videoRef.current.muted = newState;
      setIsMuted(newState);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setVolume(val);
      setIsMuted(val === 0);
      localStorage.setItem('player-volume', String(val));
    }
  };

  return (
    <div 
      ref={containerRef}
      tabIndex={0}
      className={`w-full h-full flex-col items-center bg-[#f8fafc] p-6 md:p-10 transition-all duration-500 outline-none ${isPlayerPage ? "flex" : "hidden"}`}
    >
      
      {/* Header */}
      <div className="w-full max-w-5xl flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-[#ff4d3d]">
            <Activity size={20} className={isLoaded ? "animate-pulse" : ""} />
          </div>
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Stream Engine</h2>
            <p className="text-lg font-bold text-slate-900 tracking-tight">Main Channel</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className={`absolute inline-flex h-full w-full rounded-full bg-[#ff4d3d] opacity-75 ${isLoaded ? 'animate-ping' : ''}`}></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff4d3d]"></span>
          </span>
          <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">
            {isLoaded ? 'Live' : 'Connecting'}
          </span>
        </div>
      </div>

      <div className="relative w-full max-w-5xl group">
        <div className="absolute -inset-1 bg-linear-to-r from-[#ff4d3d] via-[#ff8e84] to-[#ff4d3d] rounded-[42px] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
        
        <div className="relative bg-[#050505] rounded-[38px] overflow-hidden shadow-2xl aspect-video border-[6px] border-white focus-within:border-[#ff4d3d]/20 transition-colors">
          
          {(!isLoaded || isBuffering) && (
            <div className="absolute inset-0 z-10 bg-black flex items-center justify-center">
              <img src={defaultPreview} className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay blur-md" alt="" />
              <div className="relative flex flex-col items-center gap-4 text-white/80">
                <RefreshCw size={40} className="animate-spin opacity-50" />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {isMuted ? "Click to enable Sound" : "Synchronizing..."}
                </span>
              </div>
            </div>
          )}

          <video
            ref={videoRef}
            muted={isMuted}
            autoPlay
            playsInline
            className={`w-full h-full object-cover transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-40'}`}
          />

          <div className="absolute inset-0 z-20 bg-linear-to-t from-black/90 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <button 
                  onClick={toggleMute} 
                  className="p-4 bg-white/10 hover:bg-[#ff4d3d] backdrop-blur-xl rounded-2xl border border-white/10 transition-all active:scale-90"
                >
                  {isMuted ? <VolumeX size={24} className="text-white" /> : <Volume2 size={24} className="text-white" />}
                </button>

                <div className="hidden sm:flex items-center gap-3 bg-black/40 backdrop-blur-xl px-4 py-3 rounded-2xl border border-white/5">
                   <input 
                     type="range" min="0" max="1" step="0.01" 
                     value={isMuted ? 0 : volume} 
                     onChange={handleVolumeChange}
                     className="w-24 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#ff4d3d]"
                   />
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-white">
                <button 
                  onClick={() => videoRef.current?.requestPictureInPicture()}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <MonitorPlay size={20} />
                </button>
                <button 
                  onClick={() => videoRef.current?.requestFullscreen()}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <Maximize size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-3 gap-6 mt-12">
        {[
          { label: 'Audio', value: isMuted ? 'Muted (Interaction required)' : 'Live Output' },
          { label: 'Bitrate', value: '4500 kbps' },
          { label: 'Latency', value: '0.8s' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{stat.label}</p>
            <p className="text-sm font-bold text-slate-800 tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}