import request from "supertest";
import mongoose from "mongoose";
import { server, app } from "../server.js";
import productModel from "../models/productModel.js";
import { MongoMemoryServer } from "mongodb-memory-server";
import { USERS, CATEGORIES, PRODUCTS } from "../test-data/util.js";

const ADMIN_EMAIL = "admin@test.sg";
const ADMIN_PASSWORD = "admin@test.sg";
const USER_EMAIL = "cs4218@test.com";
const USER_PASSWORD = "cs4218@test.com";

describe("Delete Product API Tests", () => {
  let productId;
  let secondProductId;
  let adminToken;
  let userToken;
  let testDB;

  beforeAll(async () => {
    testDB = await MongoMemoryServer.create();
    await mongoose.connect(testDB.getUri());
    
    // Insert test data
    await mongoose.connection.collection("users").insertMany(USERS);
    await mongoose.connection.collection("categories").insertMany(CATEGORIES);
    
    // Insert products
    const insertedProducts = await mongoose.connection.collection("products").insertMany(PRODUCTS);
    productId = insertedProducts.insertedIds[0].toString();
    secondProductId = insertedProducts.insertedIds[1].toString();
    
    // Get admin token
    const adminLoginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    adminToken = adminLoginRes.body.token;
    
    // Get regular user token
    const userLoginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: USER_EMAIL, password: USER_PASSWORD });
    userToken = userLoginRes.body.token;
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await testDB.stop();
    server.close();
  });

  it("should successfully delete a product as admin", async () => {
    const res = await request(app)
      .delete(`/api/v1/product/delete-product/${productId}`)
      .set("Authorization", adminToken);
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Product Deleted successfully");
    
    // Verify product is actually deleted from database
    const deletedProduct = await productModel.findById(productId);
    expect(deletedProduct).toBeNull();
  });

  it("should not allow non-admin users to delete a product", async () => {
    const res = await request(app)
      .delete(`/api/v1/product/delete-product/${secondProductId}`)
      .set("Authorization", userToken);
    
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("UnAuthorized Access");
    
    // Verify product still exists in database
    const product = await productModel.findById(secondProductId);
    expect(product).not.toBeNull();
  });

  it("should handle deleting a non-existent product", async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    
    const res = await request(app)
      .delete(`/api/v1/product/delete-product/${nonExistentId}`)
      .set("Authorization", adminToken);
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Product Deleted successfully");
  });

  it("should handle invalid product ID format", async () => {
    const invalidId = "invalid-id-format";
    
    const res = await request(app)
      .delete(`/api/v1/product/delete-product/${invalidId}`)
      .set("Authorization", adminToken);
    
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Error while deleting product");
    expect(res.body.error).toBeDefined();
  });

  it("should handle database connection errors", async () => {
    // Temporarily close the connection to simulate a database error
    await mongoose.connection.close();
    
    const res = await request(app)
      .delete(`/api/v1/product/delete-product/${secondProductId}`)
      .set("Authorization", adminToken);
    
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Error in admin middleware");
      
      // Reconnect for cleanup
      await mongoose.connect(testDB.getUri());
  });
});