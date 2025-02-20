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
    expect(aboutLink).toHaveAttribute('href', '/about');

    expect(policyLink).toBeInTheDocument();
    expect(policyLink).toHaveAttribute('href', '/policy');

    expect(contactLink).toBeInTheDocument();
    expect(contactLink).toHaveAttribute('href', '/contact');
  });

});