import Chart from 'react-apexcharts';

interface DailyBarChartProps {
  categories: string[];
  series: {
    name: string;
    color: string;
    data: number[];
  }[];
}

export function DailyBarChart({ categories, series }: DailyBarChartProps) {
  // Kiểm tra có dữ liệu không
  const hasData = series.some((s) => s.data.some((d) => d > 0));

  if (!hasData) {
    return (
      <div className="card-flat h-full min-h-[350px] flex flex-col">
        <div className="card-flat-body flex flex-col items-center justify-center flex-1 text-center py-12">
          <div className="text-6xl mb-4 opacity-30">📈</div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Chưa có dữ liệu xu hướng</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 font-normal mt-1">Theo dõi thời gian qua các ngày để xem biểu đồ</p>
        </div>
      </div>
    );
  }

  const options: any = {
    chart: {
      type: 'bar',
      fontFamily: 'inherit',
      stacked: true,
      toolbar: { show: false },
      animations: { enabled: true, speed: 300 },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '60%',
        borderRadius: 4,
        borderRadiusApplication: 'around',
      },
    },
    colors: series.map((s) => s.color),
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: { fontSize: '12px', fontFamily: 'inherit', colors: '#64748b' },
        rotate: -45,
      },
      crosshairs: { show: false },
    },
    yaxis: {
      title: {
        text: 'Giờ (h)',
        style: { fontSize: '12px', fontFamily: 'inherit', colors: '#64748b', fontWeight: 500 },
      },
      labels: {
        style: { fontSize: '11px', fontFamily: 'inherit', colors: '#94a3b8' },
        formatter: (val: number) => `${val}h`,
      },
      min: 0,
      tickAmount: 5,
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      fontSize: '12px',
      fontFamily: 'inherit',
      labels: { colors: '#64748b' },
      itemMargin: { horizontal: 10, vertical: 4 },
      markers: { width: 8, height: 8, radius: 4 },
      onItemClick: { toggleDataSeries: true },
      onItemHover: { highlightDataSeries: true },
    },
    tooltip: {
      theme: 'light',
      shared: true,
      intersect: false,
      y: {
        formatter: (val: number) => `${val.toFixed(1)}h`,
      },
    },
    grid: {
      show: true,
      borderColor: '#e2e8f0',
      strokeDashArray: 4,
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    dataLabels: { enabled: false },
    responsive: [
      {
        breakpoint: 768,
        options: {
          chart: { height: 300 },
          legend: { fontSize: '10px' },
          plotOptions: { bar: { columnWidth: '70%' } },
        },
      },
      {
        breakpoint: 480,
        options: {
          chart: { height: 260 },
          legend: { position: 'bottom', horizontalAlign: 'center' },
        },
      },
    ],
  };

  const chartSeries = series.map((s) => ({
    name: s.name,
    data: s.data,
    color: s.color,
  }));

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-4 sm:p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-100 mb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0" />
          Xu hướng thời gian theo ngày
        </h3>
      </div>
      <div className="w-full" style={{ minHeight: '320px' }}>
        <Chart options={options} series={chartSeries} type="bar" width="100%" height={350} />
      </div>
    </div>
  );
}