const bcrypt = require("bcryptjs");

exports.encryptPassword = (password, seed) => {
  const salt = bcrypt.genSaltSync(seed);
  return bcrypt.hashSync(password, salt);
};
