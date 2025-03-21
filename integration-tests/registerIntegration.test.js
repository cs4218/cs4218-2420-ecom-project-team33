import { test, describe } from "@jest/globals";
import { server, app } from "../server.js";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { USERS } from "../test-data/util.js";


describe("Testing register integration tests", () => {
  beforeAll(async () => {
    const testDB = await MongoMemoryServer.create();
    await mongoose.disconnect();
    await mongoose.connect(testDB.getUri());
    await mongoose.connection.collection("users").insertMany(USERS);
  });

  afterEach(async () => {
    // clear db for new tests
    await mongoose.connection.collection("users").deleteMany({});
    await mongoose.connection.collection("users").insertMany(USERS);
  })
  
  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    server.close();
  });

  test("Should be successful password register with valid password", async () => {
    let newUser = {
      name: "John",
      email: "newemail@gmail.com",
      password: "testing123",
      phone: "83333333",
      address: "St 100",
      answer: "football"
    };
    const response = await request(app).post("/api/v1/auth/register").send(newUser);
    expect(response.body.success).toBe(true);
    expect(response.status).toBe(201);
    expect(response.body.message).toEqual("User Registered Successfully");

    // Attempting to reregister with the same user twice
    const secondResponse = await request(app).post("/api/v1/auth/register").send(newUser);
    expect(secondResponse.body.success).toBe(false);
    expect(secondResponse.status).toBe(409);
    expect(secondResponse.body.message).toEqual("Already registered. Please login.");
  });

  test("Should be unsuccessful register due to invalid username as user exists", async () => {
    let newUser = {
      name: "John",
      email: "cs4218@test.com",
      password: "testing123",
      phone: "8333333",
      address: "St 100",
      answer: "football"
    };
    const response = await request(app).post("/api/v1/auth/register").send(newUser);
    expect(response.body.success).toBe(false);
    expect(response.status).toBe(409);
    expect(response.body.message).toEqual("Already registered. Please login.");
  });

  /** Test on repeatability of fields including name, password, phone, address, answer */
  test("Should be successful register despite repeat of all fields except email", async () => {
    let newUser = USERS[0];
    newUser.email = "newemail@gmail.com";
    const response = await request(app).post("/api/v1/auth/register").send(newUser);
    expect(response.body.success).toBe(true);
    expect(response.status).toBe(201);
    expect(response.body.message).toEqual("User Registered Successfully");
  });

  /** Following tests test for missing fields including name, password, phone, address, answer */
  test("Should be missing name", async () => {
    let newUser = {
      email: "cs4218@test.com",
      password: "testing123",
      phone: "8333333",
      address: "St 100",
      answer: "football"
    };
    const response = await request(app).post("/api/v1/auth/register").send(newUser);
    expect(response.body.success).toBe(false);
    expect(response.status).toBe(400);
    expect(response.body.error).toEqual("Name is Required");
  });

  test("Should be missing email", async () => {
    let newUser = {
      name: "John",
      password: "testing123",
      phone: "8333333",
      address: "St 100",
      answer: "football"
    };
    const response = await request(app).post("/api/v1/auth/register").send(newUser);
    expect(response.body.success).toBe(false);
    expect(response.status).toBe(400);
    expect(response.body.error).toEqual("Email is Required");
  });

  test("Should be missing password", async () => {
    let newUser = {
      name: "John",
      email: "cs4218@test.com",
      phone: "8333333",
      address: "St 100",
      answer: "football"
    };
    const response = await request(app).post("/api/v1/auth/register").send(newUser);
    expect(response.body.success).toBe(false);
    expect(response.status).toBe(400);
    expect(response.body.error).toEqual("Password is Required");
  });

  test("Should be missing phone", async () => {
    let newUser = {
      name: "John",
      email: "cs4218@test.com",
      password: "testing123",
      address: "St 100",
      answer: "football"
    };
    const response = await request(app).post("/api/v1/auth/register").send(newUser);
    expect(response.body.success).toBe(false);
    expect(response.status).toBe(400);
    expect(response.body.error).toEqual("Phone number is Required");
  });

  test("Should be missing address", async () => {
    let newUser = {
      name: "John",
      email: "cs4218@test.com",
      password: "testing123",
      phone: "83333333",
      answer: "football"
    };
    const response = await request(app).post("/api/v1/auth/register").send(newUser);
    expect(response.body.success).toBe(false);
    expect(response.status).toBe(400);
    expect(response.body.error).toEqual("Address is Required");
  });

  test("Should be missing answer", async () => {
    let newUser = {
      name: "John",
      email: "cs4218@test.com",
      phone: "83333333",
      password: "testing123",
      address: "St 100"
    };
    const response = await request(app).post("/api/v1/auth/register").send(newUser);
    expect(response.body.success).toBe(false);
    expect(response.status).toBe(400);
    expect(response.body.error).toEqual("Answer is Required");
  });
})