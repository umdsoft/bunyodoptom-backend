// controllers/uploads.controller.js
const path = require("path");
const fs = require("fs-extra");

const Product = require("../models/Product");
const ProductImage = require("../models/ProductImage");
const {
  productUploadDestination,
  maybeOptimizeImage,
} = require("../utils/uploader");

function publicUrlFor(productId, filename) {
  // statik servis /uploads dan boshlanadi
  return `/uploads/products/${productId}/${filename}`;
}

module.exports = {
  // POST /api/v1/uploads/products/:productId  (multipart/form-data, field: images)
  uploadProductImages: async (req, res) => {
    const productId = Number(req.params.productId);
    if (!productId)
      return res
        .status(400)
        .json({ success: false, message: "Invalid productId" });

    const product = await Product.query().findById(productId);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    const files = req.files || [];
    if (!files.length)
      return res
        .status(400)
        .json({ success: false, message: "No files uploaded" });

    // mavjud max sort_order ni topamiz
    const last = await ProductImage.query()
      .where("product_id", productId)
      .orderBy("sort_order", "desc")
      .first();
    let startOrder = last ? last.sort_order + 1 : 0;

    const inserted = [];
    for (const f of files) {
      // optional optimize
      await maybeOptimizeImage(f.path);

      const url = publicUrlFor(productId, path.basename(f.path));
      const row = await ProductImage.query().insert({
        product_id: productId,
        url,
        sort_order: startOrder++,
      });
      inserted.push(row);
    }

    res.status(201).json({ success: true, data: inserted });
  },

  // DELETE /api/v1/uploads/products/:productId/:imageId
  deleteProductImage: async (req, res) => {
    const productId = Number(req.params.productId);
    const imageId = Number(req.params.imageId);
    if (!productId || !imageId) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid params" });
    }

    const img = await ProductImage.query().findById(imageId);
    if (!img || img.product_id !== productId) {
      return res
        .status(404)
        .json({ success: false, message: "Image not found" });
    }

    // Faylni o‘chirish
    const baseDir = productUploadDestination(productId);
    const filename = path.basename(img.url); // xavfsiz
    const filePath = path.join(baseDir, filename);
    try {
      await fs.remove(filePath);
    } catch (e) {
      // agar fayl yo'q bo'lsa ham davom etamiz
    }

    await ProductImage.query().deleteById(imageId);
    res.json({ success: true, message: "Deleted" });
  },

  // PUT /api/v1/uploads/products/:productId/reorder
  // body: { items: [{ id, sort_order }, ...] }
  reorderProductImages: async (req, res) => {
    const productId = Number(req.params.productId);
    const items = Array.isArray(req.body?.items) ? req.body.items : null;
    if (!productId || !items || !items.length) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid payload" });
    }

    // Faqat shu productga tegishli image’lar yangilanadi
    const ids = items.map((x) => Number(x.id)).filter(Boolean);
    const imgs = await ProductImage.query().whereIn("id", ids);
    // tekshiruv
    for (const id of ids) {
      const img = imgs.find((i) => i.id === id);
      if (!img || img.product_id !== productId) {
        return res
          .status(400)
          .json({
            success: false,
            message: `Image ${id} not belongs to product ${productId}`,
          });
      }
    }

    // batch update
    for (const it of items) {
      await ProductImage.query().patchAndFetchById(it.id, {
        sort_order: Number(it.sort_order) || 0,
      });
    }

    const reordered = await ProductImage.query()
      .where("product_id", productId)
      .orderBy("sort_order", "asc");
    res.json({ success: true, data: reordered });
  },
};
