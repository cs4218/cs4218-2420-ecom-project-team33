import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ProductDetails from "./ProductDetails";
import "@testing-library/jest-dom";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

// Mock all dependencies
jest.mock("axios");
jest.mock("react-router-dom", () => ({
  useParams: jest.fn(),
  useNavigate: jest.fn(),
}));
jest.mock("./../components/Layout", () =>
  jest.fn(({ children }) => <div>{children}</div>)
);

describe("ProductDetails Component", () => {
  let mockNavigate;
  
  beforeEach(() => {
    // Mock params
    useParams.mockReturnValue({ slug: "test-product" });
    
    // Mock navigate
    mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);
    
    // Mock axios responses
    axios.get.mockImplementation((url) => {
      if (url.includes("/api/v1/product/get-product")) {
        return Promise.resolve({
          data: {
            product: {
              _id: "prod1",
              name: "Test Product",
              description: "This is a test product description",
              price: 99.99,
              category: {
                _id: "cat1",
                name: "Electronics"
              }
            }
          }
        });
      } else if (url.includes("/api/v1/product/related-product")) {
        return Promise.resolve({
          data: {
            products: [
              {
                _id: "rel1",
                name: "Related Product 1",
                slug: "related-product-1",
                price: 79.99,
                description: "This is a related product."
              },
              {
                _id: "rel2",
                name: "Related Product 2",
                slug: "related-product-2",
                price: 129.99,
                description: "Another related product description."
              }
            ]
          }
        });
      }
      return Promise.resolve({ data: {} });
    });
  });

  it("renders product details when data is loaded", async () => {
    render(<ProductDetails />);
    
    await waitFor(() => {
      expect(screen.getByText("Product Details")).toBeInTheDocument();
      expect(screen.getByText("Name : Test Product")).toBeInTheDocument();
      expect(screen.getByText("Description : This is a test product description")).toBeInTheDocument();
      expect(screen.getByText(/Price :/i)).toHaveTextContent("$99.99");
      expect(screen.getByText("Category : Electronics")).toBeInTheDocument();
    });
  });

  it("displays the product image with correct attributes", async () => {
    render(<ProductDetails />);
    
    await waitFor(() => {
      const productImage = screen.getByAltText("Test Product");
      expect(productImage).toBeInTheDocument();
      expect(productImage).toHaveAttribute("src", "/api/v1/product/product-photo/prod1");
      expect(productImage).toHaveAttribute("height", "300");
      expect(productImage).toHaveAttribute("width", "350px");
    });
  });

  it("renders 'ADD TO CART' button", async () => {
    render(<ProductDetails />);
    
    await waitFor(() => {
      expect(screen.getByText("ADD TO CART")).toBeInTheDocument();
    });
  });

  it("displays similar products section", async () => {
    render(<ProductDetails />);
    
    await waitFor(() => {
      expect(screen.getByText("Similar Products ➡️")).toBeInTheDocument();
      expect(screen.getByText("Related Product 1")).toBeInTheDocument();
      expect(screen.getByText("Related Product 2")).toBeInTheDocument();
    });
  });

  it("formats related product prices correctly", async () => {
    render(<ProductDetails />);
    
    await waitFor(() => {
      expect(screen.getByText("$79.99")).toBeInTheDocument();
      expect(screen.getByText("$129.99")).toBeInTheDocument();
    });
  });

//   it("displays truncated descriptions for related products", async () => {
//     render(<ProductDetails />);
    
//     await waitFor(() => {
//       expect(screen.getByText("This is a related product with a description longer than sixty...")).toBeInTheDocument();
//     });
//   });

  it("navigates to product detail when More Details is clicked on related product", async () => {
    render(<ProductDetails />);
    
    await waitFor(() => {
      const moreDetailsButtons = screen.getAllByText("More Details");
      fireEvent.click(moreDetailsButtons[0]);
    });
    
    expect(mockNavigate).toHaveBeenCalledWith("/product/related-product-1");
  });

  it("displays message when no similar products found", async () => {
    // Override mock for this specific test
    axios.get.mockImplementation((url) => {
      if (url.includes("/api/v1/product/get-product")) {
        return Promise.resolve({
          data: {
            product: {
              _id: "prod1",
              name: "Test Product",
              description: "This is a test product description",
              price: 99.99,
              category: {
                _id: "cat1",
                name: "Electronics"
              }
            }
          }
        });
      } else if (url.includes("/api/v1/product/related-product")) {
        return Promise.resolve({
          data: {
            products: []
          }
        });
      }
      return Promise.resolve({ data: {} });
    });
    
    render(<ProductDetails />);
    
    await waitFor(() => {
      expect(screen.getByText("No Similar Products found")).toBeInTheDocument();
    });
  });

  it("fetches product data when params.slug changes", async () => {
    const { rerender } = render(<ProductDetails />);
    
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/product/get-product/test-product");
    });
    
    // Update params and rerender
    useParams.mockReturnValue({ slug: "different-product" });
    rerender(<ProductDetails />);
    
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/product/get-product/different-product");
    });
  });

  it("handles error when fetching product details", async () => {
    console.log = jest.fn(); // Mock console.log to track error logging
    
    // Override mock to throw error
    axios.get.mockImplementationOnce(() => {
      return Promise.reject(new Error("Error fetching product"));
    });
    
    render(<ProductDetails />);
    
    await waitFor(() => {
      expect(console.log).toHaveBeenCalled();
    });
  });
});
