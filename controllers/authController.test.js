import { expect, jest, test } from "@jest/globals";
import { forgotPasswordController, loginController, registerController, testController } from "./authController";
import userModel from "../models/userModel";
import bcrypt from 'bcrypt';
import { comparePassword } from "./../helpers/authHelper";
import jwt from 'jsonwebtoken';

jest.mock("../models/userModel.js");
jest.mock('bcrypt');

/**
 * Register Controller
 */
describe("Register Controller Missing Fields Test" , () => {
  let req, res

  beforeEach(() => {
    req = {
      body: {}
    };    
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });


  test("Returns HTTP 400 with missing name error message", async () => {
    req.body = { email: "cs4218@test.com", password: "password123", phone: "12344000", address: "123 Street", answer: "Football" };
    await registerController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ success: false, error: "Name is Required" });
  });

  test("Returns HTTP 400 with missing email error message", async () => {
    req.body = { name: "John Doe", phone: "12344000", password: "password123", address: "123 Street", answer: "Football" };
    await registerController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ success: false, error: "Email is Required" });
  });

  test("Returns HTTP 400 with missing password error message", async () => {
    req.body = { name: "John Doe", email: "cs4218@test.com", phone: "12344000", address: "123 Street", answer: "Football" };
    await registerController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ success: false, error: "Password is Required" });
  });

  test("Returns HTTP 400 with missing phone number error message", async () => {
    req.body = { name: "John Doe", email: "cs4218@test.com", password: "password123", address: "123 Street", answer: "Football"};
    await registerController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ success: false, error: "Phone no is Required" });
  });

  test("Returns HTTP 400 with missing address error message", async () => {
    req.body = { name: "John Doe", email: "cs4218@test.com", password: "password123", phone: "12344000", answer: "Football"};
    await registerController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ success: false, error: "Address is Required" });
  });

  test("Returns HTTP 400 with missing answer error message", async () => {
    req.body = { name: "John Doe", email: "cs4218@test.com", password: "password123", phone: "12344000", address: "123 Street" };
    await registerController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ success: false, error: "Answer is Required" }); 
  });

})

describe("Register Controller Valid and Invalid inputs Test", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        name: "John Doe",
        email: "cs4218@test.com",
        password: "password123",
        phone: "12344000",
        address: "123 Street",
        answer: "Football",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  test("HTTP 409 with error for existing user", async () => {
    userModel.findOne = jest.fn().mockResolvedValue({ email: req.body.email });

    await registerController(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Already registered. Please login."
    });
  });

  test("user model is saved for valid details", async () => {
    // specify mock functionality
    userModel.findOne = jest.fn().mockResolvedValue(null);
    userModel.prototype.save = jest.fn();

    await registerController(req, res);
    expect(userModel.prototype.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test("Returns HTTP 500 error for exception", async () => {
    // Put an error that will be thrown into Exception clause
    userModel.findOne = jest.fn().mockRejectedValue(new Error("MongoDB issue"));
  
    await registerController(req, res);
    
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error in Registration",
      error: expect.anything(),
    });
  });
});

/** 
 * Login Controller 
 */

