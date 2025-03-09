import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import AdminMenu from "./AdminMenu";

describe("AdminMenu Component", () => {
  // Render the component with MemoryRouter to handle NavLink
  const renderComponent = () => {
    render(
      <MemoryRouter>
        <AdminMenu />
      </MemoryRouter>
    );
  };

  // Test that the component renders
  it("renders the admin menu", () => {
    renderComponent();
    
    // Check for the main heading
    expect(screen.getByText("Admin Panel")).toBeInTheDocument();
  });

  // Test navigation links
  it("renders all navigation links", () => {
    renderComponent();
    
    const links = [
      "Create Category",
      "Create Product",
      "Products",
      "Orders"
    ];

    links.forEach(linkText => {
      const link = screen.getByText(linkText);
      expect(link).toBeInTheDocument();
      expect(link).toHaveClass("list-group-item", "list-group-item-action");
    });
  });

  // Test link destinations
  it("has correct link destinations", () => {
    renderComponent();
    
    const linkDestinations = [
      { text: "Create Category", to: "/dashboard/admin/create-category" },
      { text: "Create Product", to: "/dashboard/admin/create-product" },
      { text: "Products", to: "/dashboard/admin/products" },
      { text: "Orders", to: "/dashboard/admin/orders" }
    ];

    linkDestinations.forEach(({ text, to }) => {
      const link = screen.getByText(text);
      expect(link).toHaveAttribute("href", to);
    });
  });

  // Test styling and structure
  it("has correct CSS classes", () => {
    renderComponent();
    
    const container = screen.getByText("Admin Panel").closest(".text-center");
    expect(container).toBeInTheDocument();

    const listGroup = screen.getByText("Admin Panel").closest(".list-group");
    expect(listGroup).toHaveClass("dashboard-menu");
  });

  // Snapshot test
  it("matches snapshot", () => {
    const { asFragment } = render(
      <MemoryRouter>
        <AdminMenu />
      </MemoryRouter>
    );
    
    expect(asFragment()).toMatchSnapshot();
  });

});