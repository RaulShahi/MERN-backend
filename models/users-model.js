const mongoose = require("mongoose");
const { encryptPassword } = require("../util/encryptPassword");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true },
  password: { type: String, select: false, minlength: 6 },
  isAdmin: { type: Boolean, default: false },
  image: { type: String, required: true },
  token: String,
});

userSchema.pre("save", function (next) {
  if (this.password && this.isModified("password")) {
    this.password = encryptPassword(this.password, 10);
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
