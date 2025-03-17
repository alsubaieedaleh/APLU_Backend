# Stage 2: Production image
FROM node:18-alpine
WORKDIR /app

# Set environment variable to increase Node's memory limit to 4GB
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Copy only production dependencies
COPY package*.json ./
RUN pnpm ci --only=production

# Copy the built code from the builder stage
COPY --from=builder /app/dist ./dist

# Expose the port that your NestJS application listens on
EXPOSE 3000

# Start the application
CMD ["node", "dist/main.js"]
