FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy source files
COPY . .

# Build frontend
RUN npm run build

# For development, we'll override this with a watch command
CMD ["npm", "run", "build:watch"]