describe("Login Controller Test", () => {
  let req, res;
  beforeEach(() => {
    req = {
      body: {
        email: "cs4218@test.com",
        password: "password123",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  test("Returns HTTP 400 with empty email or password error", async () => {
    req.body = {};

    await loginController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Email and password are both required",
    })
  });

  test("Returns HTTP 400 with invalid email or password message", async () => {
    userModel.findOne = jest.fn().mockResolvedValue(null);

    await loginController(req, res);

    expect(userModel.findOne).toHaveBeenCalledWith({ email: req.body.email });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Invalid email or password",
    });
  });
  
  test("Returns HTTP 400 with invalid email or password message", async () => {
    const mockUser = {
      email: "cs4218@test.com",
      password: "wrongpassword"
    };
    req.body = {
      email: "cs4218@test.com",
      password: "password123"
    };
    userModel.findOne = jest.fn().mockResolvedValue(mockUser);
    bcrypt.compare = jest.fn().mockResolvedValue(false);
    const result = await comparePassword(req.body.password, mockUser.password);
    expect(result).toBe(false);
    expect(bcrypt.compare).toHaveBeenCalledWith(req.body.password, mockUser.password);

    await loginController(req, res);

    expect(userModel.findOne).toHaveBeenCalledWith({ email: req.body.email });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Invalid email or password",
    });
  });

  test("Tests successful login with HTTP 200", async () => {
    const mockUser = {
      email: "cs4218@test.com",
      password: "password123"
    };
    req.body = {
      email: "cs4218@test.com",
      password: "password123"
    };
    userModel.findOne = jest.fn().mockResolvedValue(req.body);
    bcrypt.compare = jest.fn().mockResolvedValue(true);
    jwt.sign = jest.fn().mockReturnValue("mocked_token");

    const result = await comparePassword(req.body.password, mockUser.password);

    expect(result).toBe(true);
    expect(bcrypt.compare).toHaveBeenCalledWith(req.body.password, mockUser.password);

    await loginController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      message: "Login successfully",
      token: 'mocked_token'
    }));
  });

  test("Error with HTTP code 500", async () => {
    req.body = {
      email: "cs4218@test.com",
      password: "password123"
    };
    userModel.findOne = jest.fn().mockRejectedValue(new Error("MongoDB issue"));
  
    await loginController(req, res);
    
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error in login",
      error: expect.anything(),
    });
  });
});


describe("Forgot Password Controller Test", () => {
  let req, res;
  beforeEach(() => {
    req = {
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  test("Empty email with status code 400", async () => {
    req.body = {answer: "Football", newPassword: "password124"};
    await forgotPasswordController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      error: "Email is required"
    });
  });

  test("Empty answer with status code 400", async () => {
    req.body = {email: "cs4218@test.com", newPassword: "password124"};
    await forgotPasswordController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      error: "Answer is required"
    });
  });

  test("Empty password with status code 400", async () => {
    req.body = {email: "cs4218@test.com", answer: "Football"};
    await forgotPasswordController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      error: "New Password is required"
    });
  });

  test("Wrong email with status code 404", async () => {
    req.body = {
      email: "invalid@test.com", 
      answer: "Football", newPassword: "password124"
    };
    userModel.findOne = jest.fn().mockResolvedValue(null);

    await forgotPasswordController(req, res);

    expect(userModel.findOne).toHaveBeenCalledWith({ email: req.body.email, answer: req.body.answer });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Wrong Email Or Answer",
    });
  });

  test("Wrong answer with status code 404", async () => {
    req.body = {
      email: "cs4218@test.com", 
      answer: "invalid",
      newPassword: "password124"
    };
    userModel.findOne = jest.fn().mockResolvedValue(null);

    await forgotPasswordController(req, res);

    expect(userModel.findOne).toHaveBeenCalledWith({ email: req.body.email, answer: req.body.answer });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Wrong Email Or Answer"
    });
  });

  test("Successful password reset with status code 200", async () => {
    req.body = {email: "cs4218@test.com", answer: "Football", newPassword: "password124"};
    //userModel.findOne = jest.fn().mockResolvedValue(req.body);
    const hashedPassword = "hashed_password124";

    userModel.findByIdAndUpdate = jest.fn().mockResolvedValue({ ...req.body, password: hashedPassword});

    await forgotPasswordController(req, res);
    
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Password Reset Successfully",
    });
  });

  test("Error with HTTP code 500", async () => {
    req.body = {
      email: "cs4218@test.com",
      answer: "Football",
      newPassword: "password124"
    };
    userModel.findOne = jest.fn().mockRejectedValue(new Error("MongoDB issue"));
  
    await forgotPasswordController(req, res);
    
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error in resetting password",
      error: expect.anything(),
    });
  });
});

describe("Test Controller test", () => {
  let req, res;
  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  test("Check for Protected Routes response", async () => {
    testController(req, res);
    expect(res.status).toHaveBeenCalledWith("Protected Routes");
  });

});
