<script setup lang="ts">
import { RouterView, useRoute, useRouter } from 'vue-router'
import { ref, onMounted } from "vue";
import { useMainStore } from "../pinia/useItemsStore";
import Cookies from 'js-cookie';

const token = Cookies.get('token');
const route = useRoute();
const router = useRouter();
const usestore = useMainStore();


const name = ref('');
const price = ref(0);
const discount = ref(0);
const description = ref('');
const burgerOpen = ref(true)

const file = ref<File | null>(null);
const extraFiles = ref<File[]>([]);
const extraPreviews = ref<string[]>([]);
const trueflse = ref(false);
const submitted = ref(false);

const preview = ref<string | null>(null)
// =====================
// FILE HANDLER
// =====================
const handleFile = (e: Event) => {
  const target = e.target as HTMLInputElement;

  if (target.files && target.files.length > 0) {
    file.value = target.files[0];

    // создаём превью
    preview.value = URL.createObjectURL(target.files[0]);
  }
};

// =====================
// RESET FORM
// =====================
const otmena = () => {
  name.value = '';
  price.value = 0;
  discount.value = 0;
  file.value = null;
  description.value = '';
  submitted.value = false;
  trueflse.value = false;

  if (preview.value) {
    URL.revokeObjectURL(preview.value);
  }

  preview.value = null;
};


const postfunction = async () => {
  submitted.value = true;

  if (!name.value || !discount.value || !file.value || !description.value) {
    return;
  }

  const formData = new FormData();

  formData.append('name', name.value);
  formData.append('price', String(discount.value));
  formData.append('oldPrice', String(price.value));
  formData.append('description', description.value);

  // 📸 главное фото
  formData.append('image', file.value);

  // 📸 дополнительные фото
  extraFiles.value.forEach((img) => {
    formData.append('images', img);
  });

  try {
    await fetch(`http://${usestore.text}/items`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    otmena();
    await usestore.getCartCount();
    usestore.getfunction();
    extraPreviews.value = []
  } catch (error) {
    console.error(error);
  }
};
const handleExtraFiles = (e: Event) => {
  const target = e.target as HTMLInputElement;

  if (target.files) {
    const newFiles = Array.from(target.files);


    extraFiles.value = [...extraFiles.value, ...newFiles];

    const newPreviews = newFiles.map(file =>
      URL.createObjectURL(file)
    );

    extraPreviews.value = [...extraPreviews.value, ...newPreviews];
  }


  target.value = '';
};



const functrufals = () => {
  trueflse.value = true
  burgerOpen.value = false
}
onMounted(() => {
  if (token) {
    usestore.getCartCount();
    usestore.getadmin()
  }
});
</script>


<template>
  <header class="nav" :class="{ 'logot': route.fullPath == '/registr' }">
    <img src="../../public/ChatGPT Image 15 апр. 2026 г., 15_16_37.png" alt="" class="logo"
      :class="{ 'logotwo': route.fullPath == '/' }" @click="router.push('/user')">

    <div class="search" v-if="route.fullPath == '/user'">
      <input type="text" placeholder="Поиск товаров..." v-model="usestore.search" />
    </div>
    <div class="search" v-if="route.fullPath !== '/' && route.fullPath !== '/registr' && route.fullPath !== '/user'">
      <input type="text" placeholder="Поиск товаров..." v-model="usestore.search" disabled />
    </div>

    <div class="actions" v-if="route.fullPath !== '/' && route.fullPath !== '/registr'">
      <img src="../../public/free-icon-add-button-8371357.png" alt="" class="icon" @click="trueflse = true"
        v-if="usestore.admintrue == true">
      <img src="../../public/free-icon-chat-bubble-18332775.png" alt="" class="icon" @click="router.push('/chat')">
      <div class="cart-wrapper">
        <RouterLink to="/korzine" class="n">Корзина</RouterLink>

        <span v-if="usestore.cartCount > 0 && route.fullPath !== '/korzine'" class="badge">
          {{ usestore.cartCount }}
        </span>
      </div>
      <RouterLink to="/profile" class="n">Профиль</RouterLink>
    </div>
    <!-- 🍔 BURGER -->
    <div class="burger" @click="burgerOpen = !burgerOpen" v-if="route.fullPath !== '/' && route.fullPath !== '/registr'">
      <span></span>
      <span></span>
      <span></span>
    </div>
  </header>

  <div class="search-baro" v-if="route.fullPath !== '/' && route.fullPath !== '/registr'" :class="{ 'open': burgerOpen }">
    <div class="cart-wrapper">
      <RouterLink to="/korzine" class="n" @click="burgerOpen = false">Корзина</RouterLink>

      <span v-if="usestore.cartCount > 0 && route.fullPath !== '/korzine'" class="badge">
        {{ usestore.cartCount }}
      </span>
    </div>
    <img src="../../public/free-icon-add-button-8371357.png" alt="" class="icon" @click="functrufals"
      v-if="usestore.admintrue == true">
    <img src="../../public/free-icon-chat-bubble-18332775.png" alt="" class="icon"
      @click="router.push('/chat'), burgerOpen = false">
    <RouterLink to="/profile" class="n" @click="burgerOpen = false">Профиль</RouterLink>
  </div>

  <div class="search-bar" v-if="route.fullPath == '/user'" :class="{ 'mrtop': burgerOpen }">
    <input type="text" placeholder="Поиск товаров..." v-model="usestore.search" />
  </div>

  <main class="main">
    <!-- МОДАЛКА -->
    <div class="modal" v-if="trueflse">
      <div class="modal-box">
        <h2>Добавить товар</h2>

        <!-- NAME -->
        <input type="text" v-model="name" placeholder="Название" :class="{ errorInput: submitted && !name }" />
        <p class="preduprejdenie" v-if="submitted && !name">
          Заполните название
        </p>

        <p class="cena">Цена</p>
        <input type="number" v-model="price" placeholder="Цена" :class="{ errorInput: submitted && !price }" />

        <p class="cena">акционная цена</p>
        <input type="number" v-model="discount" placeholder="Цена" :class="{ errorInput: submitted && !price }" />
        <p class="preduprejdenie" v-if="submitted && !discount">
          Укажите цену
        </p>




        <!-- IMAGE -->
        <p class="cena">Фото товара</p>
        <input type="file" accept="image/*" @change="handleFile" />
        <p v-if="submitted && !file" class="preduprejdenie">
          Выберите изображение
        </p>

        <img v-if="preview" :src="preview" class="preview-img" alt="preview" />
        <p class="cena">Дополнительные фото</p>

        <input type="file" multiple accept="image/*" @change="handleExtraFiles" />

        <div class="preview-row">
          <img v-for="(img, i) in extraPreviews" :key="i" :src="img" class="preview-img-small" />
        </div>

        <!-- DESCRIPTION -->
        <input type="text" v-model="description" placeholder="Описание"
          :class="{ errorInput: submitted && !description }" />
        <p class="preduprejdenie" v-if="submitted && !description">
          Напишите описание
        </p>

        <div class="actionsi">
          <button class="btn" @click="postfunction">
            Добавить
          </button>

          <button class="cancel" @click="otmena">
            Отмена
          </button>
        </div>
      </div>
    </div>

    <transition name="fade">
      <RouterView />
    </transition>
  </main>
</template>
  
<style scoped>
.cena {
  font-size: 12px;
  padding: 0;
  margin: 0;
  margin-left: 3px;
}

.nav {
  position: sticky;
  top: 0;
  z-index: 999;

  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);

  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  height: 50px;
  overflow: hidden;
}

