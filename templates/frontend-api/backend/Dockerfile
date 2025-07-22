FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy source files
COPY . .

# Build backend
RUN npm run build

EXPOSE {{apiPort}}
EXPOSE 9230

# For development, we use ts-node with watch mode
# For production, we use the compiled JS
CMD ["node", "--inspect=0.0.0.0:9230", "dist/server.js"]