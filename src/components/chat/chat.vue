<script setup lang="ts">
import { ref } from "vue";
import { useMainStore } from "../../pinia/useItemsStore";
import { useRouter } from 'vue-router'
import { onMounted, computed } from "vue";
import { io } from "socket.io-client"
const usestore = useMainStore();

const router = useRouter();

const socket = io(`https://${usestore.text}`)

interface Chat {
  id: number;
  lastMessage: string;
  lastTime: string | null;
  user: {
    id: number;
    name: string;
    avatar: string;
  };
}

interface Message {
  id: number;
  text: string;
  fromMe: boolean;
  createdAt: string;

  sender: {
    id: number;
    name: string;
    avatar: string;
  };
}

const chats = ref<Chat[]>([]);
const activeChat = ref<Chat | null>(null);
const messages = ref<Message[]>([]);
const myId = ref<number | null>(null)
const showMenu = ref(false)
const search = ref("")
const chatLoading = ref(false)






const getMe = async () => {
  const res = await fetch(`https://${usestore.text}/me`, {
    headers: {
      Authorization: `Bearer ${usestore.token}`,
    },
  })

  const data = await res.json()
  myId.value = data.id
}
/* =========================
   📡 GET CHATS
========================= */
const getchat = async () => {
  const res = await fetch(`https://${usestore.text}/chats`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${usestore.token}`,
    },
  });

  chats.value = await res.json();
};

/* =========================
   💬 OPEN CHAT (ВАЖНО)
========================= */
const openChat = async (chat: Chat) => {
  chatLoading.value = true   // ⬅️ ВКЛ
  if (isMobile.value) {
    showChat.value = true
  }
  const res = await fetch(
    `https://${usestore.text}/chat/${chat.id}/messages`,
    {
      headers: {
        Authorization: `Bearer ${usestore.token}`,
      },
    }
  )

  const data = await res.json()

  messages.value = data.map((m: any) => ({
    ...m,
    fromMe: isMine(m.senderId)
  }))

  activeChat.value = chat   // ⬅️ СТАВИМ ПОСЛЕ ЗАГРУЗКИ

  chatLoading.value = false  // ⬅️ ВЫКЛ
}



const text = ref("");

/* =========================
   📤 SEND MESSAGE
========================= */
const sendMessage = async () => {
  if (!activeChat.value || !text.value.trim()) return;

  const messageText = text.value;
  text.value = "";

  await fetch(`https://${usestore.text}/chat/${activeChat.value.id}/message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${usestore.token}`,
    },
    body: JSON.stringify({ text: messageText }),
  });
};

const isMobile = ref(window.innerWidth < 768)
const showChat = ref(false)

window.addEventListener('resize', () => {
  isMobile.value = window.innerWidth < 768
})

const formatTime = (date: string) => {
  return new Date(date).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Bishkek' // 🔥 ВАЖНО
  })
}
const vihod = () => {
  router.push('/user')
}


const postListFilter = computed(() => {
  const q = search.value.trim().toLowerCase()

  if (!q) return chats.value

  return chats.value.filter(el =>
    el.user.name.toLowerCase().includes(q) ||
    (el.lastMessage?.toLowerCase().includes(q) ?? false)
  )
})

const isMine = (senderId: number) => {
  return senderId === myId.value
}

onMounted(async () => {
  await getMe()
  await getchat()

  // ✅ ВОТ СЮДА
  socket.on("connect", () => {
    console.log("✅ socket connected");

    chats.value.forEach(chat => {
      socket.emit("join", chat.id)
    })
  })

  // если сокет уже подключён
  if (socket.connected) {
    chats.value.forEach(chat => {
      socket.emit("join", chat.id)
    })
  }

  if (chats.value.length > 0) {
    openChat(chats.value[0])
  }

  socket.on(`user_${myId.value}`, (msg: any) => {

    let chat = chats.value.find(c => c.id === msg.chatId)

    if (!chat && msg.chat) {
      chats.value.unshift(msg.chat)
      socket.emit("join", msg.chat.id)
      chat = msg.chat
    }

    if (chat) {
      chat.lastMessage = msg.text
      chat.lastTime = msg.createdAt
    }

    if (msg.chatId === activeChat.value?.id) {
      messages.value.push({
        ...msg,
        fromMe: isMine(msg.senderId)
      })
    }
  })


})

</script>

