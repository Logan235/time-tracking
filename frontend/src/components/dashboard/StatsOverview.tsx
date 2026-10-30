import { Clock, Users, TrendingUp, Target, Calendar } from 'lucide-react';
import type { GroupStat, DateRangeInfo } from '../../utils/dashboardUtils';

interface StatsOverviewProps {
  totalTrackedTimeFormatted: string;
  totalTrackedHours: number;
  trackedEventsCount: number;
  statsByGroup: GroupStat[];
  dateRangeInfo?: DateRangeInfo;
}

export function StatsOverview({
  totalTrackedTimeFormatted,
  totalTrackedHours,
  trackedEventsCount,
  statsByGroup,
  dateRangeInfo,
}: StatsOverviewProps) {
  const topGroup = statsByGroup[0];

  return (
    <div className="flex flex-col gap-3 mb-6">
      {/* Date Range Banner nếu có */}
      {dateRangeInfo && dateRangeInfo.totalDays > 0 && (
        <div className="card-flat px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-plum/20">
          <div className="flex items-center gap-2.5 flex-1 min-w-0 w-full sm:w-auto">
            <div className="p-1.5 bg-plum/10 text-plum rounded-full flex-shrink-0">
              <Calendar className="w-4 h-4 stroke-[1.5]" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-xs text-gray-700 dark:text-gray-300 truncate">
                Khoảng thời gian đo lường: {dateRangeInfo.startDateStr} — {dateRangeInfo.endDateStr}
              </p>
              <p className="text-[11px] font-normal text-gray-500 dark:text-gray-400">
                Thống kê dựa trên dữ liệu trong vòng <span className="font-medium text-plum">{dateRangeInfo.totalDays} ngày</span>
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Tổng giờ đã track */}
        <div className="card-flat p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
            <Clock className="w-3.5 h-3.5 stroke-[1.5] text-plum" />
            Tổng thời gian
          </div>
          <div className="text-xl font-semibold text-plum">
            {totalTrackedTimeFormatted}
          </div>
          <div className="text-[10px] font-normal text-gray-400 dark:text-gray-500">
            {totalTrackedHours > 0 ? 'Đã theo dõi' : 'Chưa có dữ liệu'}
          </div>
        </div>

        {/* Số sự kiện đã track */}
        <div className="card-flat p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
            <Target className="w-3.5 h-3.5 stroke-[1.5] text-mint" />
            Sự kiện phân nhóm
          </div>
          <div className="text-xl font-semibold text-mint">
            {trackedEventsCount}
          </div>
          <div className="text-[10px] font-normal text-gray-400 dark:text-gray-500">
            Sự kiện
          </div>
        </div>

        {/* Nhóm tốn nhiều thời gian nhất */}
        <div className="card-flat p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
            <TrendingUp className="w-3.5 h-3.5 stroke-[1.5] text-amber-600 dark:text-amber-400" />
            Nhóm cao nhất
          </div>
          <div className="text-base font-semibold text-amber-600 dark:text-amber-400 truncate" title={topGroup?.groupName || '—'}>
            {topGroup?.groupName || '—'}
          </div>
          <div className="text-[10px] font-normal text-gray-400 dark:text-gray-500 flex items-center gap-1">
            {topGroup && (
              <>
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: topGroup.color }}
                />
                {topGroup.formattedTime}
              </>
            )}
            {!topGroup && 'Chưa có nhóm'}
          </div>
        </div>

        {/* Số nhóm đang hoạt động */}
        <div className="card-flat p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
            <Users className="w-3.5 h-3.5 stroke-[1.5] text-green-600 dark:text-green-400" />
            Nhóm hoạt động
          </div>
          <div className="text-xl font-semibold text-green-600 dark:text-green-400">
            {statsByGroup.filter((g) => g.totalMinutes > 0).length} / {statsByGroup.length}
          </div>
          <div className="text-[10px] font-normal text-gray-400 dark:text-gray-500">
            Tổng số nhóm
          </div>
        </div>
      </div>
    </div>
  );
}