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
