import Dashboard from "./Dashboard";
import { render } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import '@testing-library/jest-dom/extend-expect';
import { useAuth } from "../../context/auth";

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

describe("Dashboard Page", () => {

  it("should render correctly", () => {
    // Mock useAuth hook
    useAuth.mockReturnValue([{user: { name: "test", email: "test@test.com", address: "school of computing", role: 0 }}, jest.fn()]);

    // Render Dashboard Page
    const { getByText, getByRole } = render( <MemoryRouter initialEntries={['/dashboard/user']}>
      <Routes>
        <Route path='/dashboard/user' element={<Dashboard />} />
      </Routes>
      </MemoryRouter>);

    // Expect page to have the following
    expect(getByText("Name")).toBeInTheDocument();
    expect(getByText("Email")).toBeInTheDocument();
    expect(getByText("Address")).toBeInTheDocument();
    expect(getByRole("heading", { name: "test" })).toBeInTheDocument();
    expect(getByRole("heading", { name: "test@test.com" })).toBeInTheDocument();
    expect(getByRole("heading", { name: "school of computing" })).toBeInTheDocument();
  });

  it("should render correctly even if user information is missing", () => {
    // Mock useAuth hook
    useAuth.mockReturnValue([{user: {}}, jest.fn()]);

    // Render Dashboard Page
    const { getByText } = render( <MemoryRouter initialEntries={['/dashboard/user']}>
      <Routes>
        <Route path='/dashboard/user' element={<Dashboard />} />
        </Routes>
      </MemoryRouter>);
    
    // Expect page to have the following
    expect(getByText("Name")).toBeInTheDocument();
    expect(getByText("Email")).toBeInTheDocument();
    expect(getByText("Address")).toBeInTheDocument();
    expect(getByText("Name not available at the moment.")).toBeInTheDocument();
    expect(getByText("Email not available at the moment.")).toBeInTheDocument();
    expect(getByText("Address not available at the moment.")).toBeInTheDocument();
  });

})