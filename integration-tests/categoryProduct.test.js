import { test, describe } from "@jest/globals";
import { server, app } from "../server.js";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { PRODUCTS, CATEGORIES } from "../test-data/util.js";

describe("Product Category Endpoint '/product-category/:slug'", () => {

  describe("Database Connected", () => {
    // Connect to MongoDB in memory and insert test data
    beforeAll(async () => {
      const testDB = await MongoMemoryServer.create();
      await mongoose.connect(testDB.getUri());
      await mongoose.connection.collection("categories").insertMany(CATEGORIES);
      await mongoose.connection.collection("products").insertMany(PRODUCTS.slice(0, 4));
    });
    
    // Close the connection after all tests are done
    afterAll(async () => {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
    });
    
    test("should handle valid product category request with products available", async () => {
      // Make a request to the product category endpoint
      const response = await request(app).get(`/api/v1/product/product-category/${CATEGORIES[1].slug}`);

      // Expect following
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.products.length).toBe(2);
      expect(response.body.category.name).toBe(CATEGORIES[1].name);
    });

    test("should handle valid product category request with no products available", async () => {
      // Make a request to the product category endpoint
      const response = await request(app).get(`/api/v1/product/product-category/${CATEGORIES[2].slug}`);

      // Expect following
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.products.length).toBe(0);
      expect(response.body.category.name).toBe(CATEGORIES[2].name);
    });
  
    test("should handle product category request with invalid slug", async () => {
      // Make a request to the product category endpoint
      const response = await request(app).get(`/api/v1/product/product-category/invalid`);
      
      // Expect following
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Category not found");
    });
  
    test("should handle product category request with missing slug", async () => {
      // Make a request to the product category endpoint
      const response = await request(app).get(`/api/v1/product/product-category/`);
      
      // Expect following
      expect(response.status).toBe(404);
    });
  });

  describe("Database Disconnected", () => {
    test("should handle scenario when database is disconnected", async () => {
      // Make a request to the product category endpoint
      const response = await request(app).get(`/api/v1/product/product-category/${CATEGORIES[1].slug}`);
      
      // Expect following
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Error While Getting products");
    });
  });

  afterAll(async () => {
    server.close();
  });
});