import { test, describe } from "@jest/globals";
import { server, app } from "../server.js";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { PRODUCTS, CATEGORIES } from "../test-data/util.js";

describe("Related Product Endpoint '/related-product/:pid/:cid'", () => {

  describe("Database Connected", () => {
    // Connect to MongoDB in memory and insert test data
    beforeAll(async () => {
      const testDB = await MongoMemoryServer.create();
      await mongoose.connect(testDB.getUri());
      await mongoose.connection.collection("categories").insertMany(CATEGORIES);
      await mongoose.connection.collection("products").insertMany(PRODUCTS);
    });
    
    // Close the connection after all tests are done
    afterAll(async () => {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
    });
    
    test("should handle valid related product request with products available", async () => {
      // Make a request to the related product endpoint
      const response = await request(app).get(`/api/v1/product/related-product/${PRODUCTS[0]._id.toString()}/${CATEGORIES[1]._id.toString()}`);

      // Expect following
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.products.length).toBe(2);
    });

    test("should handle valid related product request with no related products available", async () => {
      // Make a request to the related product endpoint
      const response = await request(app).get(`/api/v1/product/related-product/${PRODUCTS[5]._id.toString()}/${CATEGORIES[2]._id.toString()}`);

      // Expect following
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.products.length).toBe(0);
    });
  
    test("should handle related product request with valid product id but invalid category id", async () => {
      // Make a request to the related product endpoint
      const response = await request(app).get(`/api/v1/product/related-product/${PRODUCTS[0]._id.toString()}/invalid`);
      
      // Expect following
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).not.toBeNull();
      expect(response.body.error.name).toBe("CastError");
      expect(response.body.error.path).toBe("category");
    });

    test("should handle related product request with valid category id but invalid product id", async () => {
      // Make a request to the related product endpoint
      const response = await request(app).get(`/api/v1/product/related-product/invalid/${CATEGORIES[2]._id.toString()}`);
      
      // Expect following
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).not.toBeNull();
      expect(response.body.error.name).toBe("CastError");
      expect(response.body.error.path).toBe("_id");
    });
  
    test("should handle related product request with missing both product id and category id", async () => {
      // Make a request to the related product endpoint
      const response = await request(app).get(`/api/v1/product/related-product/`);
      
      // Expect following
      expect(response.status).toBe(404);
    });
  });

  describe("Database Disconnected", () => {
    test("should handle scenario when database is disconnected", async () => {
      // Make a request to the related product endpoint
      const response = await request(app).get(`/api/v1/product/related-product/${PRODUCTS[0]._id.toString()}/${CATEGORIES[1]._id.toString()}`);
      
      // Expect following
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("error while getting related product");
    });
  });

  afterAll(async () => {
    server.close();
  });

});