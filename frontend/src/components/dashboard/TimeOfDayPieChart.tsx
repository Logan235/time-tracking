import { useMemo } from 'react';
import Chart from 'react-apexcharts';

interface TimeOfDayPieChartProps {
  labels: string[];
  series: number[];
  colors: string[];
}

export function TimeOfDayPieChart({ labels, series, colors }: TimeOfDayPieChartProps) {
  // Kiểm tra có dữ liệu không
  const hasData = series.some((val) => val > 0);

  if (!hasData) {
    return (
      <div className="card-flat h-full min-h-[300px] flex flex-col">
        <div className="card-flat-body flex flex-col items-center justify-center flex-1 text-center py-8">
          <div className="text-5xl mb-3 opacity-30">⏰</div>
          <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">Chưa có dữ liệu thời gian trong ngày</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 font-normal mt-1">Phân bổ sự kiện để xem biểu đồ khung giờ</p>
        </div>
      </div>
    );
  }

  // Lọc các mục có giá trị > 0 để hiển thị gọn gàng
  const filteredData = useMemo(() => 
    labels
      .map((label, index) => ({
        label,
        value: series[index],
        color: colors[index],
      }))
      .filter((item) => item.value > 0),
    [labels, series, colors]
  );

  const chartLabels = useMemo(() => filteredData.map((item) => item.label), [filteredData]);
  const chartSeries = useMemo(() => filteredData.map((item) => item.value), [filteredData]);
  const chartColors = useMemo(() => filteredData.map((item) => item.color), [filteredData]);

  const options = useMemo((): any => ({
    chart: {
      type: 'donut',
      fontFamily: 'inherit',
      toolbar: { show: false },
      animations: { enabled: true, speed: 400, easing: 'easeinout' },
    },
    labels: chartLabels,
    colors: chartColors,
    legend: {
      position: 'bottom',
      fontSize: '12px',
      fontFamily: 'inherit',
      labels: { colors: '#94a3b8' },
      itemMargin: { horizontal: 12, vertical: 6 },
      formatter: (name: string, opts: any) => {
        const val = chartSeries[opts.seriesIndex];
        return `${name} (${val !== undefined ? val.toFixed(1) : '0'}h)`;
      },
      onItemClick: { toggleDataSeries: true },
      onItemHover: { highlightDataSeries: true },
    },
    tooltip: {
      theme: 'dark',
      y: {
        formatter: (val: number) => `${val.toFixed(1)}h`,
      },
      style: { fontSize: '13px' },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '14px',
              fontFamily: 'inherit',
              fontWeight: 600,
              color: '#f8fafc',
              offsetY: -4,
            },
            value: {
              show: true,
              fontSize: '12px',
              fontFamily: 'inherit',
              fontWeight: 400,
              color: '#94a3b8',
              offsetY: 8,
              formatter: (val: number) => `${val.toFixed(1)}h`,
            },
            total: {
              show: true,
              fontSize: '12px',
              fontFamily: 'inherit',
              fontWeight: 500,
              color: '#94a3b8',
              label: 'Tổng',
              formatter: (w: any) => {
                const total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
                return `${total.toFixed(1)}h`;
              },
            },
          },
        },
      },
    },
    responsive: [
      {
        breakpoint: 640,
        options: {
          legend: { fontSize: '10px', itemMargin: { horizontal: 6, vertical: 4 } },
          plotOptions: { pie: { donut: { size: '70%' } } },
        },
      },
    ],
  }), [chartLabels, chartSeries, chartColors]);

  return (
    <div className="card-flat h-full flex flex-col justify-between p-4 sm:p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
      <div>
        <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-100 mb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 flex-shrink-0" />
          Phân bổ thời gian trong ngày
        </h3>
        <div className="h-4 mb-2" /> {/* Spacer to align with TimePieChart if dateRangeInfo is present */}
      </div>
      <div className="w-full flex items-center justify-center my-2" style={{ minHeight: '260px' }}>
        <Chart options={options} series={chartSeries} type="donut" width="100%" height={280} />
      </div>
    </div>
  );
}