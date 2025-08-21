const { Router } = require("express");
const ctrl = require("../controllers/users.controller");
const asyncHandler = require("../middlewares/asyncHandler");
const { authRequired, adminOnly } = require("../middlewares/auth");

const router = Router();

router.get("/", authRequired, adminOnly, asyncHandler(ctrl.list));
router.post("/signup", asyncHandler(ctrl.signup));
router.post("/login", asyncHandler(ctrl.login));
router.get("/me", authRequired, asyncHandler(ctrl.me));
router.put("/me", authRequired, asyncHandler(ctrl.updateMe));
router.put("/me/password", authRequired, asyncHandler(ctrl.changePassword));
/**
 * @openapi
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: Users list (admin only)
 *     security: [ { BearerAuth: [] } ]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200: { description: OK }
 */
/**
 * @openapi
 * /users/signup:
 *   post:
 *     tags: [Users]
 *     summary: Signup
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/SignupInput' }
 *     responses:
 *       201: { description: Created }
 */
/**
 * @openapi
 * /users/login:
 *   post:
 *     tags: [Users]
 *     summary: Login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/LoginInput' }
 *     responses:
 *       200: { description: OK }
 */
/**
 * @openapi
 * /users/me:
 *   get:
 *     tags: [Users]
 *     summary: My profile
 *     security: [ { BearerAuth: [] } ]
 *     responses:
 *       200: { description: OK }
 */
/**
 * @openapi
 * /users/me:
 *   put:
 *     tags: [Users]
 *     summary: Update profile
 *     security: [ { BearerAuth: [] } ]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties: { name: {type: string}, brightday: {type: string, format: date} }
 *     responses:
 *       200: { description: OK }
 */
/**
 * @openapi
 * /users/me/password:
 *   put:
 *     tags: [Users]
 *     summary: Change password
 *     security: [ { BearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [old_password, new_password]
 *             properties:
 *               old_password: { type: string }
 *               new_password: { type: string, minLength: 6 }
 *     responses:
 *       200: { description: OK }
 */

module.exports = router;
