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
