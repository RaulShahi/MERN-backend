const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const placeRoutes = require("./routes/places-routes");
const userRoutes = require("./routes/users-routes");

const app = express();

app.use(bodyParser);

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PW}@cluster0.moqyz4g.mongodb.net/?retryWrites=true&w=majority`
  )
  .then(
    app.listen(process.env.PORT, (err, succ) => {
      console.log(`Connected to db.Server running on port ${process.env.PORT}`);
    })
  )
  .catch((err) => console.log(err));

app.use("/api//places", placeRoutes);
app.use("/api/users", userRoutes);
