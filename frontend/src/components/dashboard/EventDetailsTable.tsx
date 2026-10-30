import { Calendar, Clock, Trash2, FolderOpen } from "lucide-react";
import type { CalendarEvent, Group } from "../../store/useTimeTrackStore";
import {
  getEventDurationMinutes,
  formatMinutesToHoursMins,
  getEventDateRange,
} from "../../utils/dashboardUtils";

interface EventDetailsTableProps {
  events: CalendarEvent[];
  groups: Group[];
  onDeleteGroup?: (groupId: string, groupName: string) => void;
  deletingGroupId?: string | null;
}

export function EventDetailsTable({
  events,
  groups,
  onDeleteGroup,
  deletingGroupId,
}: EventDetailsTableProps) {
  const trackedEvents = events
    .filter((e) => e.groupId && getEventDurationMinutes(e) > 0)
    .sort((a, b) => {
      const dateA = a.start?.dateTime
        ? new Date(a.start.dateTime).getTime()
        : a.start?.date
          ? new Date(a.start.date).getTime()
          : 0;
      const dateB = b.start?.dateTime
        ? new Date(b.start.dateTime).getTime()
        : b.start?.date
          ? new Date(b.start.date).getTime()
          : 0;
      return dateB - dateA;
    });

  const getGroup = (groupId: string | null | undefined) =>
    groups.find((g) => g._id === groupId);

  return (
    <div className="card-flat overflow-hidden p-0">
      {groups.length > 0 && (
        <div className="border-b border-gray-100 dark:border-gray-800 p-4 bg-gray-50/50 dark:bg-gray-900/50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-plum" />
              Quản lý nhóm ({groups.length})
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {groups.map((group) => {
              const groupEvents = trackedEvents.filter(
                (e) => e.groupId === group._id,
              );
              const totalMinutes = groupEvents.reduce(
                (sum, e) => sum + getEventDurationMinutes(e),
                0,
              );
              const hasEvents = groupEvents.length > 0;
              const isDeleting = deletingGroupId === group._id;
              return (
                <div
                  key={group._id}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all ${
                    hasEvents
                      ? "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm"
                      : "bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 opacity-60"
                  }`}
                  style={{ opacity: isDeleting ? 0.5 : 1 }}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: group.color }}
                  />
                  <span className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-[150px]">
                    {group.name}
                  </span>
                  {hasEvents && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-plum/10 text-plum dark:bg-plum/20">
                      {formatMinutesToHoursMins(totalMinutes)}
                    </span>
                  )}
                  <button
                    onClick={() => onDeleteGroup?.(group._id, group.name)}
                    disabled={isDeleting}
                    className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors flex-shrink-0"
                    title={`Xóa nhóm "${group.name}"`}
                    aria-label={`Xóa nhóm ${group.name}`}
                  >
                    {isDeleting ? (
                      <span className="w-3.5 h-3.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {trackedEvents.length === 0 ? (
        <div className="min-h-[300px] flex flex-col items-center justify-center p-8 text-center">
          <div className="text-6xl mb-4 opacity-30">📋</div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Chưa có sự kiện nào được theo dõi
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 font-normal mt-1">
            Kéo sự kiện vào nhóm để xem chi tiết
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Sự kiện
                </th>
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Nhóm
                </th>
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Thời lượng
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {trackedEvents.map((event) => {
                const group = getGroup(event.groupId);
                const duration = getEventDurationMinutes(event);
                const formattedTime = formatMinutesToHoursMins(duration);
                const isMultiDay = event.isMultiDay;
                const dateRange = getEventDateRange(event);

                let startTime = "—";
                let startDate = "—";
                let endDate = "";
                if (isMultiDay && dateRange.length > 1) {
                  startDate = new Date(dateRange[0]).toLocaleDateString(
                    "vi-VN",
                    { day: "2-digit", month: "2-digit", year: "numeric" },
                  );
                  endDate = new Date(
                    dateRange[dateRange.length - 1],
                  ).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  });
                } else if (event.start?.dateTime) {
                  const date = new Date(event.start.dateTime);
                  if (!isNaN(date.getTime())) {
                    startTime = date.toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    });
                    startDate = date.toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    });
                  }
                } else if (event.start?.date) {
                  const date = new Date(event.start.date);
                  startDate = date.toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  });
                  startTime = "All-day";
                }

                return (
                  <tr
                    key={event.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="font-medium text-gray-900 dark:text-white max-w-xs truncate flex items-center gap-2">
                        <span className="truncate">
                          {event.summary || "(Không có tiêu đề)"}
                        </span>
                        {isMultiDay && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 flex-shrink-0">
                            Multi-day
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 stroke-[1.5] text-gray-400" />
                        <span>{startDate}</span>
                      </div>
                      {endDate && (
                        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-400">
                          <span>→</span>
                          <span>{endDate}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3.5 h-3.5 stroke-[1.5] text-gray-400" />
                        <span>{startTime}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      {group ? (
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: group.color }}
                          />
                          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                            {group.name}
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-normal text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-plum/10 text-plum dark:bg-plum/20">
                        <Clock className="w-3.5 h-3.5 stroke-[1.5]" />
                        {formattedTime}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
