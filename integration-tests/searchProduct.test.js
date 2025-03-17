import { test, describe } from "@jest/globals";
import app from "../server";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { PRODUCTS, CATEGORIES } from "../test-data/util.js";

describe("Search Product Endpoint '/search/:keyword'", () => {

  describe("Database Connected", () => {
    // Connect to MongoDB in memory and insert test data
    beforeAll(async () => {
      const testDB = await MongoMemoryServer.create();
      await mongoose.connect(testDB.getUri(), { useNewUrlParser: true, useUnifiedTopology: true });
      await mongoose.connection.collection("categories").insertMany(CATEGORIES);
      await mongoose.connection.collection("products").insertMany(PRODUCTS);
    });
    
    // Close the connection after all tests are done
    afterAll(async () => {
      await mongoose.connection.close();
    });
    
    test("should handle valid search request with products available", async () => {
      // Make a request to the search endpoint
      const response = await request(app).get("/api/v1/product/search/book");
      
      // Expect following
      expect(response.status).toBe(200);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body.some(product => product.name.toLowerCase().includes("book") || product.description.toLowerCase().includes("book"))).toBe(true);
    });
  
    test("should handle valid search request with products not available", async () => {
      // Make a request to the search endpoint
      const response = await request(app).get("/api/v1/product/search/none");
      
      // Expect following
      expect(response.status).toBe(200);
      expect(PRODUCTS.some(product => product.name.toLowerCase().includes("none") || product.description.toLowerCase().includes("none"))).toBe(false);
      expect(response.body.length).toBe(0);
    });
  
    test("should handle invalid requests with empty keyword", async () => {
      // Make a request to the search endpoint
      const response = await request(app).get("/api/v1/product/search");
      
      // Expect following
      expect(response.status).toBe(404);
    });
  });

  describe("Database Disconnected", () => {
    test("should handle scenario when database is disconnected", async () => {
      // Make a request to the search endpoint
      const response = await request(app).get("/api/v1/product/search/book");
      
      // Expect following
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Error In Search Product API");
    });
  });

});