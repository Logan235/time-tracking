# MASTER PROMPT: PHASE 2 - GOOGLE CALENDAR SYNC & GROUPS CRUD

## 1. MỤC TIÊU CỦA PHASE 2 (CONTEXT)
Chúng ta đã hoàn thành Phase 1 (Khởi tạo dự án & Đăng nhập Google OAuth2 thành công). Trọng tâm của Phase 2 là thiết lập luồng dữ liệu cốt lõi của ứng dụng:
1. Backend (NestJS) gọi API Google Calendar của User để lấy các sự kiện.
2. Backend (NestJS) cung cấp CRUD cho Groups (Các nhóm phân loại lịch).
3. Hợp nhất dữ liệu (Merge Data): Trả về danh sách sự kiện từ Google đã được "đính kèm" thông tin Nhóm (lấy từ EventMapping trong MongoDB).
4. Frontend (React) sử dụng Zustand để lưu trữ và quản lý các state này.

## 2. NHIỆM VỤ BACKEND (NESTJS & MONGODB)

### 2.1. Cấu hình Google Calendar API Service
* Sử dụng package `googleapis`.
* Lấy `googleAccessToken` và `googleRefreshToken` của User đang đăng nhập (từ MongoDB). 
* **Lưu ý quan trọng:** Cần xử lý logic tự động refresh token nếu `googleAccessToken` bị hết hạn bằng cách sử dụng `googleRefreshToken`.
* Viết service gọi API lấy danh sách events (`calendar.events.list`). 
  * Params mặc định: `timeMin` là thời điểm hiện tại trừ đi 7 ngày (hoặc đầu tuần), `timeMax` là hiện tại cộng thêm 7 ngày.
  * Chỉ lấy lịch `primary`.

### 2.2. Xây dựng Module Groups & EventMapping
* **Groups CRUD Endpoints:**
  * `POST /groups`: Tạo nhóm mới (cần `name`, `color`).
  * `GET /groups`: Lấy danh sách nhóm của user hiện tại.
  * `PUT /groups/:id` & `DELETE /groups/:id`.
* **EventMapping Endpoints:**
  * `POST /mappings`: Gán 1 sự kiện vào 1 nhóm. (Body gồm: `eventId` của Google và `groupId`). Sử dụng `findOneAndUpdate` với `upsert: true` để nếu event đã có map thì update group mới.
  * `DELETE /mappings/:eventId`: Gỡ sự kiện khỏi nhóm (Chuyển về trạng thái Unassigned).

### 2.3. Endpoint Hợp nhất dữ liệu (Merge Data)
* Tạo endpoint `GET /calendar/events`.
* **Luồng xử lý:**
  1. Fetch danh sách sự kiện từ Google API.
  2. Fetch danh sách `EventMapping` của user hiện tại từ MongoDB.
  3. Lặp qua danh sách sự kiện từ Google, nếu `eventId` khớp với bản ghi trong `EventMapping`, hãy đính kèm thêm `groupId` và `groupDetail` (name, color) vào object event đó.
  4. Trả về mảng JSON đã được merge hoàn chỉnh cho Frontend.

## 3. NHIỆM VỤ FRONTEND (REACT & ZUSTAND)

### 3.1. Thiết lập Zustand Store (`useTimeTrackStore`)
* Khởi tạo file store lưu các state sau:
  * `events`: Mảng sự kiện lấy từ API `/calendar/events`.
  * `groups`: Mảng nhóm lấy từ API `/groups`.
  * `isLoading`: Trạng thái loading.
* Viết các async actions trong Zustand:
  * `fetchEvents()`: Gọi API và cập nhật `events`.
  * `fetchGroups()`: Gọi API và cập nhật `groups`.
  * `assignEventToGroup(eventId, groupId)`: Gọi API POST `/mappings` và update lại state `events` local (Optimistic update) để UI mượt mà.

### 3.2. Chuẩn bị UI Cơ bản (Chuẩn bị cho Drag & Drop ở Phase 3)
* Tạo 1 trang Dashboard thô (chưa cần kéo thả).
* Render danh sách `Groups` lấy được từ Store.
* Render danh sách `Events` lấy được từ Store. Phân tách rõ những sự kiện chưa có nhóm (Unassigned) và những sự kiện đã có nhóm.

## 4. HÀNH ĐỘNG CHO AI AGENT NGAY BÂY GIỜ

Hãy thực hiện từng bước và báo cáo kết quả. Đừng làm tất cả cùng lúc để tôi dễ dàng review:

1. **Bước 1:** Viết `GoogleCalendarService` trong NestJS. Xử lý việc khởi tạo `google.calendar` client với auth token của user. Code logic lấy danh sách sự kiện trong 7 ngày qua. Trình bày code của bạn.
2. **Bước 2:** Sau khi tôi duyệt Bước 1, hãy tiến hành viết schema/controller cho `Groups` và luồng Merge dữ liệu Google Events + Mappings.