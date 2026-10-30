import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Clock, Settings } from 'lucide-react';
import type { CalendarEvent } from '../store/useTimeTrackStore';

interface DraggableEventCardProps {
  event: CalendarEvent;
  onConfigClick?: (event: CalendarEvent) => void;
}

export function DraggableEventCard({ event, onConfigClick }: DraggableEventCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: event.id || '',
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const startTime = event.start?.dateTime
    ? new Date(event.start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : event.start?.date || 'All day';

  const isMultiDayAssigned = event.isMultiDay && event.groupId;

  const handleClick = () => {
    // Don't trigger config modal if during drag
    if (isDragging) return;
    if (onConfigClick && isMultiDayAssigned) {
      onConfigClick(event);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="card-flat-interactive p-4 mb-3"
      onClick={handleClick}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-medium text-sm line-clamp-2 text-gray-900 dark:text-white">{event.summary || 'Untitled Event'}</h4>
        <div className="flex items-center gap-1 flex-shrink-0">
          {event.group && (
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: event.group.color || '#3b82f6' }}
            >
              {event.group.name}
            </span>
          )}
          {isMultiDayAssigned && onConfigClick && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onConfigClick(event);
              }}
              className="p-1.5 rounded-full text-gray-400 hover:text-plum hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Cấu hình sự kiện nhiều ngày"
              title="Cấu hình thời gian"
            >
              <Settings className="w-4 h-4 stroke-[1.5]" />
            </button>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-2">
        <Clock className="w-3.5 h-3.5 stroke-[1.5]" />
        <span>{startTime}</span>
        {isMultiDayAssigned && (
          <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            Multi-day
          </span>
        )}
      </div>
    </div>
  );
}
