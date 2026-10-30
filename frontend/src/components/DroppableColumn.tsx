import { useDroppable } from '@dnd-kit/core';
import { DraggableEventCard } from './DraggableEventCard';
import type { CalendarEvent } from '../store/useTimeTrackStore';

interface DroppableColumnProps {
  id: string;
  title: string;
  events: CalendarEvent[];
  groupColor?: string;
  isUnassigned?: boolean;
  onConfigClick?: (event: CalendarEvent) => void;
}

export function DroppableColumn({ id, title, events, groupColor, isUnassigned, onConfigClick }: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  const bgColor = isOver
    ? groupColor
      ? `${groupColor}20`
      : 'rgba(139, 92, 246, 0.1)' // plum/10
    : 'transparent';

  // Tăng min-height khi không có sự kiện để drop zone dễ thả vào hơn
  const minHeight = events.length === 0 ? 'min-h-[300px]' : 'min-h-[200px]';

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-xl transition-colors duration-150 ${minHeight} border-2 border-dashed ${isOver ? 'border-plum/50' : 'border-gray-200 dark:border-gray-700'}`}
      style={{ backgroundColor: bgColor }}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700 mb-2">
        <h3 className="font-medium text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
          {isUnassigned ? (
            <>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">Unassigned</span>
              {title}
            </>
          ) : (
            <>
              {groupColor && (
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: groupColor }}
                />
              )}
              {title}
            </>
          )}
        </h3>
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">{events.length}</span>
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-y-auto p-2">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 py-16">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3 border-2 border-dashed border-gray-300 dark:border-gray-600">
              <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-xs font-medium">Kéo sự kiện vào đây</span>
            <span className="text-[10px] opacity-60 mt-1">Thả để gán vào nhóm này</span>
          </div>
        ) : (
          events.map((event) => (
            <DraggableEventCard key={event.id || ''} event={event} onConfigClick={onConfigClick} />
          ))
        )}
      </div>
    </div>
  );
}