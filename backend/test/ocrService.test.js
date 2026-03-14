const test = require("node:test");
const assert = require("node:assert/strict");
const { withPatchedModuleLoad } = require("./helpers/moduleLoader");

const ocrServicePath = require.resolve("../src/services/ocrService");
const appConfigPath = require.resolve("../src/config/appConfig");

const clearModuleCache = () => {
  delete require.cache[ocrServicePath];
  delete require.cache[appConfigPath];
};

test("getTextFromImage returns extracted text", async () => {
  clearModuleCache();

  const fakeVisionModule = {
    ImageAnnotatorClient: class {
      async documentTextDetection() {
        return [{ fullTextAnnotation: { text: "Detected Text" } }];
      }
    },
  };

  const fakeAppConfig = {
    googleCredentialsPath: null,
  };

  await withPatchedModuleLoad(
    (originalLoad) => (request, parent, isMain) => {
      if (request === "@google-cloud/vision") {
        return fakeVisionModule;
      }

      if (request === "../config/appConfig") {
        return fakeAppConfig;
      }

      return originalLoad(request, parent, isMain);
    },
    async () => {
      const { getTextFromImage } = require("../src/services/ocrService");
      const text = await getTextFromImage("/tmp/fake-image.png");
      assert.equal(text, "Detected Text");
    },
  );

  clearModuleCache();
});

test("getTextFromImage throws explicit message when google credentials are missing", async () => {
  clearModuleCache();

  const fakeVisionModule = {
    ImageAnnotatorClient: class {
      async documentTextDetection() {
        throw new Error("Could not load the default credentials.");
      }
    },
  };

  const fakeAppConfig = {
    googleCredentialsPath: null,
  };

  await withPatchedModuleLoad(
    (originalLoad) => (request, parent, isMain) => {
      if (request === "@google-cloud/vision") {
        return fakeVisionModule;
      }

      if (request === "../config/appConfig") {
        return fakeAppConfig;
      }

      return originalLoad(request, parent, isMain);
    },
    async () => {
      const { getTextFromImage } = require("../src/services/ocrService");

      await assert.rejects(
        async () => {
          await getTextFromImage("/tmp/fake-image.png");
        },
        (error) => {
          assert.match(error.message, /Google Vision authentication failed/);
          assert.match(error.message, /No credential file found/);
          return true;
        },
      );
    },
  );

  clearModuleCache();
});

test("getVisionHealthStatus returns success true when project id can be read", async () => {
  clearModuleCache();

  const fakeVisionModule = {
    ImageAnnotatorClient: class {
      async getProjectId() {
        return "sunny-project-id";
      }
    },
  };

  const fakeAppConfig = {
    googleCredentialsPath: "C:/valid/key.json",
  };

  await withPatchedModuleLoad(
    (originalLoad) => (request, parent, isMain) => {
      if (request === "@google-cloud/vision") {
        return fakeVisionModule;
      }

      if (request === "../config/appConfig") {
        return fakeAppConfig;
      }

      return originalLoad(request, parent, isMain);
    },
    async () => {
      const { getVisionHealthStatus } = require("../src/services/ocrService");
      const result = await getVisionHealthStatus();
      assert.equal(result.success, true);
      assert.equal(result.projectId, "sunny-project-id");
    },
  );

  clearModuleCache();
});

test("getVisionHealthStatus returns explicit auth error when credentials are missing", async () => {
  clearModuleCache();

  const fakeVisionModule = {
    ImageAnnotatorClient: class {
      async getProjectId() {
        throw new Error("Could not load the default credentials.");
      }
    },
  };

  const fakeAppConfig = {
    googleCredentialsPath: null,
  };

  await withPatchedModuleLoad(
    (originalLoad) => (request, parent, isMain) => {
      if (request === "@google-cloud/vision") {
        return fakeVisionModule;
      }

      if (request === "../config/appConfig") {
        return fakeAppConfig;
      }

      return originalLoad(request, parent, isMain);
    },
    async () => {
      const { getVisionHealthStatus } = require("../src/services/ocrService");
      const result = await getVisionHealthStatus();
      assert.equal(result.success, false);
      assert.match(result.message, /Google Vision authentication failed/);
      assert.match(result.message, /No credential file found/);
    },
  );

  clearModuleCache();
});
