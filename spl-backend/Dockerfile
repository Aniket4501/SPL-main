# Use Node.js 20 LTS
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy Prisma schema (must be before npm ci since postinstall runs prisma generate)
COPY prisma ./prisma

# Install all dependencies (including devDependencies for Prisma CLI)
# This will automatically run postinstall script which generates Prisma Client
RUN npm ci

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose port 5000
EXPOSE 5000

# Start the application
CMD ["npm", "start"]

