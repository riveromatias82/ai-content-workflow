# Development stage
FROM node:18-alpine AS development

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies)
RUN npm install

# Copy source code
COPY . .

# Expose Nest.js dev server
EXPOSE 4000

# Start in development mode with debugging
CMD ["npm", "run", "start:dev"]
