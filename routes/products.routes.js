const { Router } = require('express');
const ctrl = require('../controllers/products.controller');
const asyncHandler = require('../middlewares/asyncHandler');
const { authRequired, adminOnly } = require('../middlewares/auth');
const { upload } = require('../utils/uploader');

const router = Router();

router.get('/', asyncHandler(ctrl.list));
router.get('/:id', asyncHandler(ctrl.detail));

router.post(
  '/',
  authRequired, adminOnly,
  upload.array('images'),
  asyncHandler(ctrl.create)
);

router.put(
  '/:id',
  authRequired, adminOnly,
  upload.array('images'),
  asyncHandler(ctrl.update)
);

router.delete(
  '/:id',
  authRequired, adminOnly,
  asyncHandler(ctrl.remove)
);

module.exports = router;
