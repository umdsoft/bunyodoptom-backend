const { Model } = require('objection');

class Product extends Model {
  static get tableName() {
    return 'products';
  }

  static get relationMappings() {
    const ProductImage = require('./ProductImage');
    return {
      images: {
        relation: Model.HasManyRelation,
        modelClass: ProductImage,
        join: {
          from: 'products.id',
          to: 'product_images.product_id'
        }
      }
    };
  }
}

module.exports = Product;
