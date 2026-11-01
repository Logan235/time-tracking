# TimeTracker - Google Calendar Time Management System

## Giới thiệu

**TimeTracker** là ứng dụng web giúp bạn quản lý thời gian hiệu quả bằng cách tích hợp với Google Calendar. Ứng dụng cho phép bạn:

- 🔐 **Đăng nhập an toàn** qua Google OAuth 2.0
- 📅 **Đồng bộ sự kiện** từ Google Calendar của bạn (chỉ đọc, không thay đổi lịch gốc)
- 🎨 **Tạo nhóm tùy chỉnh** với màu sắc riêng để phân loại sự kiện
- 🖱️ **Kéo thả trực quan** để gán sự kiện vào các nhóm
- 📊 **Dashboard phân tích** với biểu đồ tròn, cột, bảng thống kê theo ngày/tuần/tháng
- 🌓 **Chế độ Dark/Light mode** thân thiện với mắt

## Công nghệ sử dụng

### Backend (NestJS)
- **Framework**: NestJS 12 (Node.js + TypeScript + ESM)
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: 
  - Google OAuth 2.0 (passport-google-oauth20)
  - JWT (JSON Web Tokens) cho phiên đăng nhập
- **Security**: 
  - Rate limiting với @nestjs/throttler (100 req/phút/IP)
  - CORS production-ready
  - HTTP Security Headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy)
- **API Integration**: Google Calendar API (googleapis)

### Frontend (React + Vite)
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 8
- **State Management**: Zustand (lightweight alternative to Redux)
- **Styling**: Tailwind CSS + DaisyUI
- **Drag & Drop**: @hello-pangea/dnd (fork of react-beautiful-dnd)
- **Charts**: ApexCharts
- **Icons**: Lucide React

---

## Các file quan trọng cần biết

### Backend

1. **`backend/src/main.ts`**
   - Entry point của backend
   - Cấu hình global prefix `/api` (tất cả routes đều có prefix `/api`)
   - Cấu hình CORS cho production (Render URLs) và development (localhost)
   - Security headers

2. **`backend/src/app.module.ts`**
   - Module chính, import tất cả module con
   - Cấu hình MongoDB connection (đọc từ biến môi trường `MONGO_URI`)
   - Cấu hình rate limiting/throttler (100 req/phút)
   - Cấu hình JWT (secret từ `JWT_SECRET`)

3. **`backend/src/groups/groups.service.ts`**
   - Logic xóa nhóm sử dụng **MongoDB Transaction** để đảm bảo tính toàn vẹn dữ liệu
   - Khi xóa nhóm, tự động xóa tất cả event mappings liên quan (ACID transaction)

4. **`backend/.env`**
   - File chứa các biến môi trường local (không được push lên Git)
   - Các biến quan trọng:
     - `PORT`: Cổng chạy backend (mặc định 4000)
     - `MONGO_URI`: Chuỗi kết nối MongoDB
     - `JWT_SECRET`: Secret key cho JWT
     - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`: Credentials từ Google Cloud Console
     - `GOOGLE_CALLBACK_URL`: URL callback OAuth (phải có `/api` prefix)
     - `FRONTEND_URL`: URL frontend để cấu hình CORS

### Frontend

1. **`frontend/src/App.tsx`**
   - Component chính của ứng dụng
   - Xử lý routing (login page vs main app)
   - Xử lý OAuth callback (nhận token từ query params)

2. **`frontend/src/store/useTimeTrackStore.ts`**
   - Zustand store quản lý state toàn cục
   - Các function quan trọng:
     - `fetchEvents()`: Lấy danh sách sự kiện từ backend
     - `fetchGroups()`: Lấy danh sách nhóm
     - `createGroup()`: Tạo nhóm mới
     - `assignEventToGroup()`: Gán sự kiện vào nhóm (có optimistic update)
     - `deleteGroup()`: Xóa nhóm

3. **`frontend/src/config/api.ts`**
   - Cấu hình base URL cho API calls
   - Đọc từ biến môi trường `VITE_API_URL` hoặc default `http://localhost:4000/api`

4. **`frontend/.npmrc`**
   - Cấu hình npm để bỏ qua lỗi peer dependency conflict (cần thiết cho deploy Render)

### Root

1. **`render.yaml`**
   - Blueprint deploy cho Render
   - Định nghĩa 2 services: backend (Web Service) và frontend (Static Site)
   - Các biến môi trường production

