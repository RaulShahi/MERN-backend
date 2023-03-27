const HttpError = require("../models/http-error");
const Place = require("../models/places-model");
const User = require("../models/users-model");

exports.getAllPlaces = async (req, res, next) => {
  try {
    const places = await Place.find({});
    if (!places || places.length < 1) {
      return next(new HttpError("No places added yet.", 400));
    }
    res.status(200).json({ places });
  } catch (err) {
    return next(new HttpError(err, 500));
  }
};

exports.getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  try {
    const place = await Place.findById(placeId).populate("creator");
    if (!place) {
      return next(
        new HttpError("Could not find a place for the provided id.", 404)
      );
    }
    res.status(200).json({ place: place.toObject({ getters: true }) });
  } catch (err) {
    return next(new HttpError(err, 500));
  }
};

exports.getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  try {
    const places = await Place.find({ creator: userId }).populate("creator");

    if (!places || places.length === 0) {
      return next(
        new HttpError("Could not find a place for the provided user id.", 404)
      );
    }

    res.status(200).json({
      places: places.map((place) => place.toObject({ getters: true })),
    });
  } catch (err) {
    return next(new HttpError("Something went wrong.", 500));
  }
};

exports.createPlace = async (req, res, next) => {
  const { title, description, coordinates, address } = req.body;
  const creator = req.user._id;

  const newPlace = new Place({
    title,
    description,
    image:
      "https://media1.s-nbcnews.com/i/streams/2013/September/130905/8C8856378-130905-burj-khalifa-9a.jpg",
    location: coordinates,
    address,
    creator,
  });

  try {
    const user = await User.findById(creator);
    if (!user) {
      return next(new HttpError("Could not find user for provided id", 404));
    }
    await newPlace.save();
    res.status(201).json({ place: newPlace });
  } catch (err) {
    return next(
      new HttpError("Something went wrong.Could not add product", 500)
    );
  }
};

exports.updatePlace = async (req, res, next) => {
  const pid = req.params.pid;
  const user = req.user;
  const { title, description } = req.body;
  try {
    const selectedPlace = await Place.findById(pid).populate("creator");
    if (!selectedPlace) {
      return next(new HttpError("Place with the provided id not found", 404));
    }
    if (
      !(
        user.isAdmin ||
        user._id.toString() === selectedPlace.creator._id.toString()
      )
    ) {
      return next(
        new HttpError(
          "Place can only be updated by the admin or the creator.",
          400
        )
      );
    }
    selectedPlace.title = title;
    selectedPlace.description = description;
    const updatedPlace = await selectedPlace.save();
    res.status(201).json({ place: updatedPlace.toObject({ getters: true }) });
  } catch (err) {
    return next(new HttpError(err, 500));
  }
};

exports.deletePlace = async (req, res, next) => {
  const pid = req.params.pid;
  const user = req.user;
  try {
    const selectedPlace = await Place.findById(pid).populate("creator");
    if (!selectedPlace) {
      return next(
        new HttpError("Could not find the place with provided id", 404)
      );
    }
    if (
      !(
        user.isAdmin ||
        user._id.toString() === selectedPlace.creator._id.toString()
      )
    ) {
      return next(
        new HttpError(
          "Place can only be deleted by the admin or the creator.",
          404
        )
      );
    }
    await Place.findByIdAndRemove(pid);
    res.status(202).json({ message: "Place deleted succesfully." });
  } catch (err) {
    return next(new HttpError(err, 404));
  }
};
