const vision = require("@google-cloud/vision");
const appConfig = require("../config/appConfig");

let imageAnnotatorClient = null;

const buildCredentialsHint = () =>
  appConfig.googleCredentialsPath
    ? `Configured key file: ${appConfig.googleCredentialsPath}`
    : "No credential file found. Set GOOGLE_APPLICATION_CREDENTIALS to your JSON key file path.";

const normalizeVisionError = (error) => {
  if (
    error.message?.includes("Could not load the default credentials") ||
    error.message?.includes("Failed to parse") ||
    error.message?.includes("private_key")
  ) {
    return new Error(
      `Google Vision authentication failed. ${buildCredentialsHint()}`,
    );
  }

  return error;
};

const getVisionClient = () => {
  if (imageAnnotatorClient) {
    return imageAnnotatorClient;
  }

  const clientOptions = appConfig.googleCredentialsPath
    ? { keyFilename: appConfig.googleCredentialsPath }
    : undefined;

  imageAnnotatorClient = new vision.ImageAnnotatorClient(clientOptions);
  return imageAnnotatorClient;
};

const getTextFromImage = async (filePath) => {
  try {
    const visionClient = getVisionClient();
    const [result] = await visionClient.documentTextDetection(filePath);
    return result?.fullTextAnnotation?.text || "";
  } catch (error) {
    throw normalizeVisionError(error);
  }
};

const getVisionHealthStatus = async () => {
  try {
    const visionClient = getVisionClient();
    const projectId = await visionClient.getProjectId();
    return {
      success: true,
      projectId,
      message: "Google Vision configuration is valid.",
    };
  } catch (error) {
    const normalizedError = normalizeVisionError(error);
    return {
      success: false,
      projectId: null,
      message: normalizedError.message,
    };
  }
};

module.exports = {
  getTextFromImage,
  getVisionHealthStatus,
};
