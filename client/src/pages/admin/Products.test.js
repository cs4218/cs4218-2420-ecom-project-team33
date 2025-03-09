import "@testing-library/jest-dom"
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import Products from "./Products";

jest.mock("axios");

jest.mock("../../components/Layout", () =>
    jest.fn(({ children }) => <div>{children}</div>)
);

jest.mock("../../components/AdminMenu", () =>
    jest.fn(() => <div>Admin Menu</div>)
);

describe("Products Component", () => {

  test("renders all products correctly", async () => {
    render(
      <BrowserRouter>
        <Products />
      </BrowserRouter>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalled());

    expect(screen.getByText("All Products List")).toBeInTheDocument();
  });

  test("renders products when API call is successful", async () => {
    const mockProducts = [
      {
        _id: "prod1",
        name: "Test Product",
        description: "A great product",
        slug: "test-product",
      },
      {
        _id: "prod2",
        name: "Another Product",
        description: "Another great item",
        slug: "another-product",
      },
    ];
  
    axios.get.mockResolvedValueOnce({ data: { products: mockProducts } });
  
    render(
      <BrowserRouter>
        <Products />
      </BrowserRouter>
    );
  
    // Wait for API call
    await waitFor(() => expect(axios.get).toHaveBeenCalled());
  
    // Check if the product names appear in the DOM
    expect(await screen.findByText("Test Product")).toBeInTheDocument();
    expect(await screen.findByText("Another Product")).toBeInTheDocument();
  });
  

  test("handles API errors gracefully", async () => {
    axios.get.mockRejectedValueOnce(new Error("API Error"));

    render(
      <BrowserRouter>
        <Products />
      </BrowserRouter>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalled());
  });
});
