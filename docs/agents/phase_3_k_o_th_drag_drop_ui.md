# MASTER PROMPT: PHASE 3 - FRONTEND DRAG & DROP (DND-KIT) VÀ QUẢN LÝ TRẠNG THÁI

## 1. MỤC TIÊU CỦA PHASE 3 (CONTEXT)

Chúng ta đã hoàn thành Phase 2, Backend đã có thể trả về mảng sự kiện (Events) đính kèm thông tin nhóm (Group Mappings) và Frontend đã lưu trữ trong Zustand.

Mục tiêu của Phase 3 là xây dựng giao diện kéo thả (Drag & Drop) thực sự tương tác:

1. Hiển thị 2 khu vực chính:
   - **Khu vực 1 (Bảng Unassigned):** Danh sách các sự kiện từ Google Calendar chưa được phân nhóm.
   - **Khu vực 2 (Các Bảng Groups):** Danh sách các nhóm do người dùng tự tạo.
2. Người dùng kéo các sự kiện từ Khu vực 1 thả vào các nhóm ở Khu vực 2 (hoặc kéo từ nhóm này sang nhóm khác).
3. Khi kéo thả thành công, UI phải cập nhật ngay lập tức (Optimistic Update) thông qua Zustand, đồng thời gọi API ngầm để lưu Mapping xuống Database.
4. Sử dụng `@dnd-kit/core` và `@dnd-kit/sortable` để thực hiện.

## 2. NHIỆM VỤ THIẾT KẾ GIAO DIỆN (TAILWIND CSS & DAISYUI)

Luật:

- Có thể sử dụng nhiều font chữ tuy nhiên cần thống nhất trong toàn dự án và giảm mật độ sử dụng font bold
- Sử dụng màu sắc với 80% là trắng (cho phông nền), đen (cho văn bản) cho theme trắng hoặc ngược lại cho theme đen, 20% màu đặc trưng làm điểm nhấn
- Giữa các section, objects, div,... cần có khoảng cách nhất định

### 2.1. Bố cục chính (Main Layout)

- Sử dụng CSS Grid hoặc Flexbox chia màn hình theo chiều ngang.
- Cột bên trái: Chiếm khoảng 30% width, là danh sách dọc chứa các "Unassigned Events".
- Khu vực bên phải: Chiếm 70% width, hiển thị các Bảng Nhóm (Groups). Có thể dùng dạng lưới (CSS Grid: `grid-cols-2` hoặc `grid-cols-3` tùy kích thước màn hình).
- Sử dụng thẻ `card` của DaisyUI cho các sự kiện (Event Card). Cần hiển thị: Tên sự kiện, thời gian bắt đầu/kết thúc.

### 2.2. Xây dựng cấu trúc `@dnd-kit`

Cấu trúc cây Component cơ bản cần có:

```jsx
<DndContext
  onDragStart={handleDragStart}
  onDragEnd={handleDragEnd}
  collisionDetection={closestCorners}
>
  <div className="flex">
    {/* Cột Unassigned */}
    <DroppableContainer id="unassigned">
      {unassignedEvents.map((event) => (
        <SortableEventCard key={event.id} event={event} />
      ))}
    </DroppableContainer>

    {/* Cột Groups */}
    <div className="grid">
      {groups.map((group) => (
        <DroppableContainer key={group.id} id={group.id} title={group.name}>
          {groupedEvents[group.id].map((event) => (
            <SortableEventCard key={event.id} event={event} />
          ))}
        </DroppableContainer>
      ))}
    </div>
  </div>
  <DragOverlay>{/* Hiển thị card ảo khi đang cầm kéo đi */}</DragOverlay>
</DndContext>
```

## 3. XỬ LÝ LOGIC KÉO THẢ (ZUSTAND & DND-KIT)

### 3.1. Hook `handleDragEnd`

- Khi hàm `onDragEnd` được gọi, thư viện sẽ trả về `active` (item đang kéo) và `over` (khu vực/container được thả vào).
- Phân tích logic:
  - Nếu `over` bị `null` (thả ra ngoài khu vực hợp lệ) -> Bỏ qua.
  - Lấy `eventId` từ `active.id`.
  - Lấy `targetGroupId` từ `over.id`. (Nếu thả về cột ban đầu thì id = 'unassigned').
  - Kiểm tra nếu `targetGroupId` khác với groupId hiện tại của event, tiến hành:
    1. Gọi Action `assignEventToGroup(eventId, targetGroupId)` trong Zustand để update state local lập tức.
    2. Trong Action đó, gửi API `POST /mappings` (để gán nhóm) hoặc `DELETE /mappings/:eventId` (nếu kéo về cột Unassigned).

### 3.2. Drag Overlay (Trải nghiệm người dùng)

- Cần sử dụng `<DragOverlay>` của `@dnd-kit` để khi kéo, người dùng thấy một bản sao của card dính vào con trỏ chuột một cách mượt mà.

## 4. HÀNH ĐỘNG CHO AI AGENT NGAY BÂY GIỜ

Hãy thực hiện từng bước và trình bày code để tôi review. Đừng gộp tất cả lại!

1. **Bước 1:** Khởi tạo cấu trúc các Component: `TimeTrackingBoard.jsx`, `DroppableColumn.jsx`, `DraggableEventCard.jsx`. Sử dụng Tailwind & DaisyUI để styling tĩnh trước (chưa bọc DndContext). Hãy show code UI cho tôi xem.
2. **Bước 2:** Sau khi tôi duyệt UI, hãy bọc `<DndContext>` vào `TimeTrackingBoard`, viết hàm `onDragEnd` tích hợp với state của Zustand để xử lý logic di chuyển Event qua lại giữa các mảng data. Trình bày file code tích hợp này.
