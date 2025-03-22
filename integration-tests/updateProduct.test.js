import request from "supertest";
import mongoose from "mongoose";
import { server, app } from "../server.js";
import productModel from "../models/productModel.js";
import { MongoMemoryServer } from "mongodb-memory-server";
import fs from "fs";
import path from "path";
import { USERS, CATEGORIES, PRODUCTS } from "../test-data/util.js";

const ADMIN_EMAIL = "admin@test.sg";
const ADMIN_PASSWORD = "admin@test.sg";
const USER_EMAIL = "cs4218@test.com";
const USER_PASSWORD = "cs4218@test.com";

describe("Update Product API Tests", () => {
  let productId;
  let adminToken;
  let userToken;
  let testImagePath;

  beforeAll(async () => {
    const testDB = await MongoMemoryServer.create();
    await mongoose.connect(testDB.getUri());
    await mongoose.connection.collection("users").insertMany(USERS);
    await mongoose.connection.collection("categories").insertMany(CATEGORIES);
    
    // Insert a product that we'll update in the tests
    const insertedProducts = await mongoose.connection.collection("products").insertMany(PRODUCTS);
    productId = insertedProducts.insertedIds[0].toString();
    
    // Create a test image file for product updates
    testImagePath = path.join(process.cwd(), 'test-update-image.jpg');
    if (!fs.existsSync(testImagePath)) {
      fs.writeFileSync(testImagePath, Buffer.from('test image content'));
    }
    
    // Get admin token
    const adminLoginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    adminToken = adminLoginRes.body.token;
    
    // Get user token
    const userLoginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: USER_EMAIL, password: USER_PASSWORD });
    userToken = userLoginRes.body.token;
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

  it("should update a product successfully as admin", async () => {
    const updatedProductData = {
      name: "Updated Test Product",
      description: "This is an updated test product description",
      price: 149.99,
      category: CATEGORIES[1]._id.toString(),
      quantity: 20,
      shipping: true
    };

    const res = await request(app)
      .put(`/api/v1/product/update-product/${productId}`)
      .set("Authorization", adminToken)
      .field("name", updatedProductData.name)
      .field("description", updatedProductData.description)
      .field("price", updatedProductData.price)
      .field("category", updatedProductData.category)
      .field("quantity", updatedProductData.quantity)
      .field("shipping", updatedProductData.shipping)
      .attach("photo", testImagePath);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Product Updated Successfully");
    expect(res.body.products.name).toBe(updatedProductData.name);
    expect(res.body.products.slug).toBe("Updated-Test-Product");
    expect(res.body.products.price).toBe(updatedProductData.price);
    
    // Verify in database
    const updatedProduct = await productModel.findById(productId);
    expect(updatedProduct.name).toBe(updatedProductData.name);
    expect(updatedProduct.description).toBe(updatedProductData.description);
    expect(updatedProduct.price).toBe(updatedProductData.price);
  });

  it("should not allow updating a product without a name", async () => {
    const updatedProductData = {
      description: "This is an updated test product description",
      price: 149.99,
      category: CATEGORIES[1]._id.toString(),
      quantity: 20,
      shipping: true
    };

    const res = await request(app)
      .put(`/api/v1/product/update-product/${productId}`)
      .set("Authorization", adminToken)
      .field("description", updatedProductData.description)
      .field("price", updatedProductData.price)
      .field("category", updatedProductData.category)
      .field("quantity", updatedProductData.quantity)
      .field("shipping", updatedProductData.shipping)
      .attach("photo", testImagePath);

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Name is Required");
  });

  it("should not allow updating a product without a description", async () => {
    const updatedProductData = {
      name: "Test Product Updated Again",
      price: 149.99,
      category: CATEGORIES[1]._id.toString(),
      quantity: 20,
      shipping: true
    };

    const res = await request(app)
      .put(`/api/v1/product/update-product/${productId}`)
      .set("Authorization", adminToken)
      .field("name", updatedProductData.name)
      .field("price", updatedProductData.price)
      .field("category", updatedProductData.category)
      .field("quantity", updatedProductData.quantity)
      .field("shipping", updatedProductData.shipping)
      .attach("photo", testImagePath);

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Description is Required");
  });

  it("should not allow updating a product without a price", async () => {
    const updatedProductData = {
      name: "Test Product Updated Again",
      description: "This is an updated test product description again",
      category: CATEGORIES[1]._id.toString(),
      quantity: 20,
      shipping: true
    };

    const res = await request(app)
      .put(`/api/v1/product/update-product/${productId}`)
      .set("Authorization", adminToken)
      .field("name", updatedProductData.name)
      .field("description", updatedProductData.description)
      .field("category", updatedProductData.category)
      .field("quantity", updatedProductData.quantity)
      .field("shipping", updatedProductData.shipping)
      .attach("photo", testImagePath);

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Price is Required");
  });

  it("should not allow updating a product without a category", async () => {
    const updatedProductData = {
      name: "Test Product Updated Again",
      description: "This is an updated test product description again",
      price: 159.99,
      quantity: 20,
      shipping: true
    };

    const res = await request(app)
      .put(`/api/v1/product/update-product/${productId}`)
      .set("Authorization", adminToken)
      .field("name", updatedProductData.name)
      .field("description", updatedProductData.description)
      .field("price", updatedProductData.price)
      .field("quantity", updatedProductData.quantity)
      .field("shipping", updatedProductData.shipping)
      .attach("photo", testImagePath);

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Category is Required");
  });

  it("should not allow updating a product without a quantity", async () => {
    const updatedProductData = {
      name: "Test Product Updated Again",
      description: "This is an updated test product description again",
      price: 159.99,
      category: CATEGORIES[1]._id.toString(),
      shipping: true
    };

    const res = await request(app)
      .put(`/api/v1/product/update-product/${productId}`)
      .set("Authorization", adminToken)
      .field("name", updatedProductData.name)
      .field("description", updatedProductData.description)
      .field("price", updatedProductData.price)
      .field("category", updatedProductData.category)
      .field("shipping", updatedProductData.shipping)
      .attach("photo", testImagePath);

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Quantity is Required");
  });

  it("should validate photo size when updating a product", async () => {
    // Create a large test file (over 1MB)
    const largePath = path.join(process.cwd(), 'large-update-image.jpg');
    const largeBuffer = Buffer.alloc(1100000); // slightly over 1MB
    fs.writeFileSync(largePath, largeBuffer);

    const updatedProductData = {
      name: "Test Product Large Image Update",
      description: "This is a test product update with large image",
      price: 169.99,
      category: CATEGORIES[1]._id.toString(),
      quantity: 25,
      shipping: false
    };

    const res = await request(app)
      .put(`/api/v1/product/update-product/${productId}`)
      .set("Authorization", adminToken)
      .field("name", updatedProductData.name)
      .field("description", updatedProductData.description)
      .field("price", updatedProductData.price)
      .field("category", updatedProductData.category)
      .field("quantity", updatedProductData.quantity)
      .field("shipping", updatedProductData.shipping)
      .attach("photo", largePath);

    // Clean up large test file
    if (fs.existsSync(largePath)) {
      fs.unlinkSync(largePath);
    }

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("photo is Required and should be less then 1mb");
  });

  it("should not allow non-admin users to update a product", async () => {
    const updatedProductData = {
      name: "Unauthorized Update Attempt",
      description: "This is an unauthorized update attempt",
      price: 179.99,
      category: CATEGORIES[1]._id.toString(),
      quantity: 30,
      shipping: true
    };

    const res = await request(app)
      .put(`/api/v1/product/update-product/${productId}`)
      .set("Authorization", userToken)
      .field("name", updatedProductData.name)
      .field("description", updatedProductData.description)
      .field("price", updatedProductData.price)
      .field("category", updatedProductData.category)
      .field("quantity", updatedProductData.quantity)
      .field("shipping", updatedProductData.shipping)
      .attach("photo", testImagePath);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("UnAuthorized Access");
    
    // Verify product was not changed
    const product = await productModel.findById(productId);
    expect(product.name).not.toBe("Unauthorized Update Attempt");
  });

  it("should handle updating a non-existent product", async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    const updatedProductData = {
      name: "Non-existent Product Update",
      description: "This product does not exist",
      price: 189.99,
      category: CATEGORIES[1]._id.toString(),
      quantity: 30,
      shipping: true
    };

    const res = await request(app)
      .put(`/api/v1/product/update-product/${nonExistentId}`)
      .set("Authorization", adminToken)
      .field("name", updatedProductData.name)
      .field("description", updatedProductData.description)
      .field("price", updatedProductData.price)
      .field("category", updatedProductData.category)
      .field("quantity", updatedProductData.quantity)
      .field("shipping", updatedProductData.shipping)
      .attach("photo", testImagePath);

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Error in Updating product");
  });
});