# 1. Use official Node.js image
FROM node:18-alpine

# 2. Set app directory inside the container
WORKDIR /app

# 3. Copy package.json & package-lock.json first
COPY package*.json ./

# 4. Install dependencies
RUN npm install --production

# 5. Copy rest of your project files
COPY . .

# 6. Expose your app port
EXPOSE 8080

# 7. Start your app
CMD ["node", "server.js"]
