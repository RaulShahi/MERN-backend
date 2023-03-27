const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const placesSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  location: {
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 },
  },
  address: { type: String, required: true },
  creator: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

module.exports = mongoose.model("Place", placesSchema);
