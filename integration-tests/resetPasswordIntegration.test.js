import { test, describe } from "@jest/globals";
import { server, app } from "../server.js";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { USERS } from "../test-data/util.js";


describe("Testing reset password integration tests", () => {
  beforeAll(async () => {
    const testDB = await MongoMemoryServer.create();
    await mongoose.disconnect();
    await mongoose.connect(testDB.getUri());
    await mongoose.connection.collection("users").insertMany(USERS);
  });
  
  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    server.close();
  });

  test("Should be successful password reset with valid password", () => {
    
  })

  test("Should be unsuccessful reset with invalid password and valid username")
})