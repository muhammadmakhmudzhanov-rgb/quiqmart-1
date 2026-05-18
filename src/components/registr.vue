<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from "vue-router";
import { useMainStore } from "../pinia/useItemsStore";
import Cookies from "js-cookie";

const usestore = useMainStore()
const router = useRouter();

const email = ref('')
const password = ref('')
const name = ref('')
const message = ref('')
const token = Cookies.get('token');
const emailError = ref('')
const passwordError = ref('')
const nameError = ref('')
const avatarError = ref('')
const ojidanie = ref(false)

const validate = () => {
  let valid = true

  emailError.value = ''
  passwordError.value = ''
  nameError.value = ''

  if (!email.value) {
    emailError.value = 'Введите email'
    valid = false
  }

  if (!password.value) {
    passwordError.value = 'Введите пароль'
    valid = false
  } else if (password.value.length < 4) {
    passwordError.value = 'Минимум 4 символа'
    valid = false
  }

  if (!name.value) {
    nameError.value = 'Введите имя'
    valid = false
  }
  if (!file.value) {
    avatarError.value = 'Загрузите аватар'
    valid = false
  }

  return valid
}

// 📸 файл
const file = ref<File | null>(null)

// 👁 предпросмотр
const preview = ref('')

const handleFile = (e: Event) => {
  const target = e.target as HTMLInputElement

  avatarError.value = ''

  if (!target.files || !target.files[0]) return

  const selectedFile = target.files[0]

  // 📌 проверка типа
  if (!selectedFile.type.startsWith('image/')) {
    avatarError.value = 'Можно загружать только изображения'
    return
  }

  // 📌 проверка размера (2MB)
  if (selectedFile.size > 2 * 1024 * 1024) {
    avatarError.value = 'Максимум 2MB'
    return
  }

  file.value = selectedFile
  preview.value = URL.createObjectURL(selectedFile)
}
const login = async () => {
  message.value = ''

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
}
const register = async () => {
  try {
    message.value = ''
    ojidanie.value = true

    if (!validate()) return

    const formData = new FormData()

    formData.append('email', email.value)
    formData.append('password', password.value)
    formData.append('name', name.value)

    if (file.value) {
      formData.append('avatar', file.value)
    }

    const res = await fetch(`https://${usestore.text}/register`, {
      method: 'POST',
      body: formData
    })

    const data = await res.json()

    if (!res.ok) {
      message.value = data.message
      return
    }


    if (res.ok) {
      login()
    }
    message.value = 'Аккаунт создан ✅'

    setTimeout(() => {
      router.push('/')
    }, 1000)
  } catch (error) {
    console.error(error)
  }
  finally {
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
      <h1 class="h1">Создать аккаунт</h1>
      <p class="subtitle">Регистрация в магазине</p>

      <form @submit.prevent="register" class="form">

        <input v-model="email" :class="{ 'error-input': emailError }" type="email" placeholder="Email" />
        <p v-if="emailError" class="error">{{ emailError }}</p>

        <input v-model="password" type="password" placeholder="Пароль" />
        <p v-if="passwordError" class="error">{{ passwordError }}</p>

        <input v-model="name" type="text" placeholder="Имя" />
        <p v-if="nameError" class="error">{{ nameError }}</p>

        <!-- 📸 загрузка -->
        <label class="upload-btn">
          Выбрать аватар
          <input type="file" @change="handleFile" hidden />
        </label>
        <p v-if="avatarError" class="error">{{ avatarError }}</p>

        <img v-if="preview" :src="preview" class="preview" />
        <button v-if="ojidanie == false">Зарегистрироваться</button>
        <button v-if="ojidanie == true" disabled>Зарегистрироваться</button>

        <div class="vhod">
          <p>Войти в аккаунт</p>
          <RouterLink class="link" to="/">Вход</RouterLink>
        </div>

        <p v-if="message" class="msg">{{ message }}</p>
      </form>
    </div>
  </div>
</template>

<style scoped>
.page {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f6f8;
}

.card {
  width: 380px;
  padding: 30px;
  border-radius: 16px;
  background: white;
  border: 1px solid #e5e7eb;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  text-align: center;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

input {
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
}

button {
  padding: 12px;
  border-radius: 10px;
  border: none;
  background: #3b82f6;
  color: white;
  cursor: pointer;
}

.preview {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  margin: 10px auto;
}

.msg {
  font-size: 12px;
  color: #10b981;
}

.vhod {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.h1 {
  display: block;
}

.link {
  color: #3b82f6;
  text-decoration: none;
  border-bottom: 1px solid #3b82f6;
}

/* ========================= */
/* 📱 MOBILE (до 600px) */
/* ========================= */
@media (max-width: 600px) {

  .page {
    padding: 16px;
    align-items: center;
  }

  .card {
    width: 100%;
    max-width: 340px;
    padding: 22px;
    border-radius: 14px;
  }

  h1 {
    font-size: 20px;
  }

  .subtitle {
    font-size: 12px;
  }

  input {
    padding: 10px;
    font-size: 14px;
  }

  button {
    padding: 10px;
    font-size: 14px;
  }

  .preview {
    width: 70px;
    height: 70px;
  }

  .vhod {
    flex-direction: column;
    gap: 5px;
    font-size: 12px;
  }
}

/* ========================= */
/* 📟 TABLET (600px - 900px) */
/* ========================= */
@media (min-width: 600px) and (max-width: 900px) {

  .card {
    width: 420px;
  }
}

/* ========================= */
/* 💻 MACBOOK / DESKTOP */
/* ========================= */
@media (min-width: 1200px) {

  .card {
    width: 400px;
  }
}

.error {
  font-size: 12px;
  color: #ef4444;
  text-align: left;
  margin-top: -8px;
  margin-bottom: 5px;
}

input {
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  transition: 0.2s;
}

input:focus {
  border-color: #3b82f6;
}

input.error-input {
  border-color: #ef4444;
}


input[type="file"] {
  padding: 8px;
  font-size: 12px;
}

.error {
  font-size: 12px;
  color: #ef4444;
  text-align: left;
  margin-top: -8px;
}

.upload-btn {
  background: #f3f4f6;
  padding: 10px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 13px;
  transition: 0.2s;
}

.upload-btn:hover {
  background: #e5e7eb;
}
</style>