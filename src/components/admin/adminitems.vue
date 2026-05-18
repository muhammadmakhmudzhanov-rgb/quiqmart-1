<script setup lang="ts">
import { ref, onBeforeMount } from "vue";
import Cookies from 'js-cookie';
import { useMainStore } from "../../pinia/useItemsStore";
const usestore = useMainStore()
const token = Cookies.get('token');
interface User {
    id: number;
    description: string;
    name: string;
    image: string;
    price: number;
    userId: number;
}

// 👉 твои данные (потом сюда fetch подставишь)
const users = ref<User[]>([]);


const getadminitems = async () => {
  try {
    const response = await fetch(`https://${usestore.text}/admin/items`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    users.value = data

  } catch (error) {
    console.error(error);
  }
};
const Deleteadminitems = async (id: number) => {
  try {
    await fetch(`https://${usestore.text}/admin/items/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    getadminitems()
  } catch (error) {
    console.error(error);
  }
};






const formatPrice = (value: number) => {
  return new Intl.NumberFormat('ru-RU').format(value)
}
onBeforeMount(()=>{
    getadminitems()
})
</script>

<template>
    <div class="wrapper">
  
      <div class="grid">
        <div class="card" v-for="item in users" :key="item.id">
  
          <!-- 🖼 КАРТИНКА -->
          <div class="img-box">
  
            <RouterLink :to="`/card${item.id}`" @click="usestore.search = ''">
              <img :src="`http://${usestore.text}${item.image}`" alt="" />
            </RouterLink>
  
            <!-- 🔥 ADMIN ACTIONS -->
            <div class="actions">
              <button class="delete" @click="Deleteadminitems(item.id)">✕</button>
            </div>
  
          </div>
  
          <!-- 📦 КОНТЕНТ -->
          <div class="content">
  
            <div class="price">{{ formatPrice(item.price) }} сом</div>
  
            <div class="name">{{ item.name }}</div>
  
            <div class="desc">{{ item.description }}</div>
  
          </div>
  
        </div>
      </div>
  
    </div>
  
    <loadingsupper v-if="usestore.loadingsupp == true" class="load"></loadingsupper>
  </template>
  
  <style scoped>
  .wrapper {
  width: 100%;
}

/* GRID */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 24px;
  padding: 24px;
}

/* CARD */
.card {
  background: white;
  border-radius: 20px;
  overflow: hidden;

  border: 1px solid #e5e7eb;
  transition: 0.3s;

  display: flex;
  flex-direction: column;
}

.card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}

/* IMAGE */
.img-box {
  height: 260px;
  position: relative;
  overflow: hidden;
}

.img-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: 0.4s;
}

/* zoom */
.card:hover img {
  transform: scale(1.08);
}

/* 🔥 ACTIONS */
.actions {
  position: absolute;
  top: 10px;
  right: 10px;  
  transform: translateY(-10px);
  transition: 0.25s;
  opacity: 1;
}

.card:hover .actions {
  opacity: 1;
  transform: translateY(0);
}

/* delete btn */
.delete {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(239, 68, 68, 0.95);
  color: white;
  cursor: pointer;
  font-size: 12px;
  transition: 0.2s;
}

.delete:hover {
  background: #dc2626;
  transform: scale(1.1);
}

/* CONTENT */
.content {
  padding: 14px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

/* PRICE */
.price {
  font-size: 20px;
  font-weight: 800;
  color: #ef4444;
  margin-bottom: 6px;
}

/* NAME */
.name {
  font-size: 16px;
  font-weight: 600;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* DESC */
.desc {
  font-size: 12px;
  color: #64748b;
  margin-top: 4px;

  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* BOTTOM */
.bottom {
  margin-top: auto;
}

/* BUTTON */
.btn {
  margin-top: 10px;
  width: 100%;

  padding: 8px;
  border-radius: 10px;
  border: none;

  background: #ef4444;
  color: white;

  font-size: 13px;
  font-weight: 600;

  cursor: pointer;
  transition: 0.2s;
}

.btn:hover {
  background: #dc2626;
  transform: scale(1.03);
}

/* LOADING */
.load {
  position: fixed;
  top: 50%;
  left: 50%;
}

/* 📱 MOBILE */
@media (max-width: 600px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    padding: 10px;
  }

  .img-box {
    height: 180px;
  }

  .name {
    font-size: 14px;
  }

  .price {
    font-size: 16px;
  }
}
  </style>