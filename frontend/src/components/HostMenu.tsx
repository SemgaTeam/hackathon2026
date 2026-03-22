import { useState } from "react";
import "../App.css";
import PlaylistContainer from "./PlaylistContainer";
import UploadZone from "./UploadZone";
import CurrentTrackCard from "./CurrentTrackCard";

type Track = {
  id: string;
  title: string;
  duration: string;
  bucket?: string;
  key?: string;
  mimeType?: string;
  originalName?: string;
};

export default function HostMenu() {
  const [tracks, setTracks] = useState<Track[]>([
    { id: "1", title: "Эфир #102 - Intro", duration: "02:45" },
    { id: "2", title: "Интервью с разработчиком", duration: "15:20" },
    { id: "3", title: "Музыкальный блок: Lo-Fi", duration: "04:10" },
    { id: "4", title: "Рекламная пауза", duration: "01:00" },
    { id: "5", title: "Outro - Финал", duration: "03:15" },
  ]);

  const handleReorder = (startIndex: number, endIndex: number) => {
    const result = Array.from(tracks);
    const [removed] = result.splice(startIndex, 1);
    if (!removed) {
      return;
    }
    result.splice(endIndex, 0, removed);

    setTracks(result);
    
    // fetch('/api/playlist/reorder', { method: 'PATCH', body: JSON.stringify(result) });
  };

  const handleDeleteTrack = (id: string) => {
    setTracks(tracks.filter(track => track.id !== id));
  };

  return (
    <div className="p-6 h-full flex flex-col space-y-6 bg-white">
      <h2 className="flex items-center font-bold uppercase tracking-tighter text-black text-xl">
        🎙️ Панель управления эфиром
      </h2>

      <div className="flex flex-col lg:flex-row gap-6 grow">
        <div className="flex-[2] flex flex-col">
          <div className="mb-3 flex justify-between items-center px-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Очередь треков
            </span>
            <span className="text-[10px] text-slate-500 font-bold uppercase">
              {tracks.length} ТРЕКОВ / 26:30
            </span>
          </div>
          
          <PlaylistContainer 
            tracks={tracks} 
            onReorder={handleReorder} 
            onDelete={handleDeleteTrack}
          />
        </div>

        <div className="flex-1 flex flex-col space-y-4">
          <section className="bg-slate-50 rounded-xl p-1 border border-slate-100 shadow-sm">
            <UploadZone onUploadSuccess={(newTrack) => setTracks((prev) => [...prev, newTrack])} />
          </section>

          <section className="sticky top-20">
            <CurrentTrackCard track={tracks[0]} />
          </section>
        </div>
      </div>
    </div>
  );
}
