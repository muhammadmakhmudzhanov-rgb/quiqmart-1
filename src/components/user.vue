<script setup lang="ts">
import { onBeforeMount, ref } from "vue";
import { jwtDecode } from "jwt-decode";
import Cookies from 'js-cookie';
import { useRouter } from "vue-router";
import { useMainStore } from "../pinia/useItemsStore";
import loadingsupper from "../components/loadingsupper.vue";

const usestore = useMainStore()
const router = useRouter();
const token = Cookies.get('token');
const showModal = ref(false)
const decoded: any = jwtDecode(token || '')
const myId = decoded.id

const formatPrice = (value: number) => {
  return new Intl.NumberFormat('ru-RU').format(value)
}



const buyItem = async (itemId: number) => {
  await fetch(`https://${usestore.text}/cart`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ itemId })
  })
  await usestore.getCartCount()
  showModal.value = true
}

const slides = ref([
  "/slider1.png",
  "/slider2.png",
  "/slider3.png"
])

const currentSlide = ref(0)

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % slides.value.length
}

const prevSlide = () => {
  currentSlide.value =
    (currentSlide.value - 1 + slides.value.length) % slides.value.length
}

// авто-слайд
setInterval(() => {
  nextSlide()
}, 4000)

onBeforeMount(async () => {
  await usestore.getfunction();
  if (!token) {
    router.push('/')
  }
});
</script>

<template>
  <div class="wrapper" v-if="usestore.loadingsupp == false">

    <div class="slider" :style="{ backgroundImage: `url(${slides[currentSlide]})` }">
      <button class="arrow left" @click="prevSlide">‹</button>
      <button class="arrow right" @click="nextSlide">›</button>

      <div class="dots">
        <span v-for="(s, index) in slides" :key="s" :class="{ active: index === currentSlide }"
          @click="currentSlide = index"></span>
      </div>
    </div>


    <div class="grid">
      <div class="card" v-for="item in usestore.postListFilter">
        <RouterLink :to="`/card${item.id}`" class="img-box" @click="usestore.search = ''">
          <img :src="`https://${usestore.text}${item.image}`" alt="" />
        </RouterLink>

        <div class="content">
          <div class="price">
            <span class="new">{{ formatPrice(item.price) }} сом</span>

            <span v-if="item.oldPrice" class="old">
              {{ formatPrice(item.oldPrice) }} сом
            </span>

            <span v-if="item.discount" class="discount">
              -{{ item.discount }}%
            </span>
          </div>
          <div class="name">{{ item.name }}</div>
          <div class="desc">{{ item.description }}</div>

          <div class="bottom">

            <button class="btni" @click="buyItem(item.id)" :disabled="item.userId === myId">
              {{ item.userId === myId ? 'Ваш товар' : 'Купить' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-if="showModal" class="modal-overlay" @click="showModal = false">
    <div class="modal" @click.stop>
      <div class="modal-icon">✔</div>

      <h2>Добавлено в корзину</h2>
      <p>Товар успешно добавлен</p>

      <button @click="showModal = false">Ок</button>
    </div>
  </div>
  <loadingsupper v-if="usestore.loadingsupp == true" class="load"></loadingsupper>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 24px;
  padding: 24px;
  justify-items: center;
}

.load {
  position: fixed;
  top: 50%;
  left: 50%;
}

.slider {
  height: 320px;
  border-radius: 28px;
  margin: 25px;
  margin-bottom: 0;
  margin-top: 20px;
  position: relative;
  overflow: hidden;

  background-size: cover;
  background-position: left center;
  background-repeat: no-repeat;
}

.slide-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: 0.5s ease;
}

/* стрелки */
.arrow {
  position: absolute;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.3);
  border: none;
  color: white;
  font-size: 28px;
  padding: 1px 14px 5px;
  border-radius: 50%;
  cursor: pointer;
  z-index: 2;
  text-align: center;
}

.left {
  left: 15px;
}

.right {
  right: 15px;
}

/* точки */
.dots {
  position: absolute;
  bottom: 10px;
  width: 100%;
  text-align: center;
}

.dots span {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin: 4px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  cursor: pointer;
}

.dots .active {
  background: white;
}

/* CARD */
.card {
  width: 100%;
  max-width: 300px;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(10px);
  border-radius: 22px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
  transition: 0.3s ease;
  display: flex;
  flex-direction: column;
  position: relative;
}

.card {
  height: 100%;
}

.content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.bottom {
  margin-top: auto;
}


/* IMAGE */
.img-box {
  height: 350px;
  padding: 10px;

}

.img-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}



/* CONTENT */
.content {
  padding: 14px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

/* NAME */
.name {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* DESC */
.desc {
  font-size: 12px;
  color: #64748b;
  line-height: 1.4;

  display: -webkit-box;
  -webkit-line-clamp: 2;
  /* 👈 сколько строк */
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* PRICE */
.price {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  line-height: 1.2;
  min-height: 26px;
}

.new,
.old {
  overflow: hidden;
  text-overflow: ellipsis;
}


.new {
  font-size: 18px;
  font-weight: bold;
  color: #ff0000;
}

.new {
  font-size: clamp(14px, 2vw, 18px);
}

.old {
  text-decoration: line-through;
  color: gray;
}

.discount {
  background-color: rgb(221, 255, 0);
  padding: 3px;
  color: rgb(255, 89, 0);
  font-weight: bold;
}

@media (max-width: 480px) {
  .price {
    flex-direction: column;
    align-items: flex-start;
  }
}

/* BUTTON */
.btni {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.25s;
  width: 100%;
  margin-top: 10px;
}

.btni:hover {
  transform: scale(1.08);
  box-shadow: 0 10px 20px rgba(37, 99, 235, 0.3);
}

.acsia {
  width: 15px;
  height: 15px;
}

@media (max-width: 1024px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
    /* 📱 2 карточки */
  }
}

@media (max-width: 480px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
    /* 📱 всё равно 2 как WB */
    gap: 10px;
    padding: 10px;
  }

  .card {
    max-width: 100%;
    border-radius: 14px;
  }

  .img-box {
    height: 220px;
  }

  .name {
    font-size: 14px;
    margin: 0;
  }

  .price {
    font-size: 16px;
    margin-bottom: 5px;
  }

  .btni {
    margin-top: 3px;
  }

  .content {
    padding: 5px;
  }
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  height: 100%;
}

.modal {
  width: 300px;
  background: white;
  border-radius: 18px;
  padding: 20px;
  text-align: center;
  animation: pop 0.2s ease;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
}

.modal-icon {
  width: 50px;
  height: 50px;
  margin: 0 auto 10px;
  background: #4caf50;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.modal h2 {
  margin: 10px 0 5px;
  font-size: 18px;
}

.modal p {
  font-size: 14px;
  color: #666;
  margin-bottom: 15px;
}

.modal button {
  padding: 10px;
  width: 100%;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  cursor: pointer;
  transition: 0.2s;
}

.modal button:hover {
  background: #3e8194;
}

@keyframes pop {
  from {
    transform: scale(0.8);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}

.btni:disabled {
  background: gray;
  cursor: not-allowed;
  opacity: 0.7;
  transform: none;
  box-shadow: none;
}

</style>