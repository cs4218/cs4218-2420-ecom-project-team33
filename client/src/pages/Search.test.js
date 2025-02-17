import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { fireEvent, render } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Search from './Search';
import { GAMING_MOUSE, mockSearchResults } from '../mocks/search';
import { useSearch } from '../context/search';
import toast from 'react-hot-toast';

// Mock UseNavigate Hook
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
  useLocation: jest.fn(),
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

// Mock toast
jest.mock('react-hot-toast');

// Mock localstorage
Object.defineProperty(window, 'localStorage', {
  value: {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
  },
  writable: true,
});

// Helper function to render search page
const renderSearchPage = () => render(
  <MemoryRouter initialEntries={['/search']}>
    <Routes>
      <Route path="/search" element={<Search />} />
    </Routes>
  </MemoryRouter>
);

describe("Search Page", () => {

  // Mock Navigate Hook
  const mockNavigate = jest.fn();
  useNavigate.mockReturnValue(mockNavigate);
  useLocation.mockReturnValue({
    pathname: '/search',
    search: '',
    hash: '',
    state: undefined,
  });

  // Clear all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render correctly", () => {
    // Render search page
    const { getByTestId } = renderSearchPage();

    // Expect header to be rendered correctly.
    expect(getByTestId("search-results-header")).toHaveTextContent("Search Results");
  });

  it("should display no results found when search results are empty", () => {
    // Mock return value of useSearch
    useSearch.mockReturnValue([{ keyword: "", results: [] }, jest.fn()]);
    
    // Render search page
    const { getByTestId } = renderSearchPage();

    // Expect no results to be found.
    expect(getByTestId("search-results-count")).toHaveTextContent("No Products Found");
  });

  it("should display results correctly when search results are non-empty", () => {
    // Mock return value of useSearch
    useSearch.mockReturnValue([{ keyword: "", results: mockSearchResults }, jest.fn()]);
    
    // Render search page
    const { getByTestId } = renderSearchPage();
    
    // Expect count to be correct.
    expect(getByTestId("search-results-count")).toHaveTextContent(`Found ${mockSearchResults.length}`);
  });

  it("should truncates long descriptions to 30 characters and appends ...", () => {
    // Mock return value of useSearch
    useSearch.mockReturnValue([{ keyword: "", results: [ GAMING_MOUSE ] }, jest.fn()]);
    
    // Render search page
    const { getByText } = renderSearchPage();
    
    // Expect truncation
    expect(getByText(GAMING_MOUSE.description.slice(0, 30) + "...")).toBeInTheDocument();
  });

  it("should navigate to product page on clicking more details", () => {
    // Mock return value of useSearch
    useSearch.mockReturnValue([{ keyword: "", results: [ GAMING_MOUSE ] }, jest.fn()]);

    // Render page and get button
    const { getByText } = renderSearchPage();
    const button = getByText("More Details");
    
    // Expect button to be in document
    expect(button).toBeInTheDocument();

    // Click the button
    fireEvent.click(button);

    // Expect navigation to product page
    expect(mockNavigate).toHaveBeenCalledWith(`/product/${GAMING_MOUSE.slug}`);
  });

  it("should add to cart correctly", () => {
    // Mock return value of useSearch
    useSearch.mockReturnValue([{ keyword: "", results: [ GAMING_MOUSE ] }, jest.fn()]);

    // Render page and get button
    const { getByText } = renderSearchPage();
    const button = getByText("ADD TO CART");
    
    // Expect button to be in document
    expect(button).toBeInTheDocument();

    // Click the button
    fireEvent.click(button);

    // Expect successful toast
    expect(toast.success).toHaveBeenCalledWith("Item Added to cart");
  });

});