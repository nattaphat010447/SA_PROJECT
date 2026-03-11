<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useChatStore } from '@/stores/chat'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()
const chatStore = useChatStore()
const authStore = useAuthStore()

const matchId = Number(route.params.matchId)
const messageInput = ref('')
const messagesContainer = ref<HTMLElement | null>(null)
const matchData = ref<any>(null)

const showInfo = ref(false)

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

watch(() => chatStore.messages.length, () => {
  scrollToBottom()
})

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  chatStore.hasUnread = false

  if (chatStore.matchesList.length === 0) {
    await chatStore.fetchMatches()
  }
  matchData.value = chatStore.matchesList.find(m => m.id === matchId)

  await chatStore.fetchHistory(matchId)
  chatStore.initSocketListeners()
  scrollToBottom()
})

onUnmounted(() => {
  chatStore.activeMatchId = null
})

const targetAge = computed(() => {
  if (!matchData.value?.target_birth_date) return ''
  const dob = new Date(matchData.value.target_birth_date)
  const ageDifMs = Date.now() - dob.getTime()
  const ageDate = new Date(ageDifMs)
  return Math.abs(ageDate.getUTCFullYear() - 1970)
})

const formatTime = (dateStr: string) => {
  try {
    const d = new Date(dateStr)
    const hours = d.getHours().toString().padStart(2, '0')
    const mins = d.getMinutes().toString().padStart(2, '0')
    return `${hours}:${mins}`
  } catch {
    return ''
  }
}

const groupedMessages = computed(() => {
  const myId = Number(authStore.user?.id || (authStore.user as any)?.user_id)
  return chatStore.messages.map(msg => ({
    ...msg,
    isSelf: Number(msg.sender_id) === myId,
    time: formatTime(msg.sent_at)
  }))
})

const send = () => {
  if (!messageInput.value.trim()) return
  chatStore.sendMessage(matchId, messageInput.value.trim())
  messageInput.value = ''
  scrollToBottom()
}

const handleUnmatch = async () => {
  if (!confirm('Are you sure you want to unmatch? This action cannot be undone.')) return
  try {
    await api.put(`/swipe/unmatch/${matchId}`)
    router.push('/matches')
  } catch (err) {
    console.error('Failed to unmatch', err)
    alert('Could not unmatch. Please try again.')
  }
}

const handleReport = () => {
  alert('Report has been sent to the admin. We will review this user.')
  showInfo.value = false
}
</script>

