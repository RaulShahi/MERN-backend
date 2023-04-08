const HttpError = require("../models/http-error");
const jwt = require("jsonwebtoken");
const User = require("../models/users-model");

exports.verifyToken = async (req, res, next) => {
  // if (req.method === "OPTIONS") {
  //   return next();
  // }
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return next(new HttpError("A token is required for authentication.", 401));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.user_id);
    req.user = user;
  } catch (err) {
    return next(new HttpError("Invalid Token", 403));
  }
  next();
};
