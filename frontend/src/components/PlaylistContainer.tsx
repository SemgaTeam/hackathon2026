import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import TrackItem from './TrackItem';

export default function PlaylistContainer({ tracks, onReorder }) {
  
  const handleDragEnd = (result) => {
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