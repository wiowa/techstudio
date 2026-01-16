# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev for build)
RUN npm ci

# Copy source code
COPY . .

# Build the API and prune dependencies
RUN npx nx build api --configuration=production && npx nx run api:prune

# Production stage
FROM node:22-alpine AS runner

WORKDIR /app

# Copy pruned package files and install production dependencies
COPY --from=builder /app/apps/api/dist/package*.json ./
RUN npm ci --omit=dev

# Copy built application
COPY --from=builder /app/apps/api/dist ./

# Copy workspace modules if any exist
RUN mkdir -p workspace_modules
COPY --from=builder /app/apps/api/dist/workspace_module[s] ./workspace_modules/

# Expose port
EXPOSE 3333

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3333

# Start the application
CMD ["node", "main.js"]
