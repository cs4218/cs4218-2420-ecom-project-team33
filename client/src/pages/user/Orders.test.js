import Orders from "./Orders";
import { render, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import '@testing-library/jest-dom/extend-expect';
import { useAuth } from "../../context/auth";
import axios from "axios";
import { GAMING_MOUSE, STANDING_DESK, OFFICE_CHAIR } from "../../mocks/search";

// Mock axios
jest.mock("axios");

jest.mock('../../context/auth', () => ({
  useAuth: jest.fn(() => [null, jest.fn()]) // Mock useAuth hook to return null state and a mock function for setAuth
}));

jest.mock('../../context/cart', () => ({
  useCart: jest.fn(() => [[], jest.fn()]) // Mock useCart hook to return null state and a mock function
}));

jest.mock('../../context/search', () => ({
  useSearch: jest.fn(() => [{ keyword: '', results: [] }, jest.fn()]) // Mock useSearch hook to return null state and a mock function
}));

jest.mock('../../hooks/useCategory', () => ({
  __esModule: true, // Ensure ES module compatibility
  default: jest.fn(() => [])
}));

describe("Orders Page", () => {

  // Clear all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render correctly if user order has been successful", async () => {
    // Mock useAuth hook, axios call
    useAuth.mockReturnValue([{token: "1234"}, jest.fn()]);
    axios.get.mockResolvedValueOnce({ data: [ {"_id": 1, products: [GAMING_MOUSE, OFFICE_CHAIR], payment: { success: true }, status: "Processed", buyer: { "_id": "1", name: "test"}, createdAt: "2025-02-04T13:42:16.741Z"}]});

    // Render Orders Page
    const { getByText } = render( <MemoryRouter initialEntries={['/dashboard/user/orders']}>
      <Routes>
        <Route path='/dashboard/user/orders' element={<Orders />} />
      </Routes>
      </MemoryRouter>);

    // Expect page to have the following
    await waitFor(() => expect(axios.get).toHaveBeenCalled());

    await waitFor(() => expect(getByText(GAMING_MOUSE.name)).toBeInTheDocument());
    await waitFor(() => expect(getByText(GAMING_MOUSE.description.substring(0, 30))).toBeInTheDocument());
    await waitFor(() => expect(getByText(`Price : ${GAMING_MOUSE.price}`)).toBeInTheDocument());

    await waitFor(() => expect(getByText(OFFICE_CHAIR.name)).toBeInTheDocument());
    await waitFor(() => expect(getByText(OFFICE_CHAIR.description.substring(0, 30))).toBeInTheDocument());
    await waitFor(() => expect(getByText(`Price : ${OFFICE_CHAIR.price}`)).toBeInTheDocument());

    await waitFor(() => expect(getByText("20 days ago")).toBeInTheDocument());
    await waitFor(() => expect(getByText("Success")).toBeInTheDocument());
    await waitFor(() => expect(getByText("2")).toBeInTheDocument());
    await waitFor(() => expect(getByText("Processed")).toBeInTheDocument());
    await waitFor(() => expect(getByText("test")).toBeInTheDocument());
  });

  it("should render correctly if user order has failed", async () => {
    // Mock useAuth hook, axios call
    useAuth.mockReturnValue([{token: "1234"}, jest.fn()]);
    axios.get.mockResolvedValueOnce({ data: [ {"_id": 2, products: [STANDING_DESK], payment: {}, buyer: { "_id": "1", name: "test"}, status: "Not Processed", createdAt: "2025-02-04T13:42:16.741Z"}]});

    // Render Orders Page
    const { getByText, getAllByText } = render( <MemoryRouter initialEntries={['/dashboard/user/orders']}>
      <Routes>
        <Route path='/dashboard/user/orders' element={<Orders />} />
      </Routes>
      </MemoryRouter>);
    
    // Expect page to have the following
    await waitFor(() => expect(axios.get).toHaveBeenCalled());

    await waitFor(() => expect(getByText(STANDING_DESK.name)).toBeInTheDocument());
    await waitFor(() => expect(getByText(STANDING_DESK.description.substring(0, 30))).toBeInTheDocument());
    await waitFor(() => expect(getByText(`Price : ${STANDING_DESK.price}`)).toBeInTheDocument());

    await waitFor(() => expect(getByText("20 days ago")).toBeInTheDocument());
    await waitFor(() => expect(getByText("Failed")).toBeInTheDocument());
    await waitFor(() => expect(getAllByText("1")).toHaveLength(2));
    await waitFor(() => expect(getByText("Not Processed")).toBeInTheDocument());
    await waitFor(() => expect(getByText("test")).toBeInTheDocument());
  });

  it("should handle failed api call", async () => {
    // Mock useAuth hook, console.log, axios call
    console.log = jest.fn();
    useAuth.mockReturnValue([{token: "1234"}, jest.fn()]);
    axios.get.mockRejectedValueOnce(new Error("Invalid API Call"));

    // Render Orders Page
    render( <MemoryRouter initialEntries={['/dashboard/user/orders']}>
      <Routes>
        <Route path='/dashboard/user/orders' element={<Orders />} />
      </Routes>
      </MemoryRouter>);
    
    // Expect page to handle api call failure, and log it
    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    expect(console.log).toHaveBeenCalledWith(expect.any(Error));
  });

  it("should handle invalid auth token", async () => {
    // Mock useAuth hook
    useAuth.mockReturnValue([{}, jest.fn()]);

    // Render Orders Page
    render( <MemoryRouter initialEntries={['/dashboard/user/orders']}>
      <Routes>
        <Route path='/dashboard/user/orders' element={<Orders />} />
      </Routes>
      </MemoryRouter>);
    
    // Expect api call to not be made.
    await waitFor(() => expect(axios.get).not.toHaveBeenCalled());
  });

})