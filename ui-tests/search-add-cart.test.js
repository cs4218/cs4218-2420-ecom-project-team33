/*
  This e2e test will simulate the following actions:

  1. User will open home page.
  2. User has a certain product in mind, and decides to search for it but makes a typo.
  3. The product does not exist, and the user is greeted with a product not found page.
  4. User viewes the typo, fixes it and searches again.
  5. The product does exist, and the user views the product.
  6. The user accidently clicks on the refresh button, but the search results remain.
  7. The user adds the item to the cart and goes back to the home page to view other products.

  Pre-requisites for the e2e test:

  1. Available products has to include Laptop (included in samble db schema)
*/
import { test, expect } from "@playwright/test";

test("Search for non-existent item -> Not Found -> Search for existent item -> Found -> Reload Page -> Add to cart -> Return to home page", async ({ page }) => {
  // Start at home page
  await page.goto("/");

  // User makes typo while searching for item
  await fillAndSearch(page, "laptip");

  // Expect following
  await expect(page.getByTestId('search-results-header')).toHaveText(/Search Results/i);
  await expect(page.getByTestId('search-results-count')).toHaveText(/No Products Found/i);

  // User realises mistake, and fixes typo
  await fillAndSearch(page, "laptop");

  // Expect following
  await expect(page.getByTestId('search-results-header')).toHaveText(/Search Results/i);
  await expect(page.getByTestId('search-results-count')).toHaveText(/Found 1/i);
  await expect(page.getByRole('heading', { name: 'Laptop' })).toHaveText(/Laptop/i);
  await expect(page.getByText(/\$ 1499.99/)).toBeVisible();
  await expect(page.getByText(/A powerful laptop.../)).toBeVisible();
  await expect(page.getByRole('button', { name: 'ADD TO CART' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'More Details' })).toBeVisible();

  // User accidently reloads page
  await page.reload();

  // Expect persistence
  await expect(page.getByRole('heading', { name: 'Laptop' })).toHaveText(/Laptop/i);

  // Add item to cart
  await page.getByRole('button', { name: 'ADD TO CART' }).click();

  // User goes back to home page to look at the remaining available products
  await page.getByRole('link', { name: 'Home' }).click();

});

async function fillAndSearch(page, keyword) {
  const searchBar = page.getByTestId("search");
  await searchBar.fill(keyword);
  const searchButton = page.getByTestId('search-btn');
  await searchButton.click();
}