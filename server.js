'use strict';

const path = require('path');
const express = require('express');
const cors = require('cors');
const { ping } = require('./db');

const productsRouter = require('./routes/products');
const categoriesRouter = require('./routes/categories');
const newsRouter = require('./routes/news');
const ordersRouter = require('./routes/orders');
const contactsRouter = require('./routes/contacts');

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// API routes
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/news', newsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/contacts', contactsRouter);

app.get('/api/health', async (_req, res) => {
  try {
    await ping();
    res.json({ status: 'ok', time: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// Phục vụ trực tiếp các file tĩnh (frontend) ở thư mục gốc dự án
const staticDir = path.resolve(__dirname, '..');
app.use(express.static(staticDir, { extensions: ['html'] }));

// Error handler tập trung
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[API ERROR]', err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Lỗi máy chủ.' });
});

app.listen(PORT, () => {
  console.log(`Happy Kitchen API đang chạy tại http://localhost:${PORT}`);
});
