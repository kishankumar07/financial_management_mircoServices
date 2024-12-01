# Use Node.js LTS version as the base image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the port the API Gateway listens on
EXPOSE 3000

# Start the API Gateway
CMD ["npm", "run", "start"]
