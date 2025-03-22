import { test, expect } from "@playwright/test";

test.describe("Register page missing fields", async () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000");
    await page.getByRole("link", { name: "Register" }).click();
    await expect(page).toHaveURL("http://localhost:3000/register");
    await assertRegisterPage(page);
  });

  test("Register unsuccessfully due to missing name", async ({ page }) => {

    await page.getByRole("textbox", { name: "Enter Your Email" }).click();
    await page
      .getByRole("textbox", { name: "Enter Your Email" })
      .fill("newaccount@test.com ");
    await expect(
      page.getByRole("textbox", { name: "Enter Your Email" })
    ).toHaveValue("newaccount@test.com");

    await page.getByRole("textbox", { name: "Enter Your Password" }).click();
    await page
      .getByRole("textbox", { name: "Enter Your Password" })
      .fill("password123");
    await expect(
      page.getByRole("textbox", { name: "Enter Your Password" })
    ).toHaveValue("password123");

    await page.getByRole("textbox", { name: "Enter Your Phone" }).click();
    await page
      .getByRole("textbox", { name: "Enter Your Phone" })
      .fill("81234567");
    await expect(
      page.getByRole("textbox", { name: "Enter Your Phone" })
    ).toHaveValue("81234567");

    await page.getByRole("textbox", { name: "Enter Your Address" }).click();
    await page
      .getByRole("textbox", { name: "Enter Your Address" })
      .fill("1 Computing Drive");
    await expect(
      page.getByRole("textbox", { name: "Enter Your Address" })
    ).toHaveValue("1 Computing Drive");

    await page.getByRole("textbox", { name: "What is your favorite sport" }).click();
    await page
      .getByRole("textbox", { name: "What is your favorite sport" })
      .fill("football");
    await expect(
      page.getByRole("textbox", { name: "What is your favorite sport" })
    ).toHaveValue("football");
    await page.getByRole("button", { name: "REGISTER" }).click();
    await expect(page).toHaveURL("http://localhost:3000/register");
  });

  test("Register unsuccessfully due to missing email", async ({ page }) => {

    await page.getByRole("textbox", { name: "Enter Your Name" }).click();
    await page
      .getByRole("textbox", { name: "Enter Your Name" })
      .fill("New Account");
    await expect(
      page.getByRole("textbox", { name: "Enter Your Name" })
    ).toHaveValue("New Account");

    await page.getByRole("textbox", { name: "Enter Your Password" }).click();
    await page
      .getByRole("textbox", { name: "Enter Your Password" })
      .fill("password123");
    await expect(
      page.getByRole("textbox", { name: "Enter Your Password" })
    ).toHaveValue("password123");

    await page.getByRole("textbox", { name: "Enter Your Phone" }).click();
    await page
      .getByRole("textbox", { name: "Enter Your Phone" })
      .fill("81234567");
    await expect(
      page.getByRole("textbox", { name: "Enter Your Phone" })
    ).toHaveValue("81234567");

    await page.getByRole("textbox", { name: "Enter Your Address" }).click();
    await page
      .getByRole("textbox", { name: "Enter Your Address" })
      .fill("1 Computing Drive");
    await expect(
      page.getByRole("textbox", { name: "Enter Your Address" })
    ).toHaveValue("1 Computing Drive");

    await page.getByRole("textbox", { name: "What is your favorite sport" }).click();
    await page
      .getByRole("textbox", { name: "What is your favorite sport" })
      .fill("football");
    await expect(
      page.getByRole("textbox", { name: "What is your favorite sport" })
    ).toHaveValue("football");
    await page.getByRole("button", { name: "REGISTER" }).click();
    await expect(page).toHaveURL("http://localhost:3000/register");
  });

  test("Register unsuccessfully due to missing password", async ({ page }) => {

    await page.getByRole("textbox", { name: "Enter Your Name" }).click();
    await page
      .getByRole("textbox", { name: "Enter Your Name" })
      .fill("New Account");
    await expect(
      page.getByRole("textbox", { name: "Enter Your Name" })
    ).toHaveValue("New Account");

    await page.getByRole("textbox", { name: "Enter Your Email" }).click();
    await page
      .getByRole("textbox", { name: "Enter Your Email" })
      .fill("newaccount@test.com ");
    await expect(
      page.getByRole("textbox", { name: "Enter Your Email" })
    ).toHaveValue("newaccount@test.com");

    await page.getByRole("textbox", { name: "Enter Your Phone" }).click();
    await page
      .getByRole("textbox", { name: "Enter Your Phone" })
      .fill("81234567");
    await expect(
      page.getByRole("textbox", { name: "Enter Your Phone" })
    ).toHaveValue("81234567");

    await page.getByRole("textbox", { name: "Enter Your Address" }).click();
    await page
      .getByRole("textbox", { name: "Enter Your Address" })
      .fill("1 Computing Drive");
    await expect(
      page.getByRole("textbox", { name: "Enter Your Address" })
    ).toHaveValue("1 Computing Drive");

    await page.getByRole("textbox", { name: "What is your favorite sport" }).click();
    await page
      .getByRole("textbox", { name: "What is your favorite sport" })
      .fill("football");
    await expect(
      page.getByRole("textbox", { name: "What is your favorite sport" })
    ).toHaveValue("football");
    await page.getByRole("button", { name: "REGISTER" }).click();
    await expect(page).toHaveURL("http://localhost:3000/register");
  });

  test("Register unsuccessfully due to missing phone number", async ({ page }) => {

    await page.getByRole("textbox", { name: "Enter Your Name" }).click();
    await page
      .getByRole("textbox", { name: "Enter Your Name" })
      .fill("New Account");
    await expect(
      page.getByRole("textbox", { name: "Enter Your Name" })
    ).toHaveValue("New Account");

    await page.getByRole("textbox", { name: "Enter Your Email" }).click();
    await page
      .getByRole("textbox", { name: "Enter Your Email" })
      .fill("newaccount@test.com ");
    await expect(
      page.getByRole("textbox", { name: "Enter Your Email" })
    ).toHaveValue("newaccount@test.com");

    await page.getByRole("textbox", { name: "Enter Your Password" }).click();
    await page
      .getByRole("textbox", { name: "Enter Your Password" })
      .fill("password123");
    await expect(
      page.getByRole("textbox", { name: "Enter Your Password" })
    ).toHaveValue("password123");

    await page.getByRole("textbox", { name: "Enter Your Address" }).click();
    await page
      .getByRole("textbox", { name: "Enter Your Address" })
      .fill("1 Computing Drive");
    await expect(
      page.getByRole("textbox", { name: "Enter Your Address" })
    ).toHaveValue("1 Computing Drive");

    await page.getByRole("textbox", { name: "What is your favorite sport" }).click();
    await page
      .getByRole("textbox", { name: "What is your favorite sport" })
      .fill("football");
    await expect(
      page.getByRole("textbox", { name: "What is your favorite sport" })
    ).toHaveValue("football");
    await page.getByRole("button", { name: "REGISTER" }).click();
    await expect(page).toHaveURL("http://localhost:3000/register");
  });

  test("Register unsuccessfully due to missing address", async ({ page }) => {

    await page.getByRole("textbox", { name: "Enter Your Name" }).click();
    await page
      .getByRole("textbox", { name: "Enter Your Name" })
      .fill("New Account");
    await expect(
      page.getByRole("textbox", { name: "Enter Your Name" })
    ).toHaveValue("New Account");

    await page.getByRole("textbox", { name: "Enter Your Email" }).click();
    await page
      .getByRole("textbox", { name: "Enter Your Email" })
      .fill("newaccount@test.com ");
    await expect(
      page.getByRole("textbox", { name: "Enter Your Email" })
    ).toHaveValue("newaccount@test.com");

    await page.getByRole("textbox", { name: "Enter Your Password" }).click();
    await page
      .getByRole("textbox", { name: "Enter Your Password" })
      .fill("password123");
    await expect(
      page.getByRole("textbox", { name: "Enter Your Password" })
    ).toHaveValue("password123");

    await page.getByRole("textbox", { name: "Enter Your Phone" }).click();
    await page
      .getByRole("textbox", { name: "Enter Your Phone" })
      .fill("81234567");
    await expect(
      page.getByRole("textbox", { name: "Enter Your Phone" })
    ).toHaveValue("81234567");

    await page.getByRole("textbox", { name: "What is your favorite sport" }).click();
    await page
      .getByRole("textbox", { name: "What is your favorite sport" })
      .fill("football");
    await expect(
      page.getByRole("textbox", { name: "What is your favorite sport" })
    ).toHaveValue("football");
    await page.getByRole("button", { name: "REGISTER" }).click();
    await expect(page).toHaveURL("http://localhost:3000/register");
  });

  test("Register unsuccessfully due to missing sport", async ({ page }) => {

    await page.getByRole("textbox", { name: "Enter Your Name" }).click();
    await page
      .getByRole("textbox", { name: "Enter Your Name" })
      .fill("New Account");
    await expect(
      page.getByRole("textbox", { name: "Enter Your Name" })
    ).toHaveValue("New Account");

    await page.getByRole("textbox", { name: "Enter Your Email" }).click();
    await page
      .getByRole("textbox", { name: "Enter Your Email" })
      .fill("newaccount@test.com ");
    await expect(
      page.getByRole("textbox", { name: "Enter Your Email" })
    ).toHaveValue("newaccount@test.com");

    await page.getByRole("textbox", { name: "Enter Your Password" }).click();
    await page
      .getByRole("textbox", { name: "Enter Your Password" })
      .fill("password123");
    await expect(
      page.getByRole("textbox", { name: "Enter Your Password" })
    ).toHaveValue("password123");

    await page.getByRole("textbox", { name: "Enter Your Phone" }).click();
    await page
      .getByRole("textbox", { name: "Enter Your Phone" })
      .fill("81234567");
    await expect(
      page.getByRole("textbox", { name: "Enter Your Phone" })
    ).toHaveValue("81234567");

    await page.getByRole("textbox", { name: "Enter Your Address" }).click();
    await page
      .getByRole("textbox", { name: "Enter Your Address" })
      .fill("1 Computing Drive");
    await expect(
      page.getByRole("textbox", { name: "Enter Your Address" })
    ).toHaveValue("1 Computing Drive");

    await page.getByRole("button", { name: "REGISTER" }).click();
    await expect(page).toHaveURL("http://localhost:3000/register");
  });
});

