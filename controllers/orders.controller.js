const { transaction } = require('objection');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');
const StockLedger = require('../models/StockLedger');

module.exports = {
  /**
   * @openapi
   * /orders:
   *   get:
   *     tags: [Orders]
   *     summary: Orders list (admin: all, user: own)
   *     security: [ { BearerAuth: [] } ]
   *     responses:
   *       200: { description: OK }
   */
  list: async (req, res) => {
    const isAdmin = !!req.user?.is_admin;
    let qb = Order.query().orderBy('id', 'desc');
    if (!isAdmin) qb = qb.where('user_id', req.user.id);
    const rows = await qb;
    res.json({ success: true, data: rows });
  },

  /**
   * @openapi
   * /orders/{id}:
   *   get:
   *     tags: [Orders]
   *     summary: Order detail
   *     security: [ { BearerAuth: [] } ]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *     responses:
   *       200: { description: OK }
   */
  detail: async (req, res) => {
    const id = Number(req.params.id);
    const order = await Order.query().findById(id);
    if (!order) return res.status(404).json({ success: false, message: 'Not found' });
    if (!req.user?.is_admin && order.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    const items = await OrderItem.query().where('order_id', id);
    res.json({ success: true, data: { order, items } });
  },

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
   *     responses:
   *       201: { description: Created }
   */
  checkout: async (req, res) => {
    const { user_id, address_id, idempotency_key, notes, items } = req.body || {};
    if (!Array.isArray(items) || !items.length) {
      return res.status(400).json({ success: false, message: 'items required' });
    }
    if (user_id !== req.user.id && !req.user.is_admin) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    try {
      const order = await transaction(Order.knex(), async (trx) => {
        if (idempotency_key) {
          const existing = await Order.query(trx).findOne({ idempotency_key });
          if (existing) return existing;
        }
        const ids = items.map(x => x.product_id);
        const products = await Product.query(trx).whereIn('id', ids).forUpdate();

        let total = 0;
        for (const it of items) {
          const p = products.find(pp => pp.id === it.product_id);
          if (!p) throw new Error(`Product ${it.product_id} not found`);
          if (p.status !== 'active') throw new Error(`Product ${p.id} inactive`);
          if (p.stock_qty < it.qty) throw new Error(`Insufficient stock for ${p.id}`);

          const affected = await Product.query(trx)
            .where('id', p.id)
            .where('stock_qty', '>=', it.qty)
            .patch({ stock_qty: p.stock_qty - it.qty, updated_at: new Date() });

          if (!affected) throw new Error(`Stock race for ${p.id}`);
          total += Number(p.price) * it.qty;

          await StockLedger.query(trx).insert({
            product_id: p.id,
            delta: -it.qty,
            reason: 'order',
            order_id: null
          });
        }

        const order = await Order.query(trx).insert({
          user_id,
          address_id: address_id || null,
          total_amount: total.toFixed(2),
          payment_status: 'pending',
          status: 'created',
          idempotency_key: idempotency_key || null,
          notes: notes || null
        });

        for (const it of items) {
          const p = products.find(pp => pp.id === it.product_id);
          await OrderItem.query(trx).insert({
            order_id: order.id,
            product_id: p.id,
            qty: it.qty,
            unit_price: p.price
          });
        }

        await StockLedger.query(trx)
          .patch({ order_id: order.id })
          .whereNull('order_id')
          .whereIn('product_id', ids);

        return order;
      });

      res.status(201).json({ success: true, data: order });
    } catch (e) {
      res.status(400).json({ success: false, message: e.message });
    }
  },

  /**
   * @openapi
   * /orders/{id}/cancel:
   *   post:
   *     tags: [Orders]
   *     summary: Cancel order (user can cancel if not shipped)
   *     security: [ { BearerAuth: [] } ]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *     responses:
   *       200: { description: OK }
   */
  cancel: async (req, res) => {
    const id = Number(req.params.id);
    const order = await Order.query().findById(id);
    if (!order) return res.status(404).json({ success: false, message: 'Not found' });
    if (!req.user?.is_admin && order.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    if (order.status !== 'created') {
      return res.status(400).json({ success: false, message: 'Cannot cancel at this stage' });
    }
    await Order.query().patchAndFetchById(id, { status: 'cancelled' });
    res.json({ success: true, message: 'Cancelled' });
  },

  /**
   * @openapi
   * /orders/{id}/status:
   *   put:
   *     tags: [Orders]
   *     summary: Update order status (admin)
   *     security: [ { BearerAuth: [] } ]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [status]
   *             properties:
   *               status:
   *                 type: string
   *                 enum: [created,cancelled,shipping,delivered,completed]
   *     responses:
   *       200: { description: OK }
   */
  updateStatus: async (req, res) => {
    const id = Number(req.params.id);
    const { status } = req.body || {};
    if (!status) return res.status(400).json({ success: false, message: 'status required' });
    const updated = await Order.query().patchAndFetchById(id, { status });
    if (!updated) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: updated });
  }
};
