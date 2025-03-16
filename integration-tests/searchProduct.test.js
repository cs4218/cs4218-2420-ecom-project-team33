// import { test, describe } from "@jest/globals";

// const TEST_USER = {
// name: "CS 4218 Test Account",
// email: "cs4218@test.com",
// password: "cs4218@test.com",
// phone: "81234567",
// address: "1 Computing Drive",
// };

// describe("Search Product Endpoint '/search/:keyword'", () => {

//   test("should handle valid request", async () => {
//     const response = await Search("laptop");
//     console.log(response);
//   });

// });

// async function Register() {
//   await POST("http://localhost:6060/api/v1/auth/register", TEST_USER);
// }

// async function Login() {
//   return await POST("http://localhost:6060/api/v1/auth/login", { email: TEST_USER.email, password: TEST_USER.password });
// }

// async function Search(product) {
//   return await GET(`http://localhost:6060/api/v1/product/search/${product}`);
// }

// async function POST(endpoint, body) {
//   return await fetch(endpoint, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(body),
//   }).then(res => res.json());
// };

// async function GET(endpoint) {
//   return await fetch(endpoint, {
//     method: "GET",
//     headers: {
//       "Content-Type": "application/json",
//     },
//   }).then(res => res.json());
// };