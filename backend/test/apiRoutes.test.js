const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const createApiRoutes = require("../src/routes/apiRoutes");

const createCollectionMock = () => {
  const state = {
    findOneResult: null,
    insertOneShouldFail: false,
    historyData: [],
    insertedDocuments: [],
  };

  return {
    state,
    findOne: async () => state.findOneResult,
    insertOne: async (document) => {
      if (state.insertOneShouldFail) {
        throw new Error("insert failed");
      }
      state.insertedDocuments.push(document);
      return { acknowledged: true };
    },
    find: () => ({
      sort: () => ({
        toArray: async () => state.historyData,
      }),
      toArray: async () => state.historyData,
    }),
  };
};

const createDbMock = () => {
  const usersCollection = createCollectionMock();
  const imagesCollection = createCollectionMock();

  return {
    collections: {
      users: usersCollection,
      ImagesAndText: imagesCollection,
    },
    collection(name) {
      return this.collections[name];
    },
  };
};

const createServer = async (dbMock) => {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(
    "/",
    createApiRoutes({ db: dbMock, imageIdStore: { current: 100001 } }),
  );

  const server = await new Promise((resolve) => {
    const listeningServer = app.listen(0, () => resolve(listeningServer));
  });

  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  const requestJson = async (path, options = {}) => {
    const response = await fetch(`${baseUrl}${path}`, options);
    const body = await response.json();
    return { response, body };
  };

  return {
    requestJson,
    close: async () => {
      await new Promise((resolve) => server.close(resolve));
    },
  };
};

test("POST /saveUserDetails returns duplicate email response", async () => {
  const dbMock = createDbMock();
  dbMock.collections.users.state.findOneResult = { email: "test@example.com" };

  const api = await createServer(dbMock);

  try {
    const { response, body } = await api.requestJson("/saveUserDetails", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@example.com",
        username: "Test",
        password: "1234",
      }),
    });

    assert.equal(response.status, 409);
    assert.equal(body.success, false);
    assert.equal(body.message, "This Email is Already Registered");
  } finally {
    await api.close();
  }
});

test("POST /saveUserDetails registers user when email is new", async () => {
  const dbMock = createDbMock();
  dbMock.collections.users.state.findOneResult = null;

  const api = await createServer(dbMock);

  try {
    const { response, body } = await api.requestJson("/saveUserDetails", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "new@example.com",
        username: "New User",
        password: "1234",
      }),
    });

    assert.equal(response.status, 200);
    assert.equal(body.success, true);
    assert.equal(body.message, "Registration Success");
    assert.equal(dbMock.collections.users.state.insertedDocuments.length, 1);
  } finally {
    await api.close();
  }
});

test("GET /userLogin returns invalid password for wrong credentials", async () => {
  const dbMock = createDbMock();
  dbMock.collections.users.state.findOneResult = {
    email: "user@example.com",
    username: "User",
    password: "correct",
  };

  const api = await createServer(dbMock);

  try {
    const { response, body } = await api.requestJson(
      "/userLogin?email=user%40example.com&password=wrong",
    );

    assert.equal(response.status, 401);
    assert.equal(body.success, false);
    assert.equal(body.message, "Invalid Password");
  } finally {
    await api.close();
  }
});

test("GET /getHistoryData returns stored history", async () => {
  const dbMock = createDbMock();
  dbMock.collections.ImagesAndText.state.historyData = [
    { imageId: 100001, text: "hello", file: "100001.png", email: "a@b.com" },
  ];

  const api = await createServer(dbMock);

  try {
    const { response, body } = await api.requestJson(
      "/getHistoryData?email=a%40b.com",
    );

    assert.equal(response.status, 200);
    assert.equal(body.success, true);
    assert.equal(Array.isArray(body.data), true);
    assert.equal(body.data.length, 1);
    assert.equal(body.data[0].text, "hello");
  } finally {
    await api.close();
  }
});

test("POST /getTextFromFile returns 400 when no file is uploaded", async () => {
  const dbMock = createDbMock();
  const api = await createServer(dbMock);

  try {
    const { response, body } = await api.requestJson("/getTextFromFile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "user@example.com" }),
    });

    assert.equal(response.status, 400);
    assert.equal(body.success, false);
    assert.equal(body.message, "No files were uploaded.");
  } finally {
    await api.close();
  }
});
