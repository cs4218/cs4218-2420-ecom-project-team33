import { render, fireEvent } from '@testing-library/react';
import UserMenu from './UserMenu';
import '@testing-library/jest-dom/extend-expect';
import { MemoryRouter } from 'react-router-dom';

describe("UserMenu Component", () => {

  it("should render correctly", () => {
    // Render component
    const { getByText } = render(<MemoryRouter><UserMenu /></MemoryRouter>);

    // Get elements
    const dashboardLink = getByText("Dashboard");
    const profileLink = getByText("Profile");
    const ordersLink = getByText("Orders");

    // Expect following
    expect(dashboardLink).toBeInTheDocument();
    expect(profileLink).toBeInTheDocument();
    expect(ordersLink).toBeInTheDocument();
  });

  it("should navigate to correct page", () => {
    // Render component
    const { getByText } = render(<MemoryRouter><UserMenu /></MemoryRouter>);

    // Get elements
    const dashboardLink = getByText("Dashboard");
    const profileLink = getByText("Profile");
    const ordersLink = getByText("Orders");

    // Expect following
    expect(dashboardLink).toHaveAttribute('href', '/dashboard/user');
    expect(profileLink).toHaveAttribute('href', '/dashboard/user/profile');
    expect(ordersLink).toHaveAttribute('href', '/dashboard/user/orders');
  });

  it("should correctly display active status", () => {
    // Render component
    const { getByText } = render(<MemoryRouter><UserMenu /></MemoryRouter>);

    // Get elements
    const dashboardLink = getByText("Dashboard");
    const profileLink = getByText("Profile");
    const ordersLink = getByText("Orders");

    // Click on dashboard option.
    fireEvent.click(dashboardLink);

    // Expect dashboard to be active.
    expect(dashboardLink.getAttribute("class")).toContain("active");
    expect(profileLink.getAttribute("class")).not.toContain("active");
    expect(ordersLink.getAttribute("class")).not.toContain("active");

    // Click on profile option.
    fireEvent.click(profileLink);

    // Expect profile to be active.
    expect(dashboardLink.getAttribute("class")).not.toContain("active");
    expect(profileLink.getAttribute("class")).toContain("active");
    expect(ordersLink.getAttribute("class")).not.toContain("active");

    // Click on orders option.
    fireEvent.click(ordersLink);

    // Expect orders to be active.
    expect(dashboardLink.getAttribute("class")).not.toContain("active");
    expect(profileLink.getAttribute("class")).not.toContain("active");
    expect(ordersLink.getAttribute("class")).toContain("active");
  });

});