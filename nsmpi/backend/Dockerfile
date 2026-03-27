# NSMPI Backend Dockerfile

FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript and generate Prisma client
RUN npx prisma generate && npm run build

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
