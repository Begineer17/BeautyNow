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
  npm install express mongoose jsonwebtoken bcryptjs nodemailer multer dotenv inquirer
  ```

* Cài đặt thư viện dùng trong môi trường phát triển:

  ```bash
  npm install --save-dev nodemon
  ```

## 3. Cài đặt MongoDB

* **Cài đặt local**:

  * Tải **MongoDB Community Server** từ [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community).
  * Sau khi cài đặt xong, chạy MongoDB bằng lệnh:

    ```bash
    mongod
    ```

---
