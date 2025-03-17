/*
  This e2e test will simulate the following actions:

  1. User will log in.
  2. User will view all the products in the home page and shortlist a few products (add them to the cart).
  3. User enters credit card credentials, but makes an error while entering the CVV.
  4. User fails to checkout with the required items.

  Pre-requisites for the e2e test:

  1. User already has an account (username: cs4218@test.com, password: cs4218@test.com)
  2. Available products include Laptop, Smartphone and Textbook (included in samble db schema)
*/
import { test, expect } from "@playwright/test";

const CC_NUMBER = "4032035400234001";
const CC_EXPIRY = "06/2029";
const CC_CVV_INVALID = "35";

const USERNAME = "CS 4218 Test Account";
const ADDRESS = "1 Computing Drive";

const ITEMS = [
  {
    "name": "Laptop",
    "price": 1499.99
  },
  {
    "name": "Smartphone",
    "price": 999.99
  },
  {
    "name": "Textbook",
    "price": 79.99
  }
];

test("Login -> Add To Cart -> Attempt Checkout -> View Invalid Checkout Message", async ({ page }) => {

  // User opens login page and logs in.
  await page.goto("/login");
  await page.getByRole('textbox', { name: 'Enter Your Email' }).fill("cs4218@test.com");
  await page.getByRole('textbox', { name: 'Enter Your Password' }).fill("cs4218@test.com");
  await page.getByRole('button', { name: 'LOGIN' }).click();

  // User views more details about the product they are interested in, and adds it to the cart.
  await page.locator('.card:has(h5:text("Laptop"))').locator('button:has-text("ADD TO CART")').click();
  await page.locator('.card:has(h5:text("Smartphone"))').locator('button:has-text("ADD TO CART")').click(); 
  await page.locator('.card:has(h5:text("Textbook"))').locator('button:has-text("ADD TO CART")').click();   

  // Navigate to cart page
  await page.getByRole('link', { name: 'Cart' }).click();

  // Expect following to be present
  await expect(page.getByRole('heading', { name: `Hello ${USERNAME}` })).toBeVisible();
  await expect(page.getByRole('heading', { name: ADDRESS })).toBeVisible();

  // Expect cart page to show current number of items in cart
  await expect(page.getByText('You have 3 item(s) in your cart.')).toBeVisible();

  // Expect correct calculation of price
  await expect(page.getByTestId("total-price")).toHaveText("Total : " + calculatePrice(ITEMS[0].price + ITEMS[1].price + ITEMS[2].price) + " ");

  // User now proceeds to make the payment
  await page.locator('.braintree-card > .braintree-sheet__header').waitFor({ state: 'visible', timeout: 5000 });
  await page.locator('iframe[name="braintree-hosted-field-number"]').contentFrame().getByRole('textbox', { name: 'Credit Card Number' }).fill(CC_NUMBER);
  await page.locator('iframe[name="braintree-hosted-field-expirationDate"]').contentFrame().getByRole('textbox', { name: 'Expiration Date' }).fill(CC_EXPIRY);
  await page.locator('iframe[name="braintree-hosted-field-cvv"]').contentFrame().getByRole('textbox', { name: 'CVV' }).fill(CC_CVV_INVALID);
  await expect(page.getByRole('button', { name: "Make Payment"})).toBeEnabled();
  await page.getByRole('button', { name: "Make Payment"}).click();

  // Expect invalid cvv message
  await expect(page.getByText('This security code is not valid.')).toBeVisible();
  await expect(page.getByText('Please check your information')).toBeVisible();
});

// Helper function to calculate total price
function calculatePrice(price) {
  return price.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}