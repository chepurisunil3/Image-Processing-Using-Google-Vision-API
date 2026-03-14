const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

const appConfigPath = require.resolve("../src/config/appConfig");

const loadFreshAppConfig = () => {
  delete require.cache[appConfigPath];
  return require("../src/config/appConfig");
};

test("appConfig sets googleCredentialsPath to null when credentials file is missing", () => {
  const originalEnvPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const originalReadDir = fs.readdirSync;
  const originalExistsSync = fs.existsSync;

  process.env.GOOGLE_APPLICATION_CREDENTIALS =
    "C:/__missing__/missing-key.json";
  fs.readdirSync = () => [];
  fs.existsSync = () => false;

  try {
    const appConfig = loadFreshAppConfig();
    assert.equal(appConfig.googleCredentialsPath, null);
  } finally {
    if (originalEnvPath === undefined) {
      delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
    } else {
      process.env.GOOGLE_APPLICATION_CREDENTIALS = originalEnvPath;
    }

    fs.readdirSync = originalReadDir;
    fs.existsSync = originalExistsSync;
    delete require.cache[appConfigPath];
  }
});

test("appConfig resolves googleCredentialsPath when env path exists", () => {
  const originalEnvPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const originalReadDir = fs.readdirSync;
  const originalExistsSync = fs.existsSync;
  const tempKeyPath = path.resolve(__dirname, "temp-google-key.json");

  process.env.GOOGLE_APPLICATION_CREDENTIALS = tempKeyPath;
  fs.readdirSync = () => [];
  fs.existsSync = (targetPath) => path.resolve(targetPath) === tempKeyPath;

  try {
    const appConfig = loadFreshAppConfig();
    assert.equal(appConfig.googleCredentialsPath, tempKeyPath);
  } finally {
    if (originalEnvPath === undefined) {
      delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
    } else {
      process.env.GOOGLE_APPLICATION_CREDENTIALS = originalEnvPath;
    }

    fs.readdirSync = originalReadDir;
    fs.existsSync = originalExistsSync;
    delete require.cache[appConfigPath];
  }
});

test("appConfig handles no env and no root json without throwing", () => {
  const originalEnvPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const originalReadDir = fs.readdirSync;
  const originalExistsSync = fs.existsSync;

  delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
  fs.readdirSync = () => [];
  fs.existsSync = () => {
    throw new TypeError("invalid path");
  };

  try {
    const appConfig = loadFreshAppConfig();
    assert.equal(appConfig.googleCredentialsPath, null);
  } finally {
    if (originalEnvPath === undefined) {
      delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
    } else {
      process.env.GOOGLE_APPLICATION_CREDENTIALS = originalEnvPath;
    }

    fs.readdirSync = originalReadDir;
    fs.existsSync = originalExistsSync;
    delete require.cache[appConfigPath];
  }
});
