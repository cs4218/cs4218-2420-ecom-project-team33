import Profile from "./Profile";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import '@testing-library/jest-dom/extend-expect';
import { useAuth } from "../../context/auth";
import toast from "react-hot-toast";
import axios from "axios";

// Mock axios
jest.mock("axios");

// Mock toast
jest.mock("react-hot-toast");

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

describe("Profile Page", () => {

  // Clear all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render correctly", () => {
    // Mock useAuth hook
    useAuth.mockReturnValue([{user: { name: "test", email: "test@test.com", address: "school of computing", phone: "12345678", role: 0 }}, jest.fn()]);

    // Render Profile Page
    const { getByLabelText } = render( <MemoryRouter initialEntries={['/dashboard/user/profile']}>
      <Routes>
        <Route path='/dashboard/user/profile' element={<Profile />} />
      </Routes>
      </MemoryRouter>);

    // Get input fields
    const nameInput = getByLabelText("Name");
    const emailInput = getByLabelText("Email");
    const passwordInput = getByLabelText("Password");
    const phoneInput = getByLabelText("Phone");
    const addressInput = getByLabelText("Address");

    // Expect page to have the following
    expect(nameInput).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(phoneInput).toBeInTheDocument();
    expect(addressInput).toBeInTheDocument();
    
    // Expect page to prefill values
    expect(nameInput).toHaveValue("test");
    expect(emailInput).toHaveValue("test@test.com");
    expect(passwordInput).toHaveValue("");
    expect(phoneInput).toHaveValue("12345678");
    expect(addressInput).toHaveValue("school of computing");
    
    // Expect email input to be disabled
    expect(emailInput).toBeDisabled();
  });

  it("should update values correctly on valid input", async () => {
    // Spy on localstorage and mock the return value
    jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue(JSON.stringify({ user: { name: "test", email: "test@test.com", address: "school of computing", phone: "12345678", role: "0" }}));
    
    // Mock useAuth hook, axios
    useAuth.mockReturnValue([{user: { name: "test", email: "test@test.com", address: "school of computing", phone: "12345678", role: 0 }}, jest.fn()]);
    axios.put.mockResolvedValueOnce({ data: {success: true, updatedUser: { name: 'tester', email: "test@test.com", address: 'faculty of science', phone: '12345670', role: 0 }} });

    // Render Profile Page
    const { getByText, getByTestId } = render( <MemoryRouter initialEntries={['/dashboard/user/profile']}>
      <Routes>
        <Route path='/dashboard/user/profile' element={<Profile />} />
      </Routes>
      </MemoryRouter>);
    
    // Get input fields
    const nameInput = getByTestId("name");
    const passwordInput = getByTestId("password");
    const phoneInput = getByTestId("phone");
    const addressInput = getByTestId("address");
    
    // Update input fields
    fireEvent.change(nameInput, { target: { value: 'tester' } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });
    fireEvent.change(phoneInput, { target: { value: '12345670' } });
    fireEvent.change(addressInput, { target: { value: 'faculty of science' } });
    
    // Click on update button
    fireEvent.click(getByText("Update"));

    // Should make the API call.
    await waitFor(() => expect(axios.put).toHaveBeenCalled());

    // Expect successful toast
    expect(toast.success).toHaveBeenCalledWith("Profile Updated Successfully");
  });

  it("should handle input fields being empty (take previous values)", async () => {
    // Spy on localstorage and mock the return value
    jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue(JSON.stringify({ user: { name: "test", email: "test@test.com", address: "school of computing", phone: "12345678", role: "0" }}));
    
    // Mock useAuth hook, axios
    useAuth.mockReturnValue([{user: { name: "test", email: "test@test.com", address: "school of computing", phone: "12345678", role: 0 }}, jest.fn()]);
    axios.put.mockResolvedValueOnce({ data: {success: true, updatedUser: { name: 'test', email: "test@test.com", address: "school of computing", phone: "12345678", role: 0 }} });

    // Render Profile Page
    const { getByText, getByTestId } = render( <MemoryRouter initialEntries={['/dashboard/user/profile']}>
      <Routes>
        <Route path='/dashboard/user/profile' element={<Profile />} />
      </Routes>
      </MemoryRouter>);
    
    // Get input fields
    const nameInput = getByTestId("name");
    const phoneInput = getByTestId("phone");
    const addressInput = getByTestId("address");

    // Update input fields
    fireEvent.change(nameInput, { target: { value: '' } });
    fireEvent.change(phoneInput, { target: { value: '' } });
    fireEvent.change(addressInput, { target: { value: '' } });
    
    // Click on update button
    fireEvent.click(getByText("Update"));

    // Should make the API call.
    await waitFor(() => expect(axios.put).toHaveBeenCalled());

    // Expect successful toast
    expect(toast.success).toHaveBeenCalledWith("Profile Updated Successfully");
  });

  it("should show toast error if password is not empty and is less than 6 characters", async () => {
    // Mock useAuth hook, axios
    useAuth.mockReturnValue([{user: { name: "test", email: "test@test.com", address: "school of computing", phone: "12345678", role: 0 }}, jest.fn()]);
    axios.put.mockResolvedValueOnce({ data: {error: "Password is required and 6 character long"} });

    // Render Profile Page
    const { getByText, getByTestId } = render( <MemoryRouter initialEntries={['/dashboard/user/profile']}>
      <Routes>
        <Route path='/dashboard/user/profile' element={<Profile />} />
      </Routes>
      </MemoryRouter>);
    
    // Get password field
    const passwordInput = getByTestId("password");
    
    // Update field to have invalid password
    fireEvent.change(passwordInput, { target: { value: '12345' } });
    
    // Click on update button
    fireEvent.click(getByText("Update"));

    // Should make the API call.
    await waitFor(() => expect(axios.put).toHaveBeenCalled());

    // Expect toast error
    expect(toast.error).toHaveBeenCalledWith("Password is required and 6 character long");
  });

  it("should show toast error if there is an error with the api call", async () => {
    
    // Mock useAuth hook, axios, console
    useAuth.mockReturnValue([{user: { name: "test", email: "test@test.com", address: "school of computing", phone: "12345678", role: 0 }}, jest.fn()]);
    axios.put.mockRejectedValueOnce(new Error("Invalid API Call"));
    console.log = jest.fn();

    // Render Profile Page
    const { getByText } = render( <MemoryRouter initialEntries={['/dashboard/user/profile']}>
      <Routes>
        <Route path='/dashboard/user/profile' element={<Profile />} />
      </Routes>
      </MemoryRouter>);

    fireEvent.click(getByText("Update"));

    // Should make the API call.
    await waitFor(() => expect(axios.put).toHaveBeenCalled());
    
    // Should log the error
    expect(console.log).toHaveBeenCalledWith(expect.any(Error));

    // Expect toast error
    expect(toast.error).toHaveBeenCalledWith("Something went wrong");
  });

  // New test for phone validation
  it("should validate phone number format and prevent submission with invalid phone", async () => {
    // Mock useAuth hook
    useAuth.mockReturnValue([{user: { name: "test", email: "test@test.com", address: "school of computing", phone: "12345678", role: 0 }}, jest.fn()]);
    
    // Render Profile Page
    const { getByText, getByTestId, findByText } = render(
      <MemoryRouter initialEntries={['/dashboard/user/profile']}>
        <Routes>
          <Route path='/dashboard/user/profile' element={<Profile />} />
        </Routes>
      </MemoryRouter>
    );
    
    // Get phone input field
    const phoneInput = getByTestId("phone");
    
    // Test with non-digit characters
    fireEvent.change(phoneInput, { target: { value: '123abc456' } });
    
    // Should show validation error
    const nonDigitError = await findByText("Phone number should contain only digits");
    expect(nonDigitError).toBeInTheDocument();
    
    // Test with boundary value 7
    fireEvent.change(phoneInput, { target: { value: '123457' } });
    
    // Should show length validation error
    const lengthError = await findByText("Phone number should be at least 8 digits");
    expect(lengthError).toBeInTheDocument();
    
    // Click update button while validation error exists
    fireEvent.click(getByText("Update"));
    
    // API call should not be made when validation error exists
    expect(axios.put).not.toHaveBeenCalled();
    
    // Should show toast error with validation message
    expect(toast.error).toHaveBeenCalledWith("Phone number should be at least 8 digits");
    
    // Now fix the phone number to boundary value 8
    fireEvent.change(phoneInput, { target: { value: '12345678'} });
    
    // Validation error should be gone
    expect(lengthError).not.toBeInTheDocument();
    
    // API call should now succeed
    axios.put.mockResolvedValueOnce({ 
      data: {
        success: true, 
        updatedUser: { 
          name: 'test', 
          email: "test@test.com", 
          address: "school of computing", 
          phone: "1234567890", 
          role: 0 
        }
      } 
    });
    
    // Click update again
    fireEvent.click(getByText("Update"));
    
    // API call should be made
    await waitFor(() => expect(axios.put).toHaveBeenCalled());
    
    // Success toast should appear
    expect(toast.success).toHaveBeenCalledWith("Profile Updated Successfully");
  });
});