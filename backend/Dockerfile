# Stage 1: Build Stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /home/node/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Build the TypeScript application
RUN npm run build

# Stage 2: Production Stage
FROM node:20-alpine

# Set working directory
WORKDIR /home/node/app

# Copy only the built files and dependencies from builder
COPY --from=builder /home/node/app/dist ./dist
COPY --from=builder /home/node/app/node_modules ./node_modules
COPY package*.json ./

# Set environment variables
ENV PORT=3000

# Expose the application's port
EXPOSE 3000

# Start the Express.js server
CMD ["node", "dist/index.js"]