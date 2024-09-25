import { configDotenv } from "dotenv";
import mongoose from "mongoose";

configDotenv();

const connectDB = async () => {
  const maxRetries = 5; // Number of retry attempts
  let attempt = 0;

  const connectWithRetry = async () => {
    try {
      await mongoose.connect(process.env.MONGO_URL as string);
      console.log("MongoDB connected 🚀");
    } catch (error: any) {
      attempt += 1;
      console.error(`MongoDB connection attempt ${attempt} failed: ${error.message}`);
 
      if (attempt < maxRetries) {
        console.log(`Retrying in 5 seconds... (Attempt ${attempt + 1} of ${maxRetries})`);
        setTimeout(connectWithRetry, 5000); // Retry after 5 seconds
      } 
      else {
        console.error("Max retry attempts reached. Exiting...");
        process.exit(1);
      }
    }
  };

  if (!process.env.MONGO_URL) {
    console.error("MONGO_URL is not defined in the environment variables.");
    process.exit(1);
  }

  connectWithRetry();
};

export default connectDB;