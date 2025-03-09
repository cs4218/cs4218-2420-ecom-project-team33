import React from "react";
import { render, screen } from "@testing-library/react";
import About from "./About";
import "@testing-library/jest-dom";

jest.mock("./../components/Layout", () =>
  jest.fn(({ children }) => <div>{children}</div>)
);

describe("About Component", () => {
  
  it("displays the about image with correct attributes", () => {
    render(<About />);
    
    const aboutImage = screen.getByAltText("contactus");
    expect(aboutImage).toBeInTheDocument();
    expect(aboutImage).toHaveAttribute("src", "/images/about.jpeg");
    expect(aboutImage).toHaveStyle("width: 100%");
  });

  it("contains the text content section", () => {
    render(<About />);    
    // Check for the paragraph
    const paragraph = screen.getByText("Add text");
    expect(paragraph).toBeInTheDocument();
  });

  it("passes the correct title to Layout component", () => {
    render(<About />);
    
    // Check if Layout was called with the correct title prop
    expect(jest.mocked(require("./../components/Layout")).mock.calls[0][0].title).toBe("About us - Ecommerce app");
  });

  it("matches snapshot", () => {
    const { container } = render(<About />);
    expect(container).toMatchSnapshot();
  });
});
