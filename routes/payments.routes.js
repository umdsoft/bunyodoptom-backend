const { Router } = require('express');
const ctrl = require('../controllers/payments.controller');
const asyncHandler = require('../middlewares/asyncHandler');
const { authRequired } = require('../middlewares/auth');

const router = Router();

/**
 * @openapi
 * /payments/create:
 *   post:
 *     tags: [Payments]
 *     summary: Create payment (mock)
 *     security: [ { BearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [order_id, amount]
 *             properties:
 *               order_id: { type: integer }
 *               amount: { type: number, format: float }
 *               provider: { type: string, enum: [click, payme, stripe, manual] }
 *     responses:
 *       201: { description: Created }
 */
router.post('/create', authRequired, asyncHandler(ctrl.create));

/**
 * @openapi
 * /payments/callback/{provider}:
 *   post:
 *     tags: [Payments]
 *     summary: Provider callback (mock)
 *     parameters:
 *       - in: path
 *         name: provider
 *         required: true
 *       - in: query
 *         name: payment_id
 *         required: true
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [succeeded, failed] }
 *     responses:
 *       200: { description: OK }
 */
router.post('/callback/:provider', asyncHandler(ctrl.callback));

module.exports = router;
