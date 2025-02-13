import { createCategoryController } from "../controllers/categoryController.js";
import { updateCategoryController } from "../controllers/categoryController.js";
import categoryModel from "../models/categoryModel.js";
import slugify from "slugify";
import { jest } from "@jest/globals";

jest.mock("../models/categoryModel.js");
jest.mock("slugify");
describe("createCategoryController test", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  test("should return 400 if category name is missing", async () => {
    await createCategoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Category name is required",
    });
  });

  test("should return 409 if category already exists", async () => {
    req.body = { name: "Electronics" };
    categoryModel.findOne = jest.fn().mockResolvedValue({
      name: "Electronics",
      slug: "electronics",
    });
    await createCategoryController(req, res);
    expect(categoryModel.findOne).toHaveBeenCalledTimes(1);
    expect(categoryModel.findOne).toHaveBeenCalledWith({ name: "Electronics" });
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Category already exists",
    });
  });

  test("should create a new category and return 201", async () => {
    req.body = { name: "Furniture" };

    categoryModel.findOne.mockResolvedValue(null);

    categoryModel.prototype.save = jest.fn().mockResolvedValue({
      _id: "123",
      name: "Furniture",
      slug: "furniture-slug",
    });

    await createCategoryController(req, res);

    expect(categoryModel.findOne).toHaveBeenCalledTimes(1);
    expect(categoryModel.findOne).toHaveBeenCalledWith({ name: "Furniture" });
    // expect(slugify).toHaveBeenCalledTimes(1);
    // expect(slugifySpy).toHaveBeenCalledWith("Furniture");
    expect(categoryModel.prototype.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "new category created",
      category: {
        _id: "123",
        name: "Furniture",
        slug: "furniture-slug",
      },
    });
  });

  test("should return 500 if an error occurs", async () => {
    req.body = { name: "Books" };
    categoryModel.findOne.mockRejectedValue(new Error("Database error"));

    await createCategoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      error: new Error("Database error"),
      message: "Error in Category",
    });
  });
});

describe("updateCategoryController", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  it("should return 400 if category ID is missing", async () => {
    req = { params: {}, body: { name: "Book" } };

    await updateCategoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Category ID is required",
    });
  });

  it("should return 400 if category name is missing or invalid", async () => {
    req = { params: { id: "66db427fdb0119d9234b27ef" }, body: { name: "" } };
    await updateCategoryController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Valid category name is required",
    });

    req = { params: { id: "66db427fdb0119d9234b27ef" }, body: {} };
    await updateCategoryController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Valid category name is required",
    });

    req = { params: { id: "66db427fdb0119d9234b27ef" }, body: { name: "   " } };
    await updateCategoryController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Valid category name is required",
    });

    req = { params: { id: "66db427fdb0119d9234b27ef" }, body: { name: 123 } };
    await updateCategoryController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Valid category name is required",
    });
  });

  it("should return 404 if category provided does not exist", async () => {
    const categoryId = "66db427fdb0119d9234b27ef";
    const categoryName = "Book";
    const req = { params: { id: categoryId }, body: { name: categoryName } };
    categoryModel.findById = jest.fn().mockResolvedValue(null);
    await updateCategoryController(req, res);

    expect(categoryModel.findById).toHaveBeenCalledWith(categoryId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Category not found",
    });
  });

  it("should successfully update category and return status 200", async () => {
    const categoryId = "66db427fdb0119d9234b27ef";
    const categoryName = "Book";

    const mockCategory = {
      id: categoryId,
      name: categoryName,
      slug: "book",
    };
    categoryModel.findById = jest.fn().mockResolvedValue({
      id: categoryId,
      name: "OldCategory",
      slug: "old-category",
    });
    categoryModel.findByIdAndUpdate = jest.fn().mockResolvedValue(mockCategory);
    const req = { params: { id: categoryId }, body: { name: categoryName } };

    await updateCategoryController(req, res);

    expect(categoryModel.findById).toHaveBeenCalledWith(categoryId);
    expect(categoryModel.findByIdAndUpdate).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Category Updated Successfully",
      category: mockCategory,
    });
    // expect(slugify).toHaveBeenCalledWith(categoryName);
  });

  it("should handle errors and return status 500 if something goes wrong", async () => {
    const categoryId = "66db427fdb0119d9234b27ef";
    const categoryName = "Book";
    const req = { params: { id: categoryId }, body: { name: categoryName } };

    categoryModel.findByIdAndUpdate.mockRejectedValue(
      new Error("Database Error")
    );

    await updateCategoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      error: new Error("Database Error"),
      message: "Error while updating category",
    });
  });
});
