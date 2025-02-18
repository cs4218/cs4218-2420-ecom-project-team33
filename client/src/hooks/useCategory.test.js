import axios from "axios";
import React from "react";
import useCategory from "./useCategory";
import { render, waitFor } from "@testing-library/react";
import { BOOKS, CLOTHING, ELECTRONICS, mockCategories } from "../mocks/categories";

// Mock axios
jest.mock("axios");

describe("useCategory Hook", () => {

  // Mock component to test hook
  const MockComponent = () => {
    const categories = useCategory();
    return (
    <div>
      {categories?.map(category => <div key={category._id}>{category.name}</div>)}
    </div>
    );
  };

  it("should work correctly for successful API calls", async () => {
    // Mock axios and logger
    axios.get.mockResolvedValueOnce({ data: { category: mockCategories } });
    console.log = jest.fn();

    // Render component
    const { getByText } = render(<MockComponent />);

    // Wait for axios get call and results
    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    await waitFor(() => expect(getByText(CLOTHING.name)).toBeInTheDocument);
    await waitFor(() => expect(getByText(ELECTRONICS.name)).toBeInTheDocument);
    await waitFor(() => expect(getByText(BOOKS.name)).toBeInTheDocument);

    // Expect logger to not be called
    expect(console.log).not.toHaveBeenCalledWith(expect.any(Error));
  });

  it("should handle and log errors for unsuccessful API calls", async () => {
    // Mock axios and logger
    axios.get.mockRejectedValueOnce(new Error("Axios Error!"));
    console.log = jest.fn();
    
    // Render component
    render(<MockComponent />);
    
    // Wait for axios get call
    await waitFor(() => expect(axios.get).toHaveBeenCalled());

    // Expect logger to be called
    expect(console.log).toHaveBeenCalledWith(expect.any(Error));
  });

});