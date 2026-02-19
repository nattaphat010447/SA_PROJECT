<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-200">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
      <h1 class="text-2xl font-bold text-center mb-6">Game Match Login</h1>
      
      <form @submit.prevent="handleLogin" class="flex flex-col gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">Email / SID</label>
          <input 
            type="text" 
            placeholder="kkumail or SID" 
            class="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Password</label>
          <input 
            type="password" 
            placeholder="Password" 
            class="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button 
          type="submit" 
          class="bg-blue-600 text-white font-bold py-2 rounded mt-2 hover:bg-blue-700"
        >
          Log in
        </button>
      </form>

      <div class="mt-4 text-center text-sm">
        <p>ยังไม่มีบัญชี? <a href="#" class="text-blue-500 underline">สมัครสมาชิก</a></p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const handleLogin = () => {
  console.log('Login clicked! (รอเชื่อม API)');
}
</script>