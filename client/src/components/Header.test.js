import '@testing-library/jest-dom/extend-expect';
import { render, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from './Header';
import { useCart } from '../context/cart';
import useCategory from '../hooks/useCategory';
import { BOOKS, CLOTHING, ELECTRONICS } from '../mocks/categories';
import { useAuth } from '../context/auth';
import toast from 'react-hot-toast';

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

// Mock toast
jest.mock('react-hot-toast');

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
  },
  writable: true,
});

describe("Header Component", () => {
  
  it("should show user dropdown when user is logged in", () => {
    // Mock useAuth hook
    useAuth.mockReturnValue([{user: { name: "test", role: 0 }}, jest.fn()]);

    // Render component
    const { getByText } = render(<MemoryRouter><Header /></MemoryRouter>);
    
    // Expect following
    expect(getByText("test")).toBeInTheDocument();
    expect(getByText("Dashboard")).toBeInTheDocument();
    expect(getByText("Logout")).toBeInTheDocument();
  });

  it("should correctly navigate to the respective user pages in the logged in user dropdown menu", () => {
    // Mock useAuth hook
    useAuth.mockReturnValue([{user: { name: "test", role: 0 }}, jest.fn()]);

    // Render component
    const { getByText } = render(<MemoryRouter><Header /></MemoryRouter>);
    
    // Expect following
    expect(getByText("test")).toHaveAttribute("href", "/");
    expect(getByText("Dashboard")).toHaveAttribute("href", "/dashboard/user");
    expect(getByText("Logout")).toHaveAttribute("href", "/login");
  });

  it("should correctly navigate to the admin page (if the user is an admin) in the logged in user dropdown menu", () => {
    // Mock useAuth hook
    useAuth.mockReturnValue([{user: { name: "test", role: 1 }}, jest.fn()]);

    // Render component
    const { getByText } = render(<MemoryRouter><Header /></MemoryRouter>);
    
    // Expect following
    expect(getByText("Dashboard")).toHaveAttribute("href", "/dashboard/admin");
  });

  it("should correctly handle logout request", () => {
    // Mock useAuth hook
    const setAuth = jest.fn();
    useAuth.mockReturnValue([{user: { name: "test", role: 1 }}, setAuth]);

    // Render component
    const { getByText } = render(<MemoryRouter><Header /></MemoryRouter>);
    
    // Get logout button
    const logoutButton = getByText("Logout");

    // Click logout
    fireEvent.click(logoutButton);

    // Expect auth to be updated
    expect(setAuth).toHaveBeenCalledTimes(1);
    expect(setAuth).toHaveBeenCalledWith({user: null, token: ""});
    
    // Expect successful toast
    expect(toast.success).toHaveBeenCalledWith("Logout Successfully");
  });

  it("should show login/register dropdown when user is logged out", () => {
    // Mock useAuth hook
    useAuth.mockReturnValue([undefined, jest.fn()]);

    // Render component
    const { getByText } = render(<MemoryRouter><Header /></MemoryRouter>);
    
    // Expect following
    expect(getByText("Login")).toBeInTheDocument();
    expect(getByText("Register")).toBeInTheDocument();
  });

  it("should correctly navigate to the respective pages in the logged out user dropdown menu", () => {
    // Mock useAuth hook
    useAuth.mockReturnValue([undefined, jest.fn()]);

    // Render component
    const { getByText } = render(<MemoryRouter><Header /></MemoryRouter>);
    
    // Expect following
    expect(getByText("Login")).toHaveAttribute("href", "/login");
    expect(getByText("Register")).toHaveAttribute("href", "/register");
  });

  it("should toggle user dropdown menu on clicking on user button", () => {
    // Mock useAuth hook
    useAuth.mockReturnValue([{user: { name: "test", role: 1 }}, jest.fn()]);
    
    // Render component
    const { getByTestId } = render(<MemoryRouter><Header /></MemoryRouter>);
    
    // Get element
    const dropdownMenu = getByTestId("user-dropdown");
  
    // Mock boostrap behaviour
    dropdownMenu.addEventListener("click", () => {
      dropdownMenu.classList.toggle("show");
    });
  
    // Expect dropdown to be hidden at start
    expect(dropdownMenu).not.toHaveClass("show");
  
    // Open dropdown
    fireEvent.click(dropdownMenu);

    // Expect dropdown to be visible
    expect(dropdownMenu).toHaveClass("show");
  
    // Close dropdown
    fireEvent.click(dropdownMenu);

    // Expect dropdown to be hidden
    expect(dropdownMenu).not.toHaveClass("show");
  });

  it("should toggle category dropdown menu on clicking on categories button", () => {
    // Mock useCategory Hook
    useCategory.mockReturnValue([ELECTRONICS, BOOKS, CLOTHING]);
    
    // Render component
    const { getByTestId } = render(<MemoryRouter><Header /></MemoryRouter>);
    
    // Get elements
    const categoryButton = getByTestId("category-button");
    const dropdownMenu = getByTestId("category-dropdown");
  
    // Mock boostrap behaviour
    categoryButton.addEventListener("click", () => {
      dropdownMenu.classList.toggle("show");
    });
  
    // Expect dropdown to be hidden at start
    expect(dropdownMenu).not.toHaveClass("show");
  
    // Open dropdown
    fireEvent.click(categoryButton);

    // Expect dropdown to be visible
    expect(dropdownMenu).toHaveClass("show");
  
    // Close dropdown
    fireEvent.click(categoryButton);

    // Expect dropdown to be hidden
    expect(dropdownMenu).not.toHaveClass("show");
  });

  it("should contain all the categories in the category dropdown menu", () => {
    // Mock useCategory Hook
    useCategory.mockReturnValue([ELECTRONICS, BOOKS, CLOTHING]);
    
    // Render component
    const { getByText } = render(<MemoryRouter><Header /></MemoryRouter>);
    
    // Get elements
    const allCategories = getByText("All Categories");
    const electronics = getByText(ELECTRONICS.name);
    const books = getByText(BOOKS.name);
    const clothing = getByText(CLOTHING.name);

    // Expect following
    expect(allCategories).toBeInTheDocument();
    expect(electronics).toBeInTheDocument();
    expect(books).toBeInTheDocument();
    expect(clothing).toBeInTheDocument();
  });

  it("should correctly navigate to the respective categories in the category dropdown menu", () => {
    // Mock useCategory Hook
    useCategory.mockReturnValue([ELECTRONICS, BOOKS, CLOTHING]);
    
    // Render component
    const { getByText } = render(<MemoryRouter><Header /></MemoryRouter>);

    // Expect following
    expect(getByText("All Categories")).toHaveAttribute('href', '/categories');
    expect(getByText(ELECTRONICS.name)).toHaveAttribute('href', `/category/${ELECTRONICS.slug}`);
    expect(getByText(BOOKS.name)).toHaveAttribute('href', `/category/${BOOKS.slug}`);
    expect(getByText(CLOTHING.name)).toHaveAttribute('href', `/category/${CLOTHING.slug}`);
  });


  it("should navigate to home page on clicking on logo or home button", () => {
    // Render component
    const { getByText } = render(<MemoryRouter><Header /></MemoryRouter>);

    // Get logo and home link
    const logo = getByText("🛒 Virtual Vault");
    const link = getByText("Home");

    // Expect following
    expect(logo).toHaveAttribute('href', '/');
    expect(link).toHaveAttribute('href', '/');
  });

  it("should navigate to cart page on clicking on the cart button", () => {
    // Render component
    const { getByText } = render(<MemoryRouter><Header /></MemoryRouter>);

    // Expect following
    expect(getByText("Cart")).toHaveAttribute('href', '/cart');
  });

  it("should handle the case when cart is undefined", () => {
    useCart.mockReturnValue([undefined, jest.fn()]);

    // Render component
    const { getByText } = render(<MemoryRouter><Header /></MemoryRouter>);

    // Expect following
    expect(getByText("0")).toBeInTheDocument();
  });

  it("should show correct cart length", () => {
    useCart.mockReturnValue([["item1", "item2", "item3"], jest.fn()]);

    // Render component
    const { getByText } = render(<MemoryRouter><Header /></MemoryRouter>);

    // Expect following
    expect(getByText("3")).toBeInTheDocument();
  });

});