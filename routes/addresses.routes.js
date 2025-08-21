const { Router } = require('express');
const { authRequired } = require('../middlewares/auth');
const asyncHandler = require('../middlewares/asyncHandler');
const ctrl = require('../controllers/addresses.controller');

const router = Router();

router.get('/', authRequired, asyncHandler(ctrl.list));
router.post('/', authRequired, asyncHandler(ctrl.create));
router.put('/:id', authRequired, asyncHandler(ctrl.update));
router.delete('/:id', authRequired, asyncHandler(ctrl.remove));
/**
 * @openapi
 * /addresses:
 *   get:
 *     tags: [Addresses]
 *     summary: List my addresses
 *     security: [ { BearerAuth: [] } ]
 *     responses: { 200: { description: OK } }
 */
/**
 * @openapi
 * /addresses:
 *   post:
 *     tags: [Addresses]
 *     summary: Create address
 *     security: [ { BearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/AddressInput' }
 *     responses: { 201: { description: Created } }
 */
/**
 * @openapi
 * /addresses/{id}:
 *   put:
 *     tags: [Addresses]
 *     summary: Update address
 *     security: [ { BearerAuth: [] } ]
 *     parameters: [ { in: path, name: id, required: true } ]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/AddressInput' }
 *     responses: { 200: { description: OK } }
 */
/**
 * @openapi
 * /addresses/{id}:
 *   delete:
 *     tags: [Addresses]
 *     summary: Delete address
 *     security: [ { BearerAuth: [] } ]
 *     parameters: [ { in: path, name: id, required: true } ]
 *     responses: { 200: { description: OK } }
 */

module.exports = router;
