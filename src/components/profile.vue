<script setup lang="ts">
import { ref, onBeforeMount, type Ref } from "vue";
import Cookies from 'js-cookie';
import { useRouter } from "vue-router";
import { useMainStore } from "../pinia/useItemsStore";
import metovar from "./profile_folder/me_tovar.vue";
import mepy from "./profile_folder/me_puy.vue";
import adminuser from "./admin/adminuser.vue";
import adminitems from "./admin/adminitems.vue";
import pytovar from "./admin/adminpytovar.vue";
import grafica from "./admin/grafica.vue";

const usestore = useMainStore()
const router = useRouter();
const token = Cookies.get('token');
const content = ref(0)
const yes = ref(true)
const showEditAvatar = ref(false)
const selectedFile = ref<File | null>(null)



interface Item {
    name: string;
    avatar: string;
    createdAt: string;
}

const arr: Ref<Item | null> = ref(null);

const getfunction = async () => {
    try {
        const response = await fetch(`https://${usestore.text}/me`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        arr.value = data;
    } catch (error) {
        console.error(error);
    }
};


const admin = ref(false)
const getadmin = async () => {
    try {
        const response = await fetch(`https://${usestore.text}/admin/test`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        console.log('STATUS:', response.status);
        console.log('DATA:', data);
        if (response.ok) {
            admin.value = true

        }

    } catch (error) {
        console.error(error);
    }
};


const openEditAvatar = () => {
    showEditAvatar.value = true
}

const closeEditAvatar = () => {
    showEditAvatar.value = false
    selectedFile.value = null
}
const onFileChange = (e: Event) => {
    const target = e.target as HTMLInputElement
    if (target.files && target.files[0]) {
        selectedFile.value = target.files[0]
    }
}
const uploadAvatar = async () => {
    try {

        if (!selectedFile.value) return

    const formData = new FormData()
    formData.append('avatar', selectedFile.value)

    const res = await fetch(`https://${usestore.text}/me`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: formData
    })

    const data = await res.json()

    arr.value = data // обновляем профиль
    showEditAvatar.value = false


    getfunction()
    } catch (error) {
        
    }
    
}

//модальное окно для выхода
const showLogoutModal = ref(false);

const openLogoutModal = () => {
    showLogoutModal.value = true;
};

const closeLogoutModal = () => {
    showLogoutModal.value = false;
};

const confirmLogout = () => {
    Cookies.remove('token');
    router.push('/');
};

//аватар
const showAvatarModal = ref(false);

const openAvatar = () => {
    if (!arr.value?.avatar) return;
    showAvatarModal.value = true;
};

const closeAvatar = () => {
    showAvatarModal.value = false;
};

const sostoyania = () => {
    content.value = 3
    yes.value = !yes.value
}


onBeforeMount(() => {
    getfunction();
    getadmin()
    if (!token) {
        router.push('/')
    }
});
</script>

<template>
    <div class="page">

        <div class="profile-card">
            <button class="back-btn" @click="router.push('/user')">
                ← Назад
            </button>
            <!-- 🔷 ЛОГО -->
            <div class="logo">

                <img v-if="arr" :src="`http://${usestore.text}/${arr.avatar}`" class="avatar" @click="openAvatar" />
            </div>
            <div class="block">

                <button class="edit-avatar-btn" @click="openEditAvatar">
                    Изменить аватар
                </button>
            </div>


            <!-- 👤 ПРОФИЛЬ -->
            <div v-if="arr" class="user">
                <span>
                    <h2>{{ arr.name }}</h2>
                </span>
                <p class="date">
                    Создан: {{ new Date(arr.createdAt).toLocaleString() }}
                </p>
                <button class="tabl" :class="{ 'active': content == 3 }" @click="sostoyania" v-if="admin == true">Состояние
                    админ</button>
            </div>


            <div class="tabs-wrapper">
                <div class="tabs-slider" :class="{ active: yes }">

                    <!-- 🟥 админ -->
                    <div class="tabs-block">
                        <button class="tab" :class="{ 'active': content == 4 }" @click="content = 4">Пользователи</button>
                        <button class="tab" :class="{ 'active': content == 6 }" @click="content = 6">Товары</button>
                        <button class="tab" :class="{ 'active': content == 7 }" @click="content = 7">Проданные
                            товары</button>
                        <button class="tab" :class="{ 'active': content == 8 }" @click="content = 8">Аналитика</button>
                    </div>
                    <!-- 🟦 обычные -->
                    <div class="tabs-block">
                        <button class="tab" :class="{ 'active': content == 1 }" @click="content = 1">Добавленные
                            товары</button>
                        <button class="tab" :class="{ 'active': content == 2 }" @click="content = 2">Купленные</button>
                        <RouterLink to="/korzine" class="tab">В корзине</RouterLink>
                    </div>


                </div>
            </div>
            <button class="logout-btn" @click="openLogoutModal">
                Выйти из аккаунта
            </button>
            <!-- 📦 КОНТЕНТ -->
            <div class="content">
                <p v-if="content == 0">Тут будут товары...</p>
                <metovar v-if="content == 1"></metovar>
                <mepy v-if="content == 2"></mepy>
                <adminuser v-if="content == 4"></adminuser>
                <adminitems v-if="content == 6"></adminitems>
                <pytovar v-if="content == 7"></pytovar>
                <grafica v-if="content == 8"></grafica>
            </div>

        </div>

    </div>
    <div v-if="showLogoutModal" class="modal-overlay" @click="closeLogoutModal">
        <div class="modal" @click.stop>
            <h3>Выйти из аккаунта?</h3>
            <p>Вы действительно хотите выйти?</p>

            <div class="modal-actions">
                <button class="cancel" @click="closeLogoutModal">
                    Отмена
                </button>

                <button class="confirm" @click="confirmLogout">
                    Выйти
                </button>
            </div>
        </div>
    </div>
    <div v-if="showAvatarModal" class="avatar-modal" @click="closeAvatar">
        <img :src="`http://${usestore.text}/${arr?.avatar}`" class="avatar-full" @click.stop />
    </div>
    <div v-if="showEditAvatar" class="modal-overlay" @click="closeEditAvatar">
    <div class="modal" @click.stop>

        <h3>Изменить аватар</h3>

        <input type="file" accept="image/*" @change="onFileChange" />

        <div class="modal-actions">
            <button class="cancel" @click="closeEditAvatar">
                Отмена
            </button>

            <button class="confirm" @click="uploadAvatar" :disabled="!selectedFile">
                Сохранить
            </button>
        </div>

    </div>
</div>
</template>

<style scoped>
.page {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    background: #f5f6f8;
    padding: 20px;
}

/* 🧊 карточка */
.profile-card {
    width: 100%;
    max-width: 950px;
    background: white;
    border-radius: 24px;
    padding: 70px 24px 24px;
    position: relative;
    border: 1px solid #e5e7eb;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
    margin-top: 20px;
}

/* 🔙 кнопка назад (ВАУ стиль) */
.back-btn {
    position: absolute;
    top: 16px;
    left: 16px;

    padding: 6px 10px;
    border-radius: 10px;

    border: none;
    background: rgba(99, 102, 241, 0.1);
    color: #6366f1;

    font-size: 13px;
    font-weight: 500;

    cursor: pointer;
    transition: 0.2s;
}

.back-btn:hover {
    background: #6366f1;
    color: white;
    transform: translateX(-2px);
}

/* 👤 АВАТАР (ВАЖНО: теперь красиво плавает) */
.logo {
    position: absolute;
    top: -35px;
    left: 50%;
    transform: translateX(-50%);

    width: 100px;
    height: 100px;

    border-radius: 50%;
    background: white;
    border: 3px solid #6366f1;

    display: flex;
    align-items: center;
    justify-content: center;

    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.avatar {
    width: 94px;
    height: 94px;
    border-radius: 50%;
    object-fit: cover;
    cursor: zoom-in;
}

/* 👤 user */
.user {
    text-align: center;
    margin-top: 10px;
    margin-bottom: 15px;
}

.user h2 {
    font-size: 20px;
    margin: 0;
}

.date {
    font-size: 12px;
    color: #6b7280;
}

/* 📦 TABЫ (десктоп) */
.tabs {
    display: flex;
    gap: 10px;
    margin-top: 25px;
    border-bottom: 1px solid #eee;
    padding-bottom: 12px;
}

/* кнопки табов */
.tab {
    flex: 1;
    padding: 10px 12px;
    border-radius: 12px;

    border: 1px solid #eee;
    background: #fafafa;

    font-size: 13px;
    cursor: pointer;

    transition: 0.2s;
    color: #6b7280;
    text-decoration: none;
    text-align: center;
}

.tab:hover {
    transform: translateY(-2px);
}

.tabl {
    flex: 1;
    padding: 10px 12px;
    border-radius: 12px;

    border: 1px solid #eee;
    background: #fafafa;

    font-size: 13px;
    cursor: pointer;

    transition: 0.2s;
    color: #6b7280;
    text-decoration: none;
    text-align: center;
}

.tabl:hover {
    transform: translateY(-2px);
}

.tab.active {
    background: #6366f1;
    color: white;
    border-color: #6366f1;
}

.tabl.active {
    background: #6366f1;
    color: white;
    border-color: #6366f1;
}

/* 📦 контент */
.content {
    padding: 20px 0;
    text-align: center;
    color: #9ca3af;
}

/* 🚪 logout */
.logout-btn {
    margin-top: 20px;
    width: 100%;

    padding: 12px;
    border-radius: 14px;

    border: 1px solid #ef4444;
    background: white;

    color: #ef4444;
    font-weight: 500;

    cursor: pointer;
    transition: 0.2s;
}

.logout-btn:hover {
    background: #ef4444;
    color: white;
}

/* ========================= */
/* 📱 MOBILE — ПРЯМ КРАСИВО */
/* ========================= */
@media (max-width: 600px) {

    .profile-card {
        padding: 70px 16px 20px;
        border-radius: 18px;
    }

    .logo {
        width: 70px;
        height: 70px;
        top: -30px;
    }

    .avatar {
        width: 64px;
        height: 64px;
    }

    /* табы превращаем в свайп */
    .tabs {
        overflow-x: auto;
        white-space: nowrap;
        border-bottom: none;
        padding-bottom: 0;
    }

    .tab {
        flex: none;
        min-width: 140px;
    }

    .back-btn {
        width: 80px;
        padding: 10px;
    }
}

/* ========================= */
/* 💻 MACBOOK / BIG SCREEN */
/* ========================= */
@media (min-width: 1200px) {
    .profile-card {
        max-width: 1050px;
    }
}

/* ========================= */
/* 📱 MOBILE (до 600px) */
/* ========================= */
@media (max-width: 600px) {

    .profile-card {
        width: 100%;
        padding: 60px 14px 20px;
        border-radius: 18px;
    }

    .logo {
        width: 85px;
        height: 85px;
        top: -30px;
    }

    .avatar {
        width: 79px;
        height: 79px;
    }

    .user h2 {
        font-size: 18px;
    }

    .tabs {
        flex-wrap: wrap;
        gap: 8px;
    }

    .tab {
        flex: 1 1 100%;
        font-size: 13px;
        padding: 10px;
    }


    .logout-btn {
        font-size: 14px;
        padding: 10px;
    }
}

/* ========================= */
/* 📟 TABLET (600px - 900px) */
/* ========================= */
@media (min-width: 600px) and (max-width: 900px) {

    .profile-card {
        max-width: 700px;
        padding: 70px 18px 20px;
    }

    .tabs {
        gap: 8px;
    }

    .tab {
        font-size: 13px;
        padding: 10px;
    }
}

/* ========================= */
/* 💻 MACBOOK / DESKTOP (1200px+) */
/* ========================= */
@media (min-width: 1200px) {

    .profile-card {
        max-width: 1050px;
    }
}

/* 🌑 фон */
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(6px);
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;

    animation: fadeIn 0.2s ease;
    z-index: 1000;
}

/* 🧊 окно */
.modal {
    width: 320px;
    background: white;
    border-radius: 16px;
    padding: 20px;

    text-align: center;

    animation: popIn 0.25s ease;
}

.modal h3 {
    margin-bottom: 8px;
}

.modal p {
    font-size: 13px;
    color: #6b7280;
    margin-bottom: 20px;
}

/* кнопки */
.modal-actions {
    display: flex;
    gap: 10px;
}

.modal-actions button {
    flex: 1;
    padding: 10px;
    border-radius: 10px;
    cursor: pointer;
    font-weight: 500;
    transition: 0.2s;
}

.cancel {
    border: 1px solid #e5e7eb;
    background: white;
}

.cancel:hover {
    background: #f3f4f6;
}

.confirm {
    border: none;
    background: #ef4444;
    color: white;
}

.confirm:hover {
    background: #dc2626;
}

/* ✨ анимации */
@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes popIn {
    from {
        transform: scale(0.9);
        opacity: 0;
    }

    to {
        transform: scale(1);
        opacity: 1;
    }
}

/* 🌑 фон как Instagram */
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

/* 🖼 фото */
.avatar-full {
    width: min(90vw, 400px);
    height: min(90vw, 400px);

    border-radius: 20px;
    object-fit: cover;

    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);

    animation: zoomIn 0.25s ease;
    cursor: grab;
}

