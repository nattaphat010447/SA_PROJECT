<script setup lang="ts">
import { watch } from 'vue'
import { RouterView } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import { useAuthStore } from '@/stores/auth'
import { useChatStore } from '@/stores/chat'
import { useNotificationStore } from '@/stores/notification'
import { getSocket } from '@/services/socket'

const authStore = useAuthStore()
const chatStore = useChatStore()
const notificationStore = useNotificationStore()

watch(() => authStore.isAuthenticated, (isAuth) => {
  if (isAuth && authStore.user) {
    const socket = getSocket()

    socket.on('connect', () => socket.emit('join_global', authStore.user?.id))
    if (socket.connected) socket.emit('join_global', authStore.user.id)

    socket.off('new_notification')
    socket.on('new_notification', (data) => {
      // Trigger chat badge
      chatStore.hasUnread = true 

      // Push to global notification center
      let message = 'You have a new notification'
      if (data && data.type === 'message') message = 'You have a new message'
      if (data && data.type === 'match') message = 'You have a new match!'

      notificationStore.pushNotification({
        type: data?.type || 'info',
        message: message
      })
    })
  }
}, { immediate: true })
</script>

<template>
  <div class="h-screen flex flex-col w-full overflow-hidden bg-[var(--color-dark-bg)]">
    <Navbar />
    <main class="flex-1 flex flex-col relative overflow-y-auto min-h-0">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
/* Scoped styles if needed */
</style>
