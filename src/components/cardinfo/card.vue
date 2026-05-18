<script setup lang="ts">
import { ref, onBeforeMount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { watch } from "vue"
import Cookies from "js-cookie";
import { useMainStore } from "../../pinia/useItemsStore";
import loadingsupper from "../loadingsupper.vue";
import { jwtDecode } from "jwt-decode";

const token = Cookies.get("token")

const decodedd: any = jwtDecode(token || '')
const myIdd = decodedd.id

function parseJwt(token: string | undefined) {
    if (!token) return null

    try {
        const base64Url = token.split('.')[1]
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        )

        return JSON.parse(jsonPayload)
    } catch (e) {
        return null
    }
}

const decoded = parseJwt(token)
const myId = decoded?.id


const usestore = useMainStore()
const route = useRoute()
const router = useRouter()


const item = ref<any>({
    images: []
})
const arr = ref<any>(null)
const loading = ref(true)
const error = ref('')
const showModal = ref(false)
const current = ref(0)
const host = usestore.text

const formatPrice = (value: number) => {
    return new Intl.NumberFormat('ru-RU').format(value)
}

const getItem = async (id: number) => {
    try {
        const res = await fetch(`http://${usestore.text}/items/${id}`)

        const data = await res.json()

        if (!res.ok) {
            error.value = data.message
            return
        }

        item.value = data
    } catch (e) {
        error.value = 'Ошибка загрузки'
    } finally {
        loading.value = false
    }
}
const getarr = async (id: number) => {
    try {
        const res = await fetch(`http://${usestore.text}/items/${id}/recommend`)

        const data = await res.json()

        arr.value = data
    } catch (e) {

    } finally {
        loading.value = false
    }
}

const buyItem = async () => {
    await fetch(`http://${usestore.text}/cart`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ itemId: item.value.id })
    })

    showModal.value = true
}
const chatvibor = async () => {
    if (item.value.seller.id === myId) {
        alert('Нельзя написать самому себе')
        return
    }

    const res = await fetch(`http://${usestore.text}/chat/find`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ userId: item.value.seller.id })
    })

    await res.json()

    router.push(`/chat`)
}

const showAvatarModal = ref(false);
const showimageModal = ref(false);

const openAvatar = () => {
    if (!item.value?.seller?.avatar) return;
    showAvatarModal.value = true;
};
const openimage = () => {
    if (!item.value?.image) return;
    showimageModal.value = true;
};

const closeAvatar = () => {
    showAvatarModal.value = false;
    showimageModal.value = false;
};

const click = async (id: number) => {
    await router.push(`/card${id}`)

    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    })
}
watch(
    () => route.params.id,
    async (newId) => {
        if (!newId) return
        loading.value = true
        await getItem(Number(newId))
        await getarr(Number(newId))
    }
)

onBeforeMount(async () => {
    console.log('ID:', route.params.id)
    await getItem(Number(route.params.id))
    await getarr(Number(route.params.id))
});
</script>

<template>
    <div class="page">
        <loadingsupper v-if="loading == true" class="load"></loadingsupper>
        <div v-else-if="error">{{ error }}</div>

        <div v-else class="card">
            <div class="content">
                <div v-if="item?.images?.length" class="item-gallery">
                    <div class="item-thumbs">
                        <img v-for="(img, index) in item.images" :key="index" :src="`http://${host}${img}`"
                            @click="current = index" :class="{ active: current === index }" />
                    </div>
                </div>
                <!-- 📸 КАРТИНКА -->
                <div class="left">
                    <div class="img-wrap">
                        <img :src="`http://${usestore.text}${item.images?.[current]}`" class="img" @click="openimage" />
                    </div>
                </div>

                <!-- 📦 ИНФА -->
                <div class="right">
                    <div class="top-bar">
                        <button class="back-btn" @click="router.push('/user')">← Назад</button>
                    </div>
                    <h1 class="cardh1">{{ item.name }}</h1>
                    <h3 class="cardh3">{{ item.description }}</h3>

                    <div class="price-block">
                        <span class="price">{{ formatPrice(item.price) }}</span>
                        <span class="currency">сом</span>
                    </div>

                    <div class="flex">

                        <button class="but" @click="buyItem" :disabled="item.userId === myIdd">
                            {{ item.userId === myIdd ? 'Ваш товар' : 'Купить' }}
                        </button>
                        <button @click="chatvibor" class="nb">Написать</button>
                    </div>

                    <div v-if="item.seller" class="seller">
                        <div class="avatar-wrap">
                            <img :src="`http://${usestore.text}/${item.seller.avatar}`" class="avatar"
                                @click="openAvatar" />
                        </div>

                        <div class="seller-info">
                            <span class="seller-label">Продавец</span>
                            <p class="seller-name">{{ item.seller.name }}</p>
                        </div>
                    </div>
                </div>

            </div>
            <div v-if="arr?.length" class="recommended-section">
                <h2 class="rec-title">Рекомендовано для вас</h2>

                <div class="rec-grid">
                    <div v-for="r in arr" :key="r.id" class="rec-card" @click="click(r.id)">
                        <img :src="`http://${usestore.text}${r.image}`" />

                        <div class="rec-info">
                            <p class="rec-name">{{ r.name }}</p>
                            <p class="rec-price">{{ formatPrice(r.price) }} сом</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- ⭐ РЕКОМЕНДАЦИИ -->
    <div v-if="showModal" class="modal-overlay" @click="showModal = false">
        <div class="modal" @click.stop>
            <div class="modal-icon">✔</div>

            <h2>Добавлено в корзину</h2>
            <p>Товар успешно добавлен</p>

            <button @click="showModal = false">отмена</button>
            <button @click="router.push('/korzine')">перейти в корзину</button>
        </div>
    </div>
    <div v-if="showAvatarModal" class="avatar-modal" @click="closeAvatar">
        <img :src="`http://${usestore.text}/${item.seller?.avatar}`" class="avatar-full" @click.stop />
    </div>
    <div v-if="showimageModal" class="avatar-modali" @click="closeAvatar">
        <img :src="`http://${usestore.text}${item.images?.[current]}`" class="avatar-fulli" @click.stop />
    </div>
