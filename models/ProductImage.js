const { Model } = require("objection");

class ProductImage extends Model {
  static get tableName() {
    return "product_images";
  }
  static get modifiers() {
    return {
      orderBySort(builder) {
        builder.orderBy("sort_order", "asc");
      },
    };
  }
}

module.exports = ProductImage;
