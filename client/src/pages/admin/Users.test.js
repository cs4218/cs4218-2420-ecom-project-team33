import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from 'react-router-dom';
import Users from "./Users";

// Mock the components used in the Users page
jest.mock('../../components/Layout', () =>
  jest.fn(({ children, title }) => (
    <div data-testid="layout" data-title={title}>
      {children}
    </div>
  ))
);

jest.mock('../../components/AdminMenu', () =>
  jest.fn(() => <div data-testid="admin-menu">Admin Menu</div>)
);

describe("Users Component", () => {
  // Test that the component renders correctly
  it("renders the Users page with correct layout and title", () => {
    render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>
    );

    // Check Layout component with correct title
    const layout = screen.getByTestId('layout');
    expect(layout).toBeInTheDocument();
    expect(layout).toHaveAttribute('data-title', 'Dashboard - All Users');
  });

  // Test that AdminMenu is rendered
  it("renders the AdminMenu component", () => {
    render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>
    );

    const adminMenu = screen.getByTestId('admin-menu');
    expect(adminMenu).toBeInTheDocument();
    expect(adminMenu.textContent).toBe('Admin Menu');
  });

});
