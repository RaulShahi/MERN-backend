const express = require("express");
const morgan = require("morgan");
require("dotenv").config();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const HttpError = require("./models/http-error");

const placeRoutes = require("./routes/places-routes");
const userRoutes = require("./routes/users-routes");

const app = express();
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PW}@cluster0.moqyz4g.mongodb.net/mern?retryWrites=true&w=majority`
  )
  .then(
    app.listen(process.env.PORT, (err, succ) => {
      console.log(`Connected to db.Server running on port ${process.env.PORT}`);
    })
  )
  .catch((err) => console.log(err));

app.use("/api/places", placeRoutes);
app.use("/api/users", userRoutes);

app.use("/uploads/images", express.static(path.join("uploads", "images")));

app.use((req, res, next) => {
  const error = new HttpError("Could not find this route", 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err, succ) => {
      console.log(err);
    });
  }
  if (res.headerSent) {
    return next(error);
  }
  res
    .status(error.code || 500)
    .json({ message: error.message || "An unknown error occurred!" });
});
