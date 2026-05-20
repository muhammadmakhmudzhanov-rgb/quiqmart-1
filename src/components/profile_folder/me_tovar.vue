<script setup lang="ts">
import { ref, onBeforeMount, type Ref } from "vue";
import Cookies from 'js-cookie';
import { useRouter } from "vue-router";
import { useMainStore } from "../../pinia/useItemsStore";

const usestore = useMainStore()
const router = useRouter();
const token = Cookies.get('token');
const extraFiles = ref<File[]>([]);
const extraPreviews = ref<string[]>([]);
const showPhotoModal = ref(false);
const extraItemId = ref<number | null>(null);

const fileInput = ref<HTMLInputElement | null>(null)



const formatPrice = (value: number) => {
  return new Intl.NumberFormat('ru-RU').format(value)
}
interface Item {
  name: string;
  price: number;
  image: string;
  description: string;
  id: number;
}

const arr: Ref<Item[]> = ref([]);

const getfunction = async () => {
  try {
    const response = await fetch(`http://${usestore.text}/my-items`, {
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

const deletefunctionitem = async () => {
  try {
    const response = await fetch(`http://${usestore.text}/items/${deleteId.value}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    arr.value = data;
    getfunction()
    showLogoutModal.value = false;
  } catch (error) {
    console.error(error);
  }
}
const putfunctionitem = async () => {
  try {
    const formData = new FormData();

    formData.append('name', name.value);
    formData.append('price', String(price.value));
    formData.append('description', description.value);

    if (file.value) {
      formData.append('image', file.value);
    }

    const response = await fetch(`http://${usestore.text}/items/${currentId.value}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    await response.json();

    trueflse.value = false;
    getfunction();
  } catch (error) {
    console.error(error);
  }
}

const name = ref('');
const price = ref(0);
const description = ref('');
const currentId = ref<number | null>(null)
const file = ref<File | null>(null);
const deleteId = ref<number | null>(null)

// UI STATE
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


const modal = (item: Item) => {
  trueflse.value = true;

  currentId.value = item.id;
  name.value = item.name;
  price.value = item.price;
  description.value = item.description;
  preview.value = `http://${usestore.text}${item.image}`;
}

const showLogoutModal = ref(false);

const openLogoutModal = (id: number) => {
  deleteId.value = id;
  showLogoutModal.value = true;
};

const closeLogoutModal = () => {
  showLogoutModal.value = false;
};


const handleExtraFiles = (e: Event) => {
  const target = e.target as HTMLInputElement;

  if (target.files) {
    extraFiles.value = Array.from(target.files);

    extraPreviews.value = extraFiles.value.map(file =>
      URL.createObjectURL(file)
    );
  }
};
const openPhotoModal = (id: number) => {
  extraItemId.value = id;
  showPhotoModal.value = true;
};
const uploadExtraPhotos = async () => {
  try {
    const formData = new FormData();

    extraFiles.value.forEach((file) => {
      formData.append('images', file); // важно: одинаковый ключ
    });

    await fetch(`https://${usestore.text}/items/${extraItemId.value}/images`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    showPhotoModal.value = false;
    extraFiles.value = [];
    extraPreviews.value = [];
    getfunction();

  } catch (err) {
    console.error(err);
  }
};

onBeforeMount(() => {
  getfunction();
  if (!token) {
    router.push('/login')
  }
});
</script>

<template>
  <div class="wrapper">
    <div class="grid">
      <div class="card" v-for="item in arr">
        <div class="img-box">
          <img :src="`http://${usestore.text}${item.image}`" alt="" />
        </div>

        <div class="content">
          <div class="price"> <img src="../../../public/free-icon-promotions-372856.png" alt="" class="acsia"> {{
            formatPrice(item.price) }} сом</div>
          <div class="name">{{ item.name }}</div>
          <div class="desc">{{ item.description }}</div>

          <div class="bottom">

            <button class="btn" @click="openLogoutModal(item.id)">Удалить</button>
            <button class="btn1" @click="modal(item)">Изменить</button>
            <button class="btn1" @click="openPhotoModal(item.id)">
              + Фото
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="modal" v-if="trueflse">
    <div class="modal-box">
      <h2>Изменение товара</h2>

      <!-- NAME -->
      <input type="text" v-model="name" placeholder="Название" :class="{ errorInput: submitted && !name }" />
      <p class="preduprejdenie" v-if="submitted && !name">
        Заполните название
      </p>

      <!-- PRICE -->
      <input type="number" v-model="price" placeholder="Цена" :class="{ errorInput: submitted && !price }" />
      <p class="preduprejdenie" v-if="submitted && !price">
        Укажите цену
      </p>

      <!-- IMAGE -->
      <input type="file" accept="image/*" @change="handleFile" />
      <p v-if="submitted && !file" class="preduprejdenie">
        Выберите изображение
      </p>

      <img v-if="preview" :src="preview" class="preview-img" alt="preview" />

      <!-- DESCRIPTION -->
      <input type="text" v-model="description" placeholder="Описание"
        :class="{ errorInput: submitted && !description }" />
      <p class="preduprejdenie" v-if="submitted && !description">
        Напишите описание
      </p>

      <div class="actionsi">
        <button class="btnmodal" @click="putfunctionitem">
          Сохранить
        </button>
        <button class="cancel" @click="trueflse = false">
          Отмена
        </button>
      </div>
    </div>
  </div>
  <div v-if="showLogoutModal" class="modal-overlay" @click="closeLogoutModal">
    <div class="modali" @click.stop>
      <h3>Удаление товара</h3>
      <p>Вы действительно хотите удалить товар?</p>

      <div class="modal-actions">
        <button class="cancel" @click="closeLogoutModal">
          Отмена
        </button>

        <button class="confirm" @click="deletefunctionitem()">
          Удалить
        </button>
      </div>
    </div>
  </div>
  <div v-if="showPhotoModal" class="modal-overlay">
  <div class="modali" @click.stop>
    <h3>Добавить фото</h3>

    <div class="upload-grid">
 
  <div class="upload-tile" @click="fileInput?.click()">
    <span class="plus">+</span>
  </div>
</div>

<input
  ref="fileInput"
  type="file"
  multiple
  accept="image/*"
  @change="handleExtraFiles"
  hidden
/>

    <div class="preview-list">
      <img
        v-for="(img, i) in extraPreviews"
        :key="i"
        :src="img"
        class="preview-img"
      />
    </div>

    <div class="modal-actions">
      <button class="cancel" @click="showPhotoModal = false, extraPreviews = []">Отмена</button>
      <button class="confirm" @click="uploadExtraPhotos">
        Загрузить
      </button>
    </div>
  </div>
</div>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 24px;
  padding: 24px;
  justify-items: center;
}

/* CARD */
.card {
  width: 100%;
  max-width: 280px;
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


/* IMAGE */
.img-box {
  height: 300px;
  padding: 10px;
}

.img-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
}



/* CONTENT */
.content {
  padding: 14px;
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
}

/* NAME */
.name {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}

/* DESC */
.desc {
  font-size: 12px;
  color: #64748b;
  line-height: 1.4;
  height: 32px;
  overflow: hidden;
}

/* PRICE */
.price {
  font-size: 21px;
  font-weight: 900;
  color: #ff0000;
  margin-bottom: 15px;
}

/* BUTTON */
.btn {
  background: linear-gradient(135deg, #f63b3b, #eb2525);
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

.btn:hover {
  transform: scale(1.08);
  box-shadow: 0 10px 20px rgba(235, 37, 37, 0.3);
}

.btn1 {
  background: linear-gradient(135deg, #35d85b, #1fba1f);
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

.btn1:hover {
  transform: scale(1.08);
  box-shadow: 0 10px 20px rgba(63, 167, 25, 0.3);
}

.acsia {
  width: 15px;
  height: 15px;
}

.bottom {
  display: flex;
  gap: 5px;
  margin-top: auto;
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
}



.modal-box {
  background: white;
  padding: 20px;
  border-radius: 12px;
  width: 320px;

  display: flex;
  flex-direction: column;
  gap: 10px;
}

.modal-box h2 {
  color: #c77b00;
  font-weight: 800;
  background-color: antiquewhite;
  border-radius: 10px;
  border: 1px solid #794a00;
  padding: 5px;
}

input {
  padding: 10px;
  border: 1px solid #794a00;
  background-color: rgb(251, 241, 227);
  color: rgb(74, 0, 0);
  font-weight: 600;
  border-radius: 8px;
  outline: none;
}

.actionsi {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
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

.preview-img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 12px;
  margin-top: 10px;
  border: 1px solid #ddd;
}

.btnmodal {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  border: none;
}

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
.modali {
  width: 320px;
  background: white;
  border-radius: 16px;
  padding: 20px;

  text-align: center;

  animation: popIn 0.25s ease;
}

.modali h3 {
  margin-bottom: 8px;
}

.modali p {
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
.preview-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 15px;
}

.preview-list img {
  width: 70px;
  height: 70px;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid #ddd;
  margin: 10px;
}

.upload-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
}

/* ➕ плитка */
.upload-tile {
  width: 70px;
  height: 70px;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: 0.2s;
  background: #f8fafc;
}

.upload-tile:hover {
  border-color: #6366f1;
  background: #eef2ff;
}

.plus {
  font-size: 26px;
  color: #6366f1;
  font-weight: bold;
}

/* 📸 превью */
.preview-tile {
  width: 70px;
  height: 70px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #ddd;
}

.preview-tile img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

</style>