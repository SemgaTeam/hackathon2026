import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileAudio, CloudLightning } from 'lucide-react';
import { api } from '../api/instance';

export default function UploadZone({ onUploadSuccess }) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  
  const onDrop = useCallback(async (acceptedFiles) => {
    if (!acceptedFiles.length) return;
    setError(null);
    setIsUploading(true);

    try {
      for (const file of acceptedFiles) {
        const formData = new FormData();
        formData.append('file', file);

        const { data } = await api.post('/audio', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        const newTrack = {
          id: data?.key || `${Date.now()}-${file.name}`,
          title: file.name.replace(/\.[^/.]+$/, ""),
          duration: "00:00",
          bucket: data?.bucket,
          key: data?.key,
          mimeType: data?.mimeType,
          originalName: data?.originalName
        };

        if (onUploadSuccess) {
          onUploadSuccess(newTrack);
        }
      }
    } catch (e) {
      setError("Ошибка загрузки. Проверьте соединение или попробуйте позже.");
    } finally {
      setIsUploading(false);
    }
  }, [onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.ogg'],
      'video/*': ['.mp4', '.mkv']
    },
    multiple: true
  });

  return (
    <div
      {...getRootProps()}
      className={`
        relative border-2 border-dashed rounded-2xl p-8 
        flex flex-col items-center justify-center text-center
        transition-all duration-200 cursor-pointer
        ${isUploading ? 'opacity-80 pointer-events-none' : ''}
        ${isDragActive 
          ? 'border-[#62c5a5] bg-[#62c5a5]/5 scale-[1.02]' 
          : 'border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200'
        }
      `}
    >
      <input {...getInputProps()} />
      
      <div className={`
        w-14 h-14 rounded-full flex items-center justify-center mb-4 shadow-sm transition-colors
        ${isDragActive ? 'bg-[#62c5a5] text-white' : 'bg-white text-[#62c5a5]'}
      `}>
        {isDragActive ? <CloudLightning size={24} /> : <Upload size={24} />}
      </div>

      <div className="space-y-1">
        <p className="text-[11px] font-black text-black uppercase tracking-widest">
          {isUploading ? "Загрузка..." : (isDragActive ? "Бросайте файлы здесь" : "Перетащите аудио или видео")}
        </p>
        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
          MP3, WAV, MP4 до 100MB
        </p>
      </div>

      {/* Маленькая подсказка снизу */}
      {!isDragActive && (
        <div className="mt-4 flex items-center text-[8px] text-slate-300 font-bold uppercase tracking-[0.2em]">
          <FileAudio size={10} className="mr-1" />
          Или нажмите для выбора
        </div>
      )}

      {error && (
        <div className="mt-3 text-[9px] font-bold uppercase tracking-widest text-red-500">
          {error}
        </div>
      )}
    </div>
  );
}
