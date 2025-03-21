import { test, describe } from "@jest/globals";
import { server, app } from "../server.js";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { PRODUCTS, CATEGORIES, USERS } from "../test-data/util.js";

describe("Payment Gateway Endpoints '/braintree/token' and '/braintree/payment'", () => {
    // Connect to MongoDB in memory and insert test data
  beforeAll(async () => {
    const testDB = await MongoMemoryServer.create();
    await mongoose.connect(testDB.getUri());
    await mongoose.connection.collection("users").insertMany(USERS);
    await mongoose.connection.collection("categories").insertMany(CATEGORIES);
    await mongoose.connection.collection("products").insertMany(PRODUCTS);
  });
  
  // Close the connection after all tests are done
  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    server.close();
  });
  

  describe("Unauthenticated Request", () => {
    test("should reject request for payment", async () => {
      // Make a request to the payment endpoint
      const response = await request(app).post(`/api/v1/product/braintree/payment`);

      // Expect following
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Unauthorized");
    });

    test("should reject request for token", async () => {
      // Make a request to the token endpoint
      const response = await request(app).get(`/api/v1/product/braintree/token`);

      // Expect following
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Unauthorized");
    });
  });

  describe("Authenticated Request", () => {
    let token;
    
    beforeAll(async () => {
      const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "cs4218@test.com", password: "cs4218@test.com" });
      token = loginRes.body.token;
    });
    
    test("should handle valid request for token", async () => {
      // Make a request to the token endpoint
      const response = await request(app).get(`/api/v1/product/braintree/token`).set("Authorization", token);

      // Expect following
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.clientToken).toBeDefined();
    });

    test("should handle valid request for payment", async () => {
      // Make a request to the payment endpoint
      const response = await request(app).post(`/api/v1/product/braintree/payment`).set("Authorization", token).send({
        nonce: "fake-valid-nonce",
        cart: [PRODUCTS[0]]
      });
      
      // Expect following (payment could fail despite valid token)
      expect([200, 500]).toContain(response.status);
      expect(typeof response.body.success).toBe("boolean");
      expect(["Payment successful", "Transaction failed"]).toContain(response.body.message);
    });

    test("should handle missing nonce request for payment", async () => {
      // Make a request to the payment endpoint
      const response = await request(app).post(`/api/v1/product/braintree/payment`).set("Authorization", token).send({
        cart: [PRODUCTS[0]]
      });

      // Expect following
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Nonce is required");
    });

    test("should handle empty cart request for payment", async () => {
      // Make a request to the payment endpoint
      const response = await request(app).post(`/api/v1/product/braintree/payment`).set("Authorization", token).send({
        nonce: "fake-valid-nonce",
        cart: []
      });

      // Expect following
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Cart is empty");
    });

    test("should handle missing cart request for payment", async () => {
      // Make a request to the payment endpoint
      const response = await request(app).post(`/api/v1/product/braintree/payment`).set("Authorization", token).send({
        nonce: "fake-valid-nonce",
      });

      // Expect following
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Cart is empty");
    });

    test("should handle non-array cart request for payment", async () => {
      // Make a request to the payment endpoint
      const response = await request(app).post(`/api/v1/product/braintree/payment`).set("Authorization", token).send({
        nonce: "fake-valid-nonce",
        cart: PRODUCTS[0].name
      });

      // Expect following
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Error processing payment");
    });

    test("should handle negative price request for payment", async () => {
      // Make a request to the payment endpoint
      const response = await request(app).post(`/api/v1/product/braintree/payment`).set("Authorization", token).send({
        nonce: "fake-valid-nonce",
        cart: [{ ...PRODUCTS[0], price: -100 } ]
      });

      // Expect following
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Transaction failed");
    })
  });
});