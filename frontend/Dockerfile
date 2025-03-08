# Use Node.js as the base image
FROM node:latest

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the Next.js port
EXPOSE 3000

# Start the app in development mode
CMD ["npm", "run", "dev"]
