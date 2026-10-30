# MASTER PROMPT: UI/UX DESIGN SYSTEM & GUIDELINES

## 1. TRIẾT LÝ THIẾT KẾ CỐT LÕI (CORE PHILOSOPHY)
*   **Phong cách (Style):** Flat Design (Thiết kế phẳng) thuần túy.
*   **Nghiêm cấm (Strictly Prohibited):** Tuyệt đối KHÔNG sử dụng hiệu ứng bóng đổ (`box-shadow`, `drop-shadow`), viền nổi 3D (`bevel`, `emboss`), và hiệu ứng chuyển màu (`gradient`). Mọi thứ phải là mảng màu trơn (Solid Colors).
*   **Khoảng không (Whitespace):** Sử dụng tối đa các khoảng trắng để tạo sự phân tách không gian thay vì dùng đường viền (borders) hay background phân tầng.

## 2. HỆ THỐNG MÀU SẮC & CHỦ ĐỀ (COLOR & THEMING)
Áp dụng **Quy tắc 80/20** một cách triệt để:

*   **Màu chủ đạo (20% - Accent & Highlight):**
    *   **Plum:** `#54245f` (Dùng cho các nút bấm chính, link quan trọng, hoặc text nhấn mạnh).
    *   **Mint:** `#abe6cf` (Dùng cho các thành phần phụ trợ, tag, thông báo, hoặc nền hover nhẹ).
*   **Màu nền & Văn bản (80% - Background & Text):**
    *   **Light Theme:** Nền Trắng tinh (`#ffffff` hoặc cực gần trắng) / Văn bản Đen nguyên bản (`#000000` hoặc Xám cực đậm `#111111`).
    *   **Dark Theme:** Nền Đen tinh (`#000000` hoặc cực gần đen) / Văn bản Trắng nguyên bản (`#ffffff` hoặc `#eeeeee`).
*   **Agent Instruction:** Trong Tailwind, luôn bám sát `bg-white text-black` cho chế độ sáng và `bg-black text-white` cho chế độ tối, chỉ điểm xuyết Plum/Mint bằng class như `bg-[#54245f]`, `text-[#54245f]`.

## 3. HỆ THỐNG TYPOGRAPHY (CHỮ VIẾT)
*   **Họ Font (Font-family):** Bắt buộc sử dụng các họ font **Sans-serif** (không chân). Ưu tiên các font có tính hình học hoặc hiện đại như `Inter`, `Roboto`, `Plus Jakarta Sans` hoặc `Geist`. Không dùng font Serif (có chân).
*   **Luật giảm mật độ in đậm (Font-weight Rules):**
    *   Tuyệt đối tránh lạm dụng `font-bold` (700) hoặc `font-black` (900).
    *   **Heading lớn (H1, H2):** Sử dụng `font-semibold` (600) hoặc `font-medium` (500).
    *   **Heading nhỏ (H3, H4) & Nút bấm:** Sử dụng `font-medium` (500).
    *   **Body Text (Đoạn văn, nhãn, text phụ):** Luôn sử dụng `font-normal` (400).
    *   Nhấn mạnh trong văn bản: Chỉ dùng màu sắc (Plum) để nhấn mạnh thay vì in đậm.

## 4. HÌNH KHỐI COMPONENT (GEOMETRY & BORDER-RADIUS)
Thiết kế hình khối chia làm 2 trường hợp cụ thể:

*   **Đối tượng Nhỏ (Small Objects):** Nút bấm (Buttons), Thẻ (Tags/Badges), Ô nhập liệu nhỏ, Checkbox.
    *   **Quy tắc:** Bo tròn hoàn toàn (Pill-shape).
    *   **Tailwind Class:** `rounded-full` (border-radius: 9999px).
*   **Đối tượng Trung bình/Lớn (Medium-to-Large Objects):** Thẻ bài viết/sản phẩm (Cards), Khung Modal/Dialog, Bảng (Tables), Form lớn, Hình ảnh.
    *   **Quy tắc:** Bo góc cực kỳ nhẹ nhàng, thanh lịch.
    *   **Tailwind Class:** `rounded-md` (6px) hoặc `rounded-lg` (8px). Tuyệt đối không bo góc quá to trên các khối lớn.