/* LOGO */
.logo {
  width: 300px;
  cursor: pointer;
  margin-top: 10px;
}

.logotwo {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  margin: 0;
}

.logot {
  display: flex;
  justify-content: center;
}

/* SEARCH */
.search {
  flex: 1;
  display: flex;
  justify-content: center;
}

.icon {
  width: 40px;
  margin-right: 10px;
}

.search input {
  width: 60%;
  padding: 10px 14px;

  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);

  outline: none;
  transition: 0.2s;
  background: white;
}

.search input:focus {
  width: 70%;
  border-color: #3b82f6;
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.2);
}

/* ACTIONS */
.actions {
  display: flex;
  gap: 10px;
}

.button {

  border-radius: 10px;
  border: none;
  background: #f1f5f9;
  cursor: pointer;
  transition: 0.2s;
  font-weight: 600;
  text-decoration: none;
}

.button:hover {
  background: #e2e8f0;
  transform: translateY(-2px);
}

.profile {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}

.profile:hover {
  box-shadow: 0 10px 20px rgba(37, 99, 235, 0.3);
}

.modal-toggle {
  display: none;
}

/* фон */
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 1;
  z-index: 999;
  transition: 0.2s;
  overflow-y: auto;
}



.modal-box {
  background: white;
  padding: 20px;
  border-radius: 12px;
  width: 320px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 160px;
}

input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  outline: none;
}

