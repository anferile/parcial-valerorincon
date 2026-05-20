const express = require('express');
const morgan = require('morgan');

const healthRoutes = require('./routes/healthRoutes');
const productRoutes = require('./routes/productRoutes');
const testRoutes = require('./routes/testRoutes');
const errorHandler = require('./middleware/errorHandler');
const notFoundHandler = require('./middleware/notFoundHandler');
const requestId = require('./middleware/requestId');

const app = express();

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestId);

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

app.get('/', (req, res) => {
  res.json({
    service: 'Parcial Valero - AWS API',
    message: 'API REST desplegada en AWS detras de un ALB',
    hostname: require('os').hostname(),
    endpoints: [
      'GET    /health',
      'GET    /status',
      'GET    /api/test',
      'GET    /api/products',
      'POST   /api/products',
      'GET    /api/products/:id',
      'PUT    /api/products/:id',
      'DELETE /api/products/:id',
    ],
  });
});

app.use('/', healthRoutes);
app.use('/api', testRoutes);
app.use('/api/products', productRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
