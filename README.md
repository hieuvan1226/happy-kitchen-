# Tổng Kho Bếp Giá Tốt Happy Kitchen

Website bán hàng đồ gia dụng (frontend tĩnh) kết hợp backend Node.js + MySQL.
Frontend vẫn chạy được độc lập (mở `index.html` bằng trình duyệt) nhờ dữ liệu seed
trong `products.js` / `news.js`. Khi có server, dữ liệu sẽ được lấy từ MySQL.

## Cấu trúc thư mục

```
.
├── index.html, style.css, script.js, api.js   # Frontend
├── products.js, news.js                       # Dữ liệu seed dự phòng
├── images/                                    # Ảnh sản phẩm, banner, logo
├── database/
│   ├── schema.sql                             # Tạo cơ sở dữ liệu + bảng
│   └── seed.sql                               # Dữ liệu mẫu
└── server/
    ├── server.js                              # Express app
    ├── db.js                                  # Pool MySQL
    ├── routes/                                # REST API
    ├── package.json
    └── .env.example
```

## 1. Cài đặt cơ sở dữ liệu (MySQL 8.0+)

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

Cấu trúc gồm các bảng: `categories`, `brands`, `products`, `product_images`,
`product_features`, `product_specs`, `news`, `orders`, `order_items`,
`contacts`, `admin_users`, kèm view `v_products` để truy vấn nhanh.

## 2. Chạy backend

```bash
cd server
copy .env.example .env       # Windows (cmd). Linux/macOS: cp .env.example .env
# chỉnh DB_USER / DB_PASSWORD / DB_NAME nếu cần
npm install
npm start
```

Server mặc định chạy ở `http://localhost:3000` và phục vụ luôn các file tĩnh
ở thư mục gốc nên có thể mở `http://localhost:3000/index.html`.

### REST API

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET    | `/api/health` | Kiểm tra kết nối DB |
| GET    | `/api/products` | Danh sách sản phẩm. Hỗ trợ `?category=`, `?q=`, `?featured=1`, `?limit=`, `?offset=` |
| GET    | `/api/products/:id` | Chi tiết sản phẩm + ảnh + tính năng + thông số |
| GET    | `/api/categories` | Danh mục |
| GET    | `/api/news` | Tin tức (mới nhất) |
| GET    | `/api/news/:id` | Chi tiết bài tin tức |
| POST   | `/api/orders` | Tạo đơn hàng. Body: `{ customer, items: [{ productId, quantity }] }` |
| GET    | `/api/orders/:code` | Tra cứu đơn theo mã |
| POST   | `/api/contacts` | Gửi yêu cầu liên hệ |

## 3. Frontend

`api.js` tự động phát hiện môi trường:

- Mở qua HTTP (cùng origin với server) → gọi `/api/...`.
- Mở file tĩnh (`file://`) → fallback gọi `http://localhost:3000/api`.
- Nếu không có server, frontend vẫn dùng dữ liệu trong `products.js` / `news.js`.

## Cải tiến đã thực hiện

- Tách dữ liệu sản phẩm/tin tức ra MySQL với schema chuẩn hóa.
- Thêm bảng đơn hàng, chi tiết đơn, tồn kho, lượt xem, liên hệ, admin.
- Backend Express với routing tách module, dùng connection pool và transaction
  khi tạo đơn hàng, tự sinh mã đơn `HK<timestamp><random>`.
- Frontend dùng API client (`api.js`) với fallback dữ liệu local nên vẫn xem được
  khi chưa có backend.
- Submit liên hệ và đặt hàng được lưu vào DB qua API.
