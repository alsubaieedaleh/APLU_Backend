# Stage 1: Build the application
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) and install all dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the source code and build the application
COPY . .
RUN npm run build

# Stage 2: Production image
FROM node:18-alpine
WORKDIR /app

# Copy only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy the built code from the builder stage
COPY --from=builder /app/dist ./dist

# Expose the port that your NestJS application listens on (adjust if needed)
EXPOSE 3000

# Command to run your app
CMD ["node", "dist/main.js"]
