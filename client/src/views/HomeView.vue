<template>
  <div class="min-h-screen bg-gray-900 flex justify-center items-center p-4">
    
    <div class="bg-black text-white w-full max-w-md h-[800px] rounded-3xl overflow-hidden relative shadow-2xl flex flex-col">
      
      <div class="p-4 flex items-center">
        <button class="text-xl mr-4">←</button>
        <h1 class="text-2xl font-bold">{{ profile?.name }} {{ profile?.age || '' }}</h1>
      </div>

      <div class="flex-1 px-4 relative">
        <div class="bg-gray-700 w-full h-80 rounded-2xl flex items-center justify-center">
          <span class="text-gray-400">[รูปโปรไฟล์ ยังไม่ดึงมากจาก DB]</span>
        </div>
      </div>

      <div class="p-4 flex flex-col gap-3">
        <div class="bg-gray-800 p-4 rounded-xl">
          <h2 class="text-sm text-gray-400 mb-1">About Me</h2>
          <p class="text-sm">{{ profile?.bio || 'ยังไม่มีคำอธิบายตัวเอง' }}</p>
        </div>

        <div class="bg-gray-800 p-4 rounded-xl">
          <h2 class="text-sm text-gray-400 mb-2">เกมที่เล่น</h2>
          <div class="flex flex-wrap gap-2">
            <span class="bg-gray-600 px-3 py-1 rounded-full text-xs">Arena of Valor (MOCKDATA) </span>
            <span class="bg-gray-600 px-3 py-1 rounded-full text-xs">Free Fire(MOCKDATA) </span>
            <span class="bg-gray-600 px-3 py-1 rounded-full text-xs">League Of Legends(MOCKDATA) </span>
          </div>
        </div>
      </div>

      <div class="p-4 flex flex-col gap-2 mt-auto pb-8">
        <button class="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl border border-gray-600">
          ข้าม
        </button>
        <button class="bg-red-900 hover:bg-red-800 text-red-300 font-bold py-3 rounded-xl border border-red-700">
          บล็อค Rattatuay (MOCKDATA)
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
const profile = ref<any>(null);
const isLoading = ref(true);

onMounted(async () => {
  try {
    // ดึงข้อมูล Profile ของคนที่ Login อยู่
    const response = await api.get('/profile');
    profile.value = response.data;
  } catch (error) {
    console.error('Failed to fetch profile', error);
    // ถ้า Token หมดอายุ หรือไม่มี ให้เด้งกลับไป Login
    localStorage.removeItem('token');
    router.push('/');
  } finally {
    isLoading.value = false;
  }
});

const handleLogout = () => {
  localStorage.removeItem('token');
  router.push('/');
};
</script>