import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useParams, useLocation, useNavigate } from 'react-router-dom';
import { mockCategories, BOOKS, ELECTRONICS } from '../mocks/categories';
import toast from 'react-hot-toast';
import axios from 'axios';
import CategoryProduct from './CategoryProduct';
import { GAMING_MOUSE } from '../mocks/search';

// Mock axios
jest.mock("axios");

// Mock UseNavigate Hook
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
  useLocation: jest.fn(),
  useParams: jest.fn()
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

// Helper function to render page
const renderCategoryProductPage = (product) => render(
  <MemoryRouter initialEntries={[`/category/${product}`]}>
    <Routes>
      <Route path={`/category/${product}`} element={<CategoryProduct />} />
    </Routes>
  </MemoryRouter>
);

describe("Category Product Page", () => {

  // Clear all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the page correctly for a valid category", async () => {
    axios.get.mockResolvedValueOnce({ data: { products: [GAMING_MOUSE], category: ELECTRONICS } });
    useParams.mockReturnValue({ slug: ELECTRONICS.slug });
    useLocation.mockReturnValue({
      pathname: `/category/${ELECTRONICS.slug}`,
      search: '',
      hash: '',
      state: undefined,
    });
    console.log = jest.fn();

    const { findByText } = renderCategoryProductPage(ELECTRONICS.slug);

    // Should make the API call.
    await waitFor(() => expect(axios.get).toHaveBeenCalled());

    expect(await findByText(`Category - ${ELECTRONICS.name}`)).toBeInTheDocument;
    expect(await findByText("1 result(s) found")).toBeInTheDocument;
    expect(console.log).not.toBeCalledWith(expect.any(Error))
  });

  it("should render the page correctly for a invalid category", async () => {
    axios.get.mockRejectedValueOnce(new Error("Invalid Category"));
    useParams.mockReturnValue({ slug: "invalid" });
    useLocation.mockReturnValue({
      pathname: '/category/invalid',
      search: '',
      hash: '',
      state: undefined,
    });
    console.log = jest.fn();

    const { findByText } = renderCategoryProductPage("invalid");

    // Should make the API call.
    await waitFor(() => expect(axios.get).toHaveBeenCalled());

    // Should expect the following.
    expect(await findByText("Invalid Category invalid")).toBeInTheDocument;
    expect(await findByText("0 result(s) found")).toBeInTheDocument;
    expect(console.log).toBeCalledWith(expect.any(Error))
  });

  it("should navigate to appropriate product details page", async () => {
    axios.get.mockResolvedValueOnce({ data: { products: [GAMING_MOUSE], category: ELECTRONICS } });
    useParams.mockReturnValue({ slug: ELECTRONICS.slug });
    useLocation.mockReturnValue({
      pathname: `/category/${ELECTRONICS.slug}`,
      search: '',
      hash: '',
      state: undefined,
    });
    const mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);
    console.log = jest.fn();

    const { findByText } = renderCategoryProductPage(ELECTRONICS.slug);

    const button = await findByText('More Details')

    fireEvent.click(button);

    expect(mockNavigate).toBeCalledWith(`/product/${GAMING_MOUSE.slug}`);
  });

  it("should handle missing slug", async () => {
    axios.get.mockResolvedValueOnce({ data: { products: [GAMING_MOUSE], category: ELECTRONICS } });
    useParams.mockReturnValue(undefined);
    useLocation.mockReturnValue({
      pathname: `/category/${ELECTRONICS.slug}`,
      search: '',
      hash: '',
      state: undefined,
    });

    const { findByText } = renderCategoryProductPage(ELECTRONICS.slug);

    // Should not make the API call.
    await waitFor(() => expect(axios.get).not.toHaveBeenCalled());

    // Should expect the following.
    expect(await findByText("Invalid Category")).toBeInTheDocument;
    expect(await findByText("0 result(s) found")).toBeInTheDocument;
  });

  it("should add to cart correctly", async () => {
    axios.get.mockResolvedValueOnce({ data: { products: [GAMING_MOUSE], category: ELECTRONICS } });
    useParams.mockReturnValue({ slug: ELECTRONICS.slug });
    useLocation.mockReturnValue({
      pathname: `/category/${ELECTRONICS.slug}`,
      search: '',
      hash: '',
      state: undefined,
    });

    // Render page and get button
    const { findByText } = renderCategoryProductPage(ELECTRONICS.slug);
    const button = await findByText("ADD TO CART");
    
    // Expect button to be in document
    expect(button).toBeInTheDocument();

    // Click the button
    fireEvent.click(button);

    // Expect successful toast
    expect(toast.success).toHaveBeenCalledWith("Item Added to cart");
  });

});