const path = require("path");
const fs = require("fs");

const repositoryRootPath = path.resolve(__dirname, "../../..");

const detectRootCredentialsPath = () => {
  try {
    const rootFiles = fs.readdirSync(repositoryRootPath, {
      withFileTypes: true,
    });
    const credentialsFile = rootFiles.find(
      (entry) =>
        entry.isFile() && /^My Custom Project-.*\.json$/i.test(entry.name),
    );

    return credentialsFile
      ? path.join(repositoryRootPath, credentialsFile.name)
      : null;
  } catch (error) {
    return null;
  }
};

const resolvedCredentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  ? path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS)
  : detectRootCredentialsPath();

const hasValidCredentialsPath = (() => {
  if (!resolvedCredentialsPath) {
    return false;
  }

  try {
    return fs.existsSync(resolvedCredentialsPath);
  } catch (error) {
    return false;
  }
})();

const appConfig = {
  port: Number(process.env.PORT) || 3000,
  mongoUri: process.env.MONGODB_URI || "mongodb://localhost:27017/",
  dbName: process.env.MONGODB_DB_NAME || "SunnyAssignment",
  uploadsDir: path.resolve(__dirname, "../../staticfiles"),
  googleCredentialsPath: hasValidCredentialsPath
    ? resolvedCredentialsPath
    : null,
};

module.exports = appConfig;
