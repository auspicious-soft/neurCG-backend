##############################################################################
# This file is used to build the Docker image for the backend service.
# It includes the following steps:
# 1. Use a Node.js base image
# 2. Set the working directory inside the container
# 3. Copy package.json and install dependencies
# 4. Copy the rest of the application code
# 5. Expose the port the app runs on
# 6. Run the app using ts-node (point to the .ts entry file)
##############################################################################

# Step 1: Use a Node.js base image
FROM node:18-alpine

# Step 2: Set working directory inside the container
WORKDIR /app

# Step 3: Copy package.json and install dependencies
COPY package*.json ./

RUN npm install

# Step 4: Install ts-node globally
RUN npm install -g ts-node typescript

# Step 5: Copy the rest of the app source code to the container
COPY . . 

# Step 6: Expose the application port
EXPOSE 8000

# Step 7: Run the app using ts-node (point to the .ts entry file)
CMD ["npm", "start"]