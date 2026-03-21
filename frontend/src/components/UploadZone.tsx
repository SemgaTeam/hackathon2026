import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileAudio, CloudLightning } from 'lucide-react';

export default function UploadZone({ onUploadSuccess }) {
  
  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      console.log("Загрузка файла:", file.name);
      
      //  axios.post('/api/upload', formData)
      const fakeNewTrack = {
        id: Math.random().toString(36).substr(2, 9),
        title: file.name.replace(/\.[^/.]+$/, ""),
        duration: "00:00",
      };

      if (onUploadSuccess) {
        onUploadSuccess(fakeNewTrack);
      }
    });
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
          {isDragActive ? "Бросайте файлы здесь" : "Перетащите аудио или видео"}
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
    </div>
  );
}