import { useEffect, useState } from "react";
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { Plus, RefreshCw, LayoutDashboard, RotateCcw, AlertTriangle } from "lucide-react";
import {
  useTimeTrackStore,
  type CalendarEvent,
} from "../store/useTimeTrackStore";
import { DroppableColumn } from "./DroppableColumn";
import { DraggableEventCard } from "./DraggableEventCard";
import { getNextPastelColor } from "../utils/dashboardUtils";

export function TimeTrackingBoard() {
  const {
    events,
    groups,
    isLoading,
    isAssigning,
    fetchEvents,
    fetchGroups,
    createGroup,
    assignEventToGroup,
    resetAllMappings,
  } = useTimeTrackStore();
  const [activeEvent, setActiveEvent] = useState<CalendarEvent | null>(null);
  const [pendingAssignment, setPendingAssignment] = useState<{
    eventId: string;
    groupId: string | null;
    isMultiDay: boolean;
    defaultHours: number;
    timeOfDay: string;
  } | null>(null);
  const [configModalEvent, setConfigModalEvent] = useState<CalendarEvent | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    }),
    useSensor(KeyboardSensor),
  );

  const unassignedEvents = events.filter((e) => !e.groupId);
  const groupedEventsMap: Record<string, typeof events> = {};
  groups.forEach((g) => {
    groupedEventsMap[g._id] = events.filter((e) => e.groupId === g._id);
  });

  useEffect(() => {
    fetchEvents();
    fetchGroups();
  }, [fetchEvents, fetchGroups]);

  const handleCreateGroup = async () => {
    const name = prompt("Nhập tên nhóm mới:");
    if (!name) return;
    const usedColors = groups.map((g) => g.color);
    const color = getNextPastelColor(usedColors);
    await createGroup({ name, color });
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const foundEvent = events.find((e) => e.id === active.id);
    if (foundEvent) {
      setActiveEvent(foundEvent);
    }
  };

  const handleConfirmAssignment = async (
    hoursPerDay: number,
    timeOfDay: string,
  ) => {
    if (!pendingAssignment) return;
    const { eventId, groupId, isMultiDay } = pendingAssignment;
    await assignEventToGroup(
      eventId,
      groupId,
      isMultiDay,
      hoursPerDay,
      timeOfDay,
    );
    setPendingAssignment(null);
  };

  const handleCancelAssignment = () => {
    setPendingAssignment(null);
  };

  const handleOpenConfigModal = (event: CalendarEvent) => {
    if (event.isMultiDay && event.groupId) {
      setConfigModalEvent(event);
    }
  };

  const handleResetBoard = async () => {
    const confirmed = window.confirm(
      "Bạn có chắc chắn muốn đặt lại tất cả sự kiện về trạng thái chưa phân nhóm? Hành động này không thể hoàn tác."
    );
    if (!confirmed) return;
    
    await resetAllMappings();
  };

  const handleConfirmConfigModal = async (hoursPerDay: number, timeOfDay: string) => {
    if (!configModalEvent) return;
    await assignEventToGroup(
      configModalEvent.id!,
      configModalEvent.groupId!,
      true,
      hoursPerDay,
      timeOfDay
    );
    setConfigModalEvent(null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveEvent(null);

    if (!over) return;

    const eventId = active.id as string;
    let targetContainerId = over.id as string;

    const isGroupOrUnassigned =
      targetContainerId === "unassigned" ||
      groups.some((g) => g._id === targetContainerId);

    if (!isGroupOrUnassigned) {
      const targetEvent = events.find((e) => e.id === targetContainerId);
      if (targetEvent) {
        targetContainerId = targetEvent.groupId || "unassigned";
      } else {
        return;
      }
    }

    const draggedEvent = events.find((e) => e.id === eventId);

    if (!draggedEvent) return;
    if (targetContainerId === draggedEvent.groupId) return;
    
    // If dragging to unassigned, just unassign
    if (targetContainerId === "unassigned") {
      await assignEventToGroup(eventId, null, false, 0);
      return;
    }

    // If dragging from unassigned to a group (first assignment) - show config modal for multi-day events
    const isFromUnassigned = !draggedEvent.groupId;
    const isMultiDayEvent = Boolean(draggedEvent.start?.date && !draggedEvent.start?.dateTime);

    if (isFromUnassigned && isMultiDayEvent) {
      setPendingAssignment({
        eventId,
        groupId: targetContainerId,
        isMultiDay: true,
        defaultHours: 2,
        timeOfDay: "flexible",
      });
    } else {
      // For events already in a group (including multi-day), just reassign without config modal
      // Preserve existing multi-day config
      const existingHours = draggedEvent.hoursPerDay || 2;
      const existingTimeOfDay = draggedEvent.timeOfDay || 'flexible';
      await assignEventToGroup(eventId, targetContainerId, isMultiDayEvent, existingHours, existingTimeOfDay);
    }
  };

  if (isLoading && events.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-plum/20 border-t-plum rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="p-4 max-w-full mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <LayoutDashboard className="w-6 h-6 text-plum" />
              Bảng Phân Loại Thời Gian
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
              Kéo thả các sự kiện vào từng nhóm để theo dõi thời gian hiệu quả
              hơn
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetBoard}
              className="px-4 py-2 rounded-full text-sm font-medium text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors gap-2"
              disabled={isLoading || isAssigning}
              title="Đặt lại tất cả sự kiện về chưa phân nhóm"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Reset</span>
              <AlertTriangle className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                fetchEvents();
                fetchGroups();
              }}
              className="px-4 py-2 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300
                         bg-gray-100 dark:bg-gray-800
                         hover:bg-gray-200 dark:hover:bg-gray-700
                         transition-colors duration-200
                         focus:outline-none focus:ring-2 focus:ring-mint gap-2"
              disabled={isLoading || isAssigning}
            >
              <RefreshCw className="w-4 h-4" />
              Làm mới
            </button>

            <button
              onClick={handleCreateGroup}
              className="px-4 py-2 rounded-full text-sm font-medium text-white
                         bg-plum hover:bg-plum/90
                         transition-colors duration-200
                         focus:outline-none focus:ring-2 focus:ring-mint gap-2"
            >
              <Plus className="w-4 h-4" />
              Tạo Nhóm Mới
            </button>
          </div>
        </div>

        <div className="flex lg:grid lg:grid-cols-4 gap-6 items-start overflow-x-auto pb-6 snap-x scrollbar-flat">
          <div className="w-[85vw] sm:w-[380px] lg:w-auto flex-shrink-0 snap-start lg:col-span-1">
            <DroppableColumn
              id="unassigned"
              title="Chưa Phân Nhóm"
              events={unassignedEvents}
              isUnassigned={true}
              onConfigClick={handleOpenConfigModal}
            />
          </div>

          {groups.length === 0 ? (
            <div className="w-[85vw] sm:w-[380px] lg:w-auto flex-shrink-0 snap-start lg:col-span-3">
              <div className="card-flat p-8 text-center border-2 border-dashed border-gray-200 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Bạn chưa tạo nhóm công việc nào.
                </p>
                <button
                  onClick={handleCreateGroup}
                  className="px-4 py-2 rounded-full text-sm font-medium text-white
                             bg-plum hover:bg-plum/90
                             transition-colors duration-200
                             focus:outline-none focus:ring-2 focus:ring-mint gap-2 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  Tạo nhóm đầu tiên
                </button>
              </div>
            </div>
          ) : (
            groups.map((group) => (
              <div key={group._id} className="w-[85vw] sm:w-[380px] lg:w-auto flex-shrink-0 snap-start lg:col-span-1">
                <DroppableColumn
                  id={group._id}
                  title={group.name}
                  events={groupedEventsMap[group._id] || []}
                  groupColor={group.color}
                  onConfigClick={handleOpenConfigModal}
                />
              </div>
            ))
          )}
        </div>
      </div>

      <DragOverlay>
        {activeEvent ? (
          <div className="w-72">
            <DraggableEventCard event={activeEvent} />
          </div>
        ) : null}
      </DragOverlay>

      {pendingAssignment && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="assignment-modal-title">
          <div className="modal-content">
            <h3 id="assignment-modal-title" className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
              Cấu hình sự kiện kéo dài nhiều ngày
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
              Sự kiện này kéo dài nhiều ngày. Vui lòng cấu hình thời gian dành
              cho sự kiện này:
            </p>
            <div className="form-group-flat mb-6">
              <label className="label-flat" htmlFor="modal-hours-input">
                Giờ mỗi ngày
              </label>
              <input
                type="number"
                id="modal-hours-input"
                min="0.5"
                max="24"
                step="0.5"
                defaultValue={pendingAssignment.defaultHours}
                className="input-flat"
              />
            </div>

            <div className="form-group-flat mb-6">
              <label className="label-flat" htmlFor="modal-timeofday-select">
                Khung giờ trong ngày
              </label>
              <select
                id="modal-timeofday-select"
                defaultValue={pendingAssignment.timeOfDay}
                className="input-flat"
              >
                <option value="morning">🌅 Buổi sáng (6h - 12h)</option>
                <option value="afternoon">☀️ Buổi chiều (12h - 18h)</option>
                <option value="evening">🌆 Buổi tối (18h - 22h)</option>
                <option value="night">🌙 Ban đêm (22h - 6h)</option>
                <option value="flexible">⚡ Linh hoạt / All-day</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={handleCancelAssignment}
                className="px-4 py-2 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300
                           bg-gray-100 dark:bg-gray-800
                           hover:bg-gray-200 dark:hover:bg-gray-700
                           transition-colors duration-200
                           focus:outline-none focus:ring-2 focus:ring-mint"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  const hoursInput = document.getElementById(
                    "modal-hours-input",
                  ) as HTMLInputElement;
                  const timeSelect = document.getElementById(
                    "modal-timeofday-select",
                  ) as HTMLSelectElement;
                  const hours = hoursInput
                    ? parseFloat(hoursInput.value) || 2
                    : 2;
                  const timeOfDay = timeSelect ? timeSelect.value : "flexible";
                  handleConfirmAssignment(hours, timeOfDay);
                }}
                className="px-4 py-2 rounded-full text-sm font-medium text-white
                           bg-plum hover:bg-plum/90
                           transition-colors duration-200
                           focus:outline-none focus:ring-2 focus:ring-mint"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {configModalEvent && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="config-modal-title">
          <div className="modal-content">
            <h3 id="config-modal-title" className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
              Cấu hình sự kiện kéo dài nhiều ngày
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
              Sự kiện này kéo dài nhiều ngày. Vui lòng cấu hình thời gian dành
              cho sự kiện này:
            </p>
            <div className="form-group-flat mb-6">
              <label className="label-flat" htmlFor="config-hours-input">
                Giờ mỗi ngày
              </label>
              <input
                type="number"
                id="config-hours-input"
                min="0.5"
                max="24"
                step="0.5"
                defaultValue={configModalEvent.hoursPerDay || 2}
                className="input-flat"
              />
            </div>

            <div className="form-group-flat mb-6">
              <label className="label-flat" htmlFor="config-timeofday-select">
                Khung giờ trong ngày
              </label>
              <select
                id="config-timeofday-select"
                defaultValue={configModalEvent.timeOfDay || "flexible"}
                className="input-flat"
              >
                <option value="morning">🌅 Buổi sáng (6h - 12h)</option>
                <option value="afternoon">☀️ Buổi chiều (12h - 18h)</option>
                <option value="evening">🌆 Buổi tối (18h - 22h)</option>
                <option value="night">🌙 Ban đêm (22h - 6h)</option>
                <option value="flexible">⚡ Linh hoạt / All-day</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={() => setConfigModalEvent(null)}
                className="px-4 py-2 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300
                           bg-gray-100 dark:bg-gray-800
                           hover:bg-gray-200 dark:hover:bg-gray-700
                           transition-colors duration-200
                           focus:outline-none focus:ring-2 focus:ring-mint"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  const hoursInput = document.getElementById(
                    "config-hours-input",
                  ) as HTMLInputElement;
                  const timeSelect = document.getElementById(
                    "config-timeofday-select",
                  ) as HTMLSelectElement;
                  const hours = hoursInput
                    ? parseFloat(hoursInput.value) || 2
                    : 2;
                  const timeOfDay = timeSelect ? timeSelect.value : "flexible";
                  handleConfirmConfigModal(hours, timeOfDay);
                }}
                className="px-4 py-2 rounded-full text-sm font-medium text-white
                           bg-plum hover:bg-plum/90
                           transition-colors duration-200
                           focus:outline-none focus:ring-2 focus:ring-mint"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </DndContext>
  );
}

