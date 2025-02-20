import PageNotFound from "./PageNotFound";
import { render } from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import { MemoryRouter } from "react-router-dom";

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

describe("Page Not Found", () => {

  it("should render correctly", () => {
    // Render Page
    const { getByText } = render(<MemoryRouter><PageNotFound /></MemoryRouter>);

    // Get link
    const link = getByText("Go back home");

    // Expect following
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/');

    expect(getByText("404")).toBeInTheDocument();
    expect(getByText("Oops ! Page Not Found")).toBeInTheDocument();
  });

});