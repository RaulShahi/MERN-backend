const express = require("express");

const placeController = require("../controllers/place-controllers");
const { verifyToken } = require("../middlewares/verifyToken");

const router = express.Router();

router
  .route("/")
  .post(verifyToken, placeController.createPlace)
  .get(placeController.getAllPlaces);
router.get("/user/:uid", placeController.getPlacesByUserId);
router
  .route("/:pid")
  .get(placeController.getPlaceById)
  .patch(verifyToken, placeController.updatePlace)
  .delete(verifyToken, placeController.deletePlace);

module.exports = router;
