const mongoose = require("mongoose");
const HttpError = require("../models/http-error");
const User = require("../models/users-model");
const Places = require("../models/places-model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.getAllUsers = async (req, res, next) => {
  const users = await User.find({}).populate("places");
  if (!users || users.length < 1) {
    return next(new HttpError("No users registered"));
  }
  res.status(200).json({
    users: users.map((user) => user.toObject({ getters: true })),
  });
};

exports.deleteUser = async (req, res, next) => {
  const userId = req.params.uid;
  const loggedInUser = req.user;
  const session = await mongoose.startSession();

  if (!(loggedInUser.isAdmin || loggedInUser._id.toString() === userId)) {
    return next(
      new HttpError("Users can only be deleted by admin or themselves.")
    );
  }
  try {
    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
      return next(
        new HttpError(
          "Failed to delete. User with provided id does not exist.",
          404
        )
      );
    }
    session.startTransaction();
    await Places.deleteMany({ creator: userId }).session(session);
    await User.findByIdAndRemove(userId).session(session);
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: "User deleted succesfully" });
  } catch (err) {
    return next(new HttpError("Could not delete user.", 500));
  }
};

exports.registerUser = async (req, res, next) => {
  try {
    //Getting user input
    const { name, email, password, isAdmin } = req.body;
    //validating user input
    if (!(name && email && password)) {
      return next(new HttpError("All information is required", 400));
    }

    //checking if user already exists

    const userExists = await User.findOne({ email });

    if (userExists) {
      return next(
        new HttpError(
          "Account from this email exists. Please login or use another email.",
          409
        )
      );
    }
    const user = await User.create({
      name,
      email,
      image:
        "https://www.wwe.com/f/styles/wwe_large/public/all/2019/10/RAW_06202016rf_1606--3d3997f53e6f3e9277cd5a67fbd8f31f.jpg",
      password,
      isAdmin,
      places: [],
    });

    const token = jwt.sign(
      { user_id: user._id, email },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    user.token = token;
    res.status(201).json({ user: user.toObject({ getters: true }) });
  } catch (err) {
    return next(new HttpError(err, 500));
  }
};

exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    //validation
    if (!(email && password)) {
      return next(new HttpError("All information is required", 400));
    }
    //checking if user exists
    const user = await User.findOne({ email }, "name password");

    if (!user) {
      return next(
        new HttpError("Account doesn't exist. Please register.", 409)
      );
    }

    if (user && (await bcrypt.compare(password, user.password))) {
      //create token
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.JWT_SECRET,
        { expiresIn: "2h" }
      );
      user.token = token;
      return res.status(200).json({ user: user });
    } else {
      return next(new HttpError("Invalid credentials", 400));
    }
  } catch (err) {
    return next(new HttpError(err, 500));
  }
};
