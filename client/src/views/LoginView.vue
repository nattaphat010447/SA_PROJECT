<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-200">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
      <h1 class="text-2xl font-bold text-center mb-6">Game Match Login</h1>
      
      <form @submit.prevent="handleLogin" class="flex flex-col gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">Email / SID</label>
          <input 
            v-model="form.email"   type="text" 
            placeholder="kkumail or SID" 
            required
            class="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Password</label>
          <input 
            v-model="form.password" type="password" 
            placeholder="Password" 
            required
            class="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <p v-if="errorMessage" class="text-red-500 text-sm text-center font-semibold">
          {{ errorMessage }}
        </p>

        <button 
          type="submit" 
          class="bg-blue-600 text-white font-bold py-2 rounded mt-2 hover:bg-blue-700"
        >
          Log in
        </button>
      </form>

      <div class="mt-4 text-center text-sm">
        <p>ยังไม่มีบัญชี? <router-link to="/register" class="text-blue-500 underline">สมัครสมาชิก</router-link></p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../api';

const router = useRouter();
const form = ref({ email: '', password: '' });
const errorMessage = ref('');

const handleLogin = async () => {
  try {
    errorMessage.value = '';
    // ยิง API Login
    const response = await api.post('/auth/login', form.value);
    
    // เก็บ Token ลงในเครื่อง
    localStorage.setItem('token', response.data.token);
    
    // พาไปหน้า Home
    router.push('/home');
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
  }
};
</script>