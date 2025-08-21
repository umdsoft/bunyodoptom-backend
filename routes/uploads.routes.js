// routes/uploads.routes.js
const { Router } = require("express");
const { upload } = require("../utils/uploader");
const { authRequired, adminOnly } = require("../middlewares/auth");
const asyncHandler = require("../middlewares/asyncHandler");
const ctrl = require("../controllers/uploads.controller");

const router = Router();

/**
 * @openapi
 * /uploads/products/{productId}:
 *   post:
 *     tags: [Uploads]
 *     summary: Upload product images (multipart)
 *     security: [ { BearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201: { description: Created }
 */
router.post(
  "/products/:productId",
  authRequired,
  adminOnly,
  upload.array("images"), // field nomi
  asyncHandler(ctrl.uploadProductImages)
);

/**
 * @openapi
 * /uploads/products/{productId}/{imageId}:
 *   delete:
 *     tags: [Uploads]
 *     summary: Delete product image
 *     security: [ { BearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: OK }
 */
router.delete(
  "/products/:productId/:imageId",
  authRequired,
  adminOnly,
  asyncHandler(ctrl.deleteProductImage)
);

/**
 * @openapi
 * /uploads/products/{productId}/reorder:
 *   put:
 *     tags: [Uploads]
 *     summary: Reorder product images
 *     security: [ { BearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items]
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [id, sort_order]
 *                   properties:
 *                     id: { type: integer }
 *                     sort_order: { type: integer }
 *     responses:
 *       200: { description: OK }
 */
router.put(
  "/products/:productId/reorder",
  authRequired,
  adminOnly,
  asyncHandler(ctrl.reorderProductImages)
);

module.exports = router;
