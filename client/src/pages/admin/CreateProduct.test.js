import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import CreateProduct from "./CreateProduct";
import axios from "axios";
import "@testing-library/jest-dom"
import toast from 'react-hot-toast';

// Mocking axios
jest.mock("axios");
jest.mock('react-hot-toast');

jest.mock("../../components/Layout", () =>
    jest.fn(({ children }) => <div>{children}</div>)
);

jest.mock("../../components/AdminMenu", () =>
    jest.fn(() => <div>Admin Menu</div>)
);

describe("CreateProduct", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders CreateProduct component", () => {
    render(
      <Router>
        <CreateProduct />
      </Router>
    );

    // Check if the form elements are rendered
    expect(screen.getByPlaceholderText("write a name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("write a description")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("write a Price")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("write a quantity")).toBeInTheDocument();
  });


  test("handles form submission", async () => {
    // Mock the axios.post function
    axios.post.mockResolvedValueOnce({
      data: {
        success: true,
        message: "Product Created Successfully",
      },
    });

    render(
      <Router>
        <CreateProduct />
      </Router>
    );

    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText("write a name"), { target: { value: "Test Product" } });
    fireEvent.change(screen.getByPlaceholderText("write a description"), { target: { value: "Test Description" } });
    fireEvent.change(screen.getByPlaceholderText("write a Price"), { target: { value: "100" } });
    fireEvent.change(screen.getByPlaceholderText("write a quantity"), { target: { value: "10" } });
    fireEvent.click(screen.getByText("CREATE PRODUCT"));

    // Wait for form submission to complete
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    expect(toast.success).toHaveBeenCalledWith('Product Created Successfully');
  });

  test("displays error on failed category fetch", async () => {
    // Mock the axios error response
    axios.get.mockRejectedValueOnce(new Error("Network Error"));

    render(
      <Router>
        <CreateProduct />
      </Router>
    );

    // Check if the error toast is shown (you can simulate an error UI or behavior)
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Something wwent wrong in getting catgeory'));
  });
});
