import request from "supertest";
import mongoose from "mongoose";
import { server, app } from "../server.js";
import productModel from "../models/productModel.js";
import { MongoMemoryServer } from "mongodb-memory-server";
import fs from "fs";
import path from "path";
import { USERS, CATEGORIES } from "../test-data/util.js";

const ADMIN_EMAIL = "admin@test.sg";
const ADMIN_PASSWORD = "admin@test.sg";
const USER_EMAIL = "cs4218@test.com";
const USER_PASSWORD = "cs4218@test.com";

describe("Create Product API Tests", () => {
  let productId;
  let adminToken;
  let testImagePath;

  beforeAll(async () => {
    const testDB = await MongoMemoryServer.create();
    await mongoose.connect(testDB.getUri());
    await mongoose.connection.collection("users").insertMany(USERS);
    await mongoose.connection.collection("categories").insertMany(CATEGORIES);
    
    // Create a test image file for product creation
    testImagePath = path.join(process.cwd(), 'test-image.jpg');
    // Create a simple test image (or use an existing one in your project)
    if (!fs.existsSync(testImagePath)) {
      // This creates an empty file - in a real test you might want to copy a real test image
      fs.writeFileSync(testImagePath, '');
    }
  });

  afterAll(async () => {
    // Clean up test image
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
    
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    server.close();
  });

  it("should authenticate admin user", async () => {
    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });

    adminToken = loginRes.body.token;
    expect(loginRes.status).toBe(200);
    expect(adminToken).toBeDefined();
  });

  it("should create a product for an admin user", async () => {
    const productData = {
      name: "Test Product",
      description: "This is a test product",
      price: 99.99,
      category: CATEGORIES[0]._id.toString(),
      quantity: 10,
      shipping: true
    };

    const res = await request(app)
      .post("/api/v1/product/create-product")
      .set("Authorization", `${adminToken}`)
      .field("name", productData.name)
      .field("description", productData.description)
      .field("price", productData.price)
      .field("category", productData.category)
      .field("quantity", productData.quantity)
      .field("shipping", productData.shipping)
      .attach("photo", testImagePath);

    productId = res.body.products._id;

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Product Created Successfully");
    expect(res.body.products).toBeDefined();
    expect(res.body.products.name).toBe(productData.name);
    expect(res.body.products.slug).toBe("Test-Product");

    const productInDb = await productModel.findById(productId);
    expect(productInDb).not.toBeNull();
    expect(productInDb.name).toBe(productData.name);
    expect(productInDb.price).toBe(productData.price);
  });


  it("should validate photo size limit", async () => {
    // Create a large test file (over 1MB)
    const largePath = path.join(process.cwd(), 'large-test-image.jpg');
    // Create a file that's larger than 1MB (1048576 bytes)
    const largeBuffer = Buffer.alloc(1100000); // slightly over 1MB
    fs.writeFileSync(largePath, largeBuffer);

    const productData = {
      name: "Test Product Large Image",
      description: "This is a test product with large image",
      price: 129.99,
      category: CATEGORIES[0]._id.toString(),
      quantity: 15,
      shipping: true
    };

    const res = await request(app)
      .post("/api/v1/product/create-product")
      .set("Authorization", `${adminToken}`)
      .field("name", productData.name)
      .field("description", productData.description)
      .field("price", productData.price)
      .field("category", productData.category)
      .field("quantity", productData.quantity)
      .field("shipping", productData.shipping)
      .attach("photo", largePath);

    // Clean up large test file
    if (fs.existsSync(largePath)) {
      fs.unlinkSync(largePath);
    }

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("photo should be less then 1mb");
  });
});