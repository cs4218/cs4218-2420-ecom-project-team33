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

    // Confirm that we stay logged in when we refresh the page
    await page.reload();
    await expect(page).toHaveURL("http://localhost:3000");

    await expect(page.getByText("All ProductsNovel$14.99A")).toBeVisible();
    await expect(
      page.getByText(
        "Filter By Category"
      )
    ).toBeVisible();
    await expect(
      page.getByRole("checkbox",
        { name: "Electronics" }
      )
    ).toBeVisible();
    await expect(
      page.getByRole("checkbox",
        { name: "Book" } 
      )
    ).toBeVisible();
    await expect(
      page.getByRole("checkbox",
        { name: "Clothing" } 
      )
    ).toBeVisible();

    await expect(
      page.getByText(
        "Filter By Price"
      )
    ).toBeVisible();
    await expect(
      page.getByRole("radio",
        { name: "$0 to 19" }
      )
    ).toBeVisible();
    await expect(
      page.getByRole("radio",
        { name: "$20 to 39" } 
      )
    ).toBeVisible();
    await expect(
      page.getByRole("radio",
        { name: "$40 to 59" } 
      )
    ).toBeVisible();
    await expect(
      page.getByRole("radio",
        { name: "$60 to 79" } 
      )
    ).toBeVisible();
    await expect(
      page.getByRole("radio",
        { name: "$80 to 99" } 
      )
    ).toBeVisible();
    await expect(
      page.getByRole("radio",
        { name: "$100 or more" } 
      )
    ).toBeVisible();

    await expect(page.getByRole("img", { name: "bannerimage" })).toBeVisible();
    await expect(
      page.getByText(
        "🛒 Virtual Vault"
      )
    ).toBeVisible();
    await expect(
      page.getByText(
        "Search"
      )
    ).toBeVisible();
    await expect(
      page.getByText(
        "Home"
      )
    ).toBeVisible();
    await expect(
      page.getByRole(
        "link",
        { name: "CATEGORIES" }
      )
    ).toBeVisible();
    await expect(
      page.getByRole(
        "link",
        { name: "CART" }
      )
    ).toBeVisible();
    await expect(
      page.getByRole(
        "button",
        { name: "CS 4218 Test Account" }
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
    await expect(page.getByText("Invalid email or password")).toBeVisible();
    await expect(page).toHaveURL("http://localhost:3000/login");
  });
});

test("Invalid username", async ({page}) => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/");
  });

  await page.getByRole("link", { name: "Login" }).click();
  await expect(page).toHaveURL("http://localhost:3000/login");
  await assertLoginPage(page);
  await page.getByRole("button", { name: "LOGIN" }).click();
  await expect(page).toHaveURL("http://localhost:3000/login");

  await page.getByRole("textbox", { name: "Enter Your Email" }).click();
  await page.getByRole("textbox", { name: "Enter Your Email" }).fill("invalid@email");
  await page.getByRole("button", { name: "LOGIN" }).click();
  await expect(page).toHaveURL("http://localhost:3000/login");

  await page.getByRole("textbox", { name: "Enter Your Password" }).fill("cs4218@test.com");
  await page.getByRole("button", { name: "LOGIN" }).click();
  await expect(page.getByText("Invalid email or password")).toBeVisible();
  await expect(page).toHaveURL("http://localhost:3000/login");
});

test("Invalid password", async ({page}) => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/");
  });

  await page.getByRole("link", { name: "Login" }).click();
  await expect(page).toHaveURL("http://localhost:3000/login");
  await assertLoginPage(page);
  await page.getByRole("button", { name: "LOGIN" }).click();
  await expect(page).toHaveURL("http://localhost:3000/login");

  await page.getByRole("textbox", { name: "Enter Your Email" }).click();
  await page.getByRole("textbox", { name: "Enter Your Email" }).fill("cs4218@test.com");
  await page.getByRole("button", { name: "LOGIN" }).click();
  await expect(page).toHaveURL("http://localhost:3000/login");

  await page.getByRole("textbox", { name: "Enter Your Password" }).fill("invalidpassword");
  await page.getByRole("button", { name: "LOGIN" }).click();
  await expect(page.getByText("Invalid email or password")).toBeVisible();
  await expect(page).toHaveURL("http://localhost:3000/login");
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
