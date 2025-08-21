const Product = require('../models/Product');
const ProductImage = require('../models/ProductImage');
const { upload, maybeOptimizeImage } = require('../utils/uploader');
const path = require('path');
const fs = require('fs-extra');

// Statik URL helper
function publicUrlFor(productId, filename) {
  return `/uploads/products/${productId}/${filename}`;
}

module.exports = {
  /**
   * @openapi
   * /products:
   *   get:
   *     tags: [Products]
   *     summary: List all products
   *     responses:
   *       200:
   *         description: List of products
   */
  list: async (_req, res) => {
    const products = await Product.query().withGraphFetched('images(orderBySort)');
    res.json({ success: true, data: products });
  },

  /**
   * @openapi
   * /products/{id}:
   *   get:
   *     tags: [Products]
   *     summary: Get product by ID
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: integer }
   *     responses:
   *       200: { description: OK }
   *       404: { description: Not found }
   */
  detail: async (req, res) => {
    const product = await Product.query().findById(req.params.id).withGraphFetched('images(orderBySort)');
    if (!product) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: product });
  },

  /**
   * @openapi
   * /products:
   *   post:
   *     tags: [Products]
   *     summary: Create new product (with optional images)
   *     security: [ { BearerAuth: [] } ]
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             required: [name, price, stock]
   *             properties:
   *               name: { type: string }
   *               price: { type: number }
   *               stock: { type: integer }
   *               description: { type: string }
   *               images:
   *                 type: array
   *                 items: { type: string, format: binary }
   *     responses:
   *       201: { description: Created }
   */
  create: async (req, res) => {
    const { name, price, stock, description } = req.body;
    const product = await Product.query().insert({
      name, price, stock, description,
      created_at: new Date()
    });

    if (req.files && req.files.length) {
      let order = 0;
      for (const f of req.files) {
        await maybeOptimizeImage(f.path);
        const url = publicUrlFor(product.id, path.basename(f.path));
        await ProductImage.query().insert({
          product_id: product.id,
          url,
          sort_order: order++
        });
      }
    }

    const created = await Product.query().findById(product.id).withGraphFetched('images(orderBySort)');
    res.status(201).json({ success: true, data: created });
  },

  /**
   * @openapi
   * /products/{id}:
   *   put:
   *     tags: [Products]
   *     summary: Update product (with optional new images)
   *     security: [ { BearerAuth: [] } ]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: integer }
   *     requestBody:
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               name: { type: string }
   *               price: { type: number }
   *               stock: { type: integer }
   *               description: { type: string }
   *               images:
   *                 type: array
   *                 items: { type: string, format: binary }
   *     responses:
   *       200: { description: OK }
   */
  update: async (req, res) => {
    const id = req.params.id;
    const { name, price, stock, description } = req.body;

    const product = await Product.query().findById(id);
    if (!product) return res.status(404).json({ success: false, message: 'Not found' });

    await Product.query().patchAndFetchById(id, {
      name, price, stock, description
    });

    if (req.files && req.files.length) {
      let order = await ProductImage.query().where('product_id', id).max('sort_order as max').first();
      let nextOrder = (order?.max || 0) + 1;
      for (const f of req.files) {
        await maybeOptimizeImage(f.path);
        const url = publicUrlFor(id, path.basename(f.path));
        await ProductImage.query().insert({
          product_id: id,
          url,
          sort_order: nextOrder++
        });
      }
    }

    const updated = await Product.query().findById(id).withGraphFetched('images(orderBySort)');
    res.json({ success: true, data: updated });
  },

  /**
   * @openapi
   * /products/{id}:
   *   delete:
   *     tags: [Products]
   *     summary: Delete product + its images
   *     security: [ { BearerAuth: [] } ]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: integer }
   *     responses:
   *       200: { description: Deleted }
   */
  remove: async (req, res) => {
    const id = req.params.id;
    const product = await Product.query().findById(id);
    if (!product) return res.status(404).json({ success: false, message: 'Not found' });

    const images = await ProductImage.query().where('product_id', id);
    for (const img of images) {
      const filePath = path.join(process.env.UPLOAD_DIR || 'uploads', 'products', String(id), path.basename(img.url));
      await fs.remove(filePath);
    }
    await ProductImage.query().delete().where('product_id', id);
    await Product.query().deleteById(id);

    res.json({ success: true, message: 'Product deleted' });
  }
};
