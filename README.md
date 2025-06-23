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
  npm install express sequelize pg pg-hstore jsonwebtoken bcryptjs nodemailer multer dotenv inquirer cloudinary socket.io http web-push
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

## 4. Tạo file env va config.

* Tạo file .env tại root
```
# Server Port
PORT=3000

# Database Configuration
DATABASE_URL=postgresql://<username>:<password>@<host>:<port>/<database_name>

# JWT Secret Key
JWT_SECRET=your_jwt_secret_key

# Email Configuration (for nodemailer)
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password

# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Web-Push Configuration (Uncomment line 'console.log(webPush.generateVAPIDKeys());' and run 'node src/config/webPush.js' to get the keys logged on console)
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
```

* Tạo file config.json tại root/config/config.json
```json
{
  "development": {
    "url": "postgresql://<username>:<password>@<host>:<port>/<database_name>",
    "dialect": "postgres",
    "logging": false
  }
}
```
---
