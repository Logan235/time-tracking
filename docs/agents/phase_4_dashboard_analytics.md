# MASTER PROMPT: PHASE 4 - DASHBOARD & ANALYTICS (APEXCHARTS)

## 1. MỤC TIÊU CỦA PHASE 4 (CONTEXT)

Chúng ta đã hoàn thành Phase 3 (Kéo thả, phân nhóm sự kiện thành công). Bây giờ trong store Zustand, chúng ta đã có mảng `events` chứa các sự kiện từ Google, mỗi sự kiện đã được đính kèm `groupId` tương ứng (hoặc `unassigned`).

Mục tiêu của Phase 4 là trực quan hóa dữ liệu này thành một Dashboard thống kê thời gian thực tế:

1. **Xử lý dữ liệu (Data Processing):** Tính toán thời lượng (duration) của từng sự kiện dựa trên `start` và `end`. Nhóm tổng thời lượng theo từng Group.

2. **Giao diện Dashboard (UI):** Sử dụng `Tailwind CSS` và `DaisyUI` để tạo lưới (Grid) hiển thị các chỉ số (Stats).

3. **Biểu đồ (Charts):** Sử dụng thư viện `react-apexcharts` để vẽ:
   * Biểu đồ Tròn (Pie Chart): Tỉ lệ phân bổ thời gian giữa các Nhóm.
   * Biểu đồ Cột (Bar Chart): Xu hướng sử dụng thời gian theo từng ngày (Stacked Bar).

4. **Bảng chi tiết (Data Table):** Sử dụng component `table` của DaisyUI để liệt kê chi tiết các sự kiện và thời gian tương ứng.

## 2. HƯỚNG DẪN XỬ LÝ LOGIC (DATA PROCESSING)

### 2.1. Tính toán thời lượng (Duration)
* Dữ liệu trả về từ Google Calendar thường có định dạng: 
  `start: { dateTime: '2023-10-25T10:00:00Z' }` và `end: { dateTime: '2023-10-25T11:30:00Z' }`.
* Sử dụng thư viện `date-fns` hoặc `dayjs` (nếu đã cài đặt) để tính sự chênh lệch thời gian (theo phút hoặc giờ).
* *Lưu ý Edge Case:* Nếu sự kiện là cả ngày (All-day event), Google sẽ trả về `start: { date: '2023-10-25' }`. Hãy bỏ qua các sự kiện này trong biểu đồ Time Tracking hoặc mặc định cho nó giá trị 0h để tránh làm sai lệch biểu đồ.

### 2.2. Nhóm dữ liệu (Aggregation)
Viết một hook hoặc utility function (VD: `useDashboardStats(events, groups)`) để trả về:
1. `totalTrackedTime`: Tổng số giờ đã track (chỉ tính những event đã có `groupId`).
2. `timeByGroup`: Object/Array chứa tổng thời gian của từng nhóm để truyền vào Pie Chart. (Kèm theo `color` của Group đó).
3. `timeByDay`: Object/Array để truyền vào Bar Chart (Trục X là các ngày trong tuần, Trục Y là số giờ, chia thành các series theo Group).

## 3. THIẾT KẾ UI VÀ BIỂU ĐỒ (DAISYUI & APEXCHARTS)

### 3.1. Các Components Cần Thiết
* **`StatsOverview`**: Sử dụng DaisyUI `<div className="stats shadow">...</div>` để hiển thị: Tổng giờ, Nhóm tốn nhiều thời gian nhất, Số lượng sự kiện đã track.
* **`TimePieChart`**: Trực quan hóa biến `timeByGroup` bằng `<Chart type="pie" />` của ApexCharts. Lưu ý đồng bộ màu sắc (`colors` prop của ApexCharts) với màu của Group lưu trong CSDL.
* **`DailyBarChart`**: Trực quan hóa biến `timeByDay` bằng `<Chart type="bar" options={{ chart: { stacked: true } }} />`.
* **`EventDetailsTable`**: Một bảng hiển thị: Tên sự kiện, Thời gian bắt đầu, Nhóm đang gán, Thời lượng (vd: 1h 30m).

### 3.2. Bố cục (Layout)
* Dùng CSS Grid `grid-cols-1 lg:grid-cols-2` hoặc `lg:grid-cols-3` cho Dashboard. 
* Đặt `StatsOverview` ở trên cùng.
* Hàng tiếp theo: Trái là `DailyBarChart` (rộng hơn, col-span-2), Phải là `TimePieChart` (col-span-1).
* Dưới cùng là `EventDetailsTable`.

## 4. HÀNH ĐỘNG CHO AI AGENT NGAY BÂY GIỜ

Hãy thực hiện theo trình tự sau, trình bày code từng bước để tôi review trước khi đi tiếp:

1. **Bước 1:** Viết file `dashboardUtils.ts` (hoặc trong thư mục utils). Viết các hàm logic để lấy mảng `events` và `groups` (từ trạng thái Zustand) và tính toán ra 3 biến: `totalTrackedTime`, mảng data cho Pie Chart, mảng data cho Bar Chart. Xử lý cẩn thận tính toán ngày giờ. Hiển thị code file này.

2. **Bước 2:** Sau khi tôi duyệt Bước 1, hãy tiến hành viết các UI Components (`StatsOverview`, `TimePieChart`, `DailyBarChart`) sử dụng `react-apexcharts` và Tailwind/DaisyUI.