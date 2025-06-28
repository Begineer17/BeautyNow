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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Use cookie-parser middleware
// Serve static files for uploads
app.use('/uploads', express.static('uploads'));

app.use(cors({
  origin: 'https://localhost:8080', // Update to HTTPS
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
httpApp.use((req, res) => {
  res.redirect(`https://${req.headers.host.replace(PORT, HTTPS_PORT)}${req.url}`);
});
const httpServer = http.createServer(httpApp);

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

// Start HTTP server (for redirect)
httpServer.listen(PORT, () => {
  console.log(`HTTP Server running on port ${PORT} (redirects to HTTPS)`);
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
