import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
    const MONGODB_URI = process.env.MONGO_URI;

    if (!MONGODB_URI) {
        throw new Error("Brak zdefiniowanej zmiennej MONGO_URI w pliku .env!");
    }

    await mongoose.connect(MONGODB_URI);
    console.log("👍 Pomyślnie połączono z MongoDB");
};

export default connectDB;