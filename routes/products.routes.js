const { Router } = require("express");
const ctrl = require("../controllers/products.controller");
const asyncHandler = require("../middlewares/asyncHandler");
const { authRequired, adminOnly } = require("../middlewares/auth");
const { upload } = require("../utils/uploader");

const router = Router();

router.get("/", asyncHandler(ctrl.list));
router.get("/:id", asyncHandler(ctrl.detail));

router.post(
  "/",
  authRequired,
  adminOnly,
  upload.array("images"),
  asyncHandler(ctrl.create)
);

router.put(
  "/:id",
  authRequired,
  adminOnly,
  upload.array("images"),
  asyncHandler(ctrl.update)
);

router.delete("/:id", authRequired, adminOnly, asyncHandler(ctrl.remove));
/**
 * @openapi
 * tags:
 *   name: Products
 *   description: Products CRUD and listing
 */

/**
 * @openapi
 * /products:
 *   get:
 *     tags: [Products]
 *     summary: List products
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *       - in: query
 *         name: category_id
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: List of products
 */

/**
 * @openapi
 * /products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Get product detail
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Product details
 */

/**
 * @openapi
 * /products:
 *   post:
 *     tags: [Products]
 *     summary: Create product (multipart)
 *     security: [ { BearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name, price, stock_qty]
 *             properties:
 *               name: { type: string }
 *               price: { type: number }
 *               stock_qty: { type: integer }
 *               description: { type: string }
 *               images:
 *                 type: array
 *                 items: { type: string, format: binary }
 *     responses:
 *       201:
 *         description: Product created
 */

/**
 * @openapi
 * /products/{id}:
 *   put:
 *     tags: [Products]
 *     summary: Update product
 *     security: [ { BearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               price: { type: number }
 *               stock_qty: { type: integer }
 *               description: { type: string }
 *               images:
 *                 type: array
 *                 items: { type: string, format: binary }
 *     responses:
 *       200:
 *         description: Product updated
 */

/**
 * @openapi
 * /products/{id}:
 *   delete:
 *     tags: [Products]
 *     summary: Delete product
 *     security: [ { BearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Product deleted
 */

module.exports = router;
