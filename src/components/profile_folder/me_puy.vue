<script setup lang="ts">
import { onBeforeMount, ref, computed } from "vue";
import Cookies from 'js-cookie';
// import { useRouter } from "vue-router";
import { useMainStore } from "../../pinia/useItemsStore";
const usestore = useMainStore()
// const router = useRouter();
const token = Cookies.get('token');
interface OrderItem {
  quantity: number
  item: {
    id: number
    name: string
    price: number
    image: string
    description: string
  }
}


interface Order {
  id: number
  orderNumber: number
  items: OrderItem[]
  total: number
  status: string
  createdAt: string
}
const arr = ref<Order[]>([])
const getfunction = async () => {
  try {
    const response = await fetch(`https://${usestore.text}/orders`, {
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

const orders = computed(() => arr.value)


onBeforeMount(() => {
  getfunction()

})
</script>
<template>
  <div class="orders">

    <h1 class="title">Мои заказы</h1>

    <div v-if="orders.length === 0" class="empty">
      У вас пока нет заказов
    </div>

    <div v-for="order in orders" :key="order.id" class="order-card">

      <!-- HEADER -->
      <div class="order-header">
        <div class="flex">
          <h2>Заказ #{{ order.orderNumber }}</h2>
          <p class="dater">
            {{ new Date(order.createdAt).toLocaleString() }}
          </p>
        </div>

        <div class="status" :class="order.status">
          {{ order.status }}
        </div>
      </div>

      <!-- ITEMS -->
      <div class="items">
        <div v-for="i in order.items" :key="i.item.id" class="item">

          <img v-if="i.item.image" :src="`http://${usestore.text}${i.item.image}`" />

          <div class="info">
            <h3>{{ i.item.name }}</h3>

            <p class="desc">
              {{ i.item.description }}
            </p>

            <div class="bottom">
              <span>Кол-во: {{ i.quantity }}</span>
              <span>{{ i.item.price }}$</span>
            </div>
          </div>

        </div>
      </div>

      <!-- TOTAL -->
      <div class="order-footer">
        <h3>Итого: {{ order.total }}$</h3>
      </div>

    </div>

  </div>
</template>

<style>
.orders {
  max-width: 1000px;
  margin: 0 auto;
  padding: 16px;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  background: #f7f7fb;
  color: #1f2937;
}

/* TITLE */
.title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 16px;
  color: #111827;
}

/* EMPTY */
.empty {
  text-align: center;
  opacity: 0.5;
  padding: 40px 10px;
  font-size: 14px;
  color: #6b7280;
}

/* CARD */
.order-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 12px;
  transition: 0.15s ease;
}

.order-card:hover {
  transform: translateY(-1px);
  border-color: #ddd;
}

/* HEADER */
.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.order-header h2 {
  font-size: 16px;
  font-weight: 600;
  background: #703e00;
  color: #ffffff;
  padding: 2px;
  border-radius: 5px;

}

.dater {
  font-size: 12px;
  font-weight: 700;
  opacity: 1;

  background: #fff7ed;
  color: #c2410c;
  border: 1px solid #fed7aa;



}

/* STATUS (clean version) */
.status {
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 999px;
  background: #f9fafb;
  color: #374151;
  border: 1px solid #e5e7eb;
}

.status.pending {
  background: #fff7ed;
  color: #c2410c;
  border: 1px solid #fed7aa;
}

.status.cancelled {
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

.status.completed {
  background: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
}

/* items */
.items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* ITEM */
.item {
  display: flex;
  gap: 12px;
  padding: 8px;
  border-radius: 10px;
  background: #f9fafb;
  border: 1px solid #eef2f7;
}

/* IMAGE */
.item img {
  width: 58px;
  height: 58px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #eee;
}

/* INFO */
.info {
  flex: 1;
  min-width: 0;
  color: #111827;
}

.info h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.desc {
  font-size: 12px;
  opacity: 0.6;
  margin-top: 2px;
  color: #6b7280;

  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* bottom */
.bottom {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin-top: 4px;
  opacity: 0.8;
  color: #374151;
}

/* FOOTER */
.order-footer {
  text-align: right;
  margin-top: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

/* MOBILE */
@media (max-width: 600px) {
  .orders {
    padding: 10px;
  }

  .order-card {
    padding: 12px;
  }

  .item img {
    width: 52px;
    height: 52px;
  }
}

.flex {
  display: flex;
  gap: 15px;
  align-items: center;
  justify-content: center;
}
</style>