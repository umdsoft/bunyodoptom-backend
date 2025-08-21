const Address = require('../models/Address');

module.exports = {
  /**
   * @openapi
   * /addresses:
   *   get:
   *     tags: [Addresses]
   *     summary: List my addresses
   *     security: [ { BearerAuth: [] } ]
   *     responses:
   *       200: { description: OK }
   */
  list: async (req, res) => {
    const rows = await Address.query().where('user_id', req.user.id).orderBy('id', 'desc');
    res.json({ success: true, data: rows });
  },

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
   *           schema:
   *             type: object
   *             properties:
   *               label: { type: string }
   *               region: { type: string }
   *               city: { type: string }
   *               street: { type: string }
   *               zip_code: { type: string }
   *               is_default: { type: boolean }
   *     responses:
   *       201: { description: Created }
   */
  create: async (req, res) => {
    const payload = {
      user_id: req.user.id,
      label: req.body?.label || null,
      region: req.body?.region || null,
      city: req.body?.city || null,
      street: req.body?.street || null,
      zip_code: req.body?.zip_code || null,
      is_default: req.body?.is_default ? 1 : 0
    };
    if (payload.is_default) {
      await Address.query().patch({ is_default: 0 }).where('user_id', req.user.id);
    }
    const row = await Address.query().insert(payload);
    res.status(201).json({ success: true, data: row });
  },

  /**
   * @openapi
   * /addresses/{id}:
   *   put:
   *     tags: [Addresses]
   *     summary: Update address
   *     security: [ { BearerAuth: [] } ]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               label: { type: string }
   *               region: { type: string }
   *               city: { type: string }
   *               street: { type: string }
   *               zip_code: { type: string }
   *               is_default: { type: boolean }
   *     responses:
   *       200: { description: OK }
   */
  update: async (req, res) => {
    const id = Number(req.params.id);
    const addr = await Address.query().findById(id);
    if (!addr || addr.user_id !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }
    const patch = {
      label: req.body?.label,
      region: req.body?.region,
      city: req.body?.city,
      street: req.body?.street,
      zip_code: req.body?.zip_code
    };
    if (req.body?.is_default !== undefined) {
      if (req.body.is_default) {
        await Address.query().patch({ is_default: 0 }).where('user_id', req.user.id);
        patch.is_default = 1;
      } else {
        patch.is_default = 0;
      }
    }
    const updated = await Address.query().patchAndFetchById(id, patch);
    res.json({ success: true, data: updated });
  },

  /**
   * @openapi
   * /addresses/{id}:
   *   delete:
   *     tags: [Addresses]
   *     summary: Delete address
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
    const addr = await Address.query().findById(id);
    if (!addr || addr.user_id !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }
    await Address.query().deleteById(id);
    res.json({ success: true, message: 'Deleted' });
  }
};
