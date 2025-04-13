import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import productModel from '../models/productModel.js';
import categoryModel from '../models/categoryModel.js';
import fs from 'fs';
import slugify from 'slugify';
import path from 'path';

dotenv.config({ path: '../.env' });
console.log("DEV_MODE =", process.env.DEV_MODE);
console.log("MONGO_URL =", process.env.MONGO_URL);

async function generateVolumeTestData() {
  try {
    console.log('Connecting to MongoDB using connectDB()...');
    await connectDB();
    console.log('Connected to MongoDB successfully');

    console.log('Creating categories...');
    const categoryPromises = Array.from({ length: 20 }, (_, i) => {
      const name = `Test Category ${i + 1}`;
      return new categoryModel({
        name,
        slug: slugify(name),
      }).save();
    });

    const savedCategories = await Promise.all(categoryPromises);
    console.log(`Successfully saved ${savedCategories.length} categories`);

    console.log('Generating products...');
    const products = [];

    for (let i = 1; i <= 500; i++) {
      const name = `Volume Test Product ${i}`;
      const categoryIndex = Math.floor(Math.random() * savedCategories.length);

      products.push({
        name,
        slug: slugify(name),
        description: `Detailed description for volume test product ${i}. This product is designed for volume testing purposes and includes multiple features for testing database performance.`,
        price: Math.floor(Math.random() * 500) + 10,
        category: savedCategories[categoryIndex]._id,
        quantity: Math.floor(Math.random() * 100) + 1,
        shipping: Math.random() > 0.5,
        photo: {
          data: Buffer.from(`test-photo-${i}`),
          contentType: 'image/jpeg',
        },
      });
    }

    await productModel.insertMany(products);
    console.log(`Successfully saved ${products.length} products`);

    // Export CSV files for JMeter testing
    const outputDir = './test-output';
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    console.log('Creating CSV files for JMeter...');

    console.log('Generating product-slugs.csv...');
    const productSlugs = await productModel.find({}).select('slug');
    fs.writeFileSync(
      path.join(outputDir, 'product-slugs.csv'),
      'productSlug\n' + productSlugs.map((p) => p.slug).join('\n')
    );

    console.log('Generating productId.csv...');
    const productIds = await productModel.find({}).select('_id');
    fs.writeFileSync(
      path.join(outputDir, 'productId.csv'),
      'productId\n' + productIds.map((p) => p._id.toString()).join('\n')
    );

    console.log('Generating category-slugs.csv...');
    const categorySlugs = await categoryModel.find({}).select('slug');
    fs.writeFileSync(
      path.join(outputDir, 'category-slugs.csv'),
      'categorySlug\n' + categorySlugs.map((c) => c.slug).join('\n')
    );

    console.log('Generating categoryId.csv...');
    const categoryIds = await categoryModel.find({}).select('_id');
    fs.writeFileSync(
      path.join(outputDir, 'categoryId.csv'),
      'categoryId\n' + categoryIds.map((c) => c._id.toString()).join('\n')
    );

    console.log('Volume test data and CSV files generated successfully!');
  } catch (error) {
    console.error('Error generating volume test data:', error);
  } finally {
    console.log('Closing database connection...');
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

generateVolumeTestData();
