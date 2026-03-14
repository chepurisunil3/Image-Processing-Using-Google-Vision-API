const express = require("express");
const cors = require("cors");
const methodOverride = require("method-override");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");
const appConfig = require("./config/appConfig");
const { connectToMongo } = require("./db/mongo");
const createApiRoutes = require("./routes/apiRoutes");

dotenv.config();

const buildApp = async () => {
  const app = express();
  const db = await connectToMongo();

  const latestImage = await db
    .collection("ImagesAndText")
    .findOne({}, { sort: { imageId: -1 }, projection: { imageId: 1 } });

  const imageIdStore = {
    current: latestImage?.imageId ? Number(latestImage.imageId) + 1 : 100001,
  };

  app.use(express.urlencoded({ extended: true, limit: "50mb" }));
  app.use(express.json({ limit: "50mb" }));
  app.use(methodOverride());
  app.use(cors());
  app.use(fileUpload());
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "DELETE, PUT");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept",
    );
    next();
  });

  app.use(express.static(appConfig.uploadsDir));
  app.use("/", createApiRoutes({ db, imageIdStore }));

  return app;
};

module.exports = buildApp;
