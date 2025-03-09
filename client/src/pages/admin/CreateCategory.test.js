import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import axios from "axios";
import toast from "react-hot-toast";
import CreateCategory from "../../pages/admin/CreateCategory";

// Mock the dependencies
jest.mock("axios");
jest.mock("react-hot-toast", () => ({
  success: jest.fn(),
  error: jest.fn()
}));
jest.mock("../../components/Layout", () => ({ children, title }) => (
  <div data-testid="mock-layout" title={title}>
    {children}
  </div>
));
jest.mock("../../components/AdminMenu", () => () => (
  <div data-testid="mock-admin-menu">Admin Menu</div>
));

// Mock antd Modal component with open prop instead of visible
jest.mock("antd", () => ({
  Modal: ({ children, open, onCancel }) => (
    open ? (
      <div data-testid="mock-modal">
        <button onClick={onCancel} data-testid="modal-cancel-button">
          Cancel
        </button>
        {children}
      </div>
    ) : null
  )
}));

describe("CreateCategory Component", () => {
  // Mock categories data
  const mockCategories = [
    { _id: "1", name: "Electronics" },
    { _id: "2", name: "Books" },
    { _id: "3", name: "Clothing" }
  ];

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Mock the API responses
    axios.get.mockResolvedValue({
      data: {
        success: true,
        category: mockCategories
      }
    });
  });

  it("renders component and fetches categories successfully", async () => {
    render(<CreateCategory />);

    // Check basic component structure
    expect(screen.getByTestId("mock-layout")).toBeInTheDocument();
    expect(screen.getByTestId("mock-admin-menu")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /manage category/i })).toBeInTheDocument();

    // Verify GET request was made
    expect(axios.get).toHaveBeenCalledWith("/api/v1/category/get-category");
    
    // Wait for categories to display in table
    await waitFor(() => {
      mockCategories.forEach(category => {
        expect(screen.getByText(category.name)).toBeInTheDocument();
      });
      
      // Check for Edit and Delete buttons
      expect(screen.getAllByText("Edit").length).toBe(mockCategories.length);
      expect(screen.getAllByText("Delete").length).toBe(mockCategories.length);
    });
  });

  it("deletes a category when delete button is clicked", async () => {
    // Mock DELETE request success
    axios.delete.mockResolvedValue({
      data: { success: true }
    });

    render(<CreateCategory />);

    // Wait for categories to load
    await waitFor(() => {
      expect(screen.getAllByText("Delete").length).toBe(mockCategories.length);
    });

    // Click delete button for first category
    const deleteButtons = screen.getAllByText("Delete");
    fireEvent.click(deleteButtons[0]);

    // Verify DELETE request and success
    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(
        `/api/v1/category/delete-category/${mockCategories[0]._id}`
      );
      expect(toast.success).toHaveBeenCalledWith("category is deleted");
      expect(axios.get).toHaveBeenCalledTimes(2); // Initial + refresh after delete
    });
  });

  it("displays error toast when API calls fail", async () => {
    // Mock GET request to fail
    axios.get.mockRejectedValueOnce(new Error("Network error"));
    
    render(<CreateCategory />);
    
    // Check if error toast was shown for failed fetch
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Something wwent wrong in getting catgeory");
    });
  });
});
