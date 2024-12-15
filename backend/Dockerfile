# Use the Node.js image for Node 18
FROM node:20

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies (both dev and prod dependencies)
RUN npm install

# Copy the rest of the application code
COPY . .

# Install TypeScript if it's not installed as a global dependency in your container (optional)
RUN npm install -g typescript

# Copy the environment variables file
COPY ./.env.example ./.env

# Set the environment variable to production
ENV PORT=3000

# Expose port 3000 for the application
EXPOSE 3000

# Set the default command to run the app in development mode using tsx
CMD ["npm", "run", "dev"]
