import CartPage from "./CartPage";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import '@testing-library/jest-dom/extend-expect';
import { useAuth } from "../context/auth";
import { useCart } from "../context/cart";
import { GAMING_MOUSE, STANDING_DESK } from "../mocks/search";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "@testing-library/jest-dom";
import toast from "react-hot-toast";

// Mock braintree
jest.mock("braintree-web-drop-in-react", () => {
  const React = require("react"); 
  return function DropIn(props) {
    React.useEffect(() => {
      props.onInstance({
        requestPaymentMethod: async () => ({ nonce: "mock-nonce" }),
      });
    }, []);
    return <div data-testid="mock-drop-in" />;
  };
});

// Mock localstorage
Object.defineProperty(window, "localStorage", {
  value: {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
  },
  writable: true,
});

// Mock toast
jest.mock("react-hot-toast");

// Mock axios
jest.mock("axios");

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn()
}));

jest.mock('../context/auth', () => ({
  useAuth: jest.fn(() => [null, jest.fn()]) // Mock useAuth hook to return null state and a mock function for setAuth
}));

jest.mock('../context/cart', () => ({
  useCart: jest.fn(() => [[], jest.fn()]) // Mock useCart hook to return null state and a mock function
}));

jest.mock('../context/search', () => ({
  useSearch: jest.fn(() => [{ keyword: '', results: [] }, jest.fn()]) // Mock useSearch hook to return null state and a mock function
}));

jest.mock('../hooks/useCategory', () => ({
  __esModule: true, // Ensure ES module compatibility
  default: jest.fn(() => [])
}));

