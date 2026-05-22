FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy source code (config.env is NOT copied; env vars come from docker-compose)
COPY . .

EXPOSE 5001

CMD ["node", "server.js"]
