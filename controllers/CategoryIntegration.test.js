import request from "supertest";
import mongoose from "mongoose";
import app from "../server.js";
import categoryModel from "../models/categoryModel.js";
import { createCategoryController } from "../controllers/categoryController.js";
import { MongoMemoryServer } from "mongodb-memory-server";

const ADMIN_EMAIL = "admin@test.sg";
const ADMIN_PASSWORD = "admin@test.sg";
const USER_EMAIL = "cs4218@test.com";
const USER_PASSWORD = "cs4218@test.com";

describe("Category API Tests", () => {
  let categoryId;
  let categorySlug;
  let adminToken;

  it("should get all categories", async () => {
    const res = await request(app).get("/api/v1/category/get-category");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.category)).toBe(true);
    expect(res.body.category.length).toBeGreaterThan(0);
  });

  it("should create a category for an admin user", async () => {
    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });

    adminToken = loginRes.body.token;

    const categoryData = { name: "New Category", slug: "new-category" };

    const res = await request(app)
      .post("/api/v1/category/create-category")
      .set("Authorization", `${adminToken}`)
      .send(categoryData);
    // console.log("Response:", JSON.stringify(res.body, null, 2)); // Stringify and log response
    categoryId = res.body.category._id;
    categorySlug = res.body.category.slug;

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.category.name).toBe("New Category");
    expect(res.body.category.slug).toBe("new-category");

    const categoryInDb = await categoryModel.findById(categoryId);
    expect(categoryInDb).not.toBeNull();
    expect(categoryInDb.name).toBe("New Category");
    expect(categoryInDb.slug).toBe("new-category");
  });

  it("Should not be able to create an existing category", async () => {
    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });

    adminToken = loginRes.body.token;

    const categoryData = { name: "New Category", slug: "new-category" };

    const res = await request(app)
      .post("/api/v1/category/create-category")
      .set("Authorization", `${adminToken}`)
      .send(categoryData);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Category already exists");
  });

  it("should not allow a non-admin user to create a category", async () => {
    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: USER_EMAIL, password: USER_PASSWORD });

    const nonAdminToken = loginRes.body.token;

    const categoryData = {
      name: "Unauthorized Category",
      slug: "unauthorized-category",
    };

    const res = await request(app)
      .post("/api/v1/category/create-category")
      .set("Authorization", `${nonAdminToken}`)
      .send(categoryData);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("UnAuthorized Access");

    const categoryInDb = await categoryModel.findOne({
      slug: "unauthorized-category",
    });
    expect(categoryInDb).toBeNull();
  });

  it("should get a single category we just created", async () => {
    const res = await request(app).get(
      `/api/v1/category/single-category/${categorySlug}`
    );

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.category).toBeDefined();
    expect(res.body.category.name).toBe("New Category");
    expect(res.body.category.slug).toBe("new-category");
  });

  it("should allow a admin user to update a category", async () => {
    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: USER_EMAIL, password: USER_PASSWORD });

    const nonAdminToken = loginRes.body.token;

    const updatedCategoryData = {
      name: "Updated Category Name",
    };

    const updateRes = await request(app)
      .put(`/api/v1/category/update-category/${categoryId}`)
      .set("Authorization", `${nonAdminToken}`)
      .send(updatedCategoryData);

    expect(updateRes.status).toBe(401);
    expect(updateRes.body.success).toBe(false);
    expect(updateRes.body.message).toBe("UnAuthorized Access");
  });

  it("should allow a admin user to update a category", async () => {
    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });

    adminToken = loginRes.body.token;

    const updatedCategoryData = {
      name: "Updated Category Name",
    };

    const updateRes = await request(app)
      .put(`/api/v1/category/update-category/${categoryId}`)
      .set("Authorization", `${adminToken}`)
      .send(updatedCategoryData);

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.success).toBe(true);
    expect(updateRes.body.message).toBe("Category Updated Successfully");
    expect(updateRes.body.category).toBeDefined();
    expect(updateRes.body.category.name).toBe(updatedCategoryData.name);
    expect(updateRes.body.category.slug).toBe("updated-category-name");

    const updatedCategoryInDb = await categoryModel.findById(categoryId);
    expect(updatedCategoryInDb).toBeDefined();
    expect(updatedCategoryInDb.name).toBe(updatedCategoryData.name);
    expect(updatedCategoryInDb.slug).toBe("updated-category-name");
  });

  it("should not allow a non-admin user to delete a category", async () => {
    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: USER_EMAIL, password: USER_PASSWORD });

    const nonAdminToken = loginRes.body.token;

    const deleteRes = await request(app)
      .delete(`/api/v1/category/delete-category/${categoryId}`)
      .set("Authorization", `${nonAdminToken}`);

    expect(deleteRes.status).toBe(401);
    expect(deleteRes.body.success).toBe(false);
    expect(deleteRes.body.message).toBe("UnAuthorized Access");

    const categoryInDb = await categoryModel.findById(categoryId);
    expect(categoryInDb).not.toBeNull();
    expect(categoryInDb.name).toBe("Updated Category Name");
    expect(categoryInDb.slug).toBe("updated-category-name");
  });

  it("should allow an admin user to delete a category", async () => {
    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });

    const nonAdminToken = loginRes.body.token;

    const deleteRes = await request(app)
      .delete(`/api/v1/category/delete-category/${categoryId}`)
      .set("Authorization", `${nonAdminToken}`);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);

    const deletedCategory = await categoryModel.findById(categoryId);
    expect(deletedCategory).toBeNull();
  });
});