2. **`pnpm-workspace.yaml`**
   - Cấu hình pnpm monorepo
   - Cho phép quản lý dependencies của backend và frontend trong cùng 1 repository

---

## Hướng dẫn chạy dự án (Local Development)

### Yêu cầu hệ thống
- **Node.js**: >= 22.0.0
- **pnpm**: >= 9.0.0 (cài đặt: `npm install -g pnpm`)
- **MongoDB**: Local MongoDB hoặc MongoDB Atlas (cloud)
- **Git**: Để clone repository

### Bước 1: Clone repository

```bash
git clone https://github.com/Logan235/time-tracking.git
cd time-tracking
```

### Bước 2: Cài đặt dependencies

Từ thư mục gốc của dự án, chạy:

```bash
pnpm install
```

Lệnh này sẽ cài đặt dependencies cho cả backend và frontend nhờ cấu hình pnpm workspace.

### Bước 3: Cấu hình biến môi trường

#### Backend

1. Copy file `.env.example` thành `.env`:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. Mở file `backend/.env` và điền các thông tin:
   ```env
   PORT=4000
   NODE_ENV=development
   
   # MongoDB (local hoặc Atlas)
   MONGO_URI=mongodb://localhost:27017/time_tracking
   
   # Frontend URL
   FRONTEND_URL=http://localhost:5173
   
   # Google OAuth (xem hướng dẫn setup phía dưới)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_CALLBACK_URL=http://localhost:4000/api/auth/google/callback
   
   # JWT
   JWT_SECRET=super-secret-jwt-key-change-this-in-production
   JWT_EXPIRATION=7d
   ```

#### Frontend

1. Copy file `.env.example` thành `.env`:
   ```bash
   cd ../frontend
   cp .env.example .env
   ```

2. Mở file `frontend/.env` và điền:
   ```env
   VITE_API_URL=http://localhost:4000/api
   ```

### Bước 4: Setup Google OAuth 2.0

Để ứng dụng hoạt động, bạn cần tạo Google OAuth credentials:

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project có sẵn
3. Vào **APIs & Services** → **Credentials**
4. Nhấn **Create Credentials** → **OAuth 2.0 Client IDs**
5. Chọn **Application type**: Web application
6. Thêm **Authorized JavaScript origins**:
   - `http://localhost:5173`
   - `http://localhost:4000`
7. Thêm **Authorized redirect URIs**:
   - `http://localhost:4000/api/auth/google/callback`
8. Nhấn **Create** và copy **Client ID** và **Client Secret**
9. Paste vào file `backend/.env`
10. Vào **APIs & Services** → **Library** → Tìm và enable **Google Calendar API**

### Bước 5: Khởi động MongoDB

Nếu dùng MongoDB local:

```bash
# macOS/Linux
mongod

# Windows (nếu đã cài MongoDB service)
net start MongoDB
```

Nếu dùng MongoDB Atlas, đảm bảo connection string trong `.env` đã đúng.

### Bước 6: Chạy Backend

Mở terminal mới, từ thư mục gốc:

```bash
cd backend
pnpm run start:dev
```

Backend sẽ chạy ở `http://localhost:4000`, API có prefix `/api` nên endpoints thực tế là:
- `http://localhost:4000/api/health` (health check)
- `http://localhost:4000/api/auth/google` (OAuth login)
- `http://localhost:4000/api/groups` (quản lý nhóm)
- v.v.

### Bước 7: Chạy Frontend

Mở terminal mới, từ thư mục gốc:

```bash
cd frontend
pnpm run dev
```

Frontend sẽ chạy ở `http://localhost:5173`.

### Bước 8: Truy cập ứng dụng

1. Mở trình duyệt và truy cập `http://localhost:5173`
2. Nhấn nút **Sign In with Google**
3. Chọn tài khoản Google của bạn
4. Cho phép ứng dụng truy cập Google Calendar (read-only)

---

## Kiểm tra hệ thống

### Kiểm tra Backend

1. **Health check endpoint**:
   ```bash
   curl http://localhost:4000/api/health
   ```
   
   Kết quả mong đợi:
   ```json
   {
     "status": "ok",
     "timestamp": "2026-10-30T...",
     "uptime": 123.456,
     "environment": "development",
     "version": "1.0.0"
   }
   ```

2. **Kiểm tra MongoDB connection**:
   - Xem logs trong terminal backend, tìm dòng:
     ```
     [InstanceLoader] MongooseModule dependencies initialized +XXms
     ```

