# BeautyNow HTTPS Setup

## SSL Certificates

Dự án này đã được cấu hình để chạy với HTTPS. SSL certificates được tạo tự động khi cần thiết.

### Development

- HTTP Server: http://localhost:3000 (redirect sang HTTPS)
- HTTPS Server: https://localhost:3443

### Cấu hình

1. **SSL Certificates**: Được tạo trong thư mục `ssl/` sử dụng self-signed certificates cho development
2. **Cookie Security**: Tất cả cookies đều được set với `secure: true` và `httpOnly: true`
3. **CORS**: Được cấu hình để chấp nhận requests từ HTTPS origins

### Khởi động server

```bash
npm start
```

Server sẽ khởi động:
- HTTP server trên port 3000 (chỉ để redirect)
- HTTPS server trên port 3443

### Lưu ý

- Khi truy cập lần đầu, browser sẽ cảnh báo về self-signed certificate. Hãy chọn "Proceed to localhost (unsafe)" để tiếp tục.
- Đối với production, hãy thay thế self-signed certificates bằng certificates từ Let's Encrypt hoặc CA tin cậy khác.

### Production

Để deploy production, hãy:

1. Thay thế SSL certificates trong `ssl/` bằng certificates hợp lệ
2. Cập nhật CORS origins trong `src/index.js`
3. Set environment variable `NODE_ENV=production`
