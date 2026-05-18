<script setup lang="ts">
import { ref, computed, onBeforeMount, type Ref } from "vue";
import Cookies from 'js-cookie';
import { useMainStore } from "../../pinia/useItemsStore";
const usestore = useMainStore()
const token = Cookies.get('token');


const activeRoleMenu = ref<number | null>(null)

const toggleRoleMenu = (id: number) => {
    activeRoleMenu.value = activeRoleMenu.value === id ? null : id
}


interface User {
    id: number;
    email: string;
    name?: string;
    avatar?: string;
    createdAt?: string;
    role?: string;
}

// 👉 твои данные (потом сюда fetch подставишь)
const users = ref<User[]>([]);
const selectedUser: Ref<User | null> = ref(null);

const getadminuser = async () => {
    try {
        const response = await fetch(`http://${usestore.text}/admin/users`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        console.log('STATUS:', response.status);
        console.log('DATA:', data);
        users.value = data


    } catch (error) {
        console.error(error);
    }
};
const changeRole = async (user: User, role: string) => {
    try {
        await fetch(`http://${usestore.text}/admin/users/${user.id}/role`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ role })
        })

        // обновим локально (чтобы без перезагрузки)
        await getadminuser()
        activeRoleMenu.value = null

    } catch (e) {
        console.error(e)
    }
}
const deleteadmin = async (user: User) => {
    try {
        await fetch(`http://${usestore.text}/admin/users/${user.id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
        })


        await getadminuser()
        activeRoleMenu.value = null

    } catch (e) {
        console.error(e)
    }
}



const admins = computed(() => users.value.filter(u => u.role === "admin"));
const normalUsers = computed(() => users.value.filter(u => u.role == "user"));
const showAvatarModal = ref(false);

const openAvatar = (user: User) => {
    if (!user.avatar) return;

    selectedUser.value = user;
    showAvatarModal.value = true;
};
const closeAvatar = () => {
    showAvatarModal.value = false;
    selectedUser.value = null;
};
onBeforeMount(() => {
    getadminuser()
})
</script>

<template>
    <div class="admin-panel">

        <h2>Администраторы</h2>
        <div class="grid">
            <div v-for="user in admins" :key="user.id" class="cardi admin">
                <img v-if="user.avatar" :src="`http://${usestore.text}/${user.avatar}`" class="avatar"  @click="openAvatar(user)" />

                <div class="info">
                    <h3>{{ user.name || "Без имени" }}</h3>
                    <p :title="user.email">{{ user.email }}</p>
                </div>

                <div class="role-box">
                    <span class="rolei" @click="toggleRoleMenu(user.id)">
                        {{ user.role?.toUpperCase() }}
                    </span>

                    <!-- dropdown -->
                    <div class="role-menui" :class="{ open: activeRoleMenu === user.id }">
                        <button @click="changeRole(user, 'admin')">Admin</button>
                        <button @click="changeRole(user, 'user')">User</button>
                    </div>
                </div>
            </div>
        </div>

        <h2>Пользователи</h2>
        <div class="grid">
            <div v-for="user in normalUsers" :key="user.id" class="cardi">
                <img v-if="user.avatar" :src="`http://${usestore.text}/${user.avatar}`" class="avatar"
                    @click="openAvatar(user)" />

                <div class="info">
                    <h3>{{ user.name || "Без имени" }}</h3>
                    <p :title="user.email">{{ user.email }}</p>
                </div>

                <div class="role-box">
                    <span class="role user-role" @click="toggleRoleMenu(user.id)">
                        {{ user.role?.toUpperCase() }}
                    </span>

                    <!-- dropdown -->
                    <div class="role-menu" :class="{ open: activeRoleMenu === user.id }">
                        <button @click="changeRole(user, 'admin')">Admin</button>
                        <button @click="changeRole(user, 'user')">User</button>
                        <button class="danger" @click="deleteadmin(user)">Ban</button>
                    </div>
                </div>
            </div>
        </div>

    </div>
    <div v-if="showAvatarModal" class="avatar-modal" @click="closeAvatar">
        <img :src="`http://${usestore.text}/${selectedUser?.avatar}`">
    </div>
</template>

<style>
.admin-panel {
    padding: 20px;
    background: #f6f7fb;
    min-height: 100vh;
}

/* заголовки */
h2 {
    margin: 20px 0 10px;
    font-size: 16px;
    color: #111827;
}

/* grid */
.grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 14px;
}

/* CARD */
.cardi {
    display: flex;
    align-items: center;
    gap: 12px;

    padding: 12px;
    border-radius: 16px;

    background: white;
    border: 1px solid #e5e7eb;
    overflow: visible;
    transition: 0.25s;
    min-width: 0;
}

.cardi:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
}

/* admin highlight */
.cardi.admin {
    border: 1px solid #6366f1;
    background: #f5f7ff;
}

/* avatar */
.avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
    border: 2px solid #e5e7eb;
}