3. **Test Google OAuth flow**:
   - Truy cập `http://localhost:4000/api/auth/google` trên trình duyệt
   - Bạn sẽ được redirect sang Google login page

### Kiểm tra Frontend

1. **Kiểm tra Vite dev server**:
   - Mở `http://localhost:5173`, trang login sẽ hiển thị
   
2. **Kiểm tra API connection**:
   - Sau khi đăng nhập, mở DevTools (F12) → Network tab
   - Xem các requests đến `http://localhost:4000/api/...`
   - Tất cả requests sẽ có header `Authorization: Bearer <token>`

3. **Test các chức năng chính**:
   - ✅ Tạo nhóm mới (nhấn nút **+ New Group**)
   - ✅ Kéo thả sự kiện vào nhóm
   - ✅ Xem dashboard (tab **Dashboard & Analytics**)
   - ✅ Chuyển đổi Dark/Light mode
   - ✅ Xóa nhóm (sự kiện tự động unassign)

---

## Build Production

### Build Backend

```bash
cd backend
pnpm run build
```

File build sẽ nằm trong thư mục `backend/dist/`.

Chạy production:
```bash
pnpm run start:prod
```

### Build Frontend

```bash
cd frontend
pnpm run build
```

File build sẽ nằm trong thư mục `frontend/dist/`.

Preview production build:
```bash
pnpm run preview
```

---

## Deploy lên Render

### Cách 1: Sử dụng Render Blueprint (Khuyến nghị)

