const { Router } = require('express');
const ctrl = require('../controllers/categories.controller');
const asyncHandler = require('../middlewares/asyncHandler');
const { authRequired, adminOnly } = require('../middlewares/auth');

const router = Router();

router.get('/', asyncHandler(ctrl.list));
router.post('/', authRequired, adminOnly, asyncHandler(ctrl.create));
router.put('/:id', authRequired, adminOnly, asyncHandler(ctrl.update));
router.delete('/:id', authRequired, adminOnly, asyncHandler(ctrl.remove));

module.exports = router;
