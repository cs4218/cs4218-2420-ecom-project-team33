import { 
    createProductController,
    getProductController,
    getSingleProductController,
    deleteProductController,
    updateProductController
 } from "../controllers/productController";

 import { beforeAll, beforeEach, jest } from "@jest/globals";
 import productModel from "../models/productModel.js";
 import fs from "fs";
 import slugify from "slugify";
 import mongoose from "mongoose";
 
//  jest.mock("fs");
 jest.mock("../models/productModel");
 jest.mock("slugify");
 
 beforeAll(() => {
   productModel.findByIdAndDelete = jest.fn();
   productModel.findByIdAndUpdate = jest.fn();
   productModel.findOne = jest.fn();
   productModel.find = jest.fn();
 });
 
jest.mock("braintree", () => ({
    BraintreeGateway: jest.fn(() => ({
      clientToken: {
        generate: jest.fn((_, cb) => cb(null, { clientToken: "mockToken" })),
      },
      transaction: {
        sale: jest.fn((_, cb) => cb(null, { success: true })),
      },
    })),
    Environment: {
      Sandbox: "sandbox",
    },
}));


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
  });

  describe("createProductController tests", () => {
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
    
        jest.spyOn(productModel.prototype, 'save').mockResolvedValue(true);
        jest.spyOn(fs, 'readFileSync').mockReturnThis(null);

        await createProductController(req, res);
        
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
    
        jest.spyOn(productModel.prototype, 'save').mockRejectedValue(new Error('Error saving product'));
        jest.spyOn(fs, 'readFileSync').mockReturnThis(null);
    
        await createProductController(req, res);
    
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            error: expect.any(Error),
            message: "Error in creating product"
        })
      });
  });

  describe("getProductController tests", () => {
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
  });

  describe("getSingleProductController tests", () => {
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
  });
  
  describe("deleteProductController tests", () => {
    test("Should delete product successfully with status 200 for correct PID", async () => {
        req = {
            params: {
                pid: new mongoose.Types.ObjectId(),
            },
        };
    
        productModel.findByIdAndDelete.mockImplementation((pid) => ({
            _id: pid,
            select: jest.fn(),
        }));
    
        await deleteProductController(req, res);
    
        expect(productModel.findByIdAndDelete).toHaveBeenCalledWith(req.params.pid);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            message: "Product Deleted successfully",
        })
      });
    
      test("Should return error with status 600 for non-existent PID", async () => {
        req = {
            params: {
                pid: new mongoose.Types.ObjectId(),
            },
        };
    
        productModel.findByIdAndDelete.mockImplementation((pid) => {
            throw new Error("pid does not exist");
        });
    
        await deleteProductController(req, res);
    
        expect(productModel.findByIdAndDelete).toHaveBeenCalledWith(req.params.pid);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            message: "Error while deleting product",
            error: expect.any(Error),
        })
      });
  });

  describe("updateProductController tests", () => {        
        test("Pairwise test 1 - Missing photo, description, price, quantity should return error 500", async () => {
            const missingFields = ["description", "price", "quantity"];
            req.fields = { ...validProduct };

            for (const missingField of missingFields) {
                req.fields[missingField] = "";
            }

            await updateProductController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });

        test("Pairwise test 2 - Missing photo, name, category, shipping should return error 500", async () => {
            const missingFields = ["name", "category", "shipping"];
            req.fields = { ...validProduct };

            for (const missingField of missingFields) {
                req.fields[missingField] = "";
            }

            await updateProductController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });

        test("Pairwise test 3 - Valid photo, missing price, category, shipping should return error 500", async () => {
            const missingFields = ["price", "category", "shipping"];
            req.fields = { ...validProduct };
            req.files.photo = {
                size: 999999,
                path: "test/path",
                type: "image/jpeg"
              };

            for (const missingField of missingFields) {
                req.fields[missingField] = "";
            }

            await updateProductController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });

        test("Pairwise test 4 - Valid photo, no missing fields should update product successfully", async () => {
            // slugify.mockReturnValue("test-product");
            const mockPhoto = {
                photo: {
                    size: 999999,
                    path: "./test/img",
                    type: "image/jpeg",
                  },
            }

            const req = {
              params: {
                pid: new mongoose.Types.ObjectId(),
              },
              fields: { ...validProduct },
              files: { ...mockPhoto },
            };

            const mockProducts = {
                ...validProduct,
                photo: mockPhoto,
                save: jest.fn(),
            }

            productModel.findByIdAndUpdate.mockImplementation((pid, field, nw) => mockProducts);

            await updateProductController(req, res);

            expect(productModel.findByIdAndUpdate).toHaveBeenCalledWith(
              req.params.pid,
              { ...req.fields, slug: "Test-Product" },
              { new: true }
            );

            // expect(fs.readFileSync).toHaveBeenCalledWith(
            //   req.files.photo.path
            // );

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.send).toHaveBeenCalledWith({
                success: true,
                message: "Product Updated Successfully",
                products: mockProducts,
            })
        });

        test("Pairwise test 5 - Valid photo, missing name, description, quantity, shipping should return error 500", async () => {
            const missingFields = ["name", "description", "quantity", "shipping"];
            req.fields = { ...validProduct };
            req.files.photo = {
                size: 999999,
                path: "test/path",
                type: "image/jpeg"
              };

            for (const missingField of missingFields) {
                req.fields[missingField] = "";
            }

            await updateProductController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });

        test("Pairwise test 6 - Invalid photo, missing description, category, quantity should return error 500", async () => {
            const missingFields = ["name", "description", "category", "quantity"];
            req.fields = { ...validProduct };
            req.files.photo = {
                size: 1000000,
                path: "test/path",
                type: "image/jpeg"
              };

            for (const missingField of missingFields) {
                req.fields[missingField] = "";
            }

            await updateProductController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });

        test("Pairwise test 7 - Invalid photo, missing name, price, category, quantity, shipping should return error 500", async () => {
            const missingFields = ["name", "price", "category", "quantity", "shipping"];
            req.fields = { ...validProduct };
            req.files.photo = {
                size: 1000000,
                path: "test/path",
                type: "image/jpeg"
              };

            for (const missingField of missingFields) {
                req.fields[missingField] = "";
            }

            await updateProductController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });

        test("Pairwise test 8 - Invalid photo, missing name, description, price should return error 500", async () => {
            const missingFields = ["name", "description", "price", "quantity", "shipping"];
            req.fields = { ...validProduct };
            req.files.photo = {
                size: 1000000,
                path: "test/path",
                type: "image/jpeg"
              };

            for (const missingField of missingFields) {
                req.fields[missingField] = "";
            }

            await updateProductController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });

        test("Pairwise test 9 - Invalid photo, missing shipping should return error 500", async () => {
            const missingFields = ["shipping"];
            req.fields = { ...validProduct };
            req.files.photo = {
                size: 1000000,
                path: "test/path",
                type: "image/jpeg"
              };

            for (const missingField of missingFields) {
                req.fields[missingField] = "";
            }

            await updateProductController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({
                error: "photo is Required and should be less then 1mb",
            })
        });

        test("Valid request with DB error should return error 500", async () => {
            const mockPhoto = {
                photo: {
                    size: 999999,
                    path: "./test/img",
                    type: "image/jpeg",
                  },
            }

            const req = {
              params: {
                pid: new mongoose.Types.ObjectId(),
              },
              fields: { ...validProduct },
              files: { ...mockPhoto },
            };

            const mockProducts = {
                ...validProduct,
                photo: mockPhoto,
                save: jest.fn(async () => {
                    throw new Error("Error updating DB");
                }),
            }

            productModel.findByIdAndUpdate.mockImplementation((pid, field, nw) => mockProducts);
            
            await updateProductController(req, res);

            expect(productModel.findByIdAndUpdate).toHaveBeenCalledWith(
              req.params.pid,
              { ...req.fields, slug: "Test-Product" },
              { new: true }
            );

            // expect(slugify).toHaveBeenCalledWith(req.fields.name);
            // expect(fs.readFileSync).toHaveBeenCalledWith(
            //   req.files.photo.path
            // );

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({
                success: false,
                error: expect.any(Error),
                message: "Error in Updating product",
            })
        });
  });
});
