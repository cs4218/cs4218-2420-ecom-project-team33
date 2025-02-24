import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { CartProvider, useCart } from './cart';
import '@testing-library/jest-dom/extend-expect';

// Mock component to test useCart hook
const MockComponent = () => {
  const [values, setValues] = useCart();
  return (
    <>
      <button 
        data-testid="mock-add-cart-button" 
        onClick={() => setValues([...values, values.length ])}
      />
      <div>
        {values.map(result => <div key={result}>{result}</div>)}
      </div>
    </>
  );
}

describe('useCart Hook', () => {

  it('should update and display the results correctly!', () => {
    // Render Mock Component
    const { getByTestId, getByText } = render(
      <CartProvider>
        <MockComponent />
      </CartProvider>
    );

    // Get mock button
    const mockButton = getByTestId("mock-add-cart-button");

    // Simulate clicking the button
    fireEvent.click(mockButton);
    fireEvent.click(mockButton);
    fireEvent.click(mockButton);

    // Should contain following values
    expect(getByText("0")).toBeInTheDocument();
    expect(getByText("1")).toBeInTheDocument();
    expect(getByText("2")).toBeInTheDocument();
  });

  it('should initialize cart state from localStorage', () => {
    // Spy on localstorage and mock the return value
    jest.spyOn(window.localStorage.__proto__, 'getItem')
    .mockReturnValue(JSON.stringify([0, 1, 2]));

    // Render Mock Component
    const { getByText } = render(
      <CartProvider>
        <MockComponent />
      </CartProvider>
    );

    // Should contain following values
    expect(getByText("0")).toBeInTheDocument();
    expect(getByText("1")).toBeInTheDocument();
    expect(getByText("2")).toBeInTheDocument();
  });

});
