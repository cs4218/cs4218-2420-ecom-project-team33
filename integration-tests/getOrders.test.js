import { test, describe, expect } from "@jest/globals";
import { server, app } from "../server.js";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { PRODUCTS, CATEGORIES, ORDERS, USERS } from "../test-data/util.js";

describe("Orders Endpoints '/all-orders' and '/orders' and '/order-status/:orderId'", () => {
  // Connect to MongoDB in memory and insert test data
  let testDB;
  
  beforeAll(async () => {
    testDB = await MongoMemoryServer.create();
    await mongoose.connect(testDB.getUri());
    await mongoose.connection.collection("users").insertMany(USERS);
    await mongoose.connection.collection("categories").insertMany(CATEGORIES);
    await mongoose.connection.collection("products").insertMany(PRODUCTS);
    await mongoose.connection.collection("orders").insertOne(ORDERS);
  });

  describe("Unauthenticated Request", () => {
    test("get orders should reject request when user is not authenticated", async () => {
      const response = await request(app).get("/api/v1/auth/orders");
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Unauthorized");
    });

    test("get all orders should reject request when user is not authenticated", async () => {
      const response = await request(app).get("/api/v1/auth/all-orders");
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Unauthorized");
    });
  });

  describe("Non-Admin Authenticated Request", () => {
    let token;
    
    beforeAll(async () => {
      const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "cs4218@test.com", password: "cs4218@test.com" });
      token = loginRes.body.token;
    });

    test("should handle valid request for get orders", async () => {
      // Make a request to the orders endpoint
      const response = await request(app).get("/api/v1/auth/orders").set("Authorization", token);

      // Expect following
      expect(response.status).toBe(200);
      expect(response.body[0].products).toBeDefined();
      expect(response.body[0].products.length).toBe(3);
      expect(response.body[0].payment.message).toBe(ORDERS.payment.message);
      expect(response.body[0].payment.success).toBe(ORDERS.payment.success);
      expect(response.body[0].createdAt).toBe(ORDERS.createdAt);
    });

    test("should reject request for get all orders for non-admin user", async () => {
      // Make a request to the all-orders endpoint
      const response = await request(app).get("/api/v1/auth/all-orders").set("Authorization", token);

      // Expect following
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("UnAuthorized Access");
    });

    test("should reject request for put order status for non-admin user", async () => {
      // Make a request to the order-status endpoint
      const response = await request(app).put("/api/v1/auth/order-status/123").set("Authorization", token);

      // Expect following
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("UnAuthorized Access");
    });
  });

  describe("Admin Authenticated Request", () => {
    let adminToken;
    const ADMIN_EMAIL = "admin@test.sg";
    const ADMIN_PASSWORD = "admin@test.sg";
    
    beforeAll(async () => {
      const adminLoginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
      adminToken = adminLoginRes.body.token;
    });

    test("should handle valid request for get all orders for admin user", async () => {
      // Make a request to the orders endpoint
      const response = await request(app).get("/api/v1/auth/all-orders").set("Authorization", adminToken);
      
      // Expect following
      expect(response.status).toBe(200);
      expect(response.body[0].products).toBeDefined();
      expect(response.body[0].products.length).toBe(3);
      expect(response.body[0].payment.message).toBe(ORDERS.payment.message);
      expect(response.body[0].payment.success).toBe(ORDERS.payment.success);
      expect(response.body[0].createdAt).toBe(ORDERS.createdAt);
    });

    test("should handle valid request for put order status for admin user", async () => {
      // Make a request to the order-status endpoint
      const response = await request(app).put(`/api/v1/auth/order-status/${ORDERS._id}`).set("Authorization", adminToken).send({ status: "Processed" });

      // Expect following
      expect(response.status).toBe(200);
      expect(response.body.status).toBe("Processed");
      expect(response.body.products).toBeDefined();
      expect(response.body.products.length).toBe(3);
      expect(response.body.payment.message).toBe(ORDERS.payment.message);
      expect(response.body.payment.success).toBe(ORDERS.payment.success);
      expect(response.body.createdAt).toBe(ORDERS.createdAt);
    });

    test("should handle missing status for put order status for admin user", async () => {
      // Make a request to the order-status endpoint
      const response = await request(app).put(`/api/v1/auth/order-status/${ORDERS._id}`).set("Authorization", adminToken);

      // Expect following
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Missing Order Status");
    });

    test("should handle non-existant status for put order status for admin user", async () => {
      // Make a request to the order-status endpoint
      const response = await request(app).put(`/api/v1/auth/order-status/1234`).set("Authorization", adminToken).send({ status: "Processed" });

      // Expect following
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Error While Updating Order Status");
    });
  });

  // Close the connection after all tests are done
  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    server.close();
  });
});