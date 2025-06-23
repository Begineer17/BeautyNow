require('dotenv').config();
const express = require('express');
const { Sequelize } = require('sequelize');
const { execSync } = require('child_process');
const http = require('http'); // Import HTTP module
const { Server } = require('socket.io'); // Import Socket.io
const cors = require('cors'); // Import the CORS middleware

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Serve static files for uploads
app.use('/uploads', express.static('uploads'));

app.use(cors({
  origin: 'http://localhost:8080', // Replace with your frontend's URL
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

// Create HTTP server and initialize Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' } // Adjust CORS as needed
});

// Lưu đối tượng io vào req (dùng middleware)
// Các route khác có thể truy cập req.io để phát sự kiện realtime
app.use((req, res, next) => {
  req.io = io;
  next();
});
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

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
