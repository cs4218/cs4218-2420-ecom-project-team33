import React from "react";
import { render, screen } from "@testing-library/react";
import AdminDashboard from "./AdminDashboard";
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import "@testing-library/jest-dom"
import { useAuth } from "../../context/auth";
  
jest.mock("../../context/auth", () => ({
    useAuth: jest.fn(),
}));

jest.mock("../../components/Layout", () =>
    jest.fn(({ children }) => <div>{children}</div>)
);

jest.mock("../../components/AdminMenu", () =>
    jest.fn(() => <div>Admin Menu</div>)
);

describe("AdminDashboard Component", () => {

    it("renders admin dashboard with full user details", () => {
        useAuth.mockReturnValue([{
            user: {
              name: "Admin User",
              email: "admin@example.com",
              phone: "12345678",
              role: 1,
            },
        }]);

        const { getByText } = render(
            <MemoryRouter initialEntries={['/dashboard/admin']}>
              <Routes>
                <Route path="/dashboard/admin" element={<AdminDashboard />} />
              </Routes>
            </MemoryRouter>
        );

        expect(getByText("Admin Name : Admin User")).toBeInTheDocument();
        expect(getByText("Admin Email : admin@example.com")).toBeInTheDocument();
        expect(getByText("Admin Contact : 12345678")).toBeInTheDocument();
    });

    it("handles partial user information gracefully", () => {
        useAuth.mockReturnValue([{
            user: {
              name: "Partial User",
              email: "partial@example.com",
            },
        }]);

        const { getByText } = render(
            <MemoryRouter initialEntries={['/dashboard/admin']}>
              <Routes>
                <Route path="/dashboard/admin" element={<AdminDashboard />} />
              </Routes>
            </MemoryRouter>
        );

        expect(getByText("Admin Name : Partial User")).toBeInTheDocument();
        expect(getByText("Admin Email : partial@example.com")).toBeInTheDocument();
        expect(getByText("Admin Contact :")).toBeInTheDocument();
    });


    it("handles missing user information", () => {
        useAuth.mockReturnValue([{
            user: null,
        }]);

        const { getByText } = render(
            <MemoryRouter initialEntries={['/dashboard/admin']}>
              <Routes>
                <Route path="/dashboard/admin" element={<AdminDashboard />} />
              </Routes>
            </MemoryRouter>
        );

        expect(getByText("Admin Name :")).toBeInTheDocument();
        expect(getByText("Admin Email :")).toBeInTheDocument();
        expect(getByText("Admin Contact :")).toBeInTheDocument();
    });

    it("renders admin menu", () => {
        useAuth.mockReturnValue([{
            user: {
              name: "Admin User",
              email: "admin@example.com",
              phone: "12345678",
              role: 1,
            },
        }]);

        render(
            <MemoryRouter initialEntries={['/dashboard/admin']}>
              <Routes>
                <Route path="/dashboard/admin" element={<AdminDashboard />} />
              </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText("Admin Menu")).toBeInTheDocument();
    });

});