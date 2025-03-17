# Stage 2: Production image
FROM node:18-alpine
WORKDIR /app

# Copy only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy the built code from the builder stage
COPY --from=builder /app/dist ./dist

# Expose the port that your NestJS application listens on
EXPOSE 3000

# Increase Node memory to 4GB and start the app
CMD ["node", "--max-old-space-size=4096", "dist/main.js"]
