import { createProductController } from "../controllers/productController";
import mongoose from "mongoose";
import productModel from "../models/productModel.js";
import fs from "fs";
import slugify from "slugify";
import { error } from "console";

jest.mock("braintree");
jest.mock("fs");
jest.mock("slugify", () => jest.fn(() => 'test-product'));
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

    fs.readFileSync.mockReturnValue(Buffer.from("fake-image-data"));
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

  test("Should create product with required fields and photo exactly at size limit 999999 bytes", async () => {
    req.fields = { ...validProduct };
    req.files.photo = {
      size: 999999,
      path: "test/path",
      type: "image/jpeg"
    };

    slugify.mockReturnValue("test-slug");

    productModel.mockImplementation((data) => ({
        data,
        photo: {
          data: null,
          contentType: null
        },
        save: jest.fn().mockResolvedValue()
    }));

    await createProductController(req, res);

    expect(productModel).toHaveBeenCalledWith({
        ...req.fields,
        slug: "test-slug",
    });
    
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "Product Created Successfully",
        products: expect.any(Object)
    });
  });

  test("Should return error 500 if photo size is exactly 1MB", async () => {
    req.fields = { ...validProduct };
    req.files = {
      photo: {
        size: 1000000,
        path: "test/path",
        type: "image/jpeg"
      }
    };

    await createProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      error: "photo should be less then 1mb"
    });
  });

  test("Should return error 500 if unable to save to DB", async () => {
    req.fields = { ...validProduct };
    req.files.photo = {
      size: 800000,
      path: "test/path",
      type: "image/jpeg"
    };

    productModel.mockImplementation((data) => ({
        data,
        photo: {
          data: null,
          contentType: null
        },
        save: jest.fn(() => {
            throw new Error("Unable to save to DB");
        })
    }));

    await createProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
        success: false,
        error: expect.any(Error),
        message: "Error in creating product"
    })
  });
}

);
