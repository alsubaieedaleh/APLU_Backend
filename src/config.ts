export const config = {
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/app',
  jwtSecret: process.env.JWT_SECRET || 'secret',
}; 