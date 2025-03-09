<<<<<<< HEAD
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import CategoryForm from "./CategoryForm";

describe("CategoryForm Component", () => {
  // Mock functions for props
  const mockHandleSubmit = jest.fn((e) => {
    e.preventDefault(); // Prevent default form submission
  });
  const mockSetValue = jest.fn();

  // Reusable render function
  const renderComponent = (props = {}) => {
    const defaultProps = {
      handleSubmit: mockHandleSubmit,
      value: "",
      setValue: mockSetValue,
      ...props
    };

    return render(<CategoryForm {...defaultProps} />);
  };

  // Test that the component renders correctly
  it("renders the category form", () => {
    renderComponent();

    // Check input field
    const input = screen.getByPlaceholderText("Enter new category");
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass("form-control");

    // Check submit button
    const submitButton = screen.getByRole("button", { name: /submit/i });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toHaveClass("btn", "btn-primary");
  });

  // Test input functionality
  it("allows entering category name", () => {
    renderComponent();

    const input = screen.getByPlaceholderText("Enter new category");
    
    // Simulate user typing
    fireEvent.change(input, { target: { value: "New Category" } });

    // Verify the setValue was called with the input
    expect(mockSetValue).toHaveBeenCalledWith("New Category");
  });

  // Test with pre-filled value
  it("displays pre-filled value", () => {
    renderComponent({ value: "Existing Category" });

    const input = screen.getByPlaceholderText("Enter new category");
    expect(input).toHaveValue("Existing Category");
  });

  // Snapshot test
  it("matches snapshot", () => {
    const { asFragment } = renderComponent();
    expect(asFragment()).toMatchSnapshot();
  });

  // Test accessibility
  it("has accessible form elements", () => {
    renderComponent();

    const input = screen.getByPlaceholderText("Enter new category");
    const submitButton = screen.getByRole("button", { name: /submit/i });

    expect(input).toHaveAttribute("type", "text");
    expect(submitButton).toHaveAttribute("type", "submit");
  });


  // Test form submission
  it("submits data when the user clicks submit", () => {
    renderComponent();


    const submitButton = screen.getByRole("button", { name: /submit/i });
    fireEvent.click(submitButton);

    // Verify handleSubmit was called
    expect(mockHandleSubmit).toHaveBeenCalled();
  });

  // Test edge cases
  it("handles empty input submission", () => {
    renderComponent({ value: "" });

    const submitButton = screen.getByRole("button", { name: /submit/i });
    fireEvent.submit(submitButton);

    // Verify handleSubmit was still called even with empty input
    expect(mockHandleSubmit).toHaveBeenCalled();
  });
});
=======
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import CategoryForm from './CategoryForm';

describe("Category Form Component", () => {

  // Mock the props
  const mockCategory = "electronics";
  const mockSubmit = jest.fn().mockImplementation((e) => e.preventDefault());;
  const mockSetter = jest.fn();
  const mockNewCategory = "sports";

  // Clear all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should be renderred correctly", () => {
    // Render component
    const { getByTestId } = render(<CategoryForm value={mockCategory} handleSubmit={mockSubmit} setValue={mockSetter} />);

    // Get form elements
    const inputField = getByTestId("category-form-input");
    const submitButton = getByTestId("category-form-button");

    // Should render the following correctly
    expect(inputField).toBeInTheDocument;
    expect(inputField.value).toBe(mockCategory);
    expect(inputField.getAttribute("placeholder")).toBe("Enter new category");
    expect(inputField.getAttribute("type")).toBe("text");
    expect(submitButton).toBeInTheDocument;
    expect(submitButton.getAttribute("type")).toBe("submit");
  });

  it("should correctly update entered value", () => {
    // Render component
    const { getByTestId } = render(<CategoryForm value={mockCategory} handleSubmit={mockSubmit} setValue={mockSetter} />);

    // Get form element
    const inputField = getByTestId("category-form-input");
    
    // Update input element
    fireEvent.change(inputField, { target: { value: mockNewCategory } });

    // Expect update
    expect(mockSetter).toHaveBeenCalledWith(mockNewCategory);
  });

  it("should correctly handle submit action", () => {
    // Render component
    const { getByTestId } = render(<CategoryForm value={mockCategory} handleSubmit={mockSubmit} setValue={mockSetter} />);

    // Get form element
    const submitButton = getByTestId("category-form-button");
    
    // Simulate clicking submit button
    fireEvent.click(submitButton);
    
    // Expect handling of submit
    expect(mockSubmit).toHaveBeenCalled();
  });

});
>>>>>>> 5d533e8109c8abde0c8234ff427ed51494de2617
