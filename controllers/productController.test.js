import { 
    createProductController,
    getProductController,
    getSingleProductController,
    deleteProductController,
    updateProductController,
    productPhotoController,
    productFiltersController,
    productCountController,
    productListController,
    searchProductController,
    relatedProductController,
    productCategoryController
 } from "../controllers/productController";

 import { beforeAll, beforeEach, describe, jest, test } from "@jest/globals";
 import productModel from "../models/productModel.js";
 import categoryModel from '../models/categoryModel.js';
 import fs from "fs";
 import slugify from "slugify";
 import mongoose from "mongoose";
 
 jest.mock("../models/productModel");
 jest.mock("../models/categoryModel");
 jest.mock("slugify");
 
 beforeAll(() => {
   productModel.findByIdAndDelete = jest.fn();
   productModel.findByIdAndUpdate = jest.fn();
   productModel.findById = jest.fn();
   productModel.findOne = jest.fn();
   productModel.find = jest.fn();
   categoryModel.findOne = jest.fn();
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
    
      test("Should return error with status 500 for non-existent PID", async () => {
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

        test("Missing Price should return error 500", async () => {
          const missingFields = ["category"];
          req.fields = { ...validProduct };

          for (const missingField of missingFields) {
              req.fields[missingField] = "";
          }

          await updateProductController(req, res);

          expect(res.status).toHaveBeenCalledWith(500);
        });

        test("Missing Quantity should return error 500", async () => {
          const missingFields = ["quantity"];
          req.fields = { ...validProduct };

          for (const missingField of missingFields) {
              req.fields[missingField] = "";
          }

          await updateProductController(req, res);

          expect(res.status).toHaveBeenCalledWith(500);
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

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({
                success: false,
                error: expect.any(Error),
                message: "Error in Updating product",
            })
        });
  });

  describe("productPhotoController tests", () => {
    beforeEach(() => {
      jest.clearAllMocks();
  
      req = {
        params: {
          pid: new mongoose.Types.ObjectId(),
        }
      };
  
      res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
        set: jest.fn().mockReturnThis(),
      };
    });

    test("Should get photo successfully with valid photot", async () => {
      const mockPhotoData = Buffer.from("mock photo data");
      const mockProduct = {
        photo: {
          data: mockPhotoData,
          contentType: "image/jpeg"
        }
      };
  
      productModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockProduct)
      });
   
      await productPhotoController(req, res);

      expect(productModel.findById).toHaveBeenCalledWith(req.params.pid);
      expect(res.set).toHaveBeenCalledWith("Content-type", "image/jpeg");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(mockPhotoData);
    });

    test('should return 404 when product is not found', async () => {
      productModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });
  
      await productPhotoController(req, res);
  
      expect(productModel.findById).toHaveBeenCalledWith(req.params.pid);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: 'Product not found'
      });
      expect(res.set).not.toHaveBeenCalled();
    });

    test('should return 404 when product has no photo data', async () => {
      const mockProduct = {
        _id: req.params.pid,
        photo: {
          contentType: 'image/jpeg'
        }
      };
  
      productModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockProduct)
      });
  
      await productPhotoController(req, res);
  
      expect(productModel.findById).toHaveBeenCalledWith(req.params.pid);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: 'No photo found for this product'
      });
      expect(res.set).not.toHaveBeenCalled();
    });

    test('should return 500 when database query fails', async () => {
      const dbError = new Error('Database connection error');
      productModel.findById.mockReturnValue({
        select: jest.fn().mockRejectedValue(dbError)
      });
  
      await productPhotoController(req, res);
  
      expect(productModel.findById).toHaveBeenCalledWith(req.params.pid);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: 'Error while getting photo',
        error: dbError
      });
      expect(res.set).not.toHaveBeenCalled();
    });
  })

  describe('productFiltersController tests', () => {
    let req, res;

    beforeEach(() => {
      jest.clearAllMocks();
  
      req = {
        body: {
          checked: [],
          radio: []
        }
      };
  
      res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };
    });

    test('Should return all products when no filters are applied', async () => {
      const mockProducts = [
        { _id: 'product1', name: 'Product 1', price: 100 },
        { _id: 'product2', name: 'Product 2', price: 200 }
      ];
  
      productModel.find.mockResolvedValue(mockProducts);
  
      await productFiltersController(req, res);
  
      expect(productModel.find).toHaveBeenCalledWith({});
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        products: mockProducts
      });
    });
  
    test('Should filter products by both category and price range when filters are applied', async () => {
      const mockCategories = ['category1', 'category2'];
      const priceRange = [100, 500];
      const mockProducts = [
        { _id: 'product1', name: 'Product 1', category: 'category1', price: 200 },
        { _id: 'product2', name: 'Product 2', category: 'category2', price: 300 }
      ];
  
      req.body.checked = mockCategories;
      req.body.radio = priceRange;
  
      productModel.find.mockResolvedValue(mockProducts);
  
      await productFiltersController(req, res);
  
      expect(productModel.find).toHaveBeenCalledWith({
        category: mockCategories,
        price: { $gte: priceRange[0], $lte: priceRange[1] }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        products: mockProducts
      });
    });
  
    test('Should handle database errors and return a 400 status', async () => {
      const dbError = new Error('Database error');
      productModel.find.mockRejectedValue(dbError);
  
      await productFiltersController(req, res);
  
      expect(productModel.find).toHaveBeenCalledWith({});
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "Error WHile Filtering Products",
        error: dbError
      });
    });
  })

  describe('productCountController tests', () => {
    let req, res;
  
    beforeEach(() => {
      jest.clearAllMocks();
  
      req = {};
  
      res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };
    });
  
    test('Should return the total count of products with status 200', async () => {
      const totalProducts = 42;
      
      productModel.find.mockReturnValue({
        estimatedDocumentCount: jest.fn().mockResolvedValue(totalProducts)
      });
  
      await productCountController(req, res);
  
      expect(productModel.find).toHaveBeenCalledWith({});
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        total: totalProducts
      });
    });
  
    test('Should return status 400 when database query fails', async () => {
      const dbError = new Error('Database connection error');
      
      productModel.find.mockReturnValue({
        estimatedDocumentCount: jest.fn().mockRejectedValue(dbError)
      });
  
      await productCountController(req, res);
  
      expect(productModel.find).toHaveBeenCalledWith({});
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        message: "Error in product count",
        error: dbError,
        success: false
      });
    });
  });

  describe('productListController tests', () => {
    let req, res;
  
    beforeEach(() => {
      jest.clearAllMocks();
  
      req = {
        params: {}
      };
  
      res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };
    });
  
    test('Should return first page of products when no page is specified', async () => {
      const mockProducts = [
        { _id: 'product1', name: 'Product 1' },
        { _id: 'product2', name: 'Product 2' },
        { _id: 'product3', name: 'Product 3' },
        { _id: 'product4', name: 'Product 4' },
        { _id: 'product5', name: 'Product 5' },
        { _id: 'product6', name: 'Product 6' }
      ];
  
      productModel.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockProducts)
      });
  
      await productListController(req, res);
  
      expect(productModel.find).toHaveBeenCalledWith({});
      expect(productModel.find().select).toHaveBeenCalledWith('-photo');
      expect(productModel.find().skip).toHaveBeenCalledWith(0); // (1-1) * 6 = 0
      expect(productModel.find().limit).toHaveBeenCalledWith(6);
      expect(productModel.find().sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        products: mockProducts
      });
    });
  
  
    test('Should handle empty result set correctly', async () => {
      req.params.page = '10';
      const mockProducts = [];
  
      productModel.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockProducts)
      });
  
      await productListController(req, res);
  
      expect(productModel.find).toHaveBeenCalledWith({});
      expect(productModel.find().select).toHaveBeenCalledWith('-photo');
      expect(productModel.find().skip).toHaveBeenCalledWith(54);
      expect(productModel.find().limit).toHaveBeenCalledWith(6);
      expect(productModel.find().sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        products: []
      });
    });
  
    test('Should return error 400 with database error', async () => {
      const dbError = new Error('Database error');
      
      productModel.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockRejectedValue(dbError)
      });
  
      await productListController(req, res);
  
      expect(productModel.find).toHaveBeenCalledWith({});
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "error in per page ctrl",
        error: dbError
      });
    });
  });

  describe('searchProductController tests', () => {
    let req, res;
  
    beforeEach(() => {
      jest.clearAllMocks();
  
      req = {
        params: {}
      };
  
      res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };
    });
  
    test('should successfully return correct product with valid keyword', async () => {
      req.params.keyword = 'shirt';
      
      const mockProducts = [
        { _id: 'product1', name: 'T-shirt', description: 'A cotton t-shirt' }
      ];
  
      productModel.find.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockProducts)
      });
  
      await searchProductController(req, res);
  
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockProducts);
    });
  
  
    test('Should return status 400 with db error', async () => {
      req.params.keyword = 'shirt';
      
      const dbError = new Error('MongoDB connection failed');
      
      productModel.find.mockReturnValue({
        select: jest.fn().mockRejectedValue(dbError)
      });
    
      await searchProductController(req, res);
    
      expect(productModel.find).toHaveBeenCalledWith({
        $or: [
          { name: { $regex: 'shirt', $options: 'i' } },
          { description: { $regex: 'shirt', $options: 'i' } }
        ]
      });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "Error In Search Product API",
        error: dbError
      });
    });
  });

  describe('relatedProductController tests', () => {
    let req, res;
  
    beforeEach(() => {
      jest.clearAllMocks();
  
      req = {
        params: {
          pid: new mongoose.Types.ObjectId().toString(),
          cid: new mongoose.Types.ObjectId().toString()
        }
      };
  
      res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };
    });
  
    test('Should return status 200 and related products with correct inputs', async () => {
      const mockProducts = [
        { _id: 'product1', name: 'Related Product 1', category: req.params.cid },
        { _id: 'product2', name: 'Related Product 2', category: req.params.cid },
        { _id: 'product3', name: 'Related Product 3', category: req.params.cid }
      ];
  
      productModel.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue(mockProducts)
      });
  
      await relatedProductController(req, res);
  
      expect(productModel.find).toHaveBeenCalledWith({
        category: req.params.cid,
        _id: { $ne: req.params.pid }
      });
      expect(productModel.find().select).toHaveBeenCalledWith('-photo');
      expect(productModel.find().limit).toHaveBeenCalledWith(3);
      expect(productModel.find().populate).toHaveBeenCalledWith('category');
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        products: mockProducts
      });
    });
  
    test('Should return error 400 for empty pid parameter', async () => {
      req.params = {
        pid: '',
        cid: new mongoose.Types.ObjectId().toString()
      };
  
      await relatedProductController(req, res);
  
      expect(productModel.find).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "Product ID is required"
      });
    });
  
    test('Should return error 400 for empty cid parameter', async () => {
      req.params = {
        pid: new mongoose.Types.ObjectId().toString(),
        cid: ''
      };
  
      await relatedProductController(req, res);
  
      expect(productModel.find).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "Category ID is required"
      });
    });
  
    test('Should return error 400 for db error', async () => {
      const dbError = new Error('Database connection failed');
      
      productModel.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockRejectedValue(dbError)
      });
  
      await relatedProductController(req, res);
  
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "error while getting related product",
        error: dbError
      });
    });
  });

  describe('Product Category Controller', () => {
    let req, res;
  
    beforeEach(() => {
      jest.clearAllMocks();
  
      req = {
        params: {
          slug: 'test-category'
        }
      };
  
      res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };
    });
  
    test('Should return category and its products successfully', async () => {
      const mockCategory = {
        _id: new mongoose.Types.ObjectId(),
        name: 'Test Category',
        slug: 'test-category'
      };
      
      const mockProducts = [
        { _id: 'product1', name: 'Product 1', category: mockCategory._id },
        { _id: 'product2', name: 'Product 2', category: mockCategory._id }
      ];
  
      categoryModel.findOne.mockResolvedValue(mockCategory);
      productModel.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockProducts)
      });

      await productCategoryController(req, res);
  
      expect(categoryModel.findOne).toHaveBeenCalledWith({ slug: 'test-category' });
      expect(productModel.find).toHaveBeenCalledWith({ category: mockCategory });
      expect(productModel.find().populate).toHaveBeenCalledWith('category');
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        category: mockCategory,
        products: mockProducts
      });
    });
  
    test('Should handle case when category is not found', async () => {
      categoryModel.findOne.mockResolvedValue(null);
  
      await productCategoryController(req, res);
  
      expect(categoryModel.findOne).toHaveBeenCalledWith({ slug: 'test-category' });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "Category not found",
      });
    });
  
    test('Should handle empty products array when no products in category', async () => {
      const mockCategory = {
        _id: new mongoose.Types.ObjectId(),
        name: 'Test Category',
        slug: 'test-category'
      };
      
      const mockProducts = []; 
  
      categoryModel.findOne.mockResolvedValue(mockCategory);
      productModel.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockProducts)
      });
  
      await productCategoryController(req, res);
  
      expect(categoryModel.findOne).toHaveBeenCalledWith({ slug: 'test-category' });
      expect(productModel.find).toHaveBeenCalledWith({ category: mockCategory });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        category: mockCategory,
        products: []
      });
    });
  
    test('Should handle database error when finding category', async () => {
      const dbError = new Error('Database error in categoryModel');
      
      categoryModel.findOne.mockRejectedValue(dbError);
  
      await productCategoryController(req, res);
  
      expect(categoryModel.findOne).toHaveBeenCalledWith({ slug: 'test-category' });
      expect(productModel.find).not.toHaveBeenCalled(); 
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        error: dbError,
        message: "Error While Getting products"
      });
    });
  });
});
