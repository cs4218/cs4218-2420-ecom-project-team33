import React from 'react';
import axios from 'axios';
import { render, fireEvent, waitFor } from '@testing-library/react';
import SearchInput from './SearchInput';
import { useNavigate, useLocation } from "react-router-dom";
import { useSearch } from '../../context/search';

// Mock Axios
jest.mock('axios');

// Mock UseNavigate Hook
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
  useLocation: jest.fn()
}));

// Mock UseSearch Hook
jest.mock('../../context/search', () => ({
  useSearch: jest.fn(() => [{ keyword: '' }, jest.fn()])
}));

describe("Search Input Component", () => {

  // Mock Navigate Hook
  const mockNavigate = jest.fn();
  useNavigate.mockReturnValue(mockNavigate);
  useLocation.mockReturnValue({
    pathname: '/',
    search: '',
    hash: '',
    state: undefined,
  });

  // Clear all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should correctly receive the search keyword and navigate to /search', async () => {
    // Mock Axios, UseSearch Hook
    axios.get.mockResolvedValueOnce({ data: [] });
    useSearch.mockReturnValue([{ keyword: "test" }, jest.fn()]);

    // Render Test Component
    const { getByTestId } = render(<SearchInput />);

    // Get Form Elements
    const searchField = getByTestId("search");
    const submitButton = getByTestId("search-btn");

    // Perform input and submit actions
    fireEvent.change(searchField, { target: { value: 'te' } });
    fireEvent.change(searchField, { target: { value: 'test' } });
    fireEvent.click(submitButton);

    // Should contain input value
    expect(searchField.value).toEqual("test");

    // Should make the API call.
    await waitFor(() => expect(axios.get).toHaveBeenCalled());

    // Should navigate to /search
    expect(mockNavigate).toHaveBeenCalledWith("/search");
  });

  it('should not navigate to /search if search field is empty', async () => {
    // Mock Axios
    axios.get.mockRejectedValueOnce(new Error("Empty text field!"));

    // Render Test Component
    const { getByTestId } = render(<SearchInput />);

    // Get Form Element
    const submitButton = getByTestId("search-btn");

    // Perform submit action
    fireEvent.click(submitButton);

    // Should make the API call.
    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    
    // Shouldn't navigate to /search 
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should handle and log api error', async () => {
    // Mock Axios, Logger, UseSearch Hook
    axios.get.mockRejectedValueOnce(new Error("mock error!"));
    useSearch.mockReturnValue([{ keyword: "test" }, jest.fn()]);
    console.log = jest.fn();

    // Render Test Component
    const { getByTestId } = render(<SearchInput />);

    // Get Form Elements
    const searchField = getByTestId("search");
    const submitButton = getByTestId("search-btn");

    // Perform input and submit actions
    fireEvent.change(searchField, { target: { value: 'test' } });
    fireEvent.click(submitButton);
    
    // Expect input value to API to be valid
    expect(searchField.value).toEqual("test");

    // Should make the API call.
    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    
    // Should log the error.
    expect(console.log).toHaveBeenCalledWith(expect.any(Error));
    
    // Shouldn't navigate to /search 
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