describe("Cart Page", () => {

  // Clear all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });


  it("should render correctly for guest view", () => {
    // Mock useAuth, useCart, useNavigate hooks
    const mockNavigate = jest.fn();
    useAuth.mockReturnValue([{}, jest.fn()]);
    useCart.mockReturnValue([[STANDING_DESK, GAMING_MOUSE], jest.fn()]);
    useNavigate.mockReturnValue(mockNavigate);
    
    // Render Cart Page
    const { getByText } = render( <MemoryRouter initialEntries={['/cart']}>
      <Routes>
        <Route path="/cart" element={<CartPage />} />
      </Routes>
    </MemoryRouter>);

    // Expect page to have the following
    expect(getByText("Hello Guest")).toBeInTheDocument();
    expect(getByText("You have 2 item(s) in your cart. Please Login To Checkout!")).toBeInTheDocument();
    
    // Get address button and expect it to be in the document
    const button = getByText("Please Login To Checkout!");
    expect(button).toBeInTheDocument();
    
    // Click on button
    fireEvent.click(button);
    
    // Expect it to navigate to login page.
    expect(mockNavigate).toBeCalledWith("/login", {"state": "/cart"});
  });

  it("should render correctly for user view", async () => {
    // Mock useAuth, useCart, useNavigate hooks
    const mockNavigate = jest.fn();
    useAuth.mockReturnValue([{ user: { name: "test", address: "school of computing" }, token: "1234"}, jest.fn()]);
    useCart.mockReturnValue([[STANDING_DESK, GAMING_MOUSE], jest.fn()]);
    useNavigate.mockReturnValue(mockNavigate);

    // Render Cart Page
    const { getByText } = render( <MemoryRouter initialEntries={['/cart']}>
      <Routes>
        <Route path="/cart" element={<CartPage />} />
      </Routes>
    </MemoryRouter>);

    // Expect page to have the following
    expect(getByText("Hello test")).toBeInTheDocument();
    expect(getByText("You have 2 item(s) in your cart.")).toBeInTheDocument();
    
    // Get address button and expect it to be in the document
    const button = getByText("Update Address");
    expect(button).toBeInTheDocument();
    
    // Click on button
    fireEvent.click(button);
    
    // Expect it to navigate to profile page.
    expect(mockNavigate).toBeCalledWith("/dashboard/user/profile");
  });

  it("should not render the update address button if user address is missing", () => {
    // Mock useAuth, useCart hooks
    useAuth.mockReturnValue([{ user: { name: "test" }, token: "1234"}, jest.fn()]);
    useCart.mockReturnValue([[STANDING_DESK, GAMING_MOUSE], jest.fn()]);

    // Render Cart Page
    const { queryByText } = render( <MemoryRouter initialEntries={['/cart']}>
      <Routes>
        <Route path="/cart" element={<CartPage />} />
      </Routes>
    </MemoryRouter>);

    // Expect following
    expect(queryByText("Update Address")).not.toBeInTheDocument();
  });

  it("should correctly display the cart items", () => {
    // Mock useCart hook
    useCart.mockReturnValue([[STANDING_DESK, GAMING_MOUSE], jest.fn()]);

    // Render Cart Page
    const { getByText, getAllByText } = render( <MemoryRouter initialEntries={['/cart']}>
      <Routes>
        <Route path="/cart" element={<CartPage />} />
      </Routes>
    </MemoryRouter>);

    // Expect page to have the following
    expect(getByText(STANDING_DESK.name)).toBeInTheDocument();
    expect(getByText(STANDING_DESK.description.substring(0, 30) + "...")).toBeInTheDocument();
    expect(getByText(`Price : ${STANDING_DESK.price}`)).toBeInTheDocument();

    expect(getByText(GAMING_MOUSE.name)).toBeInTheDocument();
    expect(getByText(GAMING_MOUSE.description.substring(0, 30) + "...")).toBeInTheDocument();
    expect(getByText(`Price : ${GAMING_MOUSE.price}`)).toBeInTheDocument();

    expect(getAllByText("Remove")).toHaveLength(2);
  });

  it("should display cart is empty if cart has no items", () => {
    // Mock useCart hook
    useCart.mockReturnValue([[], jest.fn()]);

    // Render Cart Page
    const { getByText } = render( <MemoryRouter initialEntries={['/cart']}>
      <Routes>
        <Route path="/cart" element={<CartPage />} />
      </Routes>
    </MemoryRouter>);

    // Expect following
    expect(getByText("Your Cart Is Empty!")).toBeInTheDocument();
  })

  it("should correctly remove the cart items", async () => {
    // Mock useAuth, useCart hook
    useAuth.mockReturnValue([{ user: { name: "test", address: "school of computing" }, token: "1234"}, jest.fn()]);
    const setCart = jest.fn();
    useCart.mockReturnValue([[STANDING_DESK, GAMING_MOUSE], setCart]);

    // Render Cart Page
    const { getAllByText } = render( <MemoryRouter initialEntries={['/cart']}>
      <Routes>
        <Route path="/cart" element={<CartPage />} />
      </Routes>
    </MemoryRouter>);

    // Get remove buttons
    const standingDeskRemoveButton = getAllByText("Remove")[0];
    const gamingMouseRemoveButton = getAllByText("Remove")[1];
    
    // Click on standing desk remove button.
    fireEvent.click(standingDeskRemoveButton);
    
    // Expect standing desk to be removed.
    await waitFor(() => expect(setCart).toBeCalledWith([GAMING_MOUSE]));
    
    // Click on gaming mouse remove button.
    fireEvent.click(gamingMouseRemoveButton);
    
    // Expect gaming mouse to be removed.
    await waitFor(() => expect(setCart).toBeCalledWith([STANDING_DESK]));
  });

  it("should correctly handle errors in removal of cart items", async () => {
    // Mock useAuth, useCart hook
    useAuth.mockReturnValue([{ user: { name: "test", address: "school of computing" }, token: "1234"}, jest.fn()]);
    const setCart = jest.fn();
    setCart.mockImplementation(() => { throw new Error("Invalid item!"); });
    console.log = jest.fn();
    useCart.mockReturnValue([[STANDING_DESK], setCart]);

    // Render Cart Page
    const { getByText } = render( <MemoryRouter initialEntries={['/cart']}>
      <Routes>
        <Route path="/cart" element={<CartPage />} />
      </Routes>
    </MemoryRouter>);

    // Get remove buttons
    const standingDeskRemoveButton = getByText("Remove");
    
    // Click on standing desk remove button.
    fireEvent.click(standingDeskRemoveButton);
    
    // Expect standing desk to be removed.
    await waitFor(() => expect(setCart).toBeCalledWith([]));
    await waitFor(() => expect(console.log).toBeCalledWith(expect.any(Error)));
  });

  it("should not add ... if text length is less than 30 characters", () => {
    // Mock useCart hook
    useCart.mockReturnValue([[STANDING_DESK, { ...GAMING_MOUSE, description: "short" }], jest.fn()]);

    // Render Cart Page
    const { getByText } = render( <MemoryRouter initialEntries={['/cart']}>
      <Routes>
        <Route path="/cart" element={<CartPage />} />
      </Routes>
    </MemoryRouter>);

    // Expect following
    expect(getByText("short")).toBeInTheDocument();
  })

  it("should correctly calculate the total price", async () => {
    // Mock useAuth, useCart hook
    useAuth.mockReturnValue([{ user: { name: "test", address: "school of computing" }, token: "1234"}, jest.fn()]);
    useCart.mockReturnValue([[STANDING_DESK, GAMING_MOUSE], jest.fn()]);

    // Render Cart Page
    const { getByText } = render( <MemoryRouter initialEntries={['/cart']}>
      <Routes>
        <Route path="/cart" element={<CartPage />} />
      </Routes>
    </MemoryRouter>);
    
    // Expect correct total price
    expect(getByText(`Total : $${GAMING_MOUSE.price + STANDING_DESK.price}`));
  });

  it("should correctly handle errors while calculating the total price", async () => {
    // Spy on localeString
    jest.spyOn(Number.prototype, "toLocaleString").mockImplementation(() => {
      throw new Error("Invalid price!");
    });
    // Mock useAuth, useCart hook    
    useAuth.mockReturnValue([{ user: { name: "test", address: "school of computing" }, token: "1234"}, jest.fn()]);
    useCart.mockReturnValue([[GAMING_MOUSE], jest.fn()]);
    console.log = jest.fn();

    // Render Cart Page
    render( <MemoryRouter initialEntries={['/cart']}>
      <Routes>
        <Route path="/cart" element={<CartPage />} />
      </Routes>
    </MemoryRouter>);
    
    // Expect error due to missing price field in cart
    expect(console.log).toBeCalledWith(expect.any(Error));
  });

  it("should correctly display payment button if cart is not empty", async () => {
    // Mock useAuth, useCart hook, axios    
    useAuth.mockReturnValue([{ user: { name: "test", address: "school of computing" }, token: "1234"}, jest.fn()]);
    useCart.mockReturnValue([[GAMING_MOUSE, STANDING_DESK], jest.fn()]);
    axios.get.mockReturnValue({ data: { clientToken: "test"}});

    // Render Cart Page
    const { getByText, getByTestId } = render( <MemoryRouter initialEntries={['/cart']}>
      <Routes>
        <Route path="/cart" element={<CartPage />} />
      </Routes>
    </MemoryRouter>);
    
    // Expect button to be present
    await waitFor(() => expect(getByText("Make Payment")).toBeInTheDocument());
    await waitFor(() => {
      expect(getByTestId("mock-drop-in")).toBeInTheDocument();
    });
  });

  it("should correctly handle errors while getting client token", async () => {
    // Mock useAuth, useCart hook, axios, console.log    
    useAuth.mockReturnValue([{ user: { name: "test", address: "school of computing" }, token: "1234"}, jest.fn()]);
    useCart.mockReturnValue([[GAMING_MOUSE, STANDING_DESK], jest.fn()]);
    axios.get.mockRejectedValueOnce(new Error("mock error!"));
    console.log = jest.fn();

    // Render Cart Page
    render( <MemoryRouter initialEntries={['/cart']}>
      <Routes>
        <Route path="/cart" element={<CartPage />} />
      </Routes>
    </MemoryRouter>);
    
    // Expect error due to failure in api call
    await waitFor(() => expect(console.log).toBeCalledWith(expect.any(Error)));
  });

  it("should handle payment correctly", async () => {
    // Mock useNavigate, useAuth, useCart hook, axios    
    const mockNavigate = jest.fn();
    useAuth.mockReturnValue([{ user: { name: "test", address: "school of computing" }, token: "1234"}, jest.fn()]);
    const setCart = jest.fn();
    useCart.mockReturnValue([[GAMING_MOUSE, STANDING_DESK], setCart]);
    axios.get.mockReturnValue({ data: { clientToken: "test"}});
    axios.post.mockReturnValue({ data: { success: true } });
    useNavigate.mockReturnValue(mockNavigate);

    // Render Cart Page
    const { getByText, getByTestId } = render( <MemoryRouter initialEntries={['/cart']}>
      <Routes>
        <Route path="/cart" element={<CartPage />} />
      </Routes>
    </MemoryRouter>);

    // Wait for drop in to render
    await waitFor(() => {
      expect(getByTestId("mock-drop-in")).toBeInTheDocument();
    });

    // Wait for button to render and become enabled
    await waitFor(() => {
      expect(getByText("Make Payment")).not.toBeDisabled();
    });
    
    // Expect button to be present
    const button = getByText("Make Payment");
    
    // Make payment
    fireEvent.click(button);
    
    // Expect api post call
    await waitFor(() => expect(axios.post).toBeCalledWith("/api/v1/product/braintree/payment", {
        nonce: "mock-nonce",
        cart: [GAMING_MOUSE, STANDING_DESK],
    }));
    
    // Expect following
    expect(mockNavigate).toBeCalledWith("/dashboard/user/orders");
    expect(toast.success).toBeCalledWith("Payment Completed Successfully");
    expect(setCart).toBeCalledWith([]);
  });

  it("should handle payment failures", async () => {
    // Mock useNavigate, useAuth, useCart hook, axios, logger    
    const mockNavigate = jest.fn();
    useAuth.mockReturnValue([{ user: { name: "test", address: "school of computing" }, token: "1234"}, jest.fn()]);
    const setCart = jest.fn();
    useCart.mockReturnValue([[GAMING_MOUSE, STANDING_DESK], setCart]);
    axios.get.mockReturnValue({ data: { clientToken: "test"}});
    axios.post.mockRejectedValueOnce(new Error("mock error!"));
    useNavigate.mockReturnValue(mockNavigate);
    console.log = jest.fn();

    // Render Cart Page
    const { getByText, getByTestId } = render( <MemoryRouter initialEntries={['/cart']}>
      <Routes>
        <Route path="/cart" element={<CartPage />} />
      </Routes>
    </MemoryRouter>);

    // Wait for drop in to render
    await waitFor(() => {
      expect(getByTestId("mock-drop-in")).toBeInTheDocument();
    });

    // Wait for button to render and become enabled
    await waitFor(() => {
      expect(getByText("Make Payment")).not.toBeDisabled();
    });
    
    // Expect button to be present
    const button = getByText("Make Payment");
    
    // Make payment
    fireEvent.click(button);
    
    // Expect api post call
    await waitFor(() => expect(axios.post).toBeCalledWith("/api/v1/product/braintree/payment", {
        nonce: "mock-nonce",
        cart: [GAMING_MOUSE, STANDING_DESK],
    }));

    // Expect logger to be called
    expect(console.log).toBeCalledWith(expect.any(Error));
    
    // Expect following
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
    expect(setCart).not.toHaveBeenCalled();
  });
})