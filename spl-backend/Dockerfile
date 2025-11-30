# Use Node.js 20 LTS
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files (including package-lock.json if it exists)
COPY package.json ./
COPY package-lock.json* ./

# Copy Prisma schema (must be before npm install since postinstall runs prisma generate)
COPY prisma ./prisma

# Install all dependencies (including devDependencies for Prisma CLI)
# This will automatically run postinstall script which generates Prisma Client
RUN npm install

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose port 8080
EXPOSE 8080

# Start the application
CMD ["npm", "start"]

