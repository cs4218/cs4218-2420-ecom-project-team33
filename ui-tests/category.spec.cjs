import { test, expect } from "@playwright/test";

test.describe("Category page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/");
  });

  test("Categories present", async ({ page }) => {
    test.slow();
    await expect(page.getByTestId("category-button")).toBeVisible();

    await page.getByTestId("category-button").click();

    await expect(page.getByTestId("category-dropdown")).toBeVisible();

    await expect(page.getByRole("link", { name: "Electronics" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Book" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Clothing" })).toBeVisible();
    page.getByRole("link", { name: "All Categories" }).click();

    await expect(page).toHaveURL("http://localhost:3000/categories");

    // Wait for page content to be fully loaded
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(5000); // Small buffer to ensure data is rendered

    // Check for category elements with consistent timeouts
    for (const [id, name] of [
      ["66db427fdb0119d9234b27ed", "Electronics"],
      ["66db427fdb0119d9234b27ef", "Book"],
      ["66db427fdb0119d9234b27ee", "Clothing"],
    ]) {
      const element = page.getByTestId(id);
      await expect(element).toBeVisible();
      await expect(element).toContainText(name);
    }
  });

  test("Electronics contain 2 items navigate from dropdown", async ({
    page,
  }) => {
    test.slow();
    await page.getByTestId("category-button").click();
    await page.getByRole("link", { name: "Electronics" }).click();

    await expect(page).toHaveURL("http://localhost:3000/category/electronics");
    await page.waitForTimeout(5000); // Small buffer to ensure data is rendered

    await expect(page.locator("h6")).toContainText("2 result(s) found");
    await expect(
      page.getByRole("heading", { name: "Category - Electronics" })
    ).toBeVisible();

    const electronics = [
      {
        name: "Laptop",
        price: "$1,499.99",
        description: "A powerful laptop...",
      },
      {
        name: "Smartphone",
        price: "$999.99",
        description: "A high-end smartphone...",
      },
    ];

    for (let i = 0; i < electronics.length; i++) {
      const { name, price, description } = electronics[i];

      await expect(page.getByRole("main")).toContainText(name);
      await expect(page.getByRole("main")).toContainText(price);
      await expect(page.getByRole("main")).toContainText(description);
      await expect(page.getByRole("img", { name })).toBeVisible();
      await expect(
        page.getByRole("button", { name: "More Details" }).nth(i)
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "ADD TO CART" }).nth(i)
      ).toBeVisible();
    }
  });

  test("Should display 2 electronics when navigating from categories page", async ({
    page,
  }) => {
    test.slow();
    // Open category dropdown and navigate to "All Categories"
    await page.getByTestId("category-button").click();
    await page.getByRole("link", { name: "All Categories" }).click();

    // Click on Electronics category
    const electronicsCategory = page.getByTestId("66db427fdb0119d9234b27ed");
    await expect(electronicsCategory).toBeVisible();
    await electronicsCategory.click();

    // Verify URL and category page header
    await expect(page).toHaveURL("http://localhost:3000/category/electronics");
    await page.waitForTimeout(5000); // Small buffer to ensure data is rendered

    await expect(page.locator("h6")).toContainText("2 result(s) found");
    await expect(
      page.getByRole("heading", { name: "Category - Electronics" })
    ).toBeVisible();

    // Expected electronics items
    const electronics = [
      {
        name: "Laptop",
        price: "$1,499.99",
        description: "A powerful laptop...",
      },
      {
        name: "Smartphone",
        price: "$999.99",
        description: "A high-end smartphone...",
      },
    ];

    for (let i = 0; i < electronics.length; i++) {
      const { name, price, description } = electronics[i];

      await expect(page.getByRole("main")).toContainText(name);
      await expect(page.getByRole("main")).toContainText(price);
      await expect(page.getByRole("main")).toContainText(description);
      await expect(page.getByRole("img", { name })).toBeVisible();
      await expect(
        page.getByRole("button", { name: "More Details" }).nth(i)
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "ADD TO CART" }).nth(i)
      ).toBeVisible();
    }
  });

  test("should display 3 books when navigating from dropdown", async ({
    page,
  }) => {
    test.slow();
    await page.getByTestId("category-button").click();
    await page.getByRole("link", { name: "Book" }).click();
    await expect(page).toHaveURL("http://localhost:3000/category/book");
    await page.waitForTimeout(5000); // Small buffer to ensure data is rendered

    // Verify category page header
    await expect(page.locator("h6")).toHaveText("3 result(s) found");
    await expect(
      page.getByRole("heading", { name: "Category - Book" })
    ).toBeVisible();

    const books = [
      {
        name: "Textbook",
        price: "$79.99",
        description: "A comprehensive textbook...",
      },
      {
        name: "Novel",
        price: "$14.99",
        description: "A bestselling novel...",
      },
      {
        name: "The Law of Contract in Singapore",
        price: "$54.99",
        description: "A bestselling book in Singapore...",
      },
    ];

    for (let i = 0; i < books.length; i++) {
      const { name, price, description } = books[i];

      await expect(page.getByRole("main")).toContainText(name);
      await expect(page.getByRole("main")).toContainText(price);
      await expect(page.getByRole("main")).toContainText(description);
      await expect(page.getByRole("img", { name })).toBeVisible();
      await expect(
        page.getByRole("button", { name: "More Details" }).nth(i)
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "ADD TO CART" }).nth(i)
      ).toBeVisible();
    }
  });

  test("should display 3 books when navigating from categories page", async ({
    page,
  }) => {
    test.slow();
    await page.getByTestId("category-button").click();
    await page.getByRole("link", { name: "All Categories" }).click();

    await page.getByTestId("66db427fdb0119d9234b27ef").click();
    await page.waitForTimeout(5000); // Small buffer to ensure data is rendered

    // Verify category page header
    await expect(page.locator("h6")).toHaveText("3 result(s) found");
    await expect(
      page.getByRole("heading", { name: "Category - Book" })
    ).toBeVisible();

    const books = [
      {
        name: "Textbook",
        price: "$79.99",
        description: "A comprehensive textbook...",
      },
      {
        name: "Novel",
        price: "$14.99",
        description: "A bestselling novel...",
      },
      {
        name: "The Law of Contract in Singapore",
        price: "$54.99",
        description: "A bestselling book in Singapore...",
      },
    ];

    for (let i = 0; i < books.length; i++) {
      const { name, price, description } = books[i];

      await expect(page.getByRole("main")).toContainText(name);
      await expect(page.getByRole("main")).toContainText(price);
      await expect(page.getByRole("main")).toContainText(description);
      await expect(page.getByRole("img", { name })).toBeVisible();
      await expect(
        page.getByRole("button", { name: "More Details" }).nth(i)
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "ADD TO CART" }).nth(i)
      ).toBeVisible();
    }
  });

  test("should display 1 clothing when navigating from dropdown", async ({
    page,
  }) => {
    test.slow();
    await page.getByTestId("category-button").click();
    await page.getByRole("link", { name: "Clothing" }).click();
    await expect(page).toHaveURL("http://localhost:3000/category/clothing");
    await page.waitForTimeout(5000); // Small buffer to ensure data is rendered

    await expect(
      page.getByRole("heading", { name: "Category - Clothing" })
    ).toBeVisible();
    await expect(page.locator("h6")).toContainText("1 result(s) found");
    await expect(page.getByRole("img", { name: "NUS T-shirt" })).toBeVisible();
    await expect(page.getByRole("main")).toContainText("NUS T-shirt");
    await expect(page.getByRole("main")).toContainText("$4.99");
    await expect(page.getByRole("main")).toContainText(
      "Plain NUS T-shirt for sale..."
    );
    await expect(
      page.getByRole("button", { name: "More Details" })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "ADD TO CART" })
    ).toBeVisible();
  });

  test("should display 1 clothing when navigating from categories page", async ({
    page,
  }) => {
    await page.getByTestId("category-button").click();
    await page.getByRole("link", { name: "All Categories" }).click();
    await page.getByTestId("66db427fdb0119d9234b27ee").click();
    await expect(page).toHaveURL("http://localhost:3000/category/clothing");
    await page.waitForTimeout(5000); // Small buffer to ensure data is rendered

    await expect(
      page.getByRole("heading", { name: "Category - Clothing" })
    ).toBeVisible();
    await expect(page.locator("h6")).toContainText("1 result(s) found");
    await expect(page.getByRole("img", { name: "NUS T-shirt" })).toBeVisible();
    await expect(page.getByRole("main")).toContainText("NUS T-shirt");
    await expect(page.getByRole("main")).toContainText("$4.99");
    await expect(page.getByRole("main")).toContainText(
      "Plain NUS T-shirt for sale..."
    );
    await expect(
      page.getByRole("button", { name: "More Details" })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "ADD TO CART" })
    ).toBeVisible();
  });
});
