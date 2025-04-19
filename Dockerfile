# -----------------------------------------------
# Stage 1: Build stage
# -----------------------------------------------
FROM node:22-alpine AS builder

# Environment configuration
# Define build arguments for environment variables
ARG NEXT_PUBLIC_HTTP_URL
ARG NEXT_PUBLIC_SOCKET_URL
# Set environment variables for the build process
ENV NEXT_PUBLIC_HTTP_URL=$NEXT_PUBLIC_HTTP_URL
ENV NEXT_PUBLIC_SOCKET_URL=$NEXT_PUBLIC_SOCKET_URL

# Set working directory
WORKDIR /app

# Dependencies installation
# Copy only package files first to leverage Docker cache
COPY package*.json yarn.lock* ./
# Install dependencies with fallback from npm to yarn
RUN npm install --frozen-lockfile --no-progress || yarn install --frozen-lockfile --no-progress

# Application build
# Copy all project files
COPY . .
# Build the Next.js application
RUN npm run build

# -----------------------------------------------
# Stage 2: Production stage
# -----------------------------------------------
FROM node:22-alpine AS runner

# Set working directory
WORKDIR /app

# Copy build artifacts from builder stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Container configuration
# Expose the application port
EXPOSE 3000
# Start the Next.js application
CMD ["npm", "run", "start"]