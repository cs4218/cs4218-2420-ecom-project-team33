import { createProductController } from "../controllers/productController";

import mongoose from "mongoose";
import { jest } from "@jest/globals";

jest.mock("braintree");
jest.mock("../models/productModel");

describe("createProductController tests", () => {
  let req, res;
  const validProduct = {
    name: "Test Product",
    description: "Test Description",
    price: 100,
    category: new mongoose.Types.ObjectId(),
    quantity: 10,
    shipping: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      fields: {},
      files: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  test("Should return error 500 if required field is missing", async () => {
    const requiredFields = ["name", "description", "price", "category", "quantity"];

    for (const requiredField of requiredFields) {
      req.fields = { ...validProduct };
      req.fields[requiredField] = "";

      await createProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        error: `${requiredField.charAt(0).toUpperCase() + requiredField.slice(1)} is Required`,
      });

      jest.clearAllMocks();
    }
  });

  test("Should successfully create product with valid fields", async () => {
    req.fields = { ...validProduct };

    await createProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Product Created Successfully",
      products: expect.any(Object)
    });
  });

  test("Should return error 500 if photo size is too large", async () => {
    req.fields = { ...validProduct };
    req.files = {
      photo: {
        size: 1100000,
        path: "test/path",
        type: "image/jpeg"
      }
    };

    await createProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      error: "photo is Required and should be less then 1mb"
    });
  });
}
);
