<template>
  <div class="min-h-screen bg-gray-900 flex justify-center items-center p-4">
    
    <div class="bg-black text-white w-full max-w-md h-[800px] rounded-3xl overflow-hidden relative shadow-2xl flex flex-col">
      
      <div class="p-4 flex items-center">
        <button class="text-xl mr-4">←</button>
        <h1 class="text-2xl font-bold">Rattatuay 21</h1>
      </div>

      <div class="flex-1 px-4 relative">
        <div class="bg-gray-700 w-full h-80 rounded-2xl flex items-center justify-center">
          <span class="text-gray-400">[รูปโปรไฟล์นกกระจอกเทศ]</span>
        </div>
      </div>

      <div class="p-4 flex flex-col gap-3">
        <div class="bg-gray-800 p-4 rounded-xl">
          <h2 class="text-sm text-gray-400 mb-1">About Me</h2>
          <p class="text-sm">เล่นชิวๆ ไม่ซีเรียส ปกติเล่น 21.00 - 24.00</p>
        </div>

        <div class="bg-gray-800 p-4 rounded-xl">
          <h2 class="text-sm text-gray-400 mb-2">เกมที่เล่น</h2>
          <div class="flex flex-wrap gap-2">
            <span class="bg-gray-600 px-3 py-1 rounded-full text-xs">Arena of Valor</span>
            <span class="bg-gray-600 px-3 py-1 rounded-full text-xs">Free Fire</span>
            <span class="bg-gray-600 px-3 py-1 rounded-full text-xs">League Of Legends</span>
          </div>
        </div>
      </div>

      <div class="p-4 flex flex-col gap-2 mt-auto pb-8">
        <button class="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl border border-gray-600">
          ยกเลิกการแมทช์ (Skip)
        </button>
        <button class="bg-red-900 hover:bg-red-800 text-red-300 font-bold py-3 rounded-xl border border-red-700">
          บล็อค Rattatuay
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
// รอใส่ Logic การ Swipe ตรงนี้
</script>