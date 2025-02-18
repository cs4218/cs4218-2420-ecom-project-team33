import Categories from "./Categories";
import { render } from "@testing-library/react";
import { CLOTHING, ELECTRONICS, BOOKS, mockCategories } from "../mocks/categories";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import '@testing-library/jest-dom/extend-expect';

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
  default: jest.fn(() => mockCategories)
}));

describe("Categories Page", () => {

  it("should render correctly", () => {
    // Render Categories Page
    const { getByText, getAllByText } = render( <MemoryRouter initialEntries={['/category']}>
      <Routes>
        <Route path="/category" element={<Categories />} />
      </Routes>
    </MemoryRouter>);

    // Expect page to have the following
    expect(getByText("All Categories")).toBeInTheDocument;
    expect(getAllByText(BOOKS.name)).toHaveLength(2);
    expect(getAllByText(ELECTRONICS.name)).toHaveLength(2);
    expect(getAllByText(CLOTHING.name)).toHaveLength(2);
  });

  it("should navigate to category product page correctly", () => {
    // Render Categories Page
    const { getByTestId } = render( <MemoryRouter initialEntries={['/category']}>
      <Routes>
        <Route path="/category" element={<Categories />} />
      </Routes>
    </MemoryRouter>);

    // Get link elements
    const booksLink = getByTestId(BOOKS._id);
    const electronicsLink = getByTestId(ELECTRONICS._id);
    const clothingLink = getByTestId(CLOTHING._id);
    
    // Expect page to have the correct href
    expect(booksLink).toHaveAttribute('href', `/category/${BOOKS.slug}`);
    expect(electronicsLink).toHaveAttribute('href', `/category/${ELECTRONICS.slug}`);
    expect(clothingLink).toHaveAttribute('href', `/category/${CLOTHING.slug}`);
  });

})