const { Model } = require("objection");

class BaseModel extends Model {
  $beforeInsert() {
    this.created_at = new Date();
    // this.created = this.created || new Date();
  }
  $beforeUpdate() {
    this.updated_at = new Date();
    // this.updated = new Date();
  }
}
module.exports = BaseModel;
