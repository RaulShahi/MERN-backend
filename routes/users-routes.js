const express = require("express");
const userController = require("../controllers/user-controllers");
const { verifyToken } = require("../middlewares/verifyToken");

const router = express.Router();

router.route("/").get(userController.getAllUsers);
router.post("/signup", userController.registerUser);
router.post("/login", userController.loginUser);
router.delete("/:uid", verifyToken, userController.deleteUser);

module.exports = router;
