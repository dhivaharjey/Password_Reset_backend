import mongoose from "mongoose";
import dotenv from "dotenv";
import express from "express";

dotenv.config();
const dbConnection = process.env.MONGODB_CONNECTION_STRING;

const connectDb = async () => {
  try {
    const connection = await mongoose.connect(dbConnection);
    console.log("DB is connected ");
    return connection;
  } catch (error) {
    console.log(error);
  }
};
export default connectDb;
