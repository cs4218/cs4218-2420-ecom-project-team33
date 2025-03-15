import { test, expect } from "@playwright/test";

test.describe("Login page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/");
  });

  test("login successful", async ({ page }) => {
    await page.getByRole("link", { name: "Login" }).click();
    await expect(page).toHaveURL("http://localhost:3000/login");
    await assertLoginPage(page);
    await page.getByRole("textbox", { name: "Enter Your Email" }).click();
    await page
      .getByRole("textbox", { name: "Enter Your Email" })
      .fill("cs4218@test.com");
    await expect(
      page.getByRole("textbox", { name: "Enter Your Email" })
    ).toHaveValue("cs4218@test.com");
    await page.getByRole("textbox", { name: "Enter Your Password" }).click();
    await page
      .getByRole("textbox", { name: "Enter Your Password" })
      .fill("cs4218@test.com");
    await expect(
      page.getByRole("textbox", { name: "Enter Your Password" })
    ).toHaveValue("cs4218@test.com");
    await page.getByRole("button", { name: "LOGIN" }).click();
    await expect(page).toHaveURL("http://localhost:3000/");
    await expect(page.getByText("All ProductsNovel$14.99A")).toBeVisible();
    await expect(
      page.getByText(
        "Filter By CategoryElectronicsBookClothingtestFilter By Price$0 to 19$20 to 39$"
      )
    ).toBeVisible();
    await expect(page.getByRole("img", { name: "bannerimage" })).toBeVisible();
    await expect(
      page.getByText(
        "🛒 Virtual VaultSearchHomeCategoriesAll CategoriesElectronicsBookClothingtestCS"
      )
    ).toBeVisible();
  });

  test("Invalid login credentials", async ({ page }) => {
    await page.getByRole("link", { name: "Login" }).click();
    await expect(page).toHaveURL("http://localhost:3000/login");
    await assertLoginPage(page);
    await page.getByRole("button", { name: "LOGIN" }).click();
    await expect(page).toHaveURL("http://localhost:3000/login");

    await page.getByRole("textbox", { name: "Enter Your Email" }).click();
    await page
      .getByRole("textbox", { name: "Enter Your Email" })
      .fill("invalid@email");
    await page.getByRole("button", { name: "LOGIN" }).click();
    await expect(page).toHaveURL("http://localhost:3000/login");

    await page
      .getByRole("textbox", { name: "Enter Your Password" })
      .fill("invalidpassword");
    await page.getByRole("button", { name: "LOGIN" }).click();
    await expect(page.getByText("Something went wrong")).toBeVisible();
    await expect(page).toHaveURL("http://localhost:3000/login");
  });
});

test.describe("Forget password page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/");
  });

  test("Forget password page do not exist", async ({ page }) => {
    await page.getByRole("link", { name: "Login" }).click();
    await expect(page).toHaveURL("http://localhost:3000/login");
    await assertLoginPage(page);
    await page.getByRole("button", { name: "Forgot Password" }).click();
    await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Oops ! Page Not Found" })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Go back home" })
    ).toBeVisible();
    await page.getByRole("link", { name: "Go back home" }).click();
  });
});

async function assertLoginPage(page) {
  await expect(
    page.getByRole("textbox", { name: "Enter Your Email" })
  ).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "Enter Your Password" })
  ).toBeVisible();
  await expect(page.getByText("LOGIN FORMForgot PasswordLOGIN")).toBeVisible();
  await expect(page.getByRole("heading", { name: "LOGIN FORM" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Forgot Password" })
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "LOGIN" })).toBeVisible();
}
