FROM node:20-alpine

WORKDIR /app

# ก๊อปปี้ไฟล์ package.json เพื่อติดตั้ง library ก่อน
COPY package*.json ./
RUN npm install

# ก๊อปปี้โค้ดทั้งหมดตามเข้าไป
COPY . .

# Vue/Vite ปกติใช้ Port 5173
EXPOSE 5173

# รันโหมด Dev และต้องมี --host เพื่อให้เปิดจากนอก Docker ได้
CMD ["npm", "run", "dev", "--", "--host"]