.actionsi {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.btn {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  border: none;
}

.cancel {
  background: #ddd;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
}

.open-btn {
  display: inline-block;
  padding: 10px 14px;
  background: black;
  color: white;
  border-radius: 8px;
  cursor: pointer;
}

.preduprejdenie {
  color: red;
  margin: 0;
  padding: 0;
}

.n {
  background: #f1f5f9;
  display: flex;
  align-items: center;
  color: black;
  text-decoration: none;
  font-weight: 700;
  font-size: 13px;
  padding: 13px;
  border-radius: 10px;
  transition: 0.2s;
}

.n:hover {
  background: #e2e8f0;
  transform: translateY(-2px);
}

.cart-wrapper {
  position: relative;
}

.badge {
  position: absolute;
  top: -6px;
  right: -8px;
  background: #ef4444;
  color: white;
  font-size: 12px;
  font-weight: bold;
  padding: 2px 1px;
  border-radius: 50%;
  min-width: 18px;
  text-align: center;
}

.search-bar {
  padding: 12px 20px;
  background: #f8fafc;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  display: none;

}

.search-baro {
  transform: translateY(-120px);
  display: none;
  justify-content: space-between;
  overflow: hidden;
  transition: all 500ms;
  position: fixed;
  width: 100%;

}

.open {
  height: 39px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.7);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  transform: translateY(0px);
  overflow: hidden;
  position: fixed;
  width: 95%;
  margin-top: -0.1px;

}

.search-bar input {

  padding: 12px 16px;

  border-radius: 14px;
  border: 1px solid #e2e8f0;

  outline: none;
  background: white;
  font-size: 14px;

  transition: 0.2s;
}

.search-bar input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.2);
}

/* =========================
📱 МОЩНАЯ АДАПТАЦИЯ
========================= */
@media (max-width: 768px) {

  /* HEADER */
  .nav {
    padding: 10px 12px;

  }

  /* ЛОГО */
  .logo {
    width: 250px;
    margin-top: 15px;
  }

  .logotwo {
    position: static;
    transform: none;
  }

  /* ❌ УБИРАЕМ ПОИСК ИЗ ХЕДЕРА */
  .search {
    display: none;
  }

  /* ✅ ВКЛЮЧАЕМ НИЖНИЙ ПОИСК */
  .search-bar {
    padding: 10px 12px;
    display: block;
    transition-duration: 100ms;
  }

  .search-baro {

    display: flex;
    z-index: 222;

  }

  .search-bar input {
    width: 95%;
    font-size: 13px;
    padding: 10px 12px;
    border-radius: 12px;

  }

  .mrtop {
    margin-top: 63px;
  }

  /* ACTIONS */
  .actions {
    gap: 6px;
    display: none;
  }




  /* BADGE */
  .badge {
    top: -4px;
    right: -6px;
    font-size: 10px;
    min-width: 16px;
  }

  /* МОДАЛКА */
  .modal-box {
    width: 92%;
    padding: 16px;
    margin: 10px;
  }
}

@media (max-width: 491px) {
  .logo {
    width: 230px;
    margin-top: 10px;
    margin-left: -20px;
  }

  .icon {
    width: 40px;
  }

}

@media (max-width: 461px) {
  .search-baro {
    margin-left: -10px;
  }
}

.preview-img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 12px;
  margin-top: 10px;
  border: 1px solid #ddd;
}

/* 🍔 BURGER */
.burger {
  display: none;
  flex-direction: column;
  gap: 4px;
  cursor: pointer;
}

.burger span {
  width: 22px;
  height: 2px;
  background: black;
  transition: 0.3s;
}

/* 📱 МЕНЮ */
.mobile-menu {
  position: fixed;
  top: 0;
  right: -100%;
  width: 70%;
  height: 100%;

  background: white;
  z-index: 999;

  display: flex;
  flex-direction: column;
  padding: 80px 20px;
  gap: 15px;

  transition: 0.3s;
}

/* открыто */
.mobile-menu.open {
  right: 0;
}

/* ссылки */
.mobile-menu a {
  text-decoration: none;
  font-size: 18px;
  font-weight: 600;
  color: black;
}

/* кнопка */
.add-btn {
  margin-top: 20px;
  padding: 10px;
  border: none;
  background: #3b82f6;
  color: white;
  border-radius: 8px;
  cursor: pointer;
}

@media (max-width: 768px) {
  .burger {
    display: flex;
  }

}
.preview-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 6px;
}

.preview-img-small {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid #ddd;
}
</style>