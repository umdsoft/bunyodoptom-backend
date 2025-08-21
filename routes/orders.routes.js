const { Router } = require('express');
const ctrl = require('../controllers/orders.controller');
const asyncHandler = require('../middlewares/asyncHandler');
const { authRequired, adminOnly } = require('../middlewares/auth');

const router = Router();

router.get('/', authRequired, asyncHandler(ctrl.list));
router.post('/checkout', authRequired, asyncHandler(ctrl.checkout));
router.get('/:id', authRequired, asyncHandler(ctrl.detail));
router.post('/:id/cancel', authRequired, asyncHandler(ctrl.cancel));
router.put('/:id/status', authRequired, adminOnly, asyncHandler(ctrl.updateStatus));

module.exports = router;
