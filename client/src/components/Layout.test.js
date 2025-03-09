import { render, waitFor } from "@testing-library/react";
import Layout from "./Layout";
import '@testing-library/jest-dom/extend-expect';
import { MemoryRouter } from "react-router-dom";
import { getMeta } from "../setupTests";

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

describe("Layout Component", () => {

  it("renders correctly with input props", async () => {
    // Mock child component
    const mockChild = <p>Hello World</p>;
    
    // Render component
    const { getByText } = render(
      <MemoryRouter>
        <Layout title={"test"} children={mockChild} author={"author"} description={"description"} keywords={"keywords"}/>
      </MemoryRouter>
    );

    // Expect following
    await waitFor(() => expect(document.title).toEqual("test"));
    await waitFor(() => expect(getByText("Hello World")).toBeInTheDocument());
    await waitFor(() => expect(getMeta("author")).toEqual("author"));
    await waitFor(() => expect(getMeta("description")).toEqual("description"));
    await waitFor(() => expect(getMeta("keywords")).toEqual("keywords"));
  });

  it("renders correctly without props", async () => {
    // Render component
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    );

    // Expect following
    await waitFor(() => expect(document.title).toEqual("Ecommerce app - shop now"));
    await waitFor(() => expect(getMeta("author")).toEqual("Techinfoyt"));
    await waitFor(() => expect(getMeta("description")).toEqual("mern stack project"));
    await waitFor(() => expect(getMeta("keywords")).toEqual("mern,react,node,mongodb"));
  });
});
