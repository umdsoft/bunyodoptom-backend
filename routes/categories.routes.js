const { Router } = require("express");
const ctrl = require("../controllers/categories.controller");
const asyncHandler = require("../middlewares/asyncHandler");
const { authRequired, adminOnly } = require("../middlewares/auth");

const router = Router();

router.get("/", asyncHandler(ctrl.list));
router.post("/", authRequired, adminOnly, asyncHandler(ctrl.create));
router.put("/:id", authRequired, adminOnly, asyncHandler(ctrl.update));
router.delete("/:id", authRequired, adminOnly, asyncHandler(ctrl.remove));
/**
 * @openapi
 * /categories:
 *   get:
 *     tags: [Categories]
 *     summary: List categories
 *     responses:
 *       200: { description: OK }
 */
/**
 * @openapi
 * /categories:
 *   post:
 *     tags: [Categories]
 *     summary: Create category
 *     security: [ { BearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CategoryInput' }
 *     responses:
 *       201: { description: Created }
 */
/**
 * @openapi
 * /categories/{id}:
 *   put:
 *     tags: [Categories]
 *     summary: Update category
 *     security: [ { BearerAuth: [] } ]
 *     parameters: [ { in: path, name: id, required: true } ]
 *     requestBody:
 *       content: { application/json: { schema: { $ref: '#/components/schemas/CategoryInput' } } }
 *     responses:
 *       200: { description: OK }
 */
/**
 * @openapi
 * /categories/{id}:
 *   delete:
 *     tags: [Categories]
 *     summary: Delete category
 *     security: [ { BearerAuth: [] } ]
 *     parameters: [ { in: path, name: id, required: true } ]
 *     responses:
 *       200: { description: OK }
 */

module.exports = router;