</template>

<style scoped>
.page {
    padding: 30px 20px;
    background: #f4f6f9;
    min-height: 100vh;
}

.load {
    position: fixed;
    top: 50%;
    left: 50%;
}

.card {
    max-width: 900px;
    margin: auto;
    background: white;
    border-radius: 20px;
    padding: 20px;
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.08);
}

.content {
    display: flex;
    gap: 25px;
    align-items: flex-start;
}

/* 📸 */
.left {
    flex: 1;
}

.img {
    width: 100%;
    height: 560px;
    object-fit: cover;
    border-radius: 15px;
}

/* 📦 */
.right {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.cardh1 {
    font-size: 24px;
    margin-bottom: 10px;
}

.price {
    font-size: 22px;
    color: #4caf50;
    margin-bottom: 20px;
    font-weight: bold;
}

.nb {
    background-color: #4caf50;
    color: #fff;
    padding: 14px;
    border: none;
    border-radius: 12px;
    font-size: 16px;
    cursor: pointer;
    margin-bottom: 25px;
    transition: 0.2s;
}

.but {
    padding: 14px;
    border: none;
    border-radius: 12px;
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
    font-size: 16px;
    cursor: pointer;
    margin-bottom: 25px;
    transition: 0.2s;
}

.but:active {
    background: #3e8194;
}

.nb:active {
    background: #d0ff00;
}

/* 👤 */
.seller {
    margin-top: auto;
    display: flex;
    align-items: center;
    gap: 12px;

    padding: 12px;
    border-radius: 14px;

    background: #f8fafc;
    border: 1px solid #e5e7eb;
}

.avatar {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #fff;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
    cursor: zoom-in;
}

.seller-name {
    font-weight: 600;
    font-size: 15px;
    color: #111827;
}

.seller-label {
    font-size: 12px;
    color: #6b7280;
}

.seller-info {
    display: flex;
    flex-direction: column;
    line-height: 1.2;
}

.avatar {
    width: 70px;
    height: 70px;
    border-radius: 50%;
}


.back-btn {
    padding: 8px 14px;
    border-radius: 10px;
    border: 1px solid #e5e7eb;
    background: white;
    font-size: 14px;
    cursor: pointer;
    transition: 0.2s;
    color: #6366f1;
    font-weight: 500;

    display: flex;
    align-items: center;
    gap: 5px;
}

.back-btn:hover {
    background: #6366f1;
    color: white;
    transform: translateX(-2px);
}

/* 🔥 контейнер для выравнивания */
.top-bar {
    display: flex;
    justify-content: flex-start;
    margin-bottom: 10px;
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
    margin: 5px;
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

.img-wrap {
    border: 3px solid #6366f1;
    border-radius: 18px;
    padding: 4px;
}

.avatar-wrap {
    border: 3px solid #6366f1;
    border-radius: 50%;
    padding: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.img {
    width: 100%;
    height: 560px;
    object-fit: cover;
    border-radius: 14px;
    /* меньше чем wrapper */
}

.avatar {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    object-fit: cover;
}

.cardh1 {
    font-size: 22px;
    font-weight: 600;
    color: #111827;
    margin-bottom: 8px;
    line-height: 1.3;
}

.price-block {
    display: flex;
    align-items: baseline;
    gap: 6px;
    margin-bottom: 20px;
}

.price {
    font-size: 26px;
    font-weight: 700;
    color: #4f46e5;
}

.currency {
    font-size: 14px;
    color: #6b7280;
}

.avatar-modal {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
    animation: fadeIn 0.2s ease;
}

.avatar-modali {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
    animation: fadeIn 0.2s ease;
    height: 100%;
}

/* 🖼 фото */
.avatar-full {
    width: min(90vw, 400px);
    height: min(90vw, 400px);

    border-radius: 20px;
    object-fit: cover;

    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);

    animation: zoomIn 0.25s ease;
    cursor: zoom-in;
}

.avatar-fulli {
    width: min(90vw, 400px);
    height: min(120vw, 500px);

    border-radius: 20px;
    object-fit: cover;

    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);

    animation: zoomIn 0.25s ease;
    cursor: zoom-in;
}

.recommended-section {
    max-width: 900px;
    margin: 40px auto 20px;
    height: 100%;
}

.rec-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 15px;
    color: #111827;
}

