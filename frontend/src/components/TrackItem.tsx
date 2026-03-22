import { Draggable } from '@hello-pangea/dnd';
import { GripVertical, Trash2 } from 'lucide-react';

type Track = {
  id: string;
  title: string;
  duration: string;
};

type TrackItemProps = {
  track: Track;
  index: number;
  onDelete?: (id: string) => void;
};

export default function TrackItem({ track, index, onDelete }: TrackItemProps) {
  return (
    <Draggable draggableId={String(track.id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`p-3 mb-2 bg-white border rounded-lg flex items-center justify-between transition-all ${
            snapshot.isDragging 
              ? 'shadow-2xl border-[#62c5a5] rotate-1 z-50' 
              : 'border-slate-100 shadow-sm'
          }`}
        >
          <div className="flex items-center space-x-3">
            {/* Handle - только за эту часть можно тянуть */}
            <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
              <GripVertical size={16} className="text-slate-300 hover:text-slate-500" />
            </div>
            
            <div>
              <div className="text-sm font-bold text-slate-700 leading-tight">
                {track.title}
              </div>
              <div className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">
                {track.duration}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onDelete?.(track.id)}
            className="p-2 text-slate-300 hover:text-[#ff4d3d] transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
    </Draggable>
  );
}
