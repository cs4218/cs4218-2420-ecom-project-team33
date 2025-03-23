import { test, expect } from '@playwright/test';

test('basic elements of the page are present', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await expect(page.getByRole('img', { name: 'bannerimage' })).toBeVisible();
  await expect(page.getByRole('link', { name: '🛒 Virtual Vault' })).toBeVisible();
  await expect(page.getByTestId('search-btn')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
  await expect(page.getByTestId('category-button')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Register' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Cart' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Filter By Category' })).toBeVisible();
  await expect(page.getByRole('main').getByText('Clothing')).toBeVisible();
  await expect(page.getByRole('main').getByText('Book', { exact: true })).toBeVisible();
  await expect(page.getByRole('main').getByText('Toys')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Filter By Price' })).toBeVisible();
  await expect(page.getByText('$0 to')).toBeVisible();
  await expect(page.getByText('$20 to')).toBeVisible();
  await expect(page.getByText('$40 to')).toBeVisible();
  await expect(page.getByText('$60 to')).toBeVisible();
  await expect(page.getByText('$80 to')).toBeVisible();
  await expect(page.getByText('$100 or more')).toBeVisible();
  await expect(page.getByRole('button', { name: 'RESET FILTERS' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'All Products' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'All Rights Reserved ©' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'About' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Contact' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Privacy Policy' })).toBeVisible();
});

test('search bar filters items correctly', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByTestId('search').click();
    await page.getByTestId('search').fill('Smartphone');
    await page.getByTestId('search').press('Enter');
    await page.getByTestId('search-btn').click();
    await expect(page.getByRole('heading', { name: 'Smartphone' })).toBeVisible();
    await expect(page.locator('div').filter({ hasText: /^SmartphoneA high-end smartphone\.\.\. \$ 999\.99More DetailsADD TO CART$/ }).first()).toBeVisible();
    await expect(page.getByText('T-shirt', { exact: false })).not.toBeVisible();
  });

test('category filter button filters items correctly', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByRole('checkbox', { name: 'Book' }).check();
    await expect(page.getByText('Textbook$')).toBeVisible();
    await expect(page.getByText('Novel$')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'The Law of Contract in' })).toBeVisible();
});

test('price filter button filters items correctly', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByRole('radio', { name: '$0 to' }).check();
    await expect(page.getByText('Novel$')).toBeVisible();
    await expect(page.getByRole('heading', { name: '$14.99' })).toBeVisible();
    await expect(page.getByText('NUS T-shirt$')).toBeVisible();
    await expect(page.getByRole('heading', { name: '$4.99' })).toBeVisible();
  });

test('links to other pages work', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByTestId('category-button').click();
    await page.getByRole('link', { name: 'All Categories' }).click();
    await page.goto('http://localhost:3000/');
    await page.getByRole('link', { name: 'Register' }).click();
    await expect(page.locator('div').filter({ hasText: /^REGISTER FORMREGISTER$/ })).toBeVisible();
    await page.locator('div').filter({ hasText: /^REGISTER FORMREGISTER$/ }).click();
    await page.getByRole('link', { name: 'Login' }).click();
    await expect(page.locator('div').filter({ hasText: /^LOGIN FORMForgot PasswordLOGIN$/ })).toBeVisible();
    await page.goto('http://localhost:3000/');
    await page.getByRole('link', { name: 'Cart' }).click();
    await expect(page.getByRole('heading', { name: 'Cart Items' })).toBeVisible();
    await page.goto('http://localhost:3000/');
    await page.getByRole('link', { name: 'About' }).click();
    await expect(page.getByRole('img', { name: 'contactus' })).toBeVisible();
    await page.goto('http://localhost:3000/');
    await page.getByRole('link', { name: 'Privacy Policy' }).click();
    await expect(page.getByRole('heading', { name: 'Privacy Policy' })).toBeVisible();
    await page.goto('http://localhost:3000/');
    await page.getByRole('link', { name: 'Contact' }).click();
    await expect(page.getByText('CONTACT USFor any query or')).toBeVisible();
  });
