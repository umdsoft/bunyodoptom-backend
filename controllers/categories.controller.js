const Category = require('../models/Category');

module.exports = {
  /**
   * @openapi
   * /categories:
   *   get:
   *     tags: [Categories]
   *     summary: List categories
   *     responses:
   *       200: { description: OK }
   */
  list: async (req, res) => {
    const rows = await Category.query().select('*').orderBy('id', 'desc');
    res.json({ success: true, data: rows });
  },

  /**
   * @openapi
   * /categories:
   *   post:
   *     tags: [Categories]
   *     summary: Create category (admin)
   *     security: [ { BearerAuth: [] } ]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema: { $ref: '#/components/schemas/CategoryInput' }
   *     responses:
   *       201: { description: Created }
   */
  create: async (req, res) => {
    const { name, icon } = req.body || {};
    if (!name) return res.status(400).json({ success: false, message: 'name required' });

    const exists = await Category.query().findOne({ name });
    if (exists) return res.status(409).json({ success: false, message: 'Category exists' });

    const row = await Category.query().insert({ name, icon: icon || null });
    res.status(201).json({ success: true, data: row });
  },

  /**
   * @openapi
   * /categories/{id}:
   *   put:
   *     tags: [Categories]
   *     summary: Update category (admin)
   *     security: [ { BearerAuth: [] } ]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *     requestBody:
   *       content:
   *         application/json:
   *           schema: { $ref: '#/components/schemas/CategoryInput' }
   *     responses:
   *       200: { description: OK }
   */
  update: async (req, res) => {
    const id = Number(req.params.id);
    const { name, icon } = req.body || {};
    const updated = await Category.query().patchAndFetchById(id, { name, icon: icon || null });
    if (!updated) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: updated });
  },

  /**
   * @openapi
   * /categories/{id}:
   *   delete:
   *     tags: [Categories]
   *     summary: Delete category (admin)
   *     security: [ { BearerAuth: [] } ]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *     responses:
   *       200: { description: OK }
   */
  remove: async (req, res) => {
    const id = Number(req.params.id);
    const deleted = await Category.query().deleteById(id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  }
};
