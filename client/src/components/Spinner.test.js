import { render } from '@testing-library/react';
import Spinner from './Spinner';
import { useNavigate, useLocation } from "react-router-dom";
import { act } from "react-dom/test-utils";
import '@testing-library/jest-dom/extend-expect';

// Mock Navigate, Location Hook
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
  useLocation: jest.fn()
}));

describe("Spinner Component", () => {

  // Mock return value for router hooks
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
    jest.useFakeTimers();
    jest.spyOn(global, 'setTimeout');
  });

  // Clear all timers after each test
  afterEach(() => {
    jest.clearAllTimers();
  });

  it("should render correctly initially", () => {
    // Render component
    const { getByText } = render(<Spinner path={"dummy"}/>);

    // Expect following
    expect(getByText("Redirecting you in 3 second(s)")).toBeInTheDocument;
    expect(getByText("Loading...")).toBeInTheDocument;
  });

  it("should decrement after each second until it reaches 0", () => {
    // Render component
    const { getByText } = render(<Spinner path={"dummy"}/>);

    // Expect following
    expect(getByText("Redirecting you in 3 second(s)")).toBeInTheDocument();
    
    // Advance Timer
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Expect following
    expect(getByText("Redirecting you in 2 second(s)")).toBeInTheDocument();
    
    // Advance Timer
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Expect following
    expect(getByText("Redirecting you in 1 second(s)")).toBeInTheDocument();

    // Advance Timer
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Expect following
    expect(getByText("Redirecting you in 0 second(s)")).toBeInTheDocument();
  });

  it("should route to correct path", () => {
    // Render component
    render(<Spinner path={"dummy"}/>);

    // Advance Timer
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    // Expect following
    expect(mockNavigate).toHaveBeenCalledWith("/dummy", { state: "/"});
    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });

  it("should route to login if path is missing", () => {
    // Render component
    render(<Spinner />);

    // Advance Timer
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    
    // Expect following
    expect(mockNavigate).toHaveBeenCalledWith("/login", { state: "/"});
    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });

  it("should route at the end of 3 seconds", () => {
    // Render component
    render(<Spinner />);

    // Advance Timer
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Expect following
    expect(mockNavigate).toHaveBeenCalledTimes(0);

    // Advance Timer
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Expect following
    expect(mockNavigate).toHaveBeenCalledTimes(0);

    // Advance Timer
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    // Expect following
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/login", { state: "/"});
  });

});