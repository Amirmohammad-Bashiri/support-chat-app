FROM node:22-alpine AS builder

WORKDIR /app

# Copy package management files
COPY package*.json yarn.lock* ./

# Install dependencies
RUN npm install --frozen-lockfile --no-progress || yarn install --frozen-lockfile --no-progress

# Copy project source code
COPY . .

# Build the app for production
RUN npm run build

# Start a new stage from scratch
FROM node:22-alpine AS runner

WORKDIR /app

# Copy the built assets from the builder stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Make port 3000 available to the world outside this container
EXPOSE 3000

# Define the command to run your app using CMD which defines your runtime
CMD ["npm", "run", "start"]