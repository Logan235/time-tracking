# MASTER PROMPT: DỰ ÁN TIME TRACKING & GOOGLE CALENDAR DASHBOARD

## 1. BỐI CẢNH (CONTEXT)
- **Dự án:** Ứng dụng Time Tracking kết nối với Google Calendar.
- **Mục tiêu:** 
  1. Người dùng đăng nhập bằng Google.
  2. Hệ thống gọi API trực tiếp từ Google Calendar lấy danh sách sự kiện (mặc định 7 ngày).
  3. Cung cấp giao diện Kéo thả (Drag & Drop): Cột 1 là danh sách sự kiện từ Google, Cột 2 là các Nhóm (Groups) do người dùng tự tạo. Kéo sự kiện vào nhóm để phân loại.
  4. Hiển thị Dashboard (Tròn, Cột, Bảng) thống kê thời gian theo Ngày/Tuần/Tháng dựa trên dữ liệu đã phân nhóm.
- **Quy tắc cốt lõi:** Khi phân nhóm, KHÔNG cập nhật ngược lại Google Calendar. Chỉ lưu Mapping (Sự kiện A thuộc Nhóm B) tại Database nội bộ (MongoDB).

## 2. TECH STACK & LỰA CHỌN THƯ VIỆN
- **Package Manager:** `pnpm` (Triển khai Monorepo Workspace: `/frontend` và `/backend`).
- **Frontend:** 
  - Framework: `ReactJS` (Vite).
  - Styling: `Tailwind CSS`, `DaisyUI`.
  - State Management: `Zustand`.
  - Drag & Drop: `@dnd-kit/core`, `@dnd-kit/sortable`.
  - Biểu đồ (Charts): `ApexCharts` (`react-apexcharts`).
- **Backend:** `NestJS`.
- **Database:** `MongoDB` (Mongoose).
- **Authentication:** `passport-google-oauth20` kết hợp internal JWT. Xin quyền (scope): `profile`, `email`, `https://www.googleapis.com/auth/calendar.readonly`.

## 3. THIẾT KẾ CƠ SỞ DỮ LIỆU & LUỒNG API (CRITICAL)

**Database Schema (Mongoose):**
Vì chúng ta gọi API trực tiếp từ Google để lấy Event, MongoDB sẽ chỉ lưu User, Group và Mapping.
1. `User`:
   - `googleId`, `email`, `name`, `avatar`
   - `googleAccessToken`, `googleRefreshToken` (Cần lưu để NestJS gọi Google API thay user).
2. `Group`: 
   - `userId` (Ref User)
   - `name` (Tên nhóm, vd: Học tập, Làm việc)
   - `color` (Màu sắc hiển thị trên UI)
3. `EventMapping`:
   - `userId` (Ref User)
   - `eventId` (String - ID của sự kiện lấy từ Google)
   - `groupId` (Ref Group)

**Luồng dữ liệu (Data Flow):**
- Khi React gọi GET `/api/calendar/events?days=7`:
  1. NestJS lấy `googleAccessToken` của user hiện tại.
  2. Gọi Google Calendar API lấy danh sách events trong 7 ngày.
  3. Query collection `EventMapping` trong MongoDB.
  4. Merge dữ liệu: Trả về cho React mảng events, trong đó mỗi event đã được gắn thêm thông tin `group` (nếu đã được kéo thả trước đó).

## 4. CÁC PHASE TỔNG QUAN (OVERALL ROADMAP)

- **Phase 1: Project Setup & Authentication**
  - Khởi tạo Monorepo PNPM.
  - Setup Frontend (Vite + Tailwind + DaisyUI).
  - Setup Backend (NestJS + MongoDB).
  - Cấu hình Google OAuth2, xử lý lưu Token, trả JWT cho Frontend.
- **Phase 2: Google Calendar Integration & Groups CRUD**
  - Viết module gọi Google API lấy lịch (7 days default).
  - Viết CRUD cho `Groups` và lưu/xóa `EventMapping`.
- **Phase 3: Frontend Drag & Drop (UI & State)**
  - Cấu hình Zustand store lưu trữ danh sách Events và Groups.
  - Tích hợp `@dnd-kit` xây dựng 2 bảng: Unassigned Events và Grouped Boards. Xử lý UI kéo thả cực mượt. Cập nhật API khi drop thành công.
- **Phase 4: Dashboard & Analytics**
  - Xử lý dữ liệu (nhóm thời lượng theo Group) cho Ngày/Tuần/Tháng.
  - Tích hợp `ApexCharts` vẽ biểu đồ Tròn (Pie), Cột (Bar) và Bảng chi tiết.

## 5. PHASE HIỆN TẠI (CURRENT PHASE) - HÀNH ĐỘNG CHO AI AGENT

**Mục tiêu của bạn (AI Agent) trong lượt prompt này là thực hiện [PHASE 1].**

**Công việc cụ thể:**
1. **Tạo Monorepo:** Setup thư mục gốc bằng `pnpm` với 2 thư mục `frontend` và `backend`.
2. **Backend (NestJS):**
   - Khởi tạo NestJS app.
   - Kết nối MongoDB bằng Mongoose.
   - Cài đặt `passport`, `passport-google-oauth20`, `@nestjs/jwt`.
   - Dựng logic luồng Google Auth: Tạo Endpoints `/auth/google` (Redirect) và `/auth/google/callback`. Khi callback thành công, Upsert User (lưu cả Google Tokens) và trả về nội bộ một JWT (via HttpOnly Cookie hoặc redirect kèm token).
3. **Frontend (React):**
   - Khởi tạo Vite React.
   - Cài đặt Tailwind CSS và DaisyUI plugin.
   - Tạo một UI Login Screen đơn giản (Sử dụng Hero component của DaisyUI) có nút "Login with Google" trỏ tới API của Backend.

**Yêu cầu:** Hãy bắt đầu với việc thiết lập Backend (Code Auth Module và User Schema) và show cho tôi cấu trúc code của bạn để review luồng đăng nhập trước khi tiến sang Frontend.