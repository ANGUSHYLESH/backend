const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  first_name: { type: String, default: null },
  last_name: { type: String, default: null },
  password: { type: String },
  age: { type: Number },
  city:{type:String},
});

module.exports = mongoose.model("user", userSchema);