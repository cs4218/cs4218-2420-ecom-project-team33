import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard/admin');
    await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('test@example.com');
    await page.getByRole('textbox', { name: 'Enter Your Email' }).press('Tab');
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('Password');
    await page.getByRole('button', { name: 'LOGIN' }).click();
  });

test('basic elements of the page are present', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Admin Panel' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Create Category' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Create Product' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Products' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Orders' })).toBeVisible();
  await expect(page.getByText('Admin Name : Test Admin Email')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Admin Name : Test' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Admin Email : test@example.com' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Admin Contact :' })).toBeVisible();
});

test('create category menu is able to create, edit and delete categories successfully', async ({ page }) => {
    await page.getByRole('link', { name: 'Create Category' }).click();
    await page.getByTestId('category-form-input').click();
    await page.getByTestId('category-form-input').fill('Furniture');
    await page.getByTestId('category-form-button').click();
    await expect(page.getByRole('cell', { name: 'Furniture' })).toBeVisible();
    await page.getByRole('button', { name: 'Edit' }).nth(3).click();
    await page.getByRole('dialog').getByTestId('category-form-input').click();
    await page.getByRole('dialog').getByTestId('category-form-input').fill('Electronics');
    await page.getByRole('dialog').getByTestId('category-form-button').click();
    await expect(page.getByRole('cell', { name: 'Electronics' })).toBeVisible();
    await page.getByRole('button', { name: 'Delete' }).nth(3).click();
    await expect(page.getByRole('cell', { name: 'Electronics' })).not.toBeVisible();
  });

  test('create product menu is able to create products successfully', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard/admin/create-product');
    await page.locator('#rc_select_0').click();
    await page.getByTitle('Toys').locator('div').click();
    await page.getByRole('textbox', { name: 'write a name' }).click();
    await page.getByRole('textbox', { name: 'write a name' }).fill('Test Toy');
    await page.getByRole('textbox', { name: 'write a description' }).click();
    await page.getByRole('textbox', { name: 'write a description' }).fill('Test Toy');
    await page.getByPlaceholder('write a Price').click();
    await page.getByPlaceholder('write a Price').fill('1');
    await page.getByPlaceholder('write a quantity').click();
    await page.getByPlaceholder('write a quantity').fill('1');
    await page.locator('#rc_select_1').click();
    await page.getByText('Yes').click();
    await page.getByRole('button', { name: 'CREATE PRODUCT' }).click();
    await page.goto('http://localhost:3000/dashboard/admin/products');
    await expect(page.getByRole('main')).toContainText('Test Toy');
  });

  test('orders menu displays elements', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard/admin/orders');
    await expect(page.locator('div').filter({ hasText: /^All Orders$/ })).toBeVisible();
  });

test('users menu displays elements', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard/admin/users');
    await expect(page.locator('div').filter({ hasText: /^All Users$/ })).toBeVisible();
  });
