import request from "supertest";
import mongoose from "mongoose";
import { server, app } from "../server.js";
import productModel from "../models/productModel.js";
import { MongoMemoryServer } from "mongodb-memory-server";
import fs from "fs";
import path from "path";
import { CATEGORIES } from "../test-data/util.js";

describe("Product Photo API Tests", () => {
  let testDB;
  let productId;
  let productWithoutPhotoId;

  beforeAll(async () => {
    testDB = await MongoMemoryServer.create();
    await mongoose.connect(testDB.getUri());
    
    // Insert test categories
    await mongoose.connection.collection("categories").insertMany(CATEGORIES);
    
    // Create a test image
    const testImagePath = path.join(process.cwd(), 'test-image.jpg');
    const imageContent = Buffer.from('Test image content for integration test');
    fs.writeFileSync(testImagePath, imageContent);
    
    // Create a product with photo
    const productWithPhoto = new productModel({
      name: "Test Product With Photo",
      description: "This is a test product with photo",
      price: 99.99,
      category: CATEGORIES[0]._id,
      quantity: 10,
      shipping: true,
      slug: "test-product-with-photo",
      photo: {
        data: fs.readFileSync(testImagePath),
        contentType: 'image/jpeg'
      }
    });
    await productWithPhoto.save();
    productId = productWithPhoto._id.toString();
    
    // Create a product without photo
    const productWithoutPhoto = new productModel({
      name: "Test Product Without Photo",
      description: "This is a test product without photo",
      price: 79.99,
      category: CATEGORIES[0]._id,
      quantity: 5,
      shipping: false,
      slug: "test-product-without-photo"
    });
    await productWithoutPhoto.save();
    productWithoutPhotoId = productWithoutPhoto._id.toString();
    
    // Clean up the test image
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await testDB.stop();
    server.close();
  });

  it("should successfully retrieve a product photo", async () => {
    const res = await request(app).get(`/api/v1/product/product-photo/${productId}`);
    
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('image/jpeg');
    expect(res.body).toBeDefined();
    expect(Buffer.isBuffer(res.body) || res.body instanceof Uint8Array).toBe(true);
  });

  it("should handle product not found", async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    
    const res = await request(app).get(`/api/v1/product/product-photo/${nonExistentId}`);
    
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Product not found");
  });

  it("should handle product without photo", async () => {
    const res = await request(app).get(`/api/v1/product/product-photo/${productWithoutPhotoId}`);
    
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("No photo found for this product");
  });

  it("should handle invalid product ID format", async () => {
    const invalidId = "invalid-id-format";
    
    const res = await request(app).get(`/api/v1/product/product-photo/${invalidId}`);
    
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Error while getting photo");
    expect(res.body.error).toBeDefined();
  });

  it("should handle database connection errors", async () => {
    // Temporarily close the connection to simulate a database error
    await mongoose.connection.close();
    
    const res = await request(app).get(`/api/v1/product/product-photo/${productId}`);
    
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Error while getting photo");
    
    // Reconnect for subsequent tests
    await mongoose.connect(testDB.getUri());
  });
});