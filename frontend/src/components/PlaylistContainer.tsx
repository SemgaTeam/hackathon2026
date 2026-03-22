import { DragDropContext, Droppable, type DropResult } from '@hello-pangea/dnd';
import TrackItem from './TrackItem';

type Track = {
  id: string;
  title: string;
  duration: string;
};

type PlaylistContainerProps = {
  tracks: Track[];
  onReorder: (startIndex: number, endIndex: number) => void;
  onDelete?: (id: string) => void;
};

export default function PlaylistContainer({ tracks, onReorder, onDelete }: PlaylistContainerProps) {
  
  const handleDragEnd = (result: DropResult) => {
    const { destination, source } = result;

    if (!destination || (destination.index === source.index)) {
      return;
    }

    onReorder(source.index, destination.index);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="playlist-unique-id">
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`flex flex-col grow min-h-[400px] rounded-xl transition-colors ${
              snapshot.isDraggingOver ? 'bg-slate-50/50' : 'bg-transparent'
            }`}
          >
            {tracks.map((track, index) => (
              <TrackItem 
                key={track.id} 
                track={track} 
                index={index} 
                onDelete={onDelete}
              />
            ))}
            
            {provided.placeholder}

            {tracks.length === 0 && (
              <div className="flex flex-col items-center justify-center h-40 border-2 border-dotted border-slate-100 rounded-xl">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                  Очередь пуста
                </span>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
