const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const productRoutes = require('./src/routes/productRoutes');
const customerRoutes = require('./src/routes/customerRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const requireAuth = require('./src/middlewares/requireAuth');

const app = express();

// ─── Global Middleware ────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Request Logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ─── API Routes (all protected) ───────────────────────────────────────────────
app.use('/api/products', requireAuth, productRoutes);
app.use('/api/customers', requireAuth, customerRoutes);
app.use('/api/orders', requireAuth, orderRoutes);


app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found.' }));


app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ success: false, message: 'An unexpected error occurred.' });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on http://0.0.0.0:${PORT}`));
