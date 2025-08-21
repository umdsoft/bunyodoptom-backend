const BaseModel = require("./BaseModel");
class StockLedger extends BaseModel {
  static get tableName() {
    return "stock_ledger";
  }
}
module.exports = StockLedger;
