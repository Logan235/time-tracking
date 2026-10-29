export function calculateDashboardStats(
  events: CalendarEvent[],
  groups: Group[],
  selectedDate: string | null = null,
) {
  // 1. Tổng số phút đã track (chỉ tính các event có groupId)
  let totalTrackedMinutes = 0;
  let trackedEventsCount = 0;

  const groupMinutesMap: Record<string, number> = {};
  const dailyMap: Record<string, Record<string, number>> = {};

  const timeOfDayMap: Record<string, number> = {
    h0_3: 0,
    h3_6: 0,
    h6_9: 0,
    h9_12: 0,
    h12_15: 0,
    h15_18: 0,
    h18_21: 0,
    h21_24: 0,
    flexible: 0,
  };

  events.forEach((event) => {
    if (!event.groupId) return;
    const duration = getEventDurationMinutes(event);
    if (duration <= 0) return;

    totalTrackedMinutes += duration;
    trackedEventsCount++;

    // Group minutes
    groupMinutesMap[event.groupId] =
      (groupMinutesMap[event.groupId] || 0) + duration;

    // Daily minutes
    const dates = getEventDateRange(event);
    dates.forEach((dateStr) => {
      if (!dailyMap[dateStr]) {
        dailyMap[dateStr] = {};
      }
      dailyMap[dateStr][event.groupId!] =
        (dailyMap[dateStr][event.groupId!] || 0) + duration;

      if (!selectedDate || dateStr === selectedDate) {
        let hour = 9;
        if (event.start?.dateTime) {
          const startDate = new Date(event.start.dateTime);
          if (!isNaN(startDate.getTime())) {
            hour = startDate.getHours();
          }
        } else if (event.timeOfDay) {
          if (event.timeOfDay === "morning") hour = 9;
          else if (event.timeOfDay === "afternoon") hour = 14;
          else if (event.timeOfDay === "evening") hour = 19;
          else if (event.timeOfDay === "night") hour = 23;
        }

        if (hour >= 0 && hour < 3) timeOfDayMap.h0_3 += duration;
        else if (hour >= 3 && hour < 6) timeOfDayMap.h3_6 += duration;
        else if (hour >= 6 && hour < 9) timeOfDayMap.h6_9 += duration;
        else if (hour >= 9 && hour < 12) timeOfDayMap.h9_12 += duration;
        else if (hour >= 12 && hour < 15) timeOfDayMap.h12_15 += duration;
        else if (hour >= 15 && hour < 18) timeOfDayMap.h15_18 += duration;
        else if (hour >= 18 && hour < 21) timeOfDayMap.h18_21 += duration;
        else if (hour >= 21 && hour < 24) timeOfDayMap.h21_24 += duration;
        else timeOfDayMap.flexible += duration;
      }
    });
  });

  let minDateStr = "";
  let maxDateStr = "";
  let totalDays = 0;

  const allDates = Object.keys(dailyMap).sort();
  if (allDates.length > 0) {
    minDateStr = allDates[0];
    maxDateStr = allDates[allDates.length - 1];
    const minDate = new Date(minDateStr);
    const maxDate = new Date(maxDateStr);
    totalDays =
      Math.ceil(
        (maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24),
      ) + 1;
  }

  const formatDateReadable = (date: Date) => {
    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  };

  let dateRangeInfo = {
    startDateStr: "",
    endDateStr: "",
    startDateISO: "",
    endDateISO: "",
    totalDays: 0,
  };

  if (minDateStr && maxDateStr) {
    const minDate = new Date(minDateStr);
    const maxDate = new Date(maxDateStr);

    dateRangeInfo = {
      startDateStr: formatDateReadable(minDate),
      endDateStr: formatDateReadable(maxDate),
      startDateISO: minDateStr,
      endDateISO: maxDateStr,
      totalDays,
    };
  }

  const statsByGroup: GroupStat[] = groups.map((group) => {
    const mins = groupMinutesMap[group._id] || 0;
    return {
      groupId: group._id,
      groupName: group.name,
      color: group.color || "#3b82f6",
      totalMinutes: mins,
      formattedTime: formatMinutesToHoursMins(mins),
    };
  });

  statsByGroup.sort((a, b) => b.totalMinutes - a.totalMinutes);

  const pieChartData = {
    labels: statsByGroup.map((g) => g.groupName),
    series: statsByGroup.map((g) => Number((g.totalMinutes / 60).toFixed(2))),
    colors: statsByGroup.map((g) => g.color),
  };

  const timeOfDayLabels = [
    "00:00 - 03:00",
    "03:00 - 06:00",
    "06:00 - 09:00",
    "09:00 - 12:00",
    "12:00 - 15:00",
    "15:00 - 18:00",
    "18:00 - 21:00",
    "21:00 - 24:00",
    "Linh hoạt / All-day",
  ];
  const timeOfDayKeys = [
    "h0_3",
    "h3_6",
    "h6_9",
    "h9_12",
    "h12_15",
    "h15_18",
    "h18_21",
    "h21_24",
    "flexible",
  ];
  const timeOfDayColors = [
    "#1e293b",
    "#334155",
    "#f59e0b",
    "#fbbf24",
    "#3b82f6",
    "#60a5fa",
    "#8b5cf6",
    "#a78bfa",
    "#cbd5e1",
  ];

  const timeOfDaySeries = timeOfDayKeys.map((k) =>
    Number(((timeOfDayMap[k] || 0) / 60).toFixed(2)),
  );

  const timeOfDayChartData = {
    labels: timeOfDayLabels,
    series: timeOfDaySeries,
    colors: timeOfDayColors,
  };

  const sortedDates = Object.keys(dailyMap).sort();
  const barChartCategories = sortedDates.map((dateStr) => {
    const [, month, day] = dateStr.split("-");
    return `${day}/${month}`;
  });

  const barChartSeries = groups.map((group) => {
    return {
      name: group.name,
      color: group.color || "#3b82f6",
      data: sortedDates.map((dateStr) => {
        const mins = dailyMap[dateStr]?.[group._id] || 0;
        return Number((mins / 60).toFixed(2));
      }),
    };
  });

  return {
    totalTrackedTimeFormatted: formatMinutesToHoursMins(totalTrackedMinutes),
    totalTrackedHours: Number((totalTrackedMinutes / 60).toFixed(1)),
    trackedEventsCount,
    dateRangeInfo,
    statsByGroup,
    pieChartData,
    timeOfDayChartData,
    barChartData: {
      categories: barChartCategories,
      series: barChartSeries,
      rawDates: sortedDates,
      dailyMap,
    },
  };
}
