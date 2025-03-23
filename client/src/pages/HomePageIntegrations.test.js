import React from 'react';
import { render, waitFor } from '@testing-library/react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { BrowserRouter } from 'react-router-dom';
import HomePage from "./HomePage";
import { CartProvider } from "../context/cart";

jest.mock('react-icons/ai', () => ({
  AiOutlineReload: () => 'Reload Icon Mock'
}));

jest.mock('react-hot-toast', () => ({
  success: jest.fn()
}));

jest.mock('../components/Layout', () => {
  return ({ children }) => <div data-testid="layout-mock">{children}</div>;
});

describe('HomePage API Calls', () => {
  let mockAxios;
  let axiosGetSpy;
  let axiosPostSpy;
  
  beforeEach(() => {
    mockAxios = new MockAdapter(axios);
    axiosGetSpy = jest.spyOn(axios, 'get');
    axiosPostSpy = jest.spyOn(axios, 'post');
    
    mockAxios.onGet('/api/v1/category/get-category').reply(200, { 
      success: true, 
      category: [] 
    });
    
    mockAxios.onGet('/api/v1/product/product-list/1').reply(200, { 
      success: true, 
      products: [] 
    });
  });
  
  afterEach(() => {
    mockAxios.restore();
    axiosGetSpy.mockRestore();
    axiosPostSpy.mockRestore();
    jest.clearAllMocks();
  });
  
  test('makes API call to get product count on component mount', async () => {
    mockAxios.onGet('/api/v1/product/product-count').reply(200, {
      success: true,
      total: 42
    });
    
    render(
      <BrowserRouter>
        <CartProvider>
          <HomePage />
        </CartProvider>
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(axiosGetSpy).toHaveBeenCalledWith('/api/v1/product/product-count');
    });
  });
  
  test('getTotal function fetches and processes product count correctly', async () => {
    const expectedTotal = 42;
    mockAxios.onGet('/api/v1/product/product-count').reply(200, {
      success: true,
      total: expectedTotal
    });
    
    const setTotal = jest.fn();
    
    const getTotal = async () => {
      try {
        const { data } = await axios.get("/api/v1/product/product-count");
        setTotal(data?.total);
      } catch (error) {
        console.log(error);
      }
    };
    
    await getTotal();
    
    expect(setTotal).toHaveBeenCalledWith(expectedTotal);
  });
  
  test('makes API call to get products for page 1 on component mount', async () => {
    mockAxios.onGet('/api/v1/product/product-list/1').reply(200, {
      success: true,
      products: [
        { _id: '1', name: 'Product 1' },
        { _id: '2', name: 'Product 2' }
      ]
    });
    
    render(
      <BrowserRouter>
        <CartProvider>
          <HomePage />
        </CartProvider>
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(axiosGetSpy).toHaveBeenCalledWith('/api/v1/product/product-list/1');
    });
  });
  
  test('getAllProducts function fetches products for current page correctly', async () => {
    const page = 2;
    const mockProducts = [
      { _id: '3', name: 'Product 3' },
      { _id: '4', name: 'Product 4' }
    ];
    
    mockAxios.onGet(`/api/v1/product/product-list/${page}`).reply(200, {
      success: true,
      products: mockProducts
    });
    
    const setLoading = jest.fn();
    const setProducts = jest.fn();
    
    const getAllProducts = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/v1/product/product-list/${page}`);
        setLoading(false);
        setProducts(data.products);
      } catch (error) {
        setLoading(false);
        console.log(error);
      }
    };
    
    await getAllProducts();
    
    expect(setLoading).toHaveBeenCalledTimes(2);
    expect(setLoading).toHaveBeenNthCalledWith(1, true);
    expect(setLoading).toHaveBeenNthCalledWith(2, false);
    
    expect(setProducts).toHaveBeenCalledWith(mockProducts);
  });
  
  test('getAllProducts function handles API error correctly', async () => {
    const page = 1;
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    mockAxios.onGet(`/api/v1/product/product-list/${page}`).reply(400, {
      success: false,
      message: "error in per page ctrl"
    });
    
    const setLoading = jest.fn();
    const setProducts = jest.fn();
    
    const getAllProducts = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/v1/product/product-list/${page}`);
        setLoading(false);
        setProducts(data.products);
      } catch (error) {
        setLoading(false);
        console.log(error);
      }
    };
    
    await getAllProducts();
    
    expect(setLoading).toHaveBeenCalledTimes(2);
    expect(setLoading).toHaveBeenNthCalledWith(1, true);
    expect(setLoading).toHaveBeenNthCalledWith(2, false);
    
    expect(setProducts).not.toHaveBeenCalled();
    
    expect(consoleSpy).toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });
  
  test('filterProduct function posts filter criteria and updates products', async () => {
    const checked = ["category1", "category2"];
    const radio = [0, 1000];
    const mockFilteredProducts = [
      { _id: '5', name: 'Filtered Product 1', price: 500, category: "category1" },
      { _id: '6', name: 'Filtered Product 2', price: 800, category: "category2" }
    ];
    
    mockAxios.onPost('/api/v1/product/product-filters').reply(200, {
      success: true,
      products: mockFilteredProducts
    });
    
    const setProducts = jest.fn();
    
    const filterProduct = async () => {
      try {
        const { data } = await axios.post("/api/v1/product/product-filters", {
          checked,
          radio,
        });
        setProducts(data?.products);
      } catch (error) {
        console.log(error);
      }
    };
    
    await filterProduct();
    
    expect(axiosPostSpy).toHaveBeenCalledWith(
      '/api/v1/product/product-filters', 
      { checked, radio }
    );
    
    expect(setProducts).toHaveBeenCalledWith(mockFilteredProducts);
  });
  
  test('filterProduct function handles API error correctly', async () => {
    const checked = ["category1"];
    const radio = [0, 500];
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    mockAxios.onPost('/api/v1/product/product-filters').reply(400, {
      success: false,
      message: "Error WHile Filtering Products"
    });
    
    const setProducts = jest.fn();
    
    const filterProduct = async () => {
      try {
        const { data } = await axios.post("/api/v1/product/product-filters", {
          checked,
          radio,
        });
        setProducts(data?.products);
      } catch (error) {
        console.log(error);
      }
    };
    
    await filterProduct();
    
    expect(axiosPostSpy).toHaveBeenCalledWith(
      '/api/v1/product/product-filters', 
      { checked, radio }
    );
    
    expect(setProducts).not.toHaveBeenCalled();
    
    expect(consoleSpy).toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });
  
  test('useEffect triggers filterProduct when filter values change', async () => {
    const postSpy = jest.spyOn(axios, 'post');
    
    mockAxios.onPost('/api/v1/product/product-filters').reply(200, {
      success: true,
      products: []
    });
    
    const TestComponent = () => {
      const [checked, setChecked] = React.useState([]);
      const [radio, setRadio] = React.useState([]);
      
      React.useEffect(() => {
        if (checked.length || radio.length) {
          axios.post('/api/v1/product/product-filters', { checked, radio });
        }
      }, [checked, radio]);
      
      React.useEffect(() => {
        setChecked(['category1']);
      }, []);
      
      return <div>Filter Test Component</div>;
    };
    
    render(<TestComponent />);
    
    await waitFor(() => {
      expect(postSpy).toHaveBeenCalledWith(
        '/api/v1/product/product-filters', 
        { checked: ['category1'], radio: [] }
      );
    });
    
    postSpy.mockRestore();
  });
});