1. Đăng nhập vào [Render Dashboard](https://dashboard.render.com/)
2. Nhấn **New +** → **Blueprint**
3. Kết nối GitHub repository
4. Render sẽ tự động đọc file `render.yaml` và tạo:
   - Backend Web Service
   - Frontend Static Site
5. Điền các biến môi trường bí mật:
   - `MONGO_URI`: MongoDB Atlas connection string
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`: Google OAuth credentials
6. Nhấn **Apply**

### Cách 2: Deploy thủ công từng service

#### Deploy Backend

1. Nhấn **New +** → **Web Service**
2. Kết nối GitHub repo
3. Cấu hình:
   - **Name**: `time-tracking-backend`
   - **Environment**: Node
   - **Root Directory**: `backend`
   - **Build Command**: `pnpm install && pnpm build`
   - **Start Command**: `pnpm start:prod`
4. Thêm biến môi trường (xem `backend/.env.example`)
5. Nhấn **Create Web Service**

#### Deploy Frontend

1. Nhấn **New +** → **Static Site**
2. Kết nối GitHub repo
3. Cấu hình:
   - **Name**: `time-tracking-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install --legacy-peer-deps && npm run build`
   - **Publish Directory**: `dist`
4. Thêm biến môi trường:
   - `VITE_API_URL`: URL của backend (ví dụ: `https://time-tracking-backend.onrender.com/api`)
5. Nhấn **Create Static Site**

### Cập nhật Google OAuth cho Production

Sau khi deploy, cập nhật Google Cloud Console:
1. **Authorized JavaScript origins**:
   - Thêm URL frontend production: `https://<frontend>.onrender.com`
   - Thêm URL backend production: `https://<backend>.onrender.com`
2. **Authorized redirect URIs**:
   - Thêm: `https://<backend>.onrender.com/api/auth/google/callback`

---

## Troubleshooting

### Lỗi: "Failed to fetch events"

**Nguyên nhân**: Backend không kết nối được MongoDB hoặc Google Calendar API.

**Giải pháp**:
- Kiểm tra `MONGO_URI` trong `.env` có đúng không
- Kiểm tra Google Calendar API đã được enable chưa
- Xem logs backend để tìm lỗi chi tiết

### Lỗi: "404 Not Found" khi gọi API

**Nguyên nhân**: Frontend gọi sai URL hoặc thiếu prefix `/api`.

**Giải pháp**:
- Kiểm tra `VITE_API_URL` trong `frontend/.env` có đúng không
- Đảm bảo URL có đuôi `/api` (ví dụ: `http://localhost:4000/api`)

### Lỗi: "redirect_uri_mismatch" khi login Google

**Nguyên nhân**: URL callback không khớp với cấu hình trong Google Cloud Console.

**Giải pháp**:
- Kiểm tra `GOOGLE_CALLBACK_URL` trong `backend/.env`
- Đảm bảo URL này đã được thêm vào **Authorized redirect URIs** trong Google Cloud Console
- URL phải chính xác: `http://localhost:4000/api/auth/google/callback`

### Lỗi: "ERESOLVE unable to resolve dependency tree" khi build trên Render

**Nguyên nhân**: Xung đột peer dependencies giữa TypeScript 7 và typescript-eslint.

**Giải pháp**:
- Đảm bảo file `.npmrc` tồn tại ở thư mục `frontend/` với nội dung:
  ```ini
  legacy-peer-deps=true
  strict-peer-dependencies=false
  ```
- Push lại code lên GitHub và redeploy

### Backend không kết nối MongoDB trên Render

**Nguyên nhân**: Connection string MongoDB Atlas không đúng hoặc IP không được whitelist.

**Giải pháp**:
- Vào MongoDB Atlas → Network Access
- Thêm IP `0.0.0.0/0` (allow all) hoặc whitelist IP của Render
- Kiểm tra connection string có đúng format: `mongodb+srv://user:password@cluster.mongodb.net/dbname`

---

## Scripts hữu ích

### Backend

```bash
# Development mode với hot reload
pnpm run start:dev

# Production build
pnpm run build

# Run production
pnpm run start:prod

# Lint code
pnpm run lint

# Format code
pnpm run format
```

### Frontend

```bash
# Development server
pnpm run dev

# Production build
pnpm run build

# Preview production build
pnpm run preview

# Lint code
pnpm run lint
```

### Root (Monorepo)

```bash
# Build cả backend và frontend
pnpm run build:all

# Build chỉ frontend
pnpm run build:frontend
```

---

## License

MIT License - Bạn có thể tự do sử dụng, sửa đổi và phân phối dự án này.

---

**Chúc bạn làm việc hiệu quả với TimeTracker! 🚀**


```
TIMETRACKING/
├── backend/                      # Backend NestJS
│   ├── src/
│   │   ├── auth/                 # Module xác thực (Google OAuth + JWT)
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── google.strategy.ts
│   │   │   └── jwt.strategy.ts
│   │   ├── users/                # Module quản lý người dùng
│   │   │   ├── users.service.ts
│   │   │   └── schemas/user.schema.ts
│   │   ├── groups/               # Module quản lý nhóm sự kiện
│   │   │   ├── groups.controller.ts
│   │   │   ├── groups.service.ts  # Có logic transaction MongoDB
│   │   │   └── schemas/group.schema.ts
│   │   ├── event-mappings/       # Module gán sự kiện vào nhóm
│   │   │   ├── event-mappings.controller.ts
│   │   │   ├── event-mappings.service.ts
│   │   │   └── schemas/event-mapping.schema.ts
│   │   ├── calendar/             # Module đồng bộ Google Calendar
│   │   │   ├── calendar.controller.ts
│   │   │   ├── google-calendar.service.ts
│   │   │   └── calendar.module.ts
│   │   ├── app.module.ts         # Module chính (cấu hình MongoDB, Throttler, JWT)
│   │   └── main.ts               # Entry point (CORS, global prefix /api)
│   ├── package.json
│   ├── .env                      # Biến môi trường local (không push lên Git)
│   └── .env.example              # Template biến môi trường
│
├── frontend/                     # Frontend React
│   ├── src/
│   │   ├── components/
│   │   │   ├── TimeTrackingBoard.tsx   # Board chính (drag & drop)
│   │   │   ├── dashboard/
│   │   │   │   ├── DashboardView.tsx
│   │   │   │   ├── TimePieChart.tsx
│   │   │   │   ├── TimeOfDayPieChart.tsx
│   │   │   │   └── DailyBarChart.tsx
│   │   │   └── ui/
│   │   │       └── ThemeToggle.tsx
│   │   ├── store/
│   │   │   └── useTimeTrackStore.ts    # Zustand store (events, groups, API calls)
│   │   ├── context/
│   │   │   └── ThemeContext.tsx
│   │   ├── config/
│   │   │   └── api.ts                  # API base URL configuration
│   │   ├── App.tsx                     # Component chính
│   │   └── main.tsx                    # Entry point
│   ├── package.json
│   ├── .npmrc                          # Cấu hình npm (bỏ qua peer deps conflict)
│   └── .env.example
│
├── .gitignore                    # Ignore node_modules, .env, dist, build
├── .npmrc                        # Cấu hình npm cho root (legacy-peer-deps)
├── render.yaml                   # Blueprint deploy Render (backend + frontend)
├── pnpm-workspace.yaml           # Cấu hình pnpm monorepo
└── README.md                     # File này
```
