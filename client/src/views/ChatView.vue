<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useChatStore } from '@/stores/chat'
import { useAuthStore } from '@/stores/auth'
import { getSocket } from '@/services/socket'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()
const chatStore = useChatStore()
const authStore = useAuthStore()

const matchId = Number(route.params.matchId)
const messageInput = ref('')
const messagesContainer = ref<HTMLElement | null>(null)
const matchData = ref<any>(null)
const showingUnmatchConfirm = ref(false)
const showOptionsMenu = ref(false)
const showingReportModal = ref(false)
const reportReason = ref('')
const reportDetails = ref('')
const isSubmittingReport = ref(false)
const reportMediaFile = ref<File | null>(null)
const reportMediaPreview = ref('')
const isUploadingReportMedia = ref(false)

const handleUnmatch = () => {
  showOptionsMenu.value = false
  showingUnmatchConfirm.value = true
}

const handleReportRequest = () => {
  showOptionsMenu.value = false
  showingReportModal.value = true
}

const handleReportMediaFile = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    reportMediaFile.value = file
    reportMediaPreview.value = URL.createObjectURL(file)
  }
}

const removeReportMedia = () => {
  reportMediaFile.value = null
  reportMediaPreview.value = ''
}

const submitReport = async () => {
  if (!reportReason.value) return
  
  isSubmittingReport.value = true
  try {
    let mediaUrl = ''

    // Upload media if attached
    if (reportMediaFile.value) {
      isUploadingReportMedia.value = true
      const formData = new FormData()
      formData.append('file', reportMediaFile.value)
      const uploadRes = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      mediaUrl = uploadRes.data.url || uploadRes.data.imageUrl || ''
      isUploadingReportMedia.value = false
    }

    await api.post('/reports', {
      reportedUserId: matchData.value?.target_id,
      reason: reportReason.value,
      description: reportDetails.value,
      mediaUrl: mediaUrl || undefined
    })
    alert('Report submitted successfully. We will review it shortly.')
    showingReportModal.value = false
    reportReason.value = ''
    reportDetails.value = ''
    reportMediaFile.value = null
    reportMediaPreview.value = ''
  } catch (err) {
    alert('Failed to submit report. Please try again.')
  } finally {
    isSubmittingReport.value = false
    isUploadingReportMedia.value = false
  }
}

const confirmUnmatch = async () => {
  try {
    await chatStore.unmatch(matchId)
    router.push('/matches')
  } catch (err) {
    alert('Failed to unmatch. Please try again.')
  }
}

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTo({
      top: messagesContainer.value.scrollHeight,
      behavior: 'smooth'
    })
  }
}

const closeMenu = (e: MouseEvent) => {
  if (showOptionsMenu.value && !(e.target as HTMLElement).closest('.relative')) {
    showOptionsMenu.value = false
  }
}

onMounted(async () => {
  window.addEventListener('click', closeMenu)
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

  setTimeout(scrollToBottom, 100)
})

onUnmounted(() => {
  window.removeEventListener('click', closeMenu)
  chatStore.activeMatchId = null
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
  const currentUserId = authStore.user?.id || (authStore.user as any)?.user_id
  return chatStore.messages.map(msg => ({
    ...msg,
    isSelf: Number(msg.sender_id) === Number(currentUserId),
    time: formatTime(msg.sent_at)
  }))
})

const openImage = (url: string) => {
  window.open(url, '_blank')
}

const send = () => {
  if (!messageInput.value.trim()) return

  chatStore.sendMessage(matchId, messageInput.value)

  messageInput.value = ''
  scrollToBottom()
}
</script>

