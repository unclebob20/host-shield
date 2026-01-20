# Use Node LTS as the base
FROM node:20-slim

# Install system dependencies for PDF processing (required by canvas/pdf-img-convert)
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /usr/src/app

# Copy package files first to leverage Docker cache
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port your API server runs on
EXPOSE 3000

# Start the application
CMD ["node", "src/app.js"]