test.describe("Register page user already exists", async () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000");
  });

  test("Register unsuccessfully as user already exists", async ({ page }) => {
    await page.getByRole("link", { name: "Register" }).click();
    await expect(page).toHaveURL("http://localhost:3000/register");
    await assertRegisterPage(page);

    await page.getByRole("textbox", { name: "Enter Your Name" }).click();
    await page
      .getByRole("textbox", { name: "Enter Your Name" })
      .fill("New Account");
    await expect(
      page.getByRole("textbox", { name: "Enter Your Name" })
    ).toHaveValue("New Account");

    await page.getByRole("textbox", { name: "Enter Your Email" }).click();
    await page
      .getByRole("textbox", { name: "Enter Your Email" })
      .fill("cs4218@test.com ");
    await expect(
      page.getByRole("textbox", { name: "Enter Your Email" })
    ).toHaveValue("cs4218@test.com");

    await page.getByRole("textbox", { name: "Enter Your Password" }).click();
    await page
      .getByRole("textbox", { name: "Enter Your Password" })
      .fill("password123");
    await expect(
      page.getByRole("textbox", { name: "Enter Your Password" })
    ).toHaveValue("password123");

    await page.getByRole("textbox", { name: "Enter Your Phone" }).click();
    await page
      .getByRole("textbox", { name: "Enter Your Phone" })
      .fill("81234567");
    await expect(
      page.getByRole("textbox", { name: "Enter Your Phone" })
    ).toHaveValue("81234567");

    await page.getByRole("textbox", { name: "Enter Your Address" }).click();
    await page
      .getByRole("textbox", { name: "Enter Your Address" })
      .fill("1 Computing Drive");
    await expect(
      page.getByRole("textbox", { name: "Enter Your Address" })
    ).toHaveValue("1 Computing Drive");

    await page.getByRole("textbox", { name: "What is your favorite sport" }).click();
    await page
      .getByRole("textbox", { name: "What is your favorite sport" })
      .fill("football");
    await expect(
      page.getByRole("textbox", { name: "What is your favorite sport" })
    ).toHaveValue("football");

    await page.getByRole("button", { name: "REGISTER" }).click();
    const errorMessage = page.locator('div[role="status"][aria-live="polite"]');
    await expect(errorMessage).toHaveText('User already exists! Please use a new email');
    await expect(page).toHaveURL("http://localhost:3000/register");
  });
});

