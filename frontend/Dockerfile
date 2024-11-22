# Gunakan image Node.js resmi
FROM node:18

# Set working directory
WORKDIR /app

# Copy file package.json dan package-lock.json
COPY package*.json ./

# Install dependensi
RUN npm install

# Copy seluruh kode sumber
COPY . .

# Build aplikasi
RUN npm run build

# Jalankan aplikasi
CMD ["npm", "run", "dev"]

# Port yang digunakan aplikasi
EXPOSE 5173