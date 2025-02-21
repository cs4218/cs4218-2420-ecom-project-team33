import { 
    createProductController,
    getProductController,
    getSingleProductController
 } from "../controllers/productController";

import productModel from "../models/productModel.js";

import mongoose from "mongoose";
import fs from "fs";
import slugify from "slugify";
import { error } from "console";

jest.mock("braintree");
jest.mock("fs");
jest.mock("slugify", () => jest.fn(() => 'test-product'));
jest.mock("../models/productModel");

describe("Product Controller tests", () => {
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

  test("Should return all products with a 200 status code", async () => {
    const mockProducts = [
      { _id: "1", name: "Product 1", category: "Category 1" },
      { _id: "2", name: "Product 2", category: "Category 2" },
    ];

    productModel.find.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(mockProducts),
          }),
        }),
      }),
    });

    await getProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      counTotal: mockProducts.length,
      message: "All Products ",
      products: mockProducts,
    });
  });

  test("Should return error 500 with DB error", async () => {
    const mockProducts = [
      { _id: "1", name: "Product 1", category: "Category 1" },
      { _id: "2", name: "Product 2", category: "Category 2" },
    ];

    productModel.find.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            sort: jest.fn(() => {
                throw new Error("DB error");
            }),
          }),
        }),
      }),
    });

    await getProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "Error in getting products",
        error: "DB error",
    });
  });

  test("Should return single product with 200 status code", async () => {
    req = {
        params: { slug: "product-1" }, 
    };

    const mockProduct = { _id: "1", name: "Product 1", category: "Category 1" };
  
      productModel.findOne.mockReturnValue({
        select: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockProduct),
        }),
      });
  
      await getSingleProductController(req, res);
  
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "Single Product Fetched",
        product: mockProduct,
      });
  });

  test("Should return error 500 with DB error", async () => {
    req = {
        params: { slug: "product-1" }, 
    };

    const mockProduct = { _id: "1", name: "Product 1", category: "Category 1" };
  
      productModel.findOne.mockReturnValue({
        select: jest.fn().mockReturnValue({
          populate: jest.fn(() => {
            throw new Error("DB error");
          }),
        }),
      });
  
      await getSingleProductController(req, res);
  
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "Error while getitng single product",
        error: expect.any(Error),
      });
  });
}

);
