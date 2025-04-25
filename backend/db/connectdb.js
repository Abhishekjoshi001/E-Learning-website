import mongoose from "mongoose";
import {config as configDotenv} from "dotenv"

configDotenv();

const connectToMongodb = async ()=> {
    try {
        await mongoose.connect(process.env.MONGO_DB_URI);
        console.log("Connected to Mongodb database");
    } catch (error) {
        console.log(`Error in Connecting to database:${error}`)
    }
}

export default connectToMongodb;