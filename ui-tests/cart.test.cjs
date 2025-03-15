import { test, expect } from "@playwright/test"

const CREDENTIALS = "cs4218@test.com";
const USERNAME = "CS 4218 Test Accounts";
const ADDRESS = "1 Computing Drive";

const CC_NUMBER = "4032035400234001";
const CC_EXPIRY = "06/2029";
const CC_CVV = "351";

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

test.describe("Unauthenticated View", () => {
  // Go to cart page before each test
  test.beforeEach(async ({ page }) => {
    await page.goto('/cart');
  });

  test("Should render correctly", async ({ page }) => {
    // Expect following to be present
    await expect(page.getByRole('heading', { name: 'Hello Guest' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Please Login To Checkout!' })).toBeVisible();
  });

  test("Should navigate to login page on clicking the login to checkout button", async ({ page }) => {
    // Click on button
    await page.getByRole('button', { name: 'Please Login To Checkout!' }).click();

    // Wait for navigation to the login page
    await page.waitForURL('/login');
  });
});

test.describe("Authenticated View", () => {
  // Login before every test
  test.beforeEach(async ({ page }) => {
    await Login(page);
  });

  test("Should render correctly", async ({ page }) => {
    // Expect username and address to appear correctly
    await expect(page.getByRole('heading', { name: `Hello ${USERNAME}` })).toBeVisible();
    await expect(page.getByRole('heading', { name: ADDRESS })).toBeVisible();
  });

  test("Should navigate to appropriate page on clicking update address button", async ({ page }) => {
    // Expect correct navigation when clicking on update address button
    await page.getByRole('button', { name: 'Update Address' }).click();
    await page.waitForURL("/dashboard/user/profile");
  });

});

test.describe("Adding/Removing Items", () => {
  // Add items to cart before every test
  test.beforeEach(async ({ page }) => {
    await AddItemsToCart(page);
  });

  test("Should correctly display the number of items in the cart", async ({ page }) => {
    // Expect badge in navbar to have current number of items in cart
    await expect(page.getByTitle('3')).toBeVisible();
    // Expect cart page to show current number of items in cart
    await expect(page.getByText('You have 3 item(s) in your cart.')).toBeVisible();
  });

  test("Should correctly remove items from the cart", async ({ page }) => {
    // Remove laptop from cart
    await page.locator('.row.card:has(p:text("Laptop")) .cart-remove-btn button').click();
    // Expect laptop to longer exist in cart
    await expect(page.locator('.row.card:has(p:text("Laptop"))')).toHaveCount(0);
    // Expect badge and number of items to be updated accordingly
    await expect(page.getByTitle('2')).toBeVisible();
    await expect(page.getByText('You have 2 item(s) in your cart.')).toBeVisible();
  });

});

test.describe("Total Price", () => {
  test.describe("No Items", () => {
    test("Should show default $0.00 if there are no items in the cart", async ({ page }) => {
      // Go to cart page and expect following if there are no items
      await page.goto("/cart");
      await expect(page.getByRole('heading', { name: 'Total : $0.00' })).toBeVisible();
    });
  });

  test.describe("Items", () => {
    // Add items to cart before each test
    test.beforeEach(async ({ page }) => {
      await AddItemsToCart(page);
    });

    test("Should show correct price if there are items in the cart", async ({ page }) => {
      // Expect correct calculation of price
      await expect(page.getByTestId("total-price")).toHaveText("Total : " + calculatePrice(ITEMS[0].price + ITEMS[1].price + ITEMS[2].price) + " ");
    });
  
    test("Show show correct price if items are removed from the cart", async ({ page }) => {
      // Expect calculation of price to be performed again if cart is updated
      await page.locator('.row.card:has(p:text("Laptop")) .cart-remove-btn button').click();
      await expect(page.getByTestId("total-price")).toHaveText("Total : " + calculatePrice(ITEMS[1].price + ITEMS[2].price) + " ");
    });
  });
});

test.describe("Payment", () => {

  test.describe("Payment Button", () => {
    test("Should show payment button if user is logged in and has non-empty cart", async ({ page }) => {
      // Login and add items to the cart
      await Login(page);
      await AddItemsToCart(page);
      // Expect payment button to be enabled and visible
      await expect(page.getByRole('button', { name: "Make Payment"})).toBeEnabled();
      await expect(page.getByRole('button', { name: "Make Payment"})).toBeVisible();
    });

    test("Should not show payment button if user is logged in and has empty cart", async ({ page }) => {
      // Login, but expect payment button to not be visible
      await Login(page);
      await expect(page.getByRole('button', { name: "Make Payment"})).not.toBeVisible();
    });
  
    test("Should not show payment button if user is not logged in and has non empty cart", async ({ page }) => {
      // Add items to cart, but expect payment button to not be visible
      await AddItemsToCart(page);
      await expect(page.getByRole('button', { name: "Make Payment"})).not.toBeVisible();
    });
  
    test("Should not show payment button if user is not logged in and has empty cart", async ({ page }) => {
      // Go to cart page, expect payment button to not be visible
      await page.goto("/cart");
      await expect(page.getByRole('button', { name: "Make Payment"})).not.toBeVisible();
    });
  });

  test.describe("Braintree", () => {

    // Login and add items to the cart before each test
    test.beforeEach(async ({ page }) => {
      await Login(page);
      await AddItemsToCart(page);
    });

    test("Should show braintree payment options if user is logged in and has non-empty cart", async ({ page }) => {
      // Expect braintree dropin to be visible
      await page.locator('.braintree-card > .braintree-sheet__header').waitFor({ state: 'visible', timeout: 5000 });
      await expect(page.locator('.braintree-card > .braintree-sheet__header')).toBeVisible();
    });

    test("Should prevent payment if all card details are invalid", async ({ page }) => {
      // Fill in payment details and expect following
      await fillPaymentDetails(page, "", "", "");
      await expect(page.getByText('Please fill out a card number.')).toBeVisible();
      await expect(page.getByText('Please fill out an expiration')).toBeVisible();
      await expect(page.getByText('Please fill out a CVV.')).toBeVisible();
      await expect(page.getByText('Please check your information')).toBeVisible();
    });
  
    test("Should prevent payment if card number is invalid, but cvv and expiration are valid", async ({ page }) => {
      // Fill in payment details and expect following
      await fillPaymentDetails(page, "", CC_EXPIRY, CC_CVV);
      await expect(page.getByText('Please fill out a card number.')).toBeVisible();
      await expect(page.getByText('Please fill out an expiration')).not.toBeVisible();
      await expect(page.getByText('Please fill out a CVV.')).not.toBeVisible();
      await expect(page.getByText('Please check your information')).toBeVisible();
    });

    test("Should prevent payment if card expiry is invalid, but number and cvv are valid", async ({ page }) => {
      // Fill in payment details and expect following
      await fillPaymentDetails(page, CC_NUMBER, "", CC_CVV);
      await expect(page.getByText('Please fill out a card number.')).not.toBeVisible();
      await expect(page.getByText('Please fill out an expiration')).toBeVisible();
      await expect(page.getByText('Please fill out a CVV.')).not.toBeVisible();
      await expect(page.getByText('Please check your information')).toBeVisible();
    });

    test("Should prevent payment if card cvv is invalid, but number and expiration are valid", async ({ page }) => {
      // Fill in payment details and expect following
      await fillPaymentDetails(page, CC_NUMBER, CC_EXPIRY, "");
      await expect(page.getByText('Please fill out a card number.')).not.toBeVisible();
      await expect(page.getByText('Please fill out an expiration')).not.toBeVisible();
      await expect(page.getByText('Please fill out a CVV.')).toBeVisible();
      await expect(page.getByText('Please check your information')).toBeVisible();
    });

    test("Should perform successful payment if all of the card details are valid", async ( { page }) => {
      // Fill in payment details and expect correct navigation
      await fillPaymentDetails(page, CC_NUMBER, CC_EXPIRY, CC_CVV);
      await page.waitForURL('/dashboard/user/orders');
    });
  });
});

test.describe("Persistence", () => {
  // Add items to cart before each test
  test.beforeEach(async ({ page }) => {
    await AddItemsToCart(page);
  });

  test("Removing cart item updates localstorage correctly", async ({ page }) => {
    // Remove cart item
    await page.locator('.row.card:has(p:text("Laptop")) .cart-remove-btn button').click();
    // Expect localstorage to be updated
    const cardData = await getLocalStorageData(page);
    expect(cardData).not.toBeNull();
    expect(JSON.parse(cardData)).toHaveLength(2);
  });

  test("Successful payment clears localstorage", async ({ page }) => {
    // Login and fill payment details correctly
    await Login(page);
    await fillPaymentDetails(page, CC_NUMBER, CC_EXPIRY, CC_CVV);
    await page.waitForURL('/dashboard/user/orders');
    // Expect localstorage to be cleared
    const cardData = await getLocalStorageData(page);
    expect(cardData).toBeNull();
  });

  test("Cart items should be persisted upon reload of page", async ({ page }) => {
    // Reload page
    await page.reload();
    // Expect cart items to persist
    await expect(page.locator('.row.card:has(p:text("Laptop"))')).toHaveCount(1);
    await expect(page.locator('.row.card:has(p:text("Smartphone"))')).toHaveCount(1);
    await expect(page.locator('.row.card:has(p:text("Textbook"))')).toHaveCount(1);
  });

  test("Cart items should remain as user logs in after adding items to the cart", async ({ page }) => {
    // Login
    await Login(page);
    // Expect cart items to carry forward from the guest account
    await expect(page.locator('.row.card:has(p:text("Laptop"))')).toHaveCount(1);
    await expect(page.locator('.row.card:has(p:text("Smartphone"))')).toHaveCount(1);
    await expect(page.locator('.row.card:has(p:text("Textbook"))')).toHaveCount(1);
  });
});

// Helper function to login user
async function Login(page) {
  await page.goto('/login');
  await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(CREDENTIALS);
  await page.getByRole('textbox', { name: 'Enter Your Password' }).fill(CREDENTIALS);
  await page.getByRole('button', { name: 'LOGIN' }).click();
  await page.waitForURL('/');
  await page.getByRole('link', { name: 'Cart' }).click();
}

// Helper function to add 3 items to the cart
async function AddItemsToCart(page) {
  await page.goto('/');
  const laptopCard = await page.locator('.card:has(h5:text("Laptop"))'); 
  await laptopCard.locator('button:has-text("ADD TO CART")').click();  
  const smartphoneCard = await page.locator('.card:has(h5:text("Smartphone"))'); 
  await smartphoneCard.locator('button:has-text("ADD TO CART")').click();
  const textbookCard = await page.locator('.card:has(h5:text("Textbook"))'); 
  await textbookCard.locator('button:has-text("ADD TO CART")').click();
  await page.getByRole('link', { name: 'Cart' }).click();
}

// Helper function to calculate total price
function calculatePrice(price) {
  return price.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

// Helper function to fill in payment details
async function fillPaymentDetails(page, cc_number, cc_expiry, cc_cvv) {
  await page.locator('.braintree-card > .braintree-sheet__header').waitFor({ state: 'visible', timeout: 5000 });
  if (cc_number != "") {
    await page.locator('iframe[name="braintree-hosted-field-number"]').contentFrame().getByRole('textbox', { name: 'Credit Card Number' }).fill(cc_number);
  }
  if (cc_expiry != "") {
    await page.locator('iframe[name="braintree-hosted-field-expirationDate"]').contentFrame().getByRole('textbox', { name: 'Expiration Date' }).fill(cc_expiry);
  }
  if (cc_cvv != "") {
    await page.locator('iframe[name="braintree-hosted-field-cvv"]').contentFrame().getByRole('textbox', { name: 'CVV' }).fill(cc_cvv);
  }
  await expect(page.getByRole('button', { name: "Make Payment"})).toBeEnabled();
  await page.getByRole('button', { name: "Make Payment"}).click();
}

// Helper function to query localstorage
async function getLocalStorageData(page) {
  return await page.evaluate(() => localStorage.getItem('cart'));
}
