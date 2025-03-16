import { beforeAll, test, expect } from "@jest/globals";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let testDB;

beforeAll(async () => {
  testDB = await MongoMemoryServer.create();
  await mongoose.connect(testDB.getUri());
});

test("Search Product Endpoint", () => {
  expect(mongoose.connection.readyState).toBe(1);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await testDB.stop();
});