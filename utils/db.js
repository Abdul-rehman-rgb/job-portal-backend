import mongoose from "mongoose";

const connectDB = async () => {
    try {
        // MONGO_URI ko .env file se uthayega
        const conn = await mongoose.connect(process.env.MONGO_URI);
        
        console.log(`MongoDB Connected ab agay kaam karsakte hain`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1); // Agar connect nahi hua toh app band ho jaye
    }
};

export default connectDB;