const { MongoClient } = require("mongodb");
const appConfig = require("../config/appConfig");

let mongoClient;
let database;

const connectToMongo = async () => {
  if (database) {
    return database;
  }

  mongoClient = new MongoClient(appConfig.mongoUri);
  await mongoClient.connect();
  database = mongoClient.db(appConfig.dbName);
  return database;
};

const getDb = () => {
  if (!database) {
    throw new Error("Database is not connected");
  }
  return database;
};

module.exports = {
  connectToMongo,
  getDb,
};
