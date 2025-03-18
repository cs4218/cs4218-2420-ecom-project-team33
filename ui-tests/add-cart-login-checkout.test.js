/*
  This e2e test will simulate the following actions:

  1. User intially will not be logged in.
  2. User will view all the products in the home page and shortlist a few products (add them to the cart).
  3. User will proceed to the cart page to view all the items in cart (removing some items due to a change of mind).
  4. User will now click on the please login to checkout button to login.
  5. User proceeds to login, and make the payment.
  6. User views that the order is placed and logs out.

  Pre-requisites for the e2e test:

  1. User already has an account (username: cs4218@test.com, password: cs4218@test.com)
  2. Available products include Laptop, Smartphone and Textbook (included in samble db schema)
*/
import { test, expect } from "@playwright/test";

const CC_NUMBER = "374245455400126";
const CC_EXPIRY = "05/2026";
const CC_CVV = "3514";

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

test("Add To Cart -> Remove Items From Cart -> Login -> Checkout -> View Order Placed", async ({ page }) => {

  // User opens homepage, and is not currently logged in.
  await page.goto("/");

  // User views more details about the product they are interested in, and adds it to the cart.
  await page.locator('.card:has(h5:text("Laptop"))').locator('button:has-text("More Details")').click();
  await page.getByRole('button', { name: 'ADD TO CART' }).waitFor({ state: 'visible' });
  await page.getByRole('button', { name: 'ADD TO CART' }).click();
  await page.getByRole('link', { name: 'Home' }).click();

  await page.locator('.card:has(h5:text("Smartphone"))').locator('button:has-text("More Details")').click();
  await page.getByRole('button', { name: 'ADD TO CART' }).waitFor({ state: 'visible' });
  await page.getByRole('button', { name: 'ADD TO CART' }).click();
  await page.getByRole('link', { name: 'Home' }).click();

  await page.locator('.card:has(h5:text("Textbook"))').locator('button:has-text("More Details")').click();
  await page.getByRole('button', { name: 'ADD TO CART' }).waitFor({ state: 'visible' });
  await page.getByRole('button', { name: 'ADD TO CART' }).click();
  await page.getByRole('link', { name: 'Home' }).click();

  // Navigate to cart page
  await page.getByRole('link', { name: 'Cart' }).click();

  // Expect following to be present
  await page.getByRole('heading', { name: 'Hello Guest' }).waitFor({ state: 'visible' });

  // Expect cart page to show current number of items in cart
  await expect(page.getByText('You have 3 item(s) in your cart.')).toBeVisible();

  // Expect correct calculation of price
  await expect(page.getByTestId("total-price")).toHaveText("Total : " + calculatePrice(ITEMS[0].price + ITEMS[1].price + ITEMS[2].price) + " ");

  // User changes mind after seeing total price, and removes one item from the cart
  await page.locator('.row.card:has(p:text("Laptop")) .cart-remove-btn button').click();

  // Expect correct calculation of price
  await expect(page.getByTestId("total-price")).toHaveText("Total : " + calculatePrice(ITEMS[1].price + ITEMS[2].price) + " ");

  // User views price, and believes it is now in the budget, and proceeds to login
  await page.getByRole('button', { name: 'Please Login To Checkout!' }).click();

  // User logs in
  await page.getByRole('textbox', { name: 'Enter Your Email' }).fill("cs4218@test.com");
  await page.getByRole('textbox', { name: 'Enter Your Password' }).fill("cs4218@test.com");
  await page.getByRole('button', { name: 'LOGIN' }).click();
  await page.getByRole('link', { name: 'Cart' }).click();

  // User now proceeds to make the payment
  await page.locator('.braintree-card > .braintree-sheet__header').waitFor({ state: 'visible', timeout: 5000 });
  await page.locator('iframe[name="braintree-hosted-field-number"]').contentFrame().getByRole('textbox', { name: 'Credit Card Number' }).fill(CC_NUMBER);
  await page.locator('iframe[name="braintree-hosted-field-expirationDate"]').contentFrame().getByRole('textbox', { name: 'Expiration Date' }).fill(CC_EXPIRY);
  await page.locator('iframe[name="braintree-hosted-field-cvv"]').contentFrame().getByRole('textbox', { name: 'CVV' }).fill(CC_CVV);
  await expect(page.getByRole('button', { name: "Make Payment"})).toBeEnabled();
  await page.getByRole('button', { name: "Make Payment"}).click();

  // User will be redirected to the orders page to view the order
  await page.waitForURL('/dashboard/user/orders');
});

// Helper function to calculate total price
function calculatePrice(price) {
  return price.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}