<template>
  <div class="chat-page">

    <div class="chat-list" v-show="!isMobile || !showChat">
      <div class="flexo">
        <div class="textchat">Чаты</div>

        <div class="tritochki" @click="showMenu = !showMenu">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
      <div v-if="showMenu" class="modal-overlay" @click="showMenu = false">
        <div class="modal-menu" @click.stop>
          <div class="menu-item danger" @click="vihod">Выйти</div>
        </div>
      </div>
      <div class="search-box">
        <input v-model="search" placeholder="Поиск чатов..." />
      </div>

      <div v-for="chat in postListFilter" :key="chat.id" class="chat-user" @click="openChat(chat)"
        :class="{ active: activeChat?.id === chat.id }">
        <img :src="`http://${usestore.text}/${chat.user.avatar.replace(/\\/g, '/')}`" class="chat-avatar" />

        <div class="chat-meta">
          <h4>{{ chat.user.name }}</h4>
          <p>{{ chat.lastMessage || 'нет сообщений' }}</p>
        </div>
      </div>
    </div>

    <div class="chat-window" v-show="!isMobile || showChat">

      <div class="chat-header">
        <button v-if="isMobile && showChat" class="back-btni" @click="showChat = false">
          ←
        </button>
        <div class="flee">

          <div class="avatar-wrap">
            <img v-if="activeChat" :src="`http://${usestore.text}/${activeChat.user.avatar}`" alt="" class="avatar">
          </div>
          <h3 v-if="activeChat">
            {{ activeChat.user.name }}
          </h3>
        </div>

      </div>

      <div class="messages">

        <div v-if="!activeChat" style="color: gray;">
          Открой чат (логика подключена)
        </div>

        <div v-for="m in messages" :key="m.id" class="msg-row" :class="m.fromMe ? 'mine' : 'other'">

          <img :src="`http://${usestore.text}/${m.sender.avatar}`" class="msg-avatar" />

          <div class="bubble">

            <div class="msg-name">
              {{ m.sender.name }}
            </div>
            <div :class="m.fromMe ? 'flexum' : 'flex'">

              <div class="msg-text">
                {{ m.text }}
              </div>
              <div class="msg-time">
                {{ formatTime(m.createdAt) }}
              </div>

            </div>

          </div>

        </div>

      </div>
      <div class="chat-input" v-if="activeChat">

        <input v-model="text" placeholder="Написать сообщение..." @keydown.enter="sendMessage" />

        <button @click="sendMessage">
          Отправить
        </button>

      </div>
    </div>

  </div>
</template>

<style>
/* =========================
   🌐 PAGE (как у карточек)
========================= */

.chat-page {
  display: flex;
  height: calc(100vh - 80px);
  /* ВАЖНО */
  background: #f4f6f9;
  /* как .page у тебя */
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial;
}

/* =========================
   📋 LEFT CHAT LIST
========================= */

.chat-list {
  width: 360px;
  background: white;
  border-right: 1px solid #e5e7eb;
  overflow-y: auto;
  padding: 10px;
}

/* scroll */
.chat-list::-webkit-scrollbar {
  width: 6px;
}

.chat-list::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 10px;
}

/* =========================
   👤 CHAT ITEM (в стиле твоих cards)
========================= */

.chat-user {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 14px;
  cursor: pointer;
  background: #ffffff;
  border: 1px solid #eef0f3;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.04);
  transition: 0.2s ease;
}

.chat-user:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.07);
}

.chat-user.active {
  border: 1px solid #6366f1;
  background: #f5f7ff;
}

/* =========================
   🖼 AVATAR (как seller avatar)
========================= */

.chat-avatar {
  width: 50px;
  height: 50px;

  border-radius: 50%;
  object-fit: cover;

  border: 2px solid #ffffff;

  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}

/* =========================
   🧾 TEXT BLOCK
========================= */

.chat-meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.chat-meta h4 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #111827;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-meta p {
  margin: 3px 0 0;
  font-size: 12px;
  color: #6b7280;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* =========================
   💬 CHAT WINDOW
========================= */

.chat-window {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f4f6f9;

  height: calc(100vh - 80px);
  /* ВАЖНО */
  overflow: hidden;
  /* чтобы ничего не вылезало */
}

/* =========================
   🧠 HEADER (как back-btn стиль)
========================= */

.chat-header {
  background: white;

  padding: 14px 16px;

  border-bottom: 1px solid #e5e7eb;

  font-weight: 600;
  color: #111827;

  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);
}

/* =========================
   💬 MESSAGES AREA
========================= */

.messages {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;

  overflow-y: auto;
  /* ВАЖНО */
  min-height: 0;
  /* ВАЖНО (фикс для flex) */
}

/* =========================
   💭 MESSAGE BUBBLES (в стиле кнопок/карточек)
========================= */

.message {
  max-width: 65%;
  padding: 10px 14px;
  border-radius: 14px;
  font-size: 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 5px;
}

.message span {
  font-size: 10px;

}

/* mine */
.mine {
  align-self: flex-end;
  color: white;
  border-bottom-right-radius: 6px;
  text-align: end;
}

/* other */
.other {
  align-self: flex-start;
  color: #000000;
  border-bottom-left-radius: 6px;
  text-align: start;

}

/* =========================
   ✍️ INPUT AREA (как кнопки в карточке)
========================= */

.chat-input {
  display: flex;
  gap: 10px;
  padding: 12px;
  background: white;
  border-top: 1px solid #e5e7eb;
}

.chat-input input {
  flex: 1;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  outline: none;
  font-size: 14px;
  transition: 0.2s;
}

.chat-input input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