.rec-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
    gap: 14px;
}

.rec-card {
    background: white;
    border-radius: 14px;
    overflow: hidden;
    cursor: pointer;
    transition: 0.2s;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.06);

    display: flex;
    flex-direction: column;
}

.rec-card:hover {
    transform: translateY(-4px);
}

.rec-card img {
    width: 100%;
    height: 130px;
    object-fit: cover;
}

.rec-info {
    padding: 10px;
    display: flex;
    flex-direction: column;
    height: 100%;
}

.rec-name {
    font-size: 14px;
    font-weight: 500;
    color: #111827;
}

.rec-price {
    font-size: 13px;
    background-color: antiquewhite;
    width: 95%;
    border-radius: 5px;
    font-weight: 700;
    border: 1px solid #8a3300;
    padding: 5px;
    color: #940000;
    margin-top: 4px;
}

.rec-price {
    margin-top: auto;
    /* ВАЖНО */
}

/* ✨ анимации */
@keyframes zoomIn {
    from {
        transform: scale(0.7);
        opacity: 0;
    }

    to {
        transform: scale(1);
        opacity: 1;
    }
}

.cardh3 {
    color: #848484;
    font-size: 15px;
}

/* ===================== */
/* 📱 TABLET */
/* ===================== */
@media (max-width: 992px) {
    .card {
        max-width: 95%;
        padding: 16px;
    }

    .img {
        height: 420px;
    }

    .cardh1 {
        font-size: 20px;
    }

    .price {
        font-size: 22px;
    }
}

/* ===================== */
/* 📱 MOBILE */
/* ===================== */
@media (max-width: 768px) {
    .content {
        flex-direction: column;
    }

    .img {
        height: 320px;
    }

    .right {
        width: 100%;
    }

    .back-btn {
        font-size: 13px;
        padding: 6px 10px;
    }

    .price {
        font-size: 20px;
    }

    button {
        font-size: 15px;
        padding: 12px;
    }

    .seller {
        margin-top: 15px;
    }

    .left,
    .right {
        min-width: 100%;
    }
}

/* ===================== */
/* 📱 SMALL MOBILE */
/* ===================== */
@media (max-width: 480px) {
    .page {
        padding: 10px;
    }

    .card {
        padding: 12px;
        border-radius: 14px;
    }

    .img {
        height: 260px;
    }

    .cardh1 {
        font-size: 18px;
    }

    .cardh3 {
        font-size: 13px;
    }

    .price {
        font-size: 18px;
    }

    .currency {
        font-size: 12px;
    }

    button {
        padding: 10px;
        font-size: 14px;
    }

    .rec-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

.flex {
    display: flex;

}

.flex button {
    width: 100%;
}

.item-gallery {
    display: flex;
    gap: 20px;
}

.item-thumbs {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.item-thumbs img {
    width: 60px;
    height: 60px;
    object-fit: cover;
    cursor: pointer;
    border-radius: 10px;
    opacity: 0.6;
}

.item-thumbs img.active {
    border: 2px solid #3b82f6;
    opacity: 1;
}

.item-main img {
    width: 400px;
    height: 400px;
    object-fit: cover;
    border-radius: 20px;
}

.but:disabled {
  background: gray;
  cursor: not-allowed;
  opacity: 0.7;
  transform: none;
  box-shadow: none;
}

</style>