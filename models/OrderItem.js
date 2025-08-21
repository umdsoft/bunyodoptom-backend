const BaseModel = require('./BaseModel');
class OrderItem extends BaseModel {
  static get tableName() { return 'order_items'; }
}
module.exports = OrderItem;
