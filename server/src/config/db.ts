import mongoose from 'mongoose';

export async function connectDB(): Promise<void> {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/project_zenith';
    
    mongoose.connection.on('connected', () => {
      console.log('MongoDB successfully connected.');
    });

    mongoose.connection.on('error', (err) => {
      console.error(`MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected.');
    });

    await mongoose.connect(mongoUri);
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}
