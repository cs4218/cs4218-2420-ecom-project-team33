import React from "react";
import { render, screen } from "@testing-library/react";
import Contact from "./Contact";
import "@testing-library/jest-dom";

jest.mock("./../components/Layout", () =>
    jest.fn(({ children }) => <div>{children}</div>)
);

jest.mock("react-icons/bi", () => ({
    BiMailSend: () => <div data-testid="mail-icon">Mail Icon</div>,
    BiPhoneCall: () => <div data-testid="phone-icon">Phone Icon</div>,
    BiSupport: () => <div data-testid="support-icon">Support Icon</div>,
}));

describe("Contact Component", () => {
    
    it("renders contact page with title", () => {
        render(<Contact />);
        
        expect(screen.getByText("CONTACT US")).toBeInTheDocument();
    });
    
    it("displays contact image", () => {
        render(<Contact />);
        
        const contactImage = screen.getByAltText("contactus");
        expect(contactImage).toBeInTheDocument();
        expect(contactImage).toHaveAttribute("src", "/images/contactus.jpeg");
        expect(contactImage).toHaveStyle("width: 100%");
    });
    
    it("displays contact information text", () => {
        render(<Contact />);
        
        expect(screen.getByText(/For any query or info about product/i)).toBeInTheDocument();
        expect(screen.getByText(/We are available 24X7/i)).toBeInTheDocument();
    });
    
    // it("renders email contact information", () => {
    //     render(<Contact />);
        
    //     expect(screen.getByTestId("mail-icon")).toBeInTheDocument();
    //     expect(screen.getByText(": www.help@ecommerceapp.com")).toBeInTheDocument();
    // });
    
    // it("renders phone contact information", () => {
    //     render(<Contact />);
        
    //     expect(screen.getByTestId("phone-icon")).toBeInTheDocument();
    //     expect(screen.getByText(": 012-3456789")).toBeInTheDocument();
    // });
    
    // it("renders support contact information", () => {
    //     render(<Contact />);
        
    //     expect(screen.getByTestId("support-icon")).toBeInTheDocument();
    //     expect(screen.getByText(": 1800-0000-0000 (toll free)")).toBeInTheDocument();
    // });
    
    it("renders with correct layout structure", () => {
        render(<Contact />);
        
        expect(screen.getByText("CONTACT US").className).toContain("bg-dark");
        expect(screen.getByText("CONTACT US").className).toContain("text-white");
        expect(screen.getByText("CONTACT US").className).toContain("text-center");
    });
});
