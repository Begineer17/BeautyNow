# BeautyNow - BackEnd


# Hướng dẫn thiết lập dự án Node.js cho BeautyNow Backend

## 1. Cài đặt Node.js và npm

- Tải và cài đặt **Node.js** (phiên bản **LTS**, **Lưu ý: phiên bản 22**) từ [https://nodejs.org](https://nodejs.org).
- Kiểm tra cài đặt:
  ```bash
  node -v
  npm -v
  ```

## 2. Khởi tạo dự án Node.js

* Tạo thư mục dự án và di chuyển vào đó:

  ```bash
  mkdir beautynow-backend && cd beautynow-backend
  ```

* Khởi tạo dự án Node.js:

  ```bash
  npm init -y
  ```

* Cài đặt các thư viện cần thiết:

  ```bash
  npm install express sequelize pg pg-hstore jsonwebtoken bcryptjs nodemailer multer dotenv inquirer cloudinary socket.io http
  ```

* Cài đặt thư viện dùng trong môi trường phát triển:

  ```bash
  npm install --save-dev nodemon
  ```

* Cài đặt Sequelize CLI globally or locally:
  ```bash
  npm install --save-dev sequelize-cli
  ```
  Initialize Sequelize CLI (if not already done):
  ```bash
  npx sequelize-cli init
  ```

## 3. Tạo tài khoản Supabase (Main Database), Cloudinary (Lưu trữ ảnh)

* Supabase: https://supabase.com/
* Cloudinary: https://cloudinary.com/

---
