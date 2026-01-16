# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev for build)
RUN npm ci

# Copy source code
COPY . .

# Build the API with Nx
RUN npx nx build api --configuration=production

# Production stage
FROM node:22-alpine AS runner

WORKDIR /app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built application
COPY --from=builder /app/apps/api/dist ./dist

# Expose port
EXPOSE 3333

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3333

# Start the application
CMD ["node", "dist/main.js"]
