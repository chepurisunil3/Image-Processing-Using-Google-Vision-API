const fs = require("fs");
const path = require("path");
const { Router } = require("express");
const appConfig = require("../config/appConfig");
const {
  getTextFromImage,
  getVisionHealthStatus,
} = require("../services/ocrService");

const createApiRoutes = ({ db, imageIdStore }) => {
  const router = Router();

  router.get("/health/vision", async (request, response) => {
    const healthStatus = await getVisionHealthStatus();

    if (healthStatus.success) {
      return response.status(200).json(healthStatus);
    }

    return response.status(503).json(healthStatus);
  });

  router.post("/saveUserDetails", async (request, response) => {
    const email = request.body?.email;
    const name = request.body?.username;
    const password = request.body?.password;

    const existingUser = await db.collection("users").findOne({ email });

    if (existingUser) {
      return response.status(202).json({
        success: false,
        message: "This Email is Already Registered",
      });
    }

    try {
      await db.collection("users").insertOne({
        email,
        username: name,
        password,
      });

      return response.status(200).json({
        success: true,
        message: "Registration Success",
      });
    } catch (error) {
      return response.status(402).json({
        success: false,
        message: error.message,
      });
    }
  });

  router.get("/userLogin", async (request, response) => {
    const email = request.query?.email;
    const password = request.query?.password;

    const user = await db.collection("users").findOne({ email });

    if (!user) {
      return response.status(202).json({
        success: false,
        message: "Email not registered",
      });
    }

    if (user.password !== password) {
      return response.status(202).json({
        success: false,
        message: "Invalid Password",
      });
    }

    return response.status(202).json({
      success: true,
      message: "Login Success",
      username: user.username,
    });
  });

  router.get("/getHistoryData", async (request, response) => {
    const email = request.query?.email;
    const data = await db
      .collection("ImagesAndText")
      .find({ email })
      .sort({ imageId: -1 })
      .toArray();

    return response.status(200).json({
      success: true,
      data,
    });
  });

  router.post("/getTextFromFile", async (request, response) => {
    const imageFile = request.files?.uploadedImage;
    const email = request.body?.email;

    if (!imageFile) {
      return response.status(400).json({
        success: false,
        message: "No files were uploaded.",
      });
    }

    const imageId = imageIdStore.current;
    const fileName = `${imageId}.png`;
    const filePath = path.join(appConfig.uploadsDir, fileName);

    try {
      fs.mkdirSync(appConfig.uploadsDir, { recursive: true });
      await imageFile.mv(filePath);
      const processedText = await getTextFromImage(filePath);

      await db.collection("ImagesAndText").insertOne({
        imageId,
        file: fileName,
        text: processedText,
        email,
      });

      imageIdStore.current += 1;

      return response.status(200).json({
        success: true,
        text: processedText,
      });
    } catch (error) {
      return response.status(202).json({
        success: false,
        message: error.message || "Internal Error in API",
      });
    }
  });

  return router;
};

module.exports = createApiRoutes;
