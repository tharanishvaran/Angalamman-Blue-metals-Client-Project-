require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static Assets
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));
app.use('/images', express.static(uploadsDir));

// Route Imports
const authRoutes = require('./src/routes/auth');
const materialsRoutes = require('./src/routes/materials');
const servicesRoutes = require('./src/routes/services');
const quotesRoutes = require('./src/routes/quotes');
const deliveriesRoutes = require('./src/routes/deliveries');
const ordersRoutes = require('./src/routes/orders');
const invoicesRoutes = require('./src/routes/invoices');
const reviewsRoutes = require('./src/routes/reviews');
const adminRoutes = require('./src/routes/admin');
const settingsRoutes = require('./src/routes/settings');
const uploadRoutes = require('./src/routes/upload');

// API Mounts
app.use('/api/auth', authRoutes);
app.use('/api/materials', materialsRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/quotes', quotesRoutes);
app.use('/api/deliveries', deliveriesRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/upload', uploadRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    business: 'Sri Angalamman Blue Metals API',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend build if present
const frontendDist = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/images')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Sri Angalamman Blue Metals Backend running on port ${PORT}`);
  console.log(`📡 Health Check available at http://localhost:${PORT}/api/health`);
});
