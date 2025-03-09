import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import AdminOrders from "./AdminOrders";
import { useAuth } from "../../context/auth";
import "@testing-library/jest-dom"

jest.mock("axios");

jest.mock("../../context/auth", () => ({
    useAuth: jest.fn(),
}));

jest.mock("../../components/Layout", () =>
    jest.fn(({ children }) => <div>{children}</div>)
);

jest.mock("../../components/AdminMenu", () =>
    jest.fn(() => <div>Admin Menu</div>)
);

describe("AdminOrders Component", () => {
  const mockOrders = [
    {
      _id: "order1",
      status: "Processing",
      buyer: { name: "John Doe" },
      createAt: "2024-03-07T00:00:00Z",
      payment: { success: true },
      products: [{ _id: "prod1", name: "Test Product", description: "A product", price: 100 }],
    },
  ];

  beforeEach(() => {
    useAuth.mockReturnValue([{ token: "mockToken" }, jest.fn()]); // Fix useAuth return type
    axios.get.mockResolvedValue({ data: mockOrders });
  });
  
//   test("updates order status", async () => {
//     axios.put.mockResolvedValueOnce({ data: { success: true } });
  
//     render(
//       <BrowserRouter>
//         <AdminOrders />
//       </BrowserRouter>
//     );
  
//     await waitFor(() => expect(axios.get).toHaveBeenCalled()); // Wait for data to load
  
//     const select = screen.getByDisplayValue("Processing"); // Get the dropdown
//     fireEvent.change(select, { target: { value: "Shipped" } });
  
//     await waitFor(() => expect(axios.put).toHaveBeenCalled());
//   });

  test("displays product details", async () => {
    render(
      <BrowserRouter>
        <AdminOrders />
      </BrowserRouter>
    );

    await waitFor(() => expect(screen.getByText(/Test Product/i)).toBeInTheDocument());
    expect(screen.getByText(/Price : 100/i)).toBeInTheDocument();
  });
});
