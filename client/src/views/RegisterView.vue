<template>
  <div class="min-h-screen bg-gray-100 flex justify-center items-center p-4">
    <div class="bg-white text-gray-800 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl p-6 relative">
      
      <div class="flex justify-between mb-6 gap-1">
        <div v-for="i in 5" :key="i" class="h-2 flex-1 rounded-full transition-all duration-300"
             :class="step >= i ? 'bg-blue-600' : 'bg-gray-200'"></div>
      </div>

      <div v-if="errorMessage" class="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm text-center font-semibold">
        {{ errorMessage }}
      </div>

      <div v-if="step === 1" class="animate-fade-in">
        <h2 class="text-2xl font-bold mb-2">สร้างบัญชีผู้ใช้</h2>
        <p class="text-gray-500 text-sm mb-6">เริ่มต้นการหาเพื่อนเล่นเกมของคุณ</p>
        
        <div class="flex flex-col gap-4">
          <div>
            <label class="block text-sm font-semibold mb-1">ชื่อเล่น</label>
            <input v-model="form.name" type="text" placeholder="เช่น เทพซ่า007" class="w-full border rounded-xl p-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-semibold mb-1">อีเมล</label>
            <input v-model="form.email" type="email" placeholder="example@kkumail.com" class="w-full border rounded-xl p-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-semibold mb-1">รหัสผ่าน</label>
            <input v-model="form.password" type="password" placeholder="ตั้งรหัสผ่าน 6 ตัวขึ้นไป" class="w-full border rounded-xl p-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </div>

      <div v-if="step === 2" class="animate-fade-in">
        <h2 class="text-2xl font-bold mb-2">ข้อมูลส่วนตัว</h2>
        <p class="text-gray-500 text-sm mb-6">ให้คนอื่นรู้จักคุณมากขึ้นอีกนิด</p>
        
        <div class="flex flex-col gap-4">
          <div>
            <label class="block text-sm font-semibold mb-1">อายุ (ปี)</label>
            <input v-model="form.age" type="number" placeholder="เช่น 20" class="w-full border rounded-xl p-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-semibold mb-1">สถานที่ของคุณ</label>
            <input v-model="form.country" type="text" placeholder="เช่น ขอนแก่น, ไทย" class="w-full border rounded-xl p-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </div>

      <div v-if="step === 3" class="animate-fade-in">
        <h2 class="text-2xl font-bold mb-2">เกมที่คุณชอบเล่น</h2>
        <p class="text-gray-500 text-sm mb-6">เลือกเกมเพื่อหาเพื่อนที่เล่นเหมือนกัน (เลือกได้มากกว่า 1 เกม)</p>
        
        <div class="flex flex-col gap-3">
          <label v-for="game in availableGames" :key="game.id" 
                 class="flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all"
                 :class="form.games.includes(game.id) ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:bg-gray-50'">
            
            <input type="checkbox" 
                   v-model="form.games" 
                   :value="game.id" 
                   class="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer mr-3" />
            
            <span class="font-semibold">{{ game.name }}</span>
          </label>
        </div>
      </div>

      <div v-if="step === 4" class="animate-fade-in">
        <h2 class="text-2xl font-bold mb-2">บอกความเป็นคุณ (Bio)</h2>
        <p class="text-gray-500 text-sm mb-6">เขียนอะไรเจ๋งๆ ดึงดูดเพื่อนร่วมทีมหน่อย!</p>
        
        <textarea v-model="form.bio" rows="5" 
                  placeholder="เช่น เล่นชิวๆ ไม่หัวร้อน" 
                  class="w-full border rounded-xl p-3 bg-gray-50 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
      </div>

      <div v-if="step === 5" class="animate-fade-in">
        <h2 class="text-2xl font-bold mb-2">รูปโปรไฟล์ (สูงสุด 9 รูป)</h2>
        <p class="text-gray-500 text-sm mb-6">รูปแรกจะเป็นรูปหลักของคุณ (กดที่ช่องเพื่ออัปโหลด)</p>
        
        <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="handleFileUpload" />

        <div class="grid grid-cols-3 gap-2">
          <div v-for="index in 9" :key="index" 
               @click="triggerUpload(index - 1)"
               class="group aspect-square bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-200 transition relative overflow-hidden">
            
            <img v-if="imagePreviews[index - 1]" :src="imagePreviews[index - 1]" class="w-full h-full object-cover" />
            <span v-else class="text-gray-400 text-2xl">+</span>

            <button v-if="imagePreviews[index - 1]" 
                    @click.stop="removePhoto(index - 1)" 
                    class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-md hover:bg-red-600">
              ✕
            </button>
          </div>
        </div>
        
        <div v-if="isSubmitting" class="mt-4 text-center text-sm text-blue-600 font-semibold animate-pulse">
          กำลังอัปโหลดรูปภาพและบันทึกข้อมูล กรุณารอสักครู่...
        </div>
      </div>

      <div class="flex justify-between mt-8 pt-4 border-t">
        <button v-if="step > 1" @click="step--" :disabled="isSubmitting" class="text-gray-500 font-bold py-3 px-6 rounded-xl hover:bg-gray-100 transition disabled:opacity-50">
          กลับ
        </button>
        <div v-else>
          <router-link to="/" class="text-gray-500 font-bold py-3 px-6 rounded-xl hover:bg-gray-100 transition inline-block">
            ยกเลิก
          </router-link>
        </div> 

        <button v-if="step < 5" @click="nextStep" class="bg-blue-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-blue-700 transition">
          ถัดไป
        </button>
        
        <button v-if="step === 5" @click="finishRegister" :disabled="isSubmitting" 
                class="bg-green-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-green-700 transition disabled:opacity-50">
          {{ isSubmitting ? 'กำลังบันทึก...' : 'เสร็จสิ้น!' }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../api';

const router = useRouter();
const step = ref(1);
const errorMessage = ref('');
const isSubmitting = ref(false);

const availableGames = ref<any[]>([]);

const form = ref({
  name: '',
  email: '',
  password: '',
  age: '',
  country: '',
  bio: '',
  games: [] as number[],
});

// ==========================================
// 🎮 จัดการเรื่องเกม
// ==========================================
/*
const toggleGame = (gameId: number) => {
  const index = form.value.games.indexOf(gameId);
  if (index > -1) {
    form.value.games.splice(index, 1);
  } else {
    form.value.games.push(gameId);
  }
};
*/

onMounted(async () => {
  try {
    // ดึงข้อมูลเกมจาก Backend
    const res = await api.get('/profile/all-games');
    // แปลงข้อมูลให้ตรงกับที่ UI ต้องการ (เช่นใช้ game_name แทน name)
    availableGames.value = res.data.map((g: any) => ({
      id: g.id,
      name: g.game_name
    }));
  } catch (err) {
    console.error('ไม่สามารถดึงข้อมูลเกมได้', err);
  }
});

// ==========================================
// 📸 จัดการเรื่องอัปโหลดรูป (เปลี่ยนเป็น Preview & Store Local)
// ==========================================
const fileInput = ref<HTMLInputElement | null>(null);
let currentIndexToUpload = 0;

// เก็บ File object จริงๆ ไว้เตรียมยิง API ตอนจบ
const imageFiles = ref<Array<File | null>>(new Array(9).fill(null));
// เก็บ URL ของรูปที่สร้างขึ้นมาชั่วคราว (blob) ไว้โชว์ให้ User ดู
const imagePreviews = ref<Array<string>>(new Array(9).fill(''));

const triggerUpload = (index: number) => {
  if (isSubmitting.value) return; // ล็อกไม่ให้แก้ตอนกำลังโหลด
  currentIndexToUpload = index;
  fileInput.value?.click();
};

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  // คืนหน่วยความจำของรูปเก่าทิ้ง (ถ้ามี) ก่อนใส่รูปใหม่
  if (imagePreviews.value[currentIndexToUpload]) {
    URL.revokeObjectURL(imagePreviews.value[currentIndexToUpload]);
  }

  // เซฟลง State 
  imageFiles.value[currentIndexToUpload] = file;
  imagePreviews.value[currentIndexToUpload] = URL.createObjectURL(file);

  target.value = ''; // เคลียร์ input
};

