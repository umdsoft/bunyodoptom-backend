const BaseModel = require('./BaseModel');
class Order extends BaseModel {
  static get tableName() { return 'orders'; }
}
module.exports = Order;
