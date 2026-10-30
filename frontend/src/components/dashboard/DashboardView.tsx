import { useEffect, useState } from 'react';
import { BarChart3, RefreshCw, Plus } from 'lucide-react';
import { useTimeTrackStore } from '../../store/useTimeTrackStore';
import { calculateDashboardStats } from '../../utils/dashboardUtils';
import { StatsOverview } from './StatsOverview';
import { TimePieChart } from './TimePieChart';
import { TimeOfDayPieChart } from './TimeOfDayPieChart';
import { DailyBarChart } from './DailyBarChart';
import { EventDetailsTable } from './EventDetailsTable';

export function DashboardView() {
  const { events, groups, isLoading, fetchEvents, fetchGroups, deleteGroup } = useTimeTrackStore();
  const [deletingGroupId, setDeletingGroupId] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
    fetchGroups();
  }, [fetchEvents, fetchGroups]);

  const stats = calculateDashboardStats(events, groups);

  const handleDeleteGroup = async (groupId: string, groupName: string) => {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa nhóm "${groupName}"? Tất cả sự kiện trong nhóm này sẽ được chuyển về trạng thái "Chưa Phân Nhóm".`
    );
    if (!confirmed) return;
    
    setDeletingGroupId(groupId);
    try {
      await deleteGroup(groupId);
    } catch (error) {
      console.error('Failed to delete group:', error);
    } finally {
      setDeletingGroupId(null);
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
    <div className="p-4 max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
            <BarChart3 className="w-6 h-6 text-plum" />
            Analytics Dashboard
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
            Thống kê và phân tích thời gian làm việc từ Google Calendar
          </p>
        </div>
        <div className="flex items-center gap-2">
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
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
          <button
            onClick={() => {
              // This will be handled by the TimeTrackingBoard's create group
              // For now we just trigger a refresh
              fetchGroups();
            }}
            className="px-4 py-2 rounded-full text-sm font-medium text-white
                       bg-plum hover:bg-plum/90
                       transition-colors duration-200
                       focus:outline-none focus:ring-2 focus:ring-mint gap-2"
          >
            <Plus className="w-4 h-4" />
            Tạo nhóm
          </button>
        </div>
      </div>

      {/* Stats Overview (Compact / Secondary) */}
      <StatsOverview
        totalTrackedTimeFormatted={stats.totalTrackedTimeFormatted}
        totalTrackedHours={stats.totalTrackedHours}
        trackedEventsCount={stats.trackedEventsCount}
        statsByGroup={stats.statsByGroup}
        dateRangeInfo={stats.dateRangeInfo}
      />

      {/* Dedicated Analytics Section (Primary Focus - Large & Prominent Charts) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
          <h3 className="text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-white">
            <span className="w-2.5 h-2.5 rounded-full bg-plum" />
            Biểu đồ phân tích trực quan
          </h3>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Cập nhật thời gian thực từ dữ liệu sự kiện
          </span>
        </div>

        {/* Top Full Width Daily Bar Chart for Trend Analysis */}
        <DailyBarChart
          categories={stats.barChartData.categories}
          series={stats.barChartData.series}
        />

        {/* Bottom Two Column Distribution Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TimePieChart statsByGroup={stats.statsByGroup} dateRangeInfo={stats.dateRangeInfo} />
          <TimeOfDayPieChart
            labels={stats.timeOfDayChartData.labels}
            series={stats.timeOfDayChartData.series}
            colors={stats.timeOfDayChartData.colors}
          />
        </div>
      </div>

      {/* Event Details Table with Group Management */}
      <div className="pt-4">
        <h3 className="text-base font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-white">
          Quản lý nhóm & Chi tiết sự kiện
        </h3>
        <EventDetailsTable 
          events={events} 
          groups={groups} 
          onDeleteGroup={handleDeleteGroup}
          deletingGroupId={deletingGroupId}
        />
      </div>
    </div>
  );
}