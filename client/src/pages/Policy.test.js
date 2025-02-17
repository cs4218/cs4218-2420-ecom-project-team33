import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Policy from "./Policy";

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

describe("Policy Page", () => {

  it("should render correctly", () => {
    // Render Policy Page
    const { getByText, getAllByText } = render( <MemoryRouter initialEntries={['/policy']}>
      <Routes>
        <Route path="/policy" element={<Policy />} />
      </Routes>
    </MemoryRouter>);

    // Expect page to have the following
    expect(getAllByText("Privacy Policy")).toHaveLength(2);
    expect(getByText("1. Information We Collect")).toBeInTheDocument;
    expect(getByText("2. How We Use Your Information")).toBeInTheDocument;
    expect(getByText("3. Sharing Your Information")).toBeInTheDocument;
    expect(getByText("4. Data Security")).toBeInTheDocument;
    expect(getByText("5. Your Rights")).toBeInTheDocument;
    expect(getByText("6. Changes to This Privacy Policy")).toBeInTheDocument;
    expect(getByText("7. Contact Us")).toBeInTheDocument;
  });

})