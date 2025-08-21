const { Router } = require("express");
const ctrl = require("../controllers/orders.controller");
const asyncHandler = require("../middlewares/asyncHandler");
const { authRequired, adminOnly } = require("../middlewares/auth");

const router = Router();

router.get("/", authRequired, asyncHandler(ctrl.list));
router.post("/checkout", authRequired, asyncHandler(ctrl.checkout));
router.get("/:id", authRequired, asyncHandler(ctrl.detail));
router.post("/:id/cancel", authRequired, asyncHandler(ctrl.cancel));
router.put(
  "/:id/status",
  authRequired,
  adminOnly,
  asyncHandler(ctrl.updateStatus)
);
/**
 * @openapi
 * /orders:
 *   get:
 *     tags: [Orders]
 *     summary: Orders list (admin: all, user: own)
 *     security: [ { BearerAuth: [] } ]
 *     responses: { 200: { description: OK } }
 */
/**
 * @openapi
 * /orders/checkout:
 *   post:
 *     tags: [Orders]
 *     summary: Create order (checkout)
 *     security: [ { BearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CheckoutInput' }
 *     responses: { 201: { description: Created } }
 */
/**
 * @openapi
 * /orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Order detail
 *     security: [ { BearerAuth: [] } ]
 *     parameters: [ { in: path, name: id, required: true } ]
 *     responses: { 200: { description: OK } }
 */
/**
 * @openapi
 * /orders/{id}/cancel:
 *   post:
 *     tags: [Orders]
 *     summary: Cancel order
 *     security: [ { BearerAuth: [] } ]
 *     parameters: [ { in: path, name: id, required: true } ]
 *     responses: { 200: { description: OK } }
 */
/**
 * @openapi
 * /orders/{id}/status:
 *   put:
 *     tags: [Orders]
 *     summary: Update order status (admin)
 *     security: [ { BearerAuth: [] } ]
 *     parameters: [ { in: path, name: id, required: true } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/OrderStatusUpdate' }
 *     responses: { 200: { description: OK } }
 */

module.exports = router;
