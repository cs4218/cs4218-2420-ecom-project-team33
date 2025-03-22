import { test, describe } from "@jest/globals";
import { server, app } from "../server.js";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { USERS } from "../test-data/util.js";


describe("Testing login integration tests", () => {
  beforeAll(async () => {
    await mongoose.disconnect();
    const testDB = await MongoMemoryServer.create();
    await mongoose.connect(testDB.getUri());
    await mongoose.connection.collection("users").insertMany(USERS);
  });
  
  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  test("Should successfully login with valid credentials", async () => {
    const response = await request(app).post(`/api/v1/auth/login`).send({
      email: USERS[0].email,
      password: "cs4218@test.com"
    });
    expect(response.body.success).toBe(true);
    expect(response.status).toBe(200);
    expect(response.body.user).toEqual(
      expect.objectContaining({
      name: USERS[0].name,
      email: USERS[0].email,
      phone: USERS[0].phone,
      address: USERS[0].address,
      role: USERS[0].role
    }));
  });

  test("Should show error for missing email input", async () => {
    const response = await request(app).post(`/api/v1/auth/login`).send({
      password: "cs4218@test.com"
    });
    expect(response.body.success).toBe(false);
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual("Email and password are both required");
  });

  test("Should show error for missing password input", async () => {
    const response = await request(app).post(`/api/v1/auth/login`).send({
      email: USERS[0].email,
    });
    expect(response.body.success).toBe(false);
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual("Email and password are both required");
  });

  test("Should show error for invalid user", async () => {
    const response = await request(app).post(`/api/v1/auth/login`).send({
      email: "wrongemail@gmail.com",
      password: "wrongpassword"
    });
    expect(response.body.success).toBe(false);
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual("Invalid email or password");
  });

  test("Should show error for invalid password", async () => {
    const response = await request(app).post(`/api/v1/auth/login`).send({
      email: "cs4218@test.com",
      password: "wrongpassword"
    });
    expect(response.body.success).toBe(false);
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual("Invalid email or password");
  });
})