/* button */
.chat-input button {
  padding: 12px 16px;

  border: none;

  border-radius: 12px;

  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;

  cursor: pointer;

  transition: 0.2s;
}

.chat-input button:hover {
  transform: translateY(-2px);
}

/* =========================
   ✨ ANIMATION
========================= */

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* =========================
   📱 MOBILE
========================= */

/* =========================
   📱 MOBILE FIX (ПОЛНОСТЬЮ ПЕРЕДЕЛАНО)
========================= */

@media (max-width: 768px) {

  /* главный контейнер */
  .chat-page {
    flex-direction: column;
    height: calc(100vh - 130px);
    /* лучше чем 100vh на мобиле */
    overflow: hidden;
  }

  /* =========================
   📋 СПИСОК ЧАТОВ (mobile fullscreen)
========================= */

  .chat-list {
    width: 95%;
    height: 100dvh;
    padding: 10px;

    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }



  .chat-window {
    width: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }



  .chat-header {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 12px;

    position: relative;
  }

  .back-btni {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30px;
    line-height: 1;
    border: none;
    background: #f3f4f6;
    border-radius: 10px;
    cursor: pointer;
    flex-shrink: 0;
    padding-bottom: 10px;
    color: #2563eb;
  }

  .chat-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;

    flex: 1;
    text-align: center;

    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }



  .messages {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 12px;

  }



  .message {
    max-width: 85%;
    font-size: 15px;
  }



  .chat-input {
    flex-shrink: 0;
    padding: 10px;
    gap: 8px;
  }

  .chat-input input {
    font-size: 16px;
    padding: 12px;
  }

  .chat-input button {
    padding: 12px 14px;
    white-space: nowrap;
  }


  .chat-user {
    padding: 10px;
    border-radius: 12px;
  }

  .chat-avatar {
    width: 44px;
    height: 44px;
  }
}

.flexo {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0px 10px 0px 10px;
  margin-bottom: 20px;
}

.textchat {
  font-size: 20px;
  font-weight: 800;
}


.tritochki {
  display: flex;
  flex-direction: column;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  padding: 5px;
  justify-content: center;
  align-items: center;
  transition-duration: 300ms;
  gap: 3px;
  cursor: pointer;
}

.tritochki:hover {
  box-shadow: 1px 1px 20px 1px #2563eb;

}

.tritochki span {
  width: 4px;
  height: 4px;
  background: #333;
  border-radius: 50%;
}

.tritochki span:active {

  background: #ff0000;
}

/* =========================
   🔍 SEARCH
========================= */



.search-box {
  width: 100%;
  margin-bottom: 20px;
  box-sizing: border-box;

}

.search-box input {
  width: 100%;
  max-width: 100%;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid #0055ff;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
}


/* =========================
   🧊 MODAL
========================= */

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: calc(100vh - 200px);
  background: rgba(0, 0, 0, 0);
  display: flex;
  align-items: flex-start;

  padding: 70px 20px;
  z-index: 2;
}

.modal-menu {
  width: 200px;
  background: white;
  border-radius: 14px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  animation: fadeIn 0.2s ease;
  position: absolute;
  top: 22%;
  left: 20%;
}

.menu-item {
  padding: 14px;

  cursor: pointer;

  font-size: 14px;

  transition: 0.2s;
}

.menu-item:hover {
  background: #f3f4f6;
}

.menu-item.danger {
  color: red;
}

.msg-row {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
  align-items: flex-end;
}

/* мои сообщения справа */
.msg-row.mine {
  flex-direction: row-reverse;
}

/* чужие слева */
.msg-row.other {
  flex-direction: row;
}

.msg-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  object-fit: cover;
}

/* пузырь */
.bubble {
  max-width: 100%;
  padding: 10px 12px;
  border-radius: 14px;
  word-break: break-word;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

/* mine */
.msg-row.mine .bubble {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border-bottom-right-radius: 4px;
}

/* other */
.msg-row.other .bubble {
  background: white;
  color: #111827;
  border: 1px solid #e5e7eb;
  border-bottom-left-radius: 4px;
}

/* имя */
.msg-name {
  font-size: 11px;
  font-weight: 600;
  opacity: 0.9;
  margin-bottom: 4px;

}

/* текст */
.msg-text {
  font-size: 14px;
}

/* время */
.msg-time {
  width: 30px;
  font-size: 10px;
  opacity: 0.6;
  text-align: right;
  margin-top: 4px;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
}

.flexum {
  display: flex;
  gap: 15px;
  flex-direction: row-reverse;
  align-items: flex-end;
}

.flex {
  align-items: flex-end;
}

.avatar-wrap {
  border: 3px solid #6366f1;
  border-radius: 50%;
  padding: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #fff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  cursor: zoom-in;
}

.flee {
  display: flex;
  align-items: center;
  gap: 15px;

}

@media (max-width: 768px) {
  .search-box input {
    font-size: 16px;
    /* чтобы не зумило iOS */
    padding: 10px 12px;
    border-radius: 10px;
  }
}
</style>