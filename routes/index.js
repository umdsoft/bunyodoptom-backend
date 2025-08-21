const { Router } = require('express');

const usersRoutes = require('./users.routes');
const categoriesRoutes = require('./categories.routes');
const productsRoutes = require('./products.routes');
const ordersRoutes = require('./orders.routes');
const paymentsRoutes = require('./payments.routes');
const uploadsRoutes = require('./uploads.routes');
const addressesRoutes = require('./addresses.routes'); // ⬅️ yangi

const router = Router();

router.use('/users', usersRoutes);
router.use('/categories', categoriesRoutes);
router.use('/products', productsRoutes);
router.use('/orders', ordersRoutes);
router.use('/payments', paymentsRoutes);
router.use('/uploads', uploadsRoutes);
router.use('/addresses', addressesRoutes); // ⬅️

module.exports = router;
