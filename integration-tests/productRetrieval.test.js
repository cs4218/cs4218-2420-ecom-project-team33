import request from "supertest";
import mongoose from "mongoose";
import { server, app } from "../server.js";
import productModel from "../models/productModel.js";
import { MongoMemoryServer } from "mongodb-memory-server";
import { CATEGORIES, PRODUCTS } from "../test-data/util.js";

describe("Product Retrieval API Tests", () => {
  let testDB;

  beforeAll(async () => {
    testDB = await MongoMemoryServer.create();
    await mongoose.connect(testDB.getUri());
    
    // Insert test categories and products
    await mongoose.connection.collection("categories").insertMany(CATEGORIES);
    
    // Map products to include proper category references
    const productsWithCategories = PRODUCTS.map((product, index) => ({
      ...product,
      category: CATEGORIES[index % CATEGORIES.length]._id
    }));
    
    await mongoose.connection.collection("products").insertMany(productsWithCategories);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await testDB.stop();
    server.close();
  });

  describe("Get All Products Endpoint", () => {
    it("should fetch all products successfully", async () => {
      const res = await request(app).get("/api/v1/product/get-product");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("All Products ");
      expect(Array.isArray(res.body.products)).toBe(true);
      expect(res.body.counTotal).toBe(Math.min(PRODUCTS.length, 12)); // Limited to 12 products
      
      // Check that products are returned without photo field
      const firstProduct = res.body.products[0];
      expect(firstProduct).toBeDefined();
      expect(firstProduct.photo).toBeUndefined();
      
      // Check that category is populated
      expect(firstProduct.category).toBeDefined();
      expect(typeof firstProduct.category).toBe("object");
      expect(firstProduct.category.name).toBeDefined();
    });

    it("should handle database connection errors", async () => {
      // Temporarily disconnect from database to simulate error
      await mongoose.connection.close();
      
      const res = await request(app).get("/api/v1/product/get-product");
      
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Error in getting products");
      expect(res.body.error).toBeDefined();
      
      // Reconnect for subsequent tests
      await mongoose.connect(testDB.getUri());
    });
  });

  describe("Get Single Product Endpoint", () => {
    it("should fetch a single product by slug", async () => {
      // Get a slug from the database to use for testing
      const product = await productModel.findOne();
      const slug = product.slug;
      
      const res = await request(app).get(`/api/v1/product/get-product/${slug}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Single Product Fetched");
      expect(res.body.product).toBeDefined();
      expect(res.body.product.slug).toBe(slug);
      expect(res.body.product.photo).toBeUndefined();
      
      // Check that category is populated
      expect(res.body.product.category).toBeDefined();
      expect(typeof res.body.product.category).toBe("object");
      expect(res.body.product.category.name).toBeDefined();
    });

    it("should handle non-existent product slug", async () => {
      const nonExistentSlug = "non-existent-product-slug";
      
      const res = await request(app).get(`/api/v1/product/get-product/${nonExistentSlug}`);
      
      expect(res.status).toBe(200); // Your controller returns 200 even if product is not found
      expect(res.body.success).toBe(true);
      expect(res.body.product).toBeNull();
    });

    it("should handle database errors for single product", async () => {
      // Temporarily disconnect from database to simulate error
      await mongoose.connection.close();
      
      const res = await request(app).get("/api/v1/product/get-product/test-slug");
      
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Error while getitng single product");
      expect(res.body.error).toBeDefined();
      
      // Reconnect for subsequent tests
      await mongoose.connect(testDB.getUri());
    });
  });
});