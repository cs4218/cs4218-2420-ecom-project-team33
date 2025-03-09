import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import UpdateProduct from "./UpdateProduct";
import axios from "axios";
import "@testing-library/jest-dom";
import toast from "react-hot-toast";

// Mocking axios and toast
jest.mock("axios");
jest.mock("react-hot-toast");

// Mocking Layout and AdminMenu components
jest.mock("../../components/Layout", () =>
  jest.fn(({ children }) => <div>{children}</div>)
);

jest.mock("../../components/AdminMenu", () =>
  jest.fn(() => <div>Admin Menu</div>)
);

describe("UpdateProduct", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders UpdateProduct component", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        product: {
          _id: "123",
          name: "Sample Product",
          description: "Sample Description",
          price: 50,
          quantity: 10,
          shipping: "1",
          category: { _id: "cat1" },
        },
      },
    });

    render(
      <Router>
        <UpdateProduct />
      </Router>
    );

    await waitFor(() =>
      expect(screen.getByPlaceholderText("write a name")).toHaveValue(
        "Sample Product"
      )
    );

    expect(
      screen.getByPlaceholderText("write a description")
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("write a Price")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("write a quantity")).toBeInTheDocument();
  });

  test("handles form input changes", async () => {
    axios.get.mockResolvedValueOnce({
      data: { product: { name: "", description: "", price: "", quantity: "" } },
    });

    render(
      <Router>
        <UpdateProduct />
      </Router>
    );

    fireEvent.change(screen.getByPlaceholderText("write a name"), {
      target: { value: "Updated Name" },
    });
    fireEvent.change(screen.getByPlaceholderText("write a description"), {
      target: { value: "Updated Description" },
    });
    fireEvent.change(screen.getByPlaceholderText("write a Price"), {
      target: { value: 99 },
    });
    fireEvent.change(screen.getByPlaceholderText("write a quantity"), {
      target: { value: 5 },
    });

    expect(screen.getByPlaceholderText("write a name")).toHaveValue(
      "Updated Name"
    );
    expect(screen.getByPlaceholderText("write a description")).toHaveValue(
      "Updated Description"
    );
    expect(screen.getByPlaceholderText("write a Price")).toHaveValue(99);
    expect(screen.getByPlaceholderText("write a quantity")).toHaveValue(5);
  });

  test("handles form submission", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        product: { _id: "123", name: "Sample", description: "", price: "", quantity: "" },
      },
    });

    axios.put.mockResolvedValueOnce({
      data: { success: true, message: "Product Updated Successfully" },
    });

    render(
      <Router>
        <UpdateProduct />
      </Router>
    );

    fireEvent.change(screen.getByPlaceholderText("write a name"), {
      target: { value: "Updated Product" },
    });

    fireEvent.click(screen.getByText("UPDATE PRODUCT"));

    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));
    expect(toast.success).toHaveBeenCalledWith("Product Updated Successfully");
  });

  test("displays error on failed category fetch", async () => {
    axios.get.mockRejectedValueOnce(new Error("Network Error"));

    render(
      <Router>
        <UpdateProduct />
      </Router>
    );

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "Something wwent wrong in getting catgeory"
      )
    );
  });
});
