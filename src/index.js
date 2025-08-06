require('dotenv').config();
const express = require('express');
const { Sequelize } = require('sequelize');
const { execSync } = require('child_process');
const { Server } = require('socket.io'); // Import Socket.io
const cors = require('cors'); // Import the CORS middleware
const cookieParser = require('cookie-parser'); // Import cookie-parser

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Use cookie-parser middleware
// Serve static files for uploads
app.use('/uploads', express.static('uploads'));

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : [];

  
app.use(cors({
  origin: function(origin, callback) {
    console.log('[CORS] Request origin:', origin);
    console.log('[CORS] Allowed origins:', allowedOrigins);

    if (!origin) return callback(null, true);

    const match = allowedOrigins.find(o => o === origin);
    if (match) {
      return callback(null, true);
    } else {
      console.error('[CORS] Blocked by CORS:', origin);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
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

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Socket.io dùng chung server
const io = new Server(server, {
  cors: { 
    origin: process.env.ORIGIN.split(',').map(origin => origin.trim()),
    credentials: true
  }
});

app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect('https://' + req.headers.host + req.url);
  }
  next();
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

const contactRoutes = require('./routes/contactRoutes');
app.use('/contacts', contactRoutes);

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

module.exports = app;