test.describe("Register page successful", async () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000");
  });

  test("Register successfully", async ({ page }) => {
    await page.getByRole("link", { name: "Register" }).click();
    await expect(page).toHaveURL("http://localhost:3000/register");
    await assertRegisterPage(page);

    await page.getByRole("textbox", { name: "Enter Your Name" }).click();
    await page
      .getByRole("textbox", { name: "Enter Your Name" })
      .fill("New Account");
    await expect(
      page.getByRole("textbox", { name: "Enter Your Name" })
    ).toHaveValue("New Account");

    await page.getByRole("textbox", { name: "Enter Your Email" }).click();
    await page
      .getByRole("textbox", { name: "Enter Your Email" })
      .fill("newaccount@test.com ");
    await expect(
      page.getByRole("textbox", { name: "Enter Your Email" })
    ).toHaveValue("newaccount@test.com");

    await page.getByRole("textbox", { name: "Enter Your Password" }).click();
    await page
      .getByRole("textbox", { name: "Enter Your Password" })
      .fill("password123");
    await expect(
      page.getByRole("textbox", { name: "Enter Your Password" })
    ).toHaveValue("password123");

    await page.getByRole("textbox", { name: "Enter Your Phone" }).click();
    await page
      .getByRole("textbox", { name: "Enter Your Phone" })
      .fill("81234567");
    await expect(
      page.getByRole("textbox", { name: "Enter Your Phone" })
    ).toHaveValue("81234567");

    await page.getByRole("textbox", { name: "Enter Your Address" }).click();
    await page
      .getByRole("textbox", { name: "Enter Your Address" })
      .fill("1 Computing Drive");
    await expect(
      page.getByRole("textbox", { name: "Enter Your Address" })
    ).toHaveValue("1 Computing Drive");

    await page.getByRole("textbox", { name: "What is your favorite sport" }).click();
    await page
      .getByRole("textbox", { name: "What is your favorite sport" })
      .fill("football");
    await expect(
      page.getByRole("textbox", { name: "What is your favorite sport" })
    ).toHaveValue("football");
    await page.getByRole("button", { name: "REGISTER" }).click();
    await expect(page).toHaveURL("http://localhost:3000/login");
  });
});

async function assertRegisterPage(page) {
  await expect(
    page.getByRole("textbox", { name: "Enter Your Name" })
  ).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "Enter Your Email" })
  ).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "Enter Your Password" })
  ).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "Enter Your Phone" })
  ).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "Enter Your Address" })
  ).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "What is your favorite sport" })
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "REGISTER" })
  ).toBeVisible();
  await expect(page.getByText("REGISTER FORM")).toBeVisible();
}