<template>
  <div class="flex flex-col h-full absolute inset-0 bg-[var(--color-dark-bg)]">
    <div class="flex items-center justify-between px-4 py-3 bg-white/[0.03] border-b border-white/5 shrink-0 z-10">
      <div class="flex items-center gap-3">
        <button
          @click="router.push('/matches')"
          class="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full overflow-hidden border-2 border-purple-500/30 bg-[var(--color-input-bg)]">
            <img :src="matchData?.target_avatar || '/placeholder-avatar.png'" class="w-full h-full object-cover" />
          </div>
          <span class="font-semibold text-white text-[15px]">{{ matchData?.target_name || 'Match' }}</span>
        </div>
      </div>

      <button 
        @click="showInfo = true" 
        class="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>
    </div>

    <div ref="messagesContainer" class="flex-grow overflow-y-auto px-4 py-4 flex flex-col gap-2">
      <div v-if="chatStore.messages.length === 0" class="flex-grow flex flex-col items-center justify-center text-center text-gray-500">
        <p class="text-sm">No messages yet. Say hi! 👋</p>
      </div>

      <template v-for="(msg, idx) in groupedMessages" :key="msg.id">
        <div class="flex w-full" :class="msg.isSelf ? 'justify-end' : 'justify-start'">
          <div class="flex flex-col max-w-[75%]" :class="msg.isSelf ? 'items-end' : 'items-start'">
            <div
              class="px-[18px] py-[14px] text-[15px] text-left leading-[1.5] shadow-[0_2px_6px_rgba(0,0,0,0.03)] whitespace-pre-wrap [word-break:break-word]"
              :class="[
                msg.isSelf
                  ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-[18px] rounded-br-[4px]'
                  : 'bg-white/[0.08] text-gray-100 rounded-[18px] rounded-bl-[4px] border border-white/[0.05]'
              ]"
            >
              {{ msg.message_content }}
            </div>
            <span
              v-if="msg.time && (idx === groupedMessages.length - 1 || groupedMessages[idx + 1]?.isSelf !== msg.isSelf)"
              class="text-[10px] text-gray-600 mt-1 px-1"
            >
              {{ msg.time }}
            </span>
          </div>
        </div>
      </template>
    </div>

    <div class="px-4 py-3 bg-white/[0.02] border-t border-white/5 shrink-0">
      <form @submit.prevent="send" class="flex gap-2 items-center max-w-lg mx-auto w-full">
        <input
          v-model="messageInput"
          type="text"
          placeholder="Message..."
          @keydown.enter.prevent="send"
          class="flex-grow px-4 py-3 bg-[var(--color-input-bg)] border border-white/5 rounded-2xl outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white placeholder-gray-400 text-sm transition-all"
        />
        <button
          type="submit"
          :disabled="!messageInput.trim()"
          class="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white hover:bg-purple-500 transition-colors disabled:opacity-30 disabled:bg-white/10 disabled:text-gray-500 cursor-pointer shrink-0"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 19V5m-7 7l7-7 7 7" />
          </svg>
        </button>
      </form>
    </div>

    <div 
      v-if="showInfo" 
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" 
      @click.self="showInfo = false"
    >
      <div class="w-full max-w-sm bg-[var(--color-dark-bg)] border border-white/10 rounded-3xl p-6 flex flex-col shadow-2xl relative">
        <button 
          @click="showInfo = false" 
          class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
           <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div class="w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-purple-500/30 mb-4 bg-[var(--color-input-bg)] shadow-[0_0_20px_rgba(124,58,237,0.15)]">
          <img :src="matchData?.target_avatar || '/placeholder-avatar.png'" class="w-full h-full object-cover" />
        </div>

        <h3 class="text-xl font-bold text-center text-white flex items-center justify-center gap-2">
          {{ matchData?.target_name || 'Match' }}
          <span v-if="targetAge" class="text-gray-400 font-normal text-lg">{{ targetAge }}</span>
        </h3>

        <div class="mt-4 bg-white/[0.03] border border-white/5 rounded-2xl p-4 min-h-[60px] flex items-center justify-center">
          <p class="text-sm text-gray-300 leading-relaxed text-center">
            {{ matchData?.target_bio || 'No bio provided.' }}
          </p>
        </div>

        <div class="mt-5">
          <p class="text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">Interested Games</p>
          <div class="flex flex-wrap gap-2">
            <span 
              v-for="game in (matchData?.target_games || [])" 
              :key="game.id" 
              class="px-3 py-1 bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded-lg text-xs font-semibold"
            >
              {{ game.name }}
            </span>
            <span v-if="!matchData?.target_games?.length" class="text-xs text-gray-500">No games selected.</span>
          </div>
        </div>

        <div class="mt-8 flex flex-col gap-2">
          <button 
            @click="handleUnmatch" 
            class="w-full py-3 bg-red-500/10 text-red-400 font-bold rounded-xl border border-red-500/20 hover:bg-red-500/20 transition-colors cursor-pointer text-sm"
          >
            Unmatch
          </button>
          <button 
            @click="handleReport" 
            class="w-full py-3 bg-white/5 text-gray-400 font-bold rounded-xl border border-white/10 hover:bg-white/10 hover:text-white transition-colors cursor-pointer text-sm"
          >
            Report User
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
::-webkit-scrollbar {
  width: 4px;
}
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.06);
  border-radius: 4px;
}

/* แอนิเมชันสำหรับหน้าต่าง Profile */
.animate-fade-in {
  animation: fadeIn 0.2s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>