## 5. ICONOGRAPHY (BIỂU TƯỢNG)
*   **Quy tắc:** Hạn chế sử dụng icon. Ưu tiên dùng text (Label) rõ ràng.
*   **Nếu bắt buộc phải dùng:** Chỉ sử dụng 1 thư viện duy nhất (Khuyến nghị: `Lucide React` hoặc `Heroicons Outline`).
*   **Đặc điểm Icon:** Dạng viền (Outline), độ mỏng của nét (stroke-width) phải tương đương với độ dày của font chữ Regular (thường là stroke-width = 1.5 hoặc 2). Không dùng icon dạng khối (Solid/Filled).

## 6. SPACING & RESPONSIVE DESIGN (KHOẢNG CÁCH & ĐÁP ỨNG)
*   **Khoảng không gian (Spacing):** Không được thiết kế các phần tử dính sát vào nhau. Khoảng cách (margin/gap) phải rộng rãi.
    *   *Ví dụ Tailwind:* Dùng `gap-6`, `gap-8`, `mb-12`.
*   **Mobile-First Responsive:** Mọi Component phải được thiết kế cho màn hình điện thoại trước, sau đó mới scale lên Laptop.
    *   **Điện thoại (Mobile):** Stack các khối theo chiều dọc (`flex-col`), padding 2 bên viền màn hình (e.g., `px-4`). Elements cần to để dễ bấm (Touch-friendly).
    *   **Laptop/Desktop:** Trải dài theo chiều ngang (`grid-cols-2`, `grid-cols-3` hoặc `flex-row`), tăng khoảng không (Whitespace).

## 7. ANIMATION & MICRO-INTERACTIONS (HIỆU ỨNG TƯƠNG TÁC)
Vì đây là Flat Design và không có shadow, việc báo hiệu tương tác (hover, active, focus) phải phụ thuộc vào biến đổi màu sắc và kích thước:

*   **Tốc độ (Duration):** Các chuyển động phải nhanh, dứt khoát và mượt mà.
    *   **Tailwind Class:** Sử dụng `transition-all duration-200 ease-in-out` hoặc `duration-300`. Tránh các hiệu ứng quá dài (>500ms).
*   **Hover States (Khi di chuột):**
    *   **Nút bấm (Buttons):** Đổi màu nền. (Ví dụ: Từ `bg-[#54245f]` sang một tone nhạt/đậm hơn một chút, hoặc đổi màu chữ).
    *   **Cards/Khối tĩnh:** Sử dụng hiệu ứng Scale nhẹ (phóng to/thu nhỏ) để báo hiệu khối có thể click được. KHÔNG thêm shadow khi hover. (Tailwind: `hover:-translate-y-1` hoặc `hover:scale-[1.02]`).
*   **Active States (Khi click/chạm trên Mobile):**
    *   Tạo cảm giác nút lún xuống bằng `active:scale-95`.
*   **Trạng thái Focus (Bàn phím):** Bắt buộc có viền bao quanh (Outline ring) với màu Plum hoặc Mint để đảm bảo trợ năng (Accessibility) khi dùng phím Tab. (Tailwind: `focus:outline-none focus:ring-2 focus:ring-[#abe6cf]`).

## 8. LỜI NHẮC TRỰC TIẾP CHO AGENT (PROMPT EXECUTION)
Khi bắt đầu render bất kỳ component nào, Agent phải **dừng lại kiểm tra chéo** (cross-check) với các quy tắc sau:
1. "Tôi có đang dùng box-shadow nào không?" -> Phải xóa ngay lập tức.
2. "Tôi đã chia tỷ lệ màu 80 Trắng-Đen / 20 Plum-Mint chưa?"
3. "Nút bấm của tôi có phải là `rounded-full` và Card có phải là `rounded-md` không?"
4. "Font chữ của tôi có bị lạm dụng `font-bold` không?"