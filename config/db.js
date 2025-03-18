import mongoose from "mongoose";
import colors from "colors";
import { MongoMemoryServer } from "mongodb-memory-server";
import { USERS, PRODUCTS, ORDERS, CATEGORIES } from "../test-data/util.js";

const connectDB = async () => {
  if (process.env.DEV_MODE === "development") {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URL);
      console.log(
        `Connected To Mongodb Database ${conn.connection.host}`.bgMagenta.white
      );
    } catch (error) {
      console.log(`Error in Mongodb ${error}`.bgRed.white);
    }
  } else {
    const testDB = await MongoMemoryServer.create();
    const mongoUri = testDB.getUri();
    await mongoose.connect(mongoUri);
    await mongoose.connection.collection("users").insertMany(USERS);
    await mongoose.connection.collection("categories").insertMany(CATEGORIES);
    await mongoose.connection.collection("products").insertMany(PRODUCTS);
    await mongoose.connection.collection("orders").insertOne(ORDERS);
  }
};

export default connectDB;