<template>
  <div class="flex flex-col h-full absolute inset-0 bg-[#0A0D14] overflow-hidden">
    <!-- Animated Background Pulse -->
    <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" style="animation-delay: 1s"></div>

    <!-- Chat Header -->
    <div class="relative flex items-center justify-between px-4 py-4 bg-white/[0.02] backdrop-blur-xl border-b border-white/5 shrink-0 z-20">
      <div class="flex items-center gap-3">
        <button
          @click="router.push('/matches')"
          class="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all active:scale-95 cursor-pointer"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        <router-link 
          :to="`/profile/${matchData?.target_id}`" 
          class="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer group"
        >
          <div class="relative">
            <div class="w-11 h-11 rounded-full overflow-hidden p-[2px] bg-gradient-to-tr from-purple-500 to-indigo-500 group-hover:from-purple-400 group-hover:to-indigo-400 transition-all">
              <div class="w-full h-full rounded-full overflow-hidden bg-gray-900">
                <img :src="matchData?.target_avatar || '/placeholder-avatar.png'" class="w-full h-full object-cover" />
              </div>
            </div>
          </div>
          <div class="flex flex-col">
            <span class="font-bold text-white text-[16px] tracking-tight leading-tight group-hover:text-purple-400 transition-colors">{{ matchData?.target_name || 'Match' }}</span>
          </div>
        </router-link>
      </div>

      <div class="relative">
        <button 
          @click="showOptionsMenu = !showOptionsMenu"
          class="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all active:scale-95 cursor-pointer"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>

        <!-- Dropdown Menu -->
        <Transition name="fade">
          <div v-if="showOptionsMenu" 
               @click.away="showOptionsMenu = false"
               class="absolute right-0 mt-2 w-48 py-2 bg-[#1A1F2E]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl z-[60]">
            <button 
              @click="handleReportRequest"
              class="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-gray-300 hover:bg-white/5 transition-colors"
            >
              <svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Report User
            </button>
            <div class="h-px bg-white/5 mx-2 my-1"></div>
            <button 
              @click="handleUnmatch"
              class="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-rose-400 hover:bg-rose-500/5 transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              Unmatch
            </button>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <Transition name="fade">
      <div v-if="showingUnmatchConfirm" class="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/80 backdrop-blur-md">
        <div class="bg-[#121620] border border-white/10 p-8 rounded-[32px] w-full max-w-sm shadow-2xl scale-in">
          <div class="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-6">
            <svg class="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h3 class="text-2xl font-black text-white text-center mb-3">Break the link?</h3>
          <p class="text-gray-400 text-sm text-center mb-8 leading-relaxed px-2">
            This will permanently remove <b>{{ matchData?.target_name }}</b> from your matches and delete the conversation.
          </p>
          <div class="flex flex-col gap-3">
            <button 
              @click="confirmUnmatch"
              class="w-full py-4 rounded-2xl bg-rose-600 text-white font-bold hover:bg-rose-500 transition-all active:scale-95 cursor-pointer shadow-lg shadow-rose-900/20"
            >
              Unmatch Now
            </button>
            <button 
              @click="showingUnmatchConfirm = false"
              class="w-full py-4 rounded-2xl bg-white/5 text-gray-400 font-semibold hover:bg-white/10 transition-all cursor-pointer"
            >
              Actually, wait
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Report Modal -->
    <Transition name="fade">
      <div v-if="showingReportModal" class="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/80 backdrop-blur-md">
        <div class="bg-[#121620] border border-white/10 p-8 rounded-[32px] w-full max-w-md shadow-2xl scale-in">
          <div class="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
            <svg class="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 class="text-2xl font-black text-white text-center mb-3">Report User</h3>
          <p class="text-gray-400 text-sm text-center mb-6 px-2">
            Tell us why you are reporting <b>{{ matchData?.target_name }}</b>. Your safety is our priority.
          </p>
          
          <div class="space-y-4 mb-8">
            <div class="flex flex-wrap gap-2 justify-center">
              <button 
                v-for="reason in ['Harassment', 'Spam', 'Fake Profile', 'Inappropriate Content', 'Other']"
                :key="reason"
                @click="reportReason = reason"
                class="px-4 py-2 rounded-xl text-xs font-bold transition-all border"
                :class="reportReason === reason 
                  ? 'bg-amber-500 border-amber-500 text-black shadow-lg shadow-amber-500/20' 
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'"
              >
                {{ reason }}
              </button>
            </div>
            
            <textarea 
              v-model="reportDetails"
              placeholder="Provide more details (optional)..."
              class="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white outline-none focus:border-amber-500 transition-colors h-24 resize-none"
            ></textarea>

            <!-- Media Evidence Upload -->
            <div>
              <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Attach Evidence (optional)</label>
              <div v-if="!reportMediaPreview" class="relative">
                <input 
                  type="file" 
                  accept="image/*,video/*" 
                  @change="handleReportMediaFile"
                  class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div class="flex items-center justify-center gap-2 w-full py-3 bg-white/5 border border-dashed border-white/20 rounded-2xl text-gray-400 text-sm hover:bg-white/10 transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Upload image or video</span>
                </div>
              </div>
              <div v-else class="relative rounded-2xl overflow-hidden border border-white/10">
                <img v-if="reportMediaFile?.type.startsWith('image')" :src="reportMediaPreview" class="w-full h-32 object-cover" />
                <video v-else :src="reportMediaPreview" class="w-full h-32 object-cover" />
                <button @click="removeReportMedia" class="absolute top-2 right-2 w-7 h-7 bg-black/70 rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-3">
            <button 
              @click="submitReport"
              :disabled="!reportReason || isSubmittingReport"
              class="w-full py-4 rounded-2xl bg-amber-500 text-black font-extrabold hover:bg-amber-400 transition-all active:scale-95 disabled:opacity-30 disabled:grayscale cursor-pointer shadow-lg shadow-amber-900/20"
            >
              {{ isSubmittingReport ? 'Submitting...' : 'Submit Report' }}
            </button>
            <button 
              @click="showingReportModal = false"
              class="w-full py-4 rounded-2xl bg-white/5 text-gray-400 font-semibold hover:bg-white/10 transition-all cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Messages -->
    <div ref="messagesContainer" class="flex-grow overflow-y-auto px-4 py-6 flex flex-col gap-6 custom-scrollbar relative z-10">
      <div v-if="chatStore.messages.length === 0" class="flex-grow flex flex-col items-center justify-center text-center">
        <div class="w-20 h-20 rounded-full bg-white/[0.03] flex items-center justify-center mb-4">
          <span class="text-4xl">👋</span>
        </div>
        <h4 class="text-white font-bold mb-1">Start the magic</h4>
        <p class="text-gray-500 text-sm max-w-[180px]">Don't be shy! Send the first message to get things going.</p>
      </div>

      <template v-for="(msg, idx) in groupedMessages" :key="msg.id">
        <div class="flex w-full group" :class="msg.isSelf ? 'justify-end' : 'justify-start'">
          <div class="flex items-end gap-2 max-w-[85%]" :class="msg.isSelf ? 'flex-row-reverse' : 'flex-row'">
            <!-- Avatar (Small Messenger Style) -->
            <div 
              v-if="!msg.isSelf" 
              class="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-white/10 shadow-sm self-end mb-1"
            >
              <img 
                :src="matchData?.target_avatar || '/placeholder-avatar.png'" 
                class="w-full h-full object-cover" 
              />
            </div>

            <div class="flex flex-col" :class="msg.isSelf ? 'items-end' : 'items-start'">
              <div
                class="relative px-4 py-2.5 text-[15px] leading-relaxed shadow-xl transition-all w-fit max-w-full"
                style="word-wrap: break-word; white-space: pre-wrap; min-width: 50px;"
                :class="[
                  msg.isSelf
                    ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-2xl rounded-br-sm'
                    : 'bg-white/[0.08] backdrop-blur-md text-gray-100 rounded-2xl rounded-bl-sm border border-white/5'
                ]"
              >
                {{ msg.message_content }}
              </div>
              <div v-if="msg.time && (idx === groupedMessages.length - 1 || groupedMessages[idx + 1]?.isSelf !== msg.isSelf)" 
                   class="flex items-center gap-1.5 mt-1.5 px-0.5 text-[10px] font-semibold text-gray-500/80 tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                <span>{{ msg.time }}</span>
                <svg v-if="msg.isSelf" class="w-3 h-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Input Bar -->
    <div class="px-4 py-6 bg-gradient-to-t from-[#0A0D14] via-[#0A0D14]/95 to-transparent shrink-0 relative z-20">
      <form @submit.prevent="send" class="relative max-w-2xl mx-auto group">
        <div class="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-[24px] blur opacity-20 group-focus-within:opacity-40 transition duration-1000"></div>
        <div class="relative flex items-center gap-2 bg-[#161B28]/80 backdrop-blur-2xl border border-white/10 rounded-[24px] p-2 pl-5 pr-2">
          <input
            v-model="messageInput"
            type="text"
            placeholder="Write a message..."
            class="flex-grow bg-transparent border-none outline-none text-white placeholder-gray-500 text-sm py-2"
          />
          <button
            type="submit"
            :disabled="!messageInput.trim()"
            class="w-10 h-10 rounded-2xl flex items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/20 transition-all hover:scale-110 active:scale-90 disabled:grayscale disabled:opacity-30 cursor-pointer"
          >
            <svg class="w-5 h-5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.1);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.scale-in {
  animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes scaleIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes pulse {
  0%, 100% { opacity: 0.1; transform: scale(1); }
  50% { opacity: 0.15; transform: scale(1.1); }
}
</style>


