# GlowStore Platform (Multi-Product Store)

> Nền tảng thương mại điện tử Full-Stack (E-Commerce) đa sản phẩm, hỗ trợ quản lý sản phẩm, giỏ hàng, đặt hàng, cổng thanh toán VNPAY, thông báo thời gian thực và trang quản trị (Admin Dashboard).

---

## Tính Năng Nổi Bật

- **Dành cho khách hàng:**
  - Khám phá danh mục, tìm kiếm và lọc sản phẩm (giá, thương hiệu, danh mục, đánh giá).
  - Chi tiết sản phẩm, biến thể (màu sắc, kích thước), đánh giá & bình luận.
  - Giỏ hàng thông minh (Hybrid cart: đồng bộ giữa LocalStorage và Database).
  - Đặt hàng & thanh toán (COD hoặc tích hợp sandbox VNPAY).
  - Quản lý hồ sơ cá nhân, lịch sử đơn hàng, danh sách yêu thích (Wishlist).
- **Dành cho quản trị viên (Admin):**
  - Dashboard thống kê doanh thu, đơn hàng, khách hàng với biểu đồ trực quan.
  - Quản lý danh mục, sản phẩm (CRUD, hình ảnh, tồn kho).
  - Quản lý và cập nhật trạng thái đơn hàng (Timeline trạng thái).
- **Hệ thống & Kỹ thuật:**
  - Xác thực bảo mật với JWT (Access Token & Refresh Token Rotation).
  - Tự động seed dữ liệu mẫu phong phú khi khởi động lần đầu.
  - Thông báo thời gian thực (Real-time updates) qua Socket.io.
  - Tối ưu hiệu năng và bảo mật (Helmet, CORS, Rate Limit, Redis caching).

---

## Công Nghệ Sử Dụng (Tech Stack)

| Thành phần | Công nghệ |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, TailwindCSS, Zustand, TanStack Query, Framer Motion, Lucide |
| **Backend** | Node.js, Express, TypeScript, Mongoose (MongoDB), Redis, Socket.io, Winston Logger, Zod |
| **Thanh toán** | VNPAY Sandbox, COD |
| **Kiến trúc** | NPM Workspaces (Monorepo: `frontend` + `backend`) |

---

## Cấu Trúc Dự Án

```text
Multi-product store/
├── backend/            # Express TypeScript API Backend
│   ├── src/
│   │   ├── config/     # Kết nối MongoDB, Redis, Seed data
│   │   ├── controllers/# Xử lý HTTP request & response
│   │   ├── middleware/ # Xác thực JWT, phân quyền, xử lý lỗi
│   │   ├── models/     # Mongoose Schemas & Types
│   │   ├── routes/     # Khai báo endpoint định tuyến
│   │   ├── services/   # Nghiệp vụ logic & truy vấn dữ liệu
│   │   └── server.ts   # Khởi chạy Express & Socket.io server
│   ├── .env.example    # Mẫu cấu hình biến môi trường
│   └── package.json
├── frontend/           # Ứng dụng React + Vite
│   ├── src/
│   │   ├── components/ # Các component giao diện dùng chung
│   │   ├── context/    # Quản lý trạng thái React Context
│   │   ├── pages/      # Các trang giao diện (Khách hàng & Admin)
│   │   ├── services/   # API client gọi về backend
│   │   ├── styles/     # CSS toàn cục
│   │   ├── utils/      # Các hàm tiện ích (format tiền tệ, ngày tháng)
│   │   └── App.jsx     # Điều hướng Router chính
│   ├── vite.config.js  # Cấu hình Vite & API proxy
│   └── package.json
├── archive/            # Lưu trữ mã nguồn phiên bản cũ (legacy)
├── doc/                # Tài liệu kỹ thuật tham khảo
├── package.json        # NPM Workspaces cấu hình chung
└── README.md           # Hướng dẫn dự án
```

---

## Hướng Dẫn Cài Đặt & Chạy Ứng Dụng

### 1. Yêu cầu hệ thống
- **Node.js**: >= 18.x
- **NPM**: >= 9.x
- **MongoDB**: Đã cài đặt cục bộ hoặc sử dụng kết nối MongoDB Atlas
- **Redis** *(tùy chọn / khuyến nghị)*: Cổng `6379` để phục vụ caching

---

### 2. Cài đặt Dependencies

Tại thư mục gốc của dự án, chạy lệnh:

```bash
npm install
```

*(Nhờ cơ chế NPM Workspaces, lệnh này sẽ tự động cài đặt toàn bộ gói phụ thuộc cho cả `backend` và `frontend`)*.

---

### 3. Cấu hình biến môi trường (Environment Variables)

Sao chép file `.env.example` thành `.env` trong thư mục `backend`:

```bash
cp backend/.env.example backend/.env
```

Kiểm tra và cập nhật các thông số cần thiết trong `backend/.env` (chuỗi kết nối MongoDB, Secret Key, cấu hình VNPAY,...).

---

### 4. Khởi chạy ứng dụng

#### Cách 1: Chạy từ thư mục gốc (Khuyên dùng)

Mở 2 cửa sổ terminal:

- **Terminal 1 (Backend - chạy trên port 5000):**
  ```bash
  npm run dev:backend
  ```

- **Terminal 2 (Frontend - chạy trên port 3000):**
  ```bash
  npm run dev:frontend
  ```

#### Cách 2: Chạy trực tiếp trong từng thư mục con

- **Khởi chạy Backend:**
  ```bash
  cd backend
  npm run dev
  ```

- **Khởi chạy Frontend:**
  ```bash
  cd frontend
  npm run dev
  ```

---

### 5. Địa chỉ truy cập

- **Giao diện người dùng (Frontend):** [http://localhost:3000](http://localhost:3000)
- **API Backend:** [http://localhost:5000](http://localhost:5000)

---

## Tài Khoản Trải Nghiệm Mẫu

Hệ thống đã tích hợp sẵn cơ chế **Seed Database** tự động tạo tài khoản và danh mục sản phẩm mẫu khi backend chạy lần đầu:

| Vai trò | Email | Mật khẩu |
| :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin@glowstore.com` | `admin123` |
| **Khách hàng (Customer)** | `customer@glowstore.com` | `customer123` |

---

## Build Cho Production

- **Build Backend:**
  ```bash
  npm run build:backend
  # Chạy bản build:
  npm --workspace=backend start
  ```

- **Build Frontend:**
  ```bash
  npm run build:frontend
  # Xem thử bản build:
  npm --workspace=frontend run preview
  ```

---

## Tài Liệu Bổ Sung

Để tìm hiểu sâu hơn về kiến trúc phân lớp, thiết kế hệ thống, sơ đồ cơ sở dữ liệu và các luồng nghiệp vụ chi tiết, vui lòng xem [doc/README.md](file:///run/media/na_duc/Folder/MyProject/Multi-product%20store/doc/README.md).
