import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import CategoryForm from './CategoryForm';

describe("Category Form Component", () => {

  // Mock the props
  const mockCategory = "electronics";
  const mockSubmit = jest.fn();
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