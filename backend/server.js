const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorMiddleware');
const { apiLimiter } = require('./middlewares/rateLimiter');

// Initialize env profiles
dotenv.config();

// Connect to database cluster
connectDB();

const app = express();

// 1. Production Security Middlewares
app.use(helmet({
  contentSecurityPolicy: false // Allow dynamic loading of CDNs / charts in iframe if needed
}));

const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// 2. Body Parser Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Static directory uploads setup
const fs = require('fs');
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// 4. API & Public Redirection Routing Engine
app.use('/api/auth', apiLimiter, require('./routes/authRoutes'));
app.use('/api/links', apiLimiter, require('./routes/linkRoutes'));
app.use('/api/analytics', apiLimiter, require('./routes/analyticsRoutes'));

// Public Root Redirect Router (Place at the end so APIs aren't intercepted)
app.use('/', require('./routes/redirectRoutes'));

// 5. Centralized Error Handler (RFC-7807)
app.use(errorHandler);

// 6. Listener Configuration
const PORT = process.env.PORT || 5000;
// const server = app.listen(PORT, () => {
//   console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
// });
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Graceful shutdowns
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  server.close(() => process.exit(1));
});
