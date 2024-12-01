# Use an official Node.js image as the base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy only the package.json and package-lock.json first for dependency installation
COPY package*.json ./

# Install dependencies
RUN npm install 

# Copy the rest of the application source code
COPY . .

# Expose the service's port
EXPOSE 50052


# Command to run the application
CMD ["npm", "start"]
