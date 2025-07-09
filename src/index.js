require('dotenv').config();
const express = require('express');
const { Sequelize } = require('sequelize');
const { execSync } = require('child_process');
const http = require('http'); // Import HTTP module
const https = require('https'); // Import HTTPS module
const fs = require('fs'); // Import fs for reading SSL certificates
const { Server } = require('socket.io'); // Import Socket.io
const cors = require('cors'); // Import the CORS middleware
const cookieParser = require('cookie-parser'); // Import cookie-parser

const app = express();

// Security middleware để force HTTPS
app.use((req, res, next) => {
  // Thêm security headers
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Kiểm tra nếu request không phải HTTPS (trong production)
  if (req.header('x-forwarded-proto') !== 'https' && process.env.NODE_ENV === 'production') {
    return res.redirect(301, `https://${req.header('host')}${req.url}`);
  }
  
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Use cookie-parser middleware
// Serve static files for uploads
app.use('/uploads', express.static('uploads'));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] // Thay thế bằng domain thực của bạn
    : ['http://localhost:8080', 'https://localhost:8080', 'http://localhost:3000', 'https://localhost:3443'], // Allow cả HTTP và HTTPS cho development
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
  credentials: true, // Allow cookies if needed
  
}));

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

sequelize.authenticate()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch(err => console.error('PostgreSQL connection error:', err));

// Run migrations on startup
async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Connected to PostgreSQL');
    execSync('npx sequelize-cli db:migrate', { stdio: 'inherit' });
    console.log('Database migrations applied');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

initializeDatabase();

const PORT = process.env.PORT || 3000;
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;

// SSL Certificate options
const sslOptions = {
  key: fs.readFileSync('./ssl/key.pem'),
  cert: fs.readFileSync('./ssl/cert.pem')
};

// Create HTTP server for redirect to HTTPS
const httpApp = express();

// Middleware để redirect HTTP sang HTTPS
httpApp.use((req, res, next) => {
  // Log request để debug
  console.log(`HTTP Request: ${req.method} ${req.url} from ${req.ip}`);
  
  // Xây dựng HTTPS URL
  let httpsHost = req.headers.host;
  
  // Thay thế port nếu cần
  if (httpsHost.includes(':' + PORT)) {
    httpsHost = httpsHost.replace(':' + PORT, ':' + HTTPS_PORT);
  } else if (!httpsHost.includes(':')) {
    // Nếu không có port trong host, thêm HTTPS port
    httpsHost = httpsHost + ':' + HTTPS_PORT;
  }
  
  const httpsUrl = `https://${httpsHost}${req.url}`;
  
  console.log(`Redirecting to: ${httpsUrl}`);
  
  // Redirect với status 301 (permanent redirect)
  res.status(301).redirect(httpsUrl);
});

const httpServer = http.createServer(httpApp);
httpServer.listen(PORT, () => {
  console.log(`HTTP Server running on port ${PORT} (redirects to HTTPS)`);
});

// Create HTTPS server and initialize Socket.io
const httpsServer = https.createServer(sslOptions, app);
const io = new Server(httpsServer, {
  cors: { 
    origin: ['https://localhost:8080', 'https://localhost:3443'],
    credentials: true
  }
});

// Lưu đối tượng io vào req (dùng middleware)
// Các route khác có thể truy cập req.io để phát sự kiện realtime
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Start HTTPS server
httpsServer.listen(HTTPS_PORT, () => {
  console.log(`HTTPS Server running on port ${HTTPS_PORT}`);
});

const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

const adminRoutes = require('./routes/admin');
app.use('/admin', adminRoutes);

const userProfileRoutes = require('./routes/userProfileRoutes');
app.use('/user-profile', userProfileRoutes);

const salonProfileRoutes = require('./routes/salonProfileRoutes');
app.use('/salon-profile', salonProfileRoutes);

const serviceFilterRoutes = require('./routes/serviceFilterRoutes');
app.use('/services', serviceFilterRoutes);

const appointmentRoutes = require('./routes/appointmentRoutes');
app.use('/appointments', appointmentRoutes);

const reviewRoutes = require('./routes/reviewRoutes');
app.use('/reviews', reviewRoutes);

const updateRatingRoutes = require('./routes/updateRatingRoutes');
app.use('/update-ratings', updateRatingRoutes);

const adRoutes = require('./routes/adRoutes');
app.use('/ads', adRoutes);

const analyticsRoutes = require('./routes/analyticsRoutes');
app.use('/analytics', analyticsRoutes);

const offerRoutes = require('./routes/salonVoucherRoutes');
app.use('/salon-vouchers', offerRoutes);

const userVoucherRoutes = require('./routes/userVoucherRoutes');
app.use('/user-vouchers', userVoucherRoutes);

const pushNotificationRoutes = require('./routes/pushNotificationRoutes');

app.use('/push-notification', pushNotificationRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    protocol: req.protocol,
    secure: req.secure,
    headers: {
      host: req.headers.host,
      'x-forwarded-proto': req.headers['x-forwarded-proto']
    }
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'BeautyNow API Server', 
    protocol: req.protocol,
    secure: req.secure,
    timestamp: new Date().toISOString()
  });
});

// Socket.io xử lý sự kiện chat
io.on('connection', (socket) => {
    console.log('User connected: ' + socket.id);

    socket.on('chatMessage', (data) => {
        console.log('Chat message received:', data);
        io.emit('chatMessage', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected: ' + socket.id);
    });
});

app.use((err, req, res, next) => {
  console.error('Error:', err.stack); // Log full error stack
  res.status(500).json({ message: 'Server error', error: err.message || 'Unknown error' });
});
