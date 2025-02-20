import { render } from "@testing-library/react";
import Footer from "./Footer";
import '@testing-library/jest-dom/extend-expect';
import { MemoryRouter } from "react-router-dom";

describe("Footer Component", () => {
  
  it("should render correctly", () => {
    // Render component
    const { getByText } = render(<MemoryRouter><Footer /></MemoryRouter>);

    // Get link components
    const aboutLink = getByText("About");
    const policyLink = getByText("Privacy Policy");
    const contactLink = getByText("Contact");

    // Expect following
    expect(getByText("All Rights Reserved © TestingComp")).toBeInTheDocument();
    expect(aboutLink).toBeInTheDocument();
    expect(policyLink).toBeInTheDocument();
    expect(contactLink).toBeInTheDocument();
  });

  it("should navigate to correct page", () => {
    // Render component
    const { getByText } = render(<MemoryRouter><Footer /></MemoryRouter>);

    // Expect following
    expect(getByText("About")).toHaveAttribute('href', '/about');
    expect(getByText("Privacy Policy")).toHaveAttribute('href', '/policy');
    expect(getByText("Contact")).toHaveAttribute('href', '/contact');
  });

});