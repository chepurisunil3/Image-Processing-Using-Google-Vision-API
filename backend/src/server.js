const appConfig = require("./config/appConfig");
const buildApp = require("./app");

const startServer = async () => {
  try {
    const app = await buildApp();
    app.listen(appConfig.port, () => {
      console.log(`server running on port: ${appConfig.port}`);
    });
  } catch (error) {
    console.error("Unable to start server:", error.message);
    process.exit(1);
  }
};

startServer();
