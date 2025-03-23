import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import HomePage from "./HomePage";
import "@testing-library/jest-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/cart";
import toast from "react-hot-toast";

// Mock all dependencies
jest.mock("axios");
jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));
jest.mock("../context/cart", () => ({
  useCart: jest.fn(),
}));
jest.mock("react-hot-toast", () => ({
  success: jest.fn(),
}));
jest.mock("./../components/Layout", () =>
  jest.fn(({ children }) => <div>{children}</div>)
);
jest.mock("react-icons/ai", () => ({
  AiOutlineReload: () => <div data-testid="reload-icon">Reload Icon</div>,
}));

describe("HomePage Component", () => {
  let mockNavigate;
  let mockCart;
  let mockSetCart;
  
  beforeEach(() => {
    mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);
    
    mockCart = [];
    mockSetCart = jest.fn((newCart) => {
      mockCart = newCart;
    });
    useCart.mockReturnValue([mockCart, mockSetCart]);
    
    // Mock localStorage
    Storage.prototype.getItem = jest.fn();
    Storage.prototype.setItem = jest.fn();
    
    // Mock axios responses
    axios.get.mockImplementation((url) => {
      if (url.includes("/api/v1/category/get-category")) {
        return Promise.resolve({
          data: {
            success: true,
            category: [
              { _id: "cat1", name: "Electronics" },
              { _id: "cat2", name: "Clothing" }
            ]
          }
        });
      } else if (url.includes("/api/v1/product/product-count")) {
        return Promise.resolve({
          data: {
            total: 5
          }
        });
      } else if (url.includes("/api/v1/product/product-list")) {
        return Promise.resolve({
          data: {
            products: [
              {
                _id: "prod1",
                name: "Test Product 1",
                slug: "test-product-1",
                price: 99.99,
                description: "Test description"
              },
              {
                _id: "prod2",
                name: "Test Product 2",
                slug: "test-product-2",
                price: 149.99,
                description: "Another description"
              }
            ]
          }
        });
      }
      return Promise.resolve({ data: {} });
    });
    
    axios.post.mockImplementation(() => {
      return Promise.resolve({
        data: {
          products: [
            {
              _id: "filtered1",
              name: "Filtered Product",
              slug: "filtered-product",
              price: 79.99,
              description: "This is a filtered product."
            }
          ]
        }
      });
    });
  });

  it("renders homepage with banner image", async () => {
    render(<HomePage />);
    
    const bannerImage = screen.getByAltText("bannerimage");
    expect(bannerImage).toBeInTheDocument();
    expect(bannerImage).toHaveAttribute("src", "/images/Virtual.png");
    expect(bannerImage).toHaveAttribute("width", "100%");
  });

  it("fetches and displays categories", async () => {
    render(<HomePage />);
    
    await waitFor(() => {
      expect(screen.getByText("Electronics")).toBeInTheDocument();
      expect(screen.getByText("Clothing")).toBeInTheDocument();
    });
    
    expect(screen.getByText("Filter By Category")).toBeInTheDocument();
  });

  it("fetches and displays products", async () => {
    render(<HomePage />);
    
    await waitFor(() => {
      expect(screen.getByText("Test Product 1")).toBeInTheDocument();
      expect(screen.getByText("Test Product 2")).toBeInTheDocument();
    });
    
    expect(screen.getByText("All Products")).toBeInTheDocument();
  });

  it("formats product prices correctly", async () => {
    render(<HomePage />);
    
    await waitFor(() => {
      expect(screen.getByText("$99.99")).toBeInTheDocument();
      expect(screen.getByText("$149.99")).toBeInTheDocument();
    });
  });

  it("navigates to product detail page when More Details is clicked", async () => {
    render(<HomePage />);
    
    await waitFor(() => {
      const moreDetailsButtons = screen.getAllByText("More Details");
      fireEvent.click(moreDetailsButtons[0]);
    });
    
    expect(mockNavigate).toHaveBeenCalledWith("/product/test-product-1");
  });

  it("adds product to cart when ADD TO CART is clicked", async () => {
    render(<HomePage />);
    
    await waitFor(() => {
      const addToCartButtons = screen.getAllByText("ADD TO CART");
      fireEvent.click(addToCartButtons[0]);
    });
    
    expect(mockSetCart).toHaveBeenCalled();
    expect(localStorage.setItem).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith("Item Added to cart");
  });

  it("handles category filter changes", async () => {
    render(<HomePage />);
    
    await waitFor(() => {
      const categoryCheckbox = screen.getByText("Electronics").closest("label").querySelector("input");
      fireEvent.click(categoryCheckbox);
    });
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith("/api/v1/product/product-filters", expect.any(Object));
    });
  });

  // it("shows load more button when more products exist", async () => {
  //   render(<HomePage />);
    
  //   await waitFor(() => {
  //     expect(screen.getByText(/Loadmore/i)).toBeInTheDocument();
  //   });
  // });

  // it("loads more products when load more button is clicked", async () => {
  //   render(<HomePage />);
    
  //   await waitFor(() => {
  //     const loadMoreButton = screen.getByText(/Loadmore/i);
  //     fireEvent.click(loadMoreButton);
  //   });
    
  //   expect(axios.get).toHaveBeenCalledWith("/api/v1/product/product-list/2");
  // });

  it("resets filters when reset button is clicked", async () => {
    const mockLocation = window.location;
    delete window.location;
    window.location = { reload: jest.fn() };
    
    render(<HomePage />);
    
    await waitFor(() => {
      const resetButton = screen.getByText("RESET FILTERS");
      fireEvent.click(resetButton);
    });
    
    expect(window.location.reload).toHaveBeenCalled();
    
    window.location = mockLocation;
  });
});