.avatar-full:active {
    cursor: grabbing;
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


.tabs-wrapper {
    overflow: hidden;
    width: 100%;
}

.tabs-slider {
    display: flex;
    width: 200%;
    transition: transform 0.4s ease;
}

/* каждый блок = половина */
.tabs-block {
    width: 100%;
    display: flex;
    gap: 10px;
}

/* когда админ режим */
.tabs-slider.active {
    transform: translateX(-50%);
}

@media (max-width: 400px) {
    .profile-card {
        padding: 55px 10px 15px;
    }

    .logo {
        width: 65px;
        height: 65px;
        top: -25px;
    }

    .avatar {
        width: 60px;
        height: 60px;
    }

    .user h2 {
        font-size: 16px;
    }

    .date {
        font-size: 11px;
    }

    .tab {
        font-size: 12px;
        padding: 8px;
    }

    .logout-btn {
        padding: 10px;
        font-size: 13px;
    }

    .modal {
        width: 90%;
    }
}


.tabs-block {
    flex-wrap: wrap;
}

@media (max-width: 600px) {
    .tabs-block {
        overflow-x: auto;
        padding-bottom: 6px;
    }

    .tabs-block::-webkit-scrollbar {
        display: none;
    }

    .tab {
        min-width: 130px;
    }
}

@media (min-width: 900px) {
    .tabs-block {
        justify-content: center;
    }

    .tab {
        max-width: 200px;
    }
}

@media (min-width: 1400px) {
    .profile-card {
        max-width: 1200px;
        padding: 80px 40px 30px;
    }

    .user h2 {
        font-size: 24px;
    }

    .avatar-full {
        width: 450px;
        height: 450px;
    }
}
.block{
    display: flex;
    justify-content: center;
    
}
.edit-avatar-btn {

    padding: 8px 12px;
    border-radius: 10px;
    border: 1px solid #6366f1;
    background: white;
    color: #6366f1;
    cursor: pointer;
    transition: 0.2s;
    margin: 10px auto;
}

.edit-avatar-btn:hover {
    background: #6366f1;
    color: white;
}
</style>