import { createCategoryController } from "../controllers/categoryController.js";
import { updateCategoryController } from "../controllers/categoryController.js";
import { categoryController } from "../controllers/categoryController.js";
import { singleCategoryController } from "../controllers/categoryController.js";
import { deleteCategoryController } from "../controllers/categoryController.js";
import categoryModel from "../models/categoryModel.js";
import { jest } from "@jest/globals";
import slugify from "slugify";

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
    // expect(slugify).toHaveBeenCalledWith("Furniture");
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
    const error = new Error("Database error");
    categoryModel.findOne.mockRejectedValue(error);

    await createCategoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      error: error.message,
      message: "Error in Category",
    });
  });
});

describe("updateCategoryController", () => {
  let req, res;
  const categoryId = "66db427fdb0119d9234b27ef";

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
    req = { params: { id: categoryId }, body: { name: "" } };
    await updateCategoryController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Valid category name is required",
    });

    req = { params: { id: categoryId }, body: {} };
    await updateCategoryController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Valid category name is required",
    });

    req = { params: { id: categoryId }, body: { name: "   " } };
    await updateCategoryController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Valid category name is required",
    });

    req = { params: { id: categoryId }, body: { name: 123 } };
    await updateCategoryController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Valid category name is required",
    });
  });

  it("should return 404 if category provided does not exist", async () => {
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
  });

  it("should handle errors and return status 500 if something goes wrong", async () => {
    const categoryName = "Book";
    const req = { params: { id: categoryId }, body: { name: categoryName } };
    const error = new Error("Database error");
    categoryModel.findByIdAndUpdate.mockRejectedValue(error);

    await updateCategoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      error: error.message,
      message: "Error while updating category",
    });
  });
});

describe("categoryController", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  it("should return 200 and a list of categories when successful", async () => {
    const mockCategories = [
      { _id: "1", name: "Book", slug: "book" },
      { _id: "2", name: "Electronics", slug: "electronics" },
    ];
    categoryModel.find = jest.fn().mockResolvedValue(mockCategories);

    await categoryController(req, res);

    expect(categoryModel.find).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "All Categories List",
      category: mockCategories,
    });
  });

  it("should return 500 if there is a database error", async () => {
    const error = new Error("Database error");
    categoryModel.find = jest.fn().mockRejectedValue(error);

    await categoryController(req, res);

    expect(categoryModel.find).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      error: error.message,
      message: "Error while getting all categories",
    });
  });

  it("should return 200 with an empty array if no categories exist", async () => {
    categoryModel.find.mockResolvedValue([]);

    await categoryController(req, res);

    expect(categoryModel.find).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "All Categories List",
      category: [],
    });
  });
});

describe("singleCategoryController", () => {
  let req, res;

  beforeEach(() => {
    req = { params: { slug: "test-category" } };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it("should return a category successfully", async () => {
    const mockCategory = {
      _id: "123",
      name: "Test Category",
      slug: "test-category",
    };
    categoryModel.findOne.mockResolvedValue(mockCategory);

    await singleCategoryController(req, res);

    expect(categoryModel.findOne).toHaveBeenCalledWith({
      slug: "test-category",
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Get single category successfully",
      category: mockCategory,
    });
  });

  it("should return 404 if category is not found", async () => {
    categoryModel.findOne.mockResolvedValue(null);

    await singleCategoryController(req, res);

    expect(categoryModel.findOne).toHaveBeenCalledWith({
      slug: "test-category",
    });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Category not found",
    });
  });

  it("should return 400 if slug is missing", async () => {
    req.params.slug = "";

    await singleCategoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Slug parameter is required",
    });
  });

  it("should handle internal server errors", async () => {
    const error = new Error("Database error");
    categoryModel.findOne.mockRejectedValue(error);

    await singleCategoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      error: "Database error",
      message: "Error while getting single category",
    });
  });
});

describe("deleteCategoryController", () => {
  let req, res;

  beforeEach(() => {
    req = { params: { id: "123" } };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it("should delete a category successfully", async () => {
    categoryModel.findByIdAndDelete = jest
      .fn()
      .mockResolvedValue({ _id: "123" });

    await deleteCategoryController(req, res);

    expect(categoryModel.findByIdAndDelete).toHaveBeenCalledWith("123");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Category deleted successfully",
    });
  });

  it("should return 404 if category is not found", async () => {
    categoryModel.findByIdAndDelete.mockResolvedValue(null);

    await deleteCategoryController(req, res);

    expect(categoryModel.findByIdAndDelete).toHaveBeenCalledWith("123");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Category not found",
    });
  });

  it("should return 400 if id is missing", async () => {
    req.params.id = "";

    await deleteCategoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Category ID is required",
    });
  });

  it("should handle internal server errors", async () => {
    const error = new Error("Database error");
    categoryModel.findByIdAndDelete.mockRejectedValue(error);

    await deleteCategoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error while deleting category",
      error: error.message,
    });
  });
});
