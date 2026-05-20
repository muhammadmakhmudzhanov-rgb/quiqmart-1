<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, } from "vue-router";
import Cookies from "js-cookie";
import { useMainStore } from "../pinia/useItemsStore";

const usestore = useMainStore()

const router = useRouter();
const email = ref('')
const password = ref('')
const message = ref('')
const token = Cookies.get('token');
const ojidanie = ref(false)


const register = async () => {
  message.value = ''
  ojidanie.value = true
  try {

    const res = await fetch(`https://${usestore.text}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value,
        password: password.value
      })
    })

    const data = await res.json()

    if (!res.ok) {
      message.value = data.message
      return
    }
    if (res.ok) {
      router.push('/user');
      Cookies.set("token", data.token, { expires: 0.5 });
    }

    message.value = 'вход....'

    email.value = ''
    password.value = ''
    

    if (token) {
    router.push('/user');
    }
  }
    catch (error) {
    console.error(error)
  }
    finally{
      ojidanie.value = false
    }

}

if (token) {
  router.push('/user');
}
</script>

<template>
  <div class="page">
    <div class="card">
      <h1 class="tt">Войти в аккаунт</h1>
      <p class="subtitle">вход в аккаунт</p>

      <form @submit.prevent="register" class="form">
        <input v-model="email" type="email" placeholder="Email" />
        <input v-model="password" type="password" placeholder="Пароль" />

        <button v-if="ojidanie == false">войти</button>
        <button v-if="ojidanie == true" disabled>войти</button>
        <div class="vhod">
          <p>Если у вас нету аккаунта -></p>
          <RouterLink class="link" to="/registr">Зарегистрироваться</RouterLink>
        </div>

        <p v-if="message" class="msg">{{ message }}</p>
      </form>
    </div>
  </div>
</template>
  
  
  
<style scoped>
/* фон */
.page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;

  background: linear-gradient(135deg, #eef2ff, #f8fafc);
  font-family: Arial, sans-serif;
  padding: 20px;
}

/* карточка */
.card {
  width: 380px;
  padding: 32px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
  text-align: center;
  transition: 0.3s;
}

.card:hover {
  transform: translateY(-4px);
}

/* заголовок */
.tt {
  margin-bottom: 6px;
  font-size: 24px;
  font-weight: 600;
  display: block;
}

.subtitle {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 22px;
}

/* форма */
.form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* 🔥 ИНПУТЫ */
input {
  padding: 12px 14px;
  border-radius: 12px;

  border: 1px solid #e5e7eb;
  background: #f9fafb;

  outline: none;
  transition: 0.25s;
  font-size: 14px;
}

input:focus {
  border-color: #6366f1;
  background: white;

  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15);
  transform: scale(1.02);
}

/* 🔥 КНОПКА */
button {
  padding: 12px;
  border-radius: 12px;
  border: none;

  cursor: pointer;

  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;

  font-weight: 600;
  letter-spacing: 0.3px;

  transition: 0.25s;
}

button:hover {
  transform: translateY(-2px) scale(1.01);
  box-shadow: 0 10px 25px rgba(99, 102, 241, 0.3);
}

/* ссылка */
.vhod {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.link {
  color: #6366f1;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: 0.2s;
}

.link:hover {
  border-color: #6366f1;
}

/* сообщение */
.msg {
  font-size: 12px;
  color: #10b981;
}

/* 📱 адаптив */
@media (max-width: 600px) {

  .card {
    width: 100%;
    max-width: 340px;
    padding: 24px;
    border-radius: 16px;
  }

  .tt {
    font-size: 20px;
  }

  input {
    padding: 11px;
  }

  button {
    padding: 11px;
  }

  .vhod {
    flex-direction: column;
    gap: 4px;
    text-align: center;
  }
}
</style>