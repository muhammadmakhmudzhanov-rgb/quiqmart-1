<script setup lang="ts">
import { onBeforeMount, ref, type Ref } from "vue";
import Cookies from 'js-cookie';
import { useRouter } from "vue-router";
import { useMainStore } from "../../pinia/useItemsStore";


const usestore = useMainStore()
const router = useRouter();
const token = Cookies.get('token');
interface SoldItem {
  orderId: number;
  orderNumber: string;

  product: {
    id: number;
    name: string;
    price: number;
    image: string;
  };

  quantity: number;

  buyer: {
    name: string;
  };

  status: string;

  createdAt: string;
}

const soldItems: Ref<SoldItem[]> = ref([]);




const buyItemget = async () => {
  const res = await fetch(`http://${usestore.text}/seller/sold-items`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
  })
  const data = await res.json()
  soldItems.value = data
}




onBeforeMount(async () => {
  await buyItemget()
  if (!token) {
    router.push('/')
  }
});
</script>

<template>
    <div class="sold-page">
  
      <h1 class="title">Проданные товары</h1>
  
      <div class="sold-list">
  
        <div class="sold-card" v-for="item in soldItems" :key="item.orderId">
  
          <img
            :src="`http://${usestore.text}${item.product.image}`"
            class="product-image"
          />
  
          <div class="card-info">
  
            <div class="top">
  
              <h2 class="product-name">
                {{ item.product.name }}
              </h2>
  
              <span class="status" v-if="item.status">
                Куплено
              </span>
  
            </div>
  
            <div class="details">
  
              <p>
                Заказ:
                <b>{{ item.orderNumber }}</b>
              </p>
  
              <p>
                Количество:
                <b>{{ item.quantity }}</b>
              </p>
  
              <p>
                Цена:
                <b>{{ item.product.price }} сом</b>
              </p>
  
              <p>
                Покупатель:
                <b>{{ item.buyer.name }}</b>
              </p>
  
              <p>
                Дата:
                <b>
                  {{
                    new Date(item.createdAt)
                      .toLocaleDateString()
                  }}
                </b>
              </p>
  
            </div>
  
          </div>
  
        </div>
  
      </div>
  
    </div>
  </template>
  
  <style scoped>

.sold-page {
  min-height: 100vh;
  padding: 30px 16px;
  background: #f6f9fc;
}

.title {
  font-size: 28px;
  font-weight: 800;
  color: #111827;

  margin-bottom: 20px;
}

.sold-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.sold-card {
  display: flex;
  gap: 14px;

  background: white;

  border-radius: 20px;

  padding: 14px;

  border: 1px solid #edf2f7;

  transition: 0.2s;

  box-shadow:
    0 4px 15px rgba(0,0,0,0.04);
}

.sold-card:hover {
  transform: translateY(-2px);

  box-shadow:
    0 8px 20px rgba(0,0,0,0.06);
}

.product-image {
  width: 110px;
  height: 110px;

  object-fit: cover;

  border-radius: 16px;

  flex-shrink: 0;

  background: #f3f4f6;
}

.card-info {
  flex: 1;

  display: flex;
  flex-direction: column;

  justify-content: space-between;
}

.top {
  display: flex;
  justify-content: space-between;
  align-items: center;

  gap: 10px;
}

.product-name {
  font-size: 18px;
  font-weight: 700;

  color: #111827;

  line-height: 1.2;
}

.status {
  background: #dcfce7;

  color: #16a34a;

  padding: 6px 12px;

  border-radius: 999px;

  font-size: 12px;
  font-weight: 700;
}

.details {
  display: flex;
  flex-wrap: wrap;

  gap: 10px;

  margin-top: 12px;
}

.details p {
  background: #f8fafc;

  border-radius: 12px;

  padding: 8px 12px;

  font-size: 13px;

  color: #64748b;

  margin: 0;
}

.details b {
  color: #111827;
}

@media (max-width: 700px) {

  .sold-card {
    flex-direction: column;
  }

  .product-image {
    width: 100%;
    height: 200px;
  }

  .top {
    align-items: flex-start;
    flex-direction: column;
  }

}

</style>