import { test, expect } from "@playwright/test"

const VALID_SEARCH_KEYWORD = "laptop";
const INVALID_SEARCH_KEYWORD = "none";

test.describe("Navigation", () => {
  // Go to home page before each test
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Navigates to search results page on valid search', async ({ page }) => {
    // Fill up the search bar and click search
    await fillAndSearch(page, VALID_SEARCH_KEYWORD)
  
    // Wait for navigation to the search results page
    await page.waitForURL('**/search');
  
    // Expect title to be search results
    expect(await page.title()).toContain("Search results");
  });
  
  test('Does not navigate to search results page if search keyword is empty', async ({ page }) => {
    // Fill up the search bar and click search
    await fillAndSearch(page, "");
  
    // Shouldn't navigate to the search results page
    await expect(page).not.toHaveURL('**/search');
  
    // Expect page title to remain the same
    expect(await page.title()).toContain('ALL Products - Best offers');
  });
});

test.describe("Viewing Search Results", () => {
  // Go to search results page before each test
  test.beforeEach(async ({ page }) => {
    await page.goto('/search');
  });

  test('Renders search results page correctly if there is a product matching the search keyword', async ({ page }) => {
    // Fill up the search bar and click search
    await fillAndSearch(page, VALID_SEARCH_KEYWORD);

    // Assert search results as expected
    await assertSearchResults(page);
  });
  
  test('Renders search results page correctly if there is no product matching the search keyword', async ({ page }) => {
    // Fill up the search bar and click search
    await fillAndSearch(page, INVALID_SEARCH_KEYWORD);
  
    // Assert following
    await expect(page.getByTestId('search-results-header')).toHaveText(/Search Results/i);
    await expect(page.getByTestId('search-results-count')).toHaveText(/No Products Found/i);
  });
});

test.describe("Viewing More Details", () => {
  // Go to search results page before each test
  test.beforeEach(async ({ page }) => {
    await page.goto('/search');
    // Fill up the search bar and click search
    await fillAndSearch(page, VALID_SEARCH_KEYWORD);
    // Click on more details button
    await page.getByRole('button', { name: 'More Details' }).click();
  });

  test('Navigates to product page on clicking the more details button', async ({ page }) => {
    // Should navigate to the respective product page
    await page.waitForURL(`**/product/${VALID_SEARCH_KEYWORD}`);
  });
});

test.describe("Adding to Cart", () => {
  // Go to search results page before each test
  test.beforeEach(async ({ page }) => {
    await page.goto('/search');
    // Fill up the search bar and click search
    await fillAndSearch(page, VALID_SEARCH_KEYWORD);
    // Click on add to cart button
    await page.getByRole('button', { name: 'ADD TO CART' }).click();
  });

  test('Add to cart button shows toast on success', async ({ page }) => {
    // Should show the toast
    await expect(page.getByText('Item Added to cart')).toBeVisible();
  });

  test('Add to cart button updates localstorage', async ({ page }) => {
    // Should update localstorage and contain only one item in the array
    const cartData = await page.evaluate(() => localStorage.getItem('cart'));
    expect(cartData).not.toBeNull();
    expect(JSON.parse(cartData)).toHaveLength(1);
  });

  test('Add to cart button updates cart badge in navbar', async ({ page }) => {
    // Should update badge in navbar
    await expect(page.getByText('1', { exact: true })).toBeVisible();
  });
});

test.describe("Persistence", () => {
  // Go to search results page before each test
  test.beforeEach(async ({ page }) => {
    await page.goto('/search');
    // Fill up the search bar and click search
    await fillAndSearch(page, VALID_SEARCH_KEYWORD);
  });

  test('Search results remain even after refreshing the page', async ({ page }) => {
    // Assert search results, localstorage to ensure it has the required data before refreshing
    await assertSearchResults(page);
    await assertLocalStorage(page);

    // Reload page
    await page.reload();

    // Assert search results
    await assertSearchResults(page);
  });

  test('Search results should clear after navigating away from search results page', async ({ page }) => {
    // Assert search results, localstorage to ensure it has the required data before navigating
    await assertSearchResults(page);
    await assertLocalStorage(page);

    // Navigate away
    await page.getByRole('link', { name: 'Home' }).click();

    // Assert localstorage and search bar clears
    await assertLocalStorage(page, false);
    await expect(page.getByTestId("search")).toHaveValue("");
  });
});

// Helper function to fill in search keyword and click the search button
async function fillAndSearch(page, keyword) {
  const searchBar = page.getByTestId("search");
  await searchBar.fill(keyword);
  const searchButton = page.getByTestId('search-btn');
  await searchButton.click();
}

// Helper function to check local storage data
async function assertLocalStorage(page, expected=true) {
  const searchData = await page.evaluate(() => localStorage.getItem('search'));
  if (expected) {
    expect(searchData).not.toBeNull();
    expect(JSON.parse(searchData).keyword).toBe(VALID_SEARCH_KEYWORD);
  } else {
    expect(searchData).toBeNull();
  }
}

// Helper function to assert search results
async function assertSearchResults(page) {
  await expect(page.getByTestId("search")).toHaveValue(VALID_SEARCH_KEYWORD);
  await expect(page.getByTestId('search-results-header')).toHaveText(/Search Results/i);
  await expect(page.getByTestId('search-results-count')).toHaveText(/Found 1/i);
  await expect(page.getByRole('heading', { name: 'Laptop' })).toHaveText(/Laptop/i);
  await expect(page.getByText(/\$ 1499.99/)).toBeVisible();
  await expect(page.getByText(/A powerful laptop.../)).toBeVisible();
  await expect(page.getByRole('img', { name: 'Laptop' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'ADD TO CART' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'More Details' })).toBeVisible();
};
