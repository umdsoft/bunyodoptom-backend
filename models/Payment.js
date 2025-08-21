const BaseModel = require('./BaseModel');
class Payment extends BaseModel {
  static get tableName() { return 'payments'; }
}
module.exports = Payment;
