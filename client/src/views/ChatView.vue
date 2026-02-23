<template>
  <div class="min-h-screen bg-gray-100 flex justify-center items-center p-4">
    <div class="bg-white w-full max-w-md h-[600px] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
      
      <div class="bg-blue-600 text-white p-4 flex items-center shadow-md z-10">
        <button @click="$router.push('/home')" class="mr-4 font-bold text-xl">←</button>
        <h2 class="text-lg font-bold">ห้องแชท (Match ID: {{ matchId }})</h2>
      </div>

      <div class="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
        <div v-if="messages.length === 0" class="text-center text-gray-400 mt-10">
          ยังไม่มีข้อความ เริ่มทักทายเลย!
        </div>

        <div v-for="msg in messages" :key="msg.id" 
             class="max-w-[75%] p-3 rounded-2xl"
             :class="msg.sender_id === myId ? 'bg-blue-500 text-white self-end rounded-br-none' : 'bg-gray-200 text-gray-800 self-start rounded-bl-none'">
          {{ msg.message_content }}
        </div>
      </div>

      <div class="p-3 bg-white border-t flex gap-2">
        <input 
          v-model="newMessage" 
          @keyup.enter="sendMessage"
          type="text" 
          placeholder="พิมพ์ข้อความ..." 
          class="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button 
          @click="sendMessage" 
          class="bg-blue-600 text-white rounded-full px-6 py-2 font-bold hover:bg-blue-700 transition">
          ส่ง
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '../api';

// 1. นำเข้า Socket.io Client
import { io, Socket } from 'socket.io-client';

const route = useRoute();
const matchId = route.params.id; // รับ ID ห้องแชทจาก URL
const messages = ref<any[]>([]);
const newMessage = ref('');
const myId = ref<number | null>(null);

let socket: Socket;

onMounted(async () => {
  try {
    // โหลดประวัติแชทเก่าจาก Database
    const res = await api.get(`/chat/${matchId}`);
    messages.value = res.data;

    // แอบดึง My ID มาเช็คว่าข้อความไหนของเรา (จะได้โชว์ฝั่งขวา)
    const profileRes = await api.get('/profile');
    myId.value = profileRes.data.user_id;

    // ==========================================
    // เชื่อมต่อ Socket.io กับ Backend
    // ==========================================
    socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000');

    // สั่งให้เข้าห้องแชทของ Match นี้
    socket.emit('join_match', matchId);

    // ดักฟังข้อความใหม่ (ถ้ามีคนพิมพ์มา ให้เอาใส่ Array โชว์บนจอทันที!)
    socket.on('receive_message', (msg) => {
      messages.value.push(msg);
    });

  } catch (error) {
    console.error('Error loading chat:', error);
    alert('เข้าห้องแชทไม่ได้ (อาจจะไม่มีสิทธิ์)');
  }
});

// ตัดการเชื่อมต่อเมื่อกดออกหน้าแชท
onUnmounted(() => {
  if (socket) socket.disconnect();
});

// ฟังก์ชันส่งข้อความ
const sendMessage = async () => {
  if (!newMessage.value.trim()) return;

  try {
    // ส่งข้อความไปเซฟลง Database ผ่าน API
    // (ส่วนการกระจายข้อความให้ Socket จะเกิดขึ้นที่หลังบ้านเอง)
    await api.post(`/chat/${matchId}`, {
      message_content: newMessage.value
    });

    newMessage.value = ''; // เคลียร์ช่องพิมพ์
  } catch (error) {
    console.error('Send error:', error);
  }
};
</script>