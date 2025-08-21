const { Router } = require('express');
const { authRequired } = require('../middlewares/auth');
const asyncHandler = require('../middlewares/asyncHandler');
const ctrl = require('../controllers/addresses.controller');

const router = Router();

router.get('/', authRequired, asyncHandler(ctrl.list));
router.post('/', authRequired, asyncHandler(ctrl.create));
router.put('/:id', authRequired, asyncHandler(ctrl.update));
router.delete('/:id', authRequired, asyncHandler(ctrl.remove));

module.exports = router;