/* info */
.info {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
}

.info h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: #111827;
}

/* email */
.info p {
    margin: 0;
    font-size: 12px;
    color: #6b7280;

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* ROLE */
.role {
    font-size: 10px;
    padding: 4px 8px;
    border-radius: 999px;
    background: #6366f1;
    color: white;
    cursor: pointer;
    flex-shrink: 0;
    letter-spacing: 0.5px;
}
.rolei {
    font-size: 10px;
    padding: 4px 8px;
    border-radius: 999px;
    background: #6366f1;
    color: white;
    cursor: pointer;
    flex-shrink: 0;
    letter-spacing: 0.5px;
}

.user-role {
    background: #9ca3af;
}

/* MODAL */
.avatar-modal {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.85);

    display: flex;
    justify-content: center;
    align-items: center;

    z-index: 2000;
}

/* FIX: ты забыл стиль 😄 */
.avatar-modal img {
    width: min(90vw, 420px);
    height: min(90vw, 420px);

    border-radius: 20px;
    object-fit: cover;

    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);

    animation: zoomIn 0.25s ease;
}

@keyframes zoomIn {
    from {
        transform: scale(0.8);
        opacity: 0;
    }

    to {
        transform: scale(1);
        opacity: 1;
    }
}

/* контейнер */
.role-box {
    position: relative;
}

.role-menu {
    position: absolute;
    top: 100%;
    right: 0;

    display: flex;
    gap: 6px;

    margin-top: 6px;

    opacity: 0;
    transform: translateY(-10px);
    pointer-events: none;

    transition: 0.25s ease;
    z-index: 100; /* 💥 важно */
}

/* когда открыто */
.role-menu.open {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
}

/* кнопки */
.role-menu button {
    padding: 5px 8px;
    font-size: 11px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    box-shadow: 0px 0px 0px 1px rgba(0, 0, 0, 0.4);
    background: #f3f4f6;
    transition: 0.2s;
}

.role-menu button:hover {
    background: #e5e7eb;
}

/* опасная */
.role-menu .danger {
    background: #fee2e2;
    color: #b91c1c;
}

.role-menu .danger:hover {
    background: #fecaca;
}
.role-menui {
    position: absolute;
    top: 100%;
    right: 0;
    display: flex;
    gap: 6px;
    margin-top: 16px;
    opacity: 0;
    transform: translateY(-10px);
    pointer-events: none;
    transition: 0.25s ease;
    z-index: 100; /* 💥 важно */
}

/* когда открыто */
.role-menui.open {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
}

/* кнопки */
.role-menui button {
    padding: 5px 8px;
    font-size: 11px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    background: #6366f1;
    color: white;
    transition: 0.2s;
}

.role-menui button:hover {
    background: #103785;
}

/* опасная */
.role-menui .danger {
    background: #fee2e2;
    color: #b91c1c;
}

.role-menui .danger:hover {
    background: #fecaca;
}


.cardi {
    overflow: visible;
}

.role-box {
    position: relative;
}

.role-menu {
    position: absolute;
    top: 100%;
    right: 0;

    display: flex;
    gap: 6px;

    opacity: 0;
    transform: translateY(-10px);
    pointer-events: none;

    transition: 0.25s ease;
    z-index: 100;
}

.role-menu.open {
    opacity: 1;
    transform: translateY(10px);
    pointer-events: auto;
}
.role-menui {
    position: absolute;
    top: 100%;
    right: 0;
    display: flex;
    gap: 6px;
    opacity: 0;
    transform: translateY(-10px);
    pointer-events: none;
    transition: 0.25s ease;
    z-index: 100;
}

.role-menu.openi {
    opacity: 1;
    transform: translateY(0px);
    pointer-events: auto;
}
</style>