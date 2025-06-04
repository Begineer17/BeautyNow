require('dotenv').config();
const express = require('express');
const { Sequelize } = require('sequelize');
const { execSync } = require('child_process');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Serve static files for uploads
app.use('/uploads', express.static('uploads'));

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
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

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

app.use((err, req, res, next) => {
  console.error('Error:', err.stack); // Log full error stack
  res.status(500).json({ message: 'Server error', error: err.message || 'Unknown error' });
});
