const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const rentalRoutes = require('./routes/rentalRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const serviceAreaRoutes = require('./routes/serviceAreaRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

// Strip trailing slashes so "https://x.vercel.app/" still matches "https://x.vercel.app"
const clean = (url) => (url || '').trim().replace(/\/+$/, '');

// CLIENT_URL can hold one URL or several separated by commas
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  ...(process.env.CLIENT_URL || '').split(',').map(clean).filter(Boolean),
];

// Matches your production and preview deployments on Vercel
const vercelPattern = /^https:\/\/rentease-rental-platform-[a-z0-9-]+\.vercel\.app$/;

const corsOptions = {
  origin: (origin, callback) => {
    // no origin = Postman, curl, server-to-server
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin) || vercelPattern.test(origin)) {
      return callback(null, true);
    }
    console.warn('Blocked by CORS:', origin);
    return callback(null, false); // no CORS headers, instead of throwing a 500
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // handle preflight requests

app.use(express.json());
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.get('/', (req, res) => res.send('RentEase API is running'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'RentEase API', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/service-areas', serviceAreaRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;