const removePhoto = (index: number) => {
  if (isSubmitting.value) return;
  
  // คืนหน่วยความจำ
  if (imagePreviews.value[index]) {
    URL.revokeObjectURL(imagePreviews.value[index]);
  }
  
  // ลบข้อมูลออกจาก State
  imageFiles.value[index] = null;
  imagePreviews.value[index] = '';
};

// ==========================================
// ➡️ จัดการเรื่องเปลี่ยนหน้า และ บันทึกข้อมูล
// ==========================================
const nextStep = () => {
  errorMessage.value = '';
  
  if (step.value === 1) {
    if (!form.value.name || !form.value.email || !form.value.password) {
      errorMessage.value = 'กรุณากรอกข้อมูลให้ครบถ้วน';
      return;
    }
  } 
  
  step.value++;
};

const finishRegister = async () => {
  try {
    errorMessage.value = '';
    isSubmitting.value = true;

    // 1. สร้าง Account
    await api.post('/auth/register', {
      name: form.value.name,
      email: form.value.email,
      password: form.value.password
    });

    // 2. ล็อกอินอัตโนมัติ เพื่อเอา Token มาใช้ยืนยันตัวตนตอนอัปโหลดรูป
    const loginRes = await api.post('/auth/login', {
      email: form.value.email,
      password: form.value.password
    });
    const token = loginRes.data.token;
    localStorage.setItem('token', token);

    // 3. ทยอยอัปโหลดรูปขึ้น Cloudinary (เอาเฉพาะช่องที่มีไฟล์)
    const uploadedUrls: string[] = [];
    
    for (let i = 0; i < imageFiles.value.length; i++) {
      const file = imageFiles.value[i];
      if (file) {
        const formData = new FormData();
        formData.append('image', file);
        
        // ยิง API โดยแนบ Token ไปด้วย 
        const uploadRes = await api.post('/upload', formData, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}` 
          }
        });
        
        uploadedUrls.push(uploadRes.data.imageUrl);
      }
    }

    // 4. เซฟ Profile พร้อมรูปที่อัปโหลดสำเร็จ
    await api.put('/profile', {
      display_name: form.value.name,
      bio: form.value.bio,
      age: Number(form.value.age) || 0,
      country: form.value.country,
      profile_images: uploadedUrls // ส่ง Array ของ URL ไปบันทึก
    }, {
      headers: { 'Authorization': `Bearer ${token}` } // อย่าลืมแนบ Token
    });

    // 5. เซฟ Games ที่เลือก
    for (const gameId of form.value.games) {
      await api.post('/profile/games', { gameId }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
    }

    // ล้าง Memory ทิ้งหลังอัปโหลดเสร็จ
    imagePreviews.value.forEach(url => {
      if (url) URL.revokeObjectURL(url);
    });

    alert('สร้างโปรไฟล์และอัปโหลดรูปสำเร็จ! ยินดีต้อนรับเข้าสู่ระบบ 🚀');
    router.push('/home'); 

  } catch (err: any) {
    console.error(err);
    errorMessage.value = err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง';
    
    if (errorMessage.value.includes('exists') || errorMessage.value.includes('already')) {
      step.value = 1; 
    }
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.4s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>