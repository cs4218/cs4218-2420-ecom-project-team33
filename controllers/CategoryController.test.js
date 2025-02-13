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

  it("should successfully update category and return status 200", async () => {
    const categoryId = "category123";
    const categoryName = "NewCategory";

    const mockCategory = {
      id: categoryId,
      name: categoryName,
      slug: "new-category",
    };

    categoryModel.findByIdAndUpdate = jest.fn().mockResolvedValue(mockCategory);
    const req = { params: { id: categoryId }, body: { name: categoryName } };

    await updateCategoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      messsage: "Category Updated Successfully",
      category: mockCategory,
    });
    // expect(slugify).toHaveBeenCalledWith(categoryName);
  });

  // it("should handle errors and return status 500 if something goes wrong", async () => {
  //   const categoryId = "category123";
  //   const categoryName = "New Category";

  //   // Simulate an error in the controller
  //   const req = { params: { id: categoryId }, body: { name: categoryName } };
  //   const res = {
  //     status: jest.fn().mockReturnThis(),
  //     send: jest.fn(),
  //   };

  //   // Mock an error when finding/updating the category
  //   mockingoose(categoryModel).toReturn(
  //     new Error("Database Error"),
  //     "findOneAndUpdate"
  //   );

  //   await updateCategoryController(req, res);

  //   expect(res.status).toHaveBeenCalledWith(500);
  //   expect(res.send).toHaveBeenCalledWith({
  //     success: false,
  //     error: new Error("Database Error"),
  //     message: "Error while updating category",
  //   });
  // });
});
