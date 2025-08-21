const { Router } = require('express');
const ctrl = require('../controllers/users.controller');
const asyncHandler = require('../middlewares/asyncHandler');
const { authRequired, adminOnly } = require('../middlewares/auth');

const router = Router();

router.get('/', authRequired, adminOnly, asyncHandler(ctrl.list));
router.post('/signup', asyncHandler(ctrl.signup));
router.post('/login', asyncHandler(ctrl.login));
router.get('/me', authRequired, asyncHandler(ctrl.me));
router.put('/me', authRequired, asyncHandler(ctrl.updateMe));
router.put('/me/password', authRequired, asyncHandler(ctrl.changePassword));

module.exports = router;
