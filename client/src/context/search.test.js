import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { SearchProvider, useSearch } from './search';
import { GAMING_MOUSE } from '../mocks/search';

// Mock component to test useSearch hook
const MockComponent = () => {
  const [values, setValues] = useSearch();
  return (
    <>
      <input 
        type="text"
        data-testid="mock-search"
        onChange={(e) => setValues({ ...values, keyword: e.target.value })}
        value={values.keyword} 
      />
      <button 
        data-testid="mock-search-button" 
        onClick={() => setValues({ ...values, results: ["mock1", "mock2", "mock3"] })}
      />
      <div>
        {values?.results.map(result => <div key={result}>{result}</div>)}
      </div>
    </>
  );
}

describe('useSearch Hook', () => {

  it('should initialize search state from localStorage', () => {
    // Spy on localstorage and mock the return value
    jest.spyOn(window.localStorage.__proto__, 'getItem')
    .mockReturnValue(JSON.stringify({ keyword: "mock", results: [ GAMING_MOUSE.name ] }));

    // Render Mock Component
    const { getByTestId, getByText } = render(
      <SearchProvider>
        <MockComponent />
      </SearchProvider>
    );

    // Get mock input element
    const mockSearch = getByTestId("mock-search");

    // Should contain following values
    expect(mockSearch.value).toBe("mock");
    expect(getByText(GAMING_MOUSE.name)).toBeInTheDocument;
  });

  it('should update and display the entered value correctly!', () => {
    // Render Mock Component
    const { getByTestId } = render(
      <SearchProvider>
        <MockComponent />
      </SearchProvider>
    );

    // Get mock input element
    const mockSearch = getByTestId("mock-search");

    // Simulate typing in the input field
    fireEvent.change(mockSearch, { target: { value: 'basketball' } });

    // Should contain following value
    expect(mockSearch.value).toBe("basketball");

  });

  it('should update and display the results correctly!', () => {
    // Render Mock Component
    const { getByTestId, getByText } = render(
      <SearchProvider>
        <MockComponent />
      </SearchProvider>
    );

    // Get mock button
    const mockButton = getByTestId("mock-search-button");

    // Simulate clicking the button
    fireEvent.click(mockButton);

    // Should contain following values
    expect(getByText("mock1")).toBeInTheDocument;
    expect(getByText("mock2")).toBeInTheDocument;
    expect(getByText("mock3")).toBeInTheDocument;
  });

});
