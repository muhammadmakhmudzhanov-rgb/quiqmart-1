<script setup lang="ts">
import { ref, onBeforeMount, type Ref } from "vue";
import Cookies from 'js-cookie';
import { useRouter } from "vue-router";
import { useMainStore } from "../pinia/useItemsStore";
import loading from "../components/loading.vue";

const usestore = useMainStore()
const router = useRouter();
const token = Cookies.get('token');
const load = ref(false);
const formatPrice = (value: number) => {
  return new Intl.NumberFormat('ru-RU').format(value)
}
interface CartItem {
  id: number;
  quantity: number;
  subtotal: number;
  item: {
    id: number;
    name: string;
    price: number;
    image: string;
    description: string;
  };
}

const arr: Ref<CartItem[]> = ref([]);
const total = ref(0);
const getfunction = async () => {
  try {
    const response = await fetch(`https://${usestore.text}/cart`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    arr.value = data.items;   // ✅
    total.value = data.total; // ✅

  } catch (error) {
    console.error(error);
  }
};
const increase = async (cart: CartItem) => {
  load.value = true
  try {
    await fetch(`https://${usestore.text}/cart/${cart.id}/increase`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        quantity: cart.quantity + 1
      })
    });

    await getfunction(); // 🔄 обновляем корзину
  } catch (error) {
    console.error(error);
  } finally {
    load.value = false
  }
};
const decrease = async (cart: CartItem) => {
  load.value = true
  try {
    if (cart.quantity <= 1) return; // ❗ чтобы не ушло в 0

    await fetch(`https://${usestore.text}/cart/${cart.id}/decrease`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        quantity: cart.quantity - 1
      })
    });

    await getfunction(); // 🔄 обновляем
  } catch (error) {
    console.error(error);
  }finally {
    load.value = false
  }
};
const deletefunction = async (cart: CartItem) => {
  try {

    await fetch(`https://${usestore.text}/cart/${cart.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    await getfunction(); // 🔄 обновляем
    usestore.getCartCount()
  } catch (error) {
    console.error(error);
  }
};
const checkout = async () => {
  try {
    const response = await fetch(`https://${usestore.text}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        items: arr.value.map(i => ({
          itemId: i.item.id,
          quantity: i.quantity
        })),
        total: total.value
      })
    })

    const data = await response.json()

    console.log('Заказ оформлен:', data)

    await deletekorzine()
    await getfunction()
    await usestore.getCartCount()

    // 👉 опционально редирект
    // router.push('/orders')

  } catch (error) {
    console.error(error)
  }
}

const deletekorzine = async () => {
  try {
    await fetch(`https://${usestore.text}/cart`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    // 🧹 очищаем локально
    usestore.getCartCount()

  } catch (error) {
    console.error(error)
  }
}

onBeforeMount(async () => {
  await getfunction();
  if (!token) {
    router.push('/')
  }
});
</script>

<template>
  <div class="cart">
    <div class="cart-header">
      <button class="back-btn" @click="router.push('/user')">← Назад</button>
      <h1><img src="../../public/free-icon-shopping-cart-1288755.png" alt="" class="img"> Корзина</h1>
    </div>

    <div class="cart-item" v-for="cart in arr" :key="cart.id">
      <img :src="`http://${usestore.text}${cart.item.image}`" alt="">

      <div class="info">
        <h3>{{ cart.item.name }}</h3>
        <p class="price">{{ formatPrice(cart.item.price) }}$</p>

        <div class="qty">
          <button @click="decrease(cart)" v-if="load == false">-</button>
          <button @click="decrease(cart)" v-if="load == true">-</button>
          <span v-if="load == false">
            {{ cart.quantity }}
          </span>
          <loading v-else></loading>
          <button @click="increase(cart)" v-if="load == false">+</button>
          <button @click="increase(cart)" v-if="load == true" disabled>+</button>
        </div>

        <p class="subtotal">
          Итого: {{ formatPrice(cart.subtotal) }}$
        </p>

        <button class="delete" @click="deletefunction(cart)">Удалить</button>
      </div>
    </div>

    <div class="cart-summary">
      <h2>Общая сумма: {{ formatPrice(total) }}$</h2>
      <button class="checkout" @click="checkout">
        Оформить заказ
      </button>
    </div>
  </div>
</template>

<style>
body {
  background: #f5f5f5;
  font-family: sans-serif;
}

.cart {
  max-width: 800px;
  margin: 40px auto;
}

.cart h1 {
  margin-bottom: 20px;
}

.cart-item {
  display: flex;
  gap: 20px;
  background: #fff;
  padding: 15px;
  border-radius: 15px;
  margin-bottom: 15px;
  align-items: center;
  transition: 0.2s;
  border: 2px solid #6366f1;
}

.cart-item:hover {
  transform: scale(1.01);
}

.cart-item img {
  width: 160px;
  height: 200px;
  object-fit: cover;
  border-radius: 10px;
}

.info {
  flex: 1;
}

.price {
  color: #888;
}

.qty {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 10px 0;
}

.qty button {
  width: 30px;
  height: 30px;
  border: none;
  background: #eee;
  border-radius: 6px;
  cursor: pointer;
}

.qty button:hover {
  background: #ddd;
}

.subtotal {
  font-weight: bold;
}

.delete {
  margin-top: 10px;
  background: #ff4d4d;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
}

.delete:hover {
  background: #e60000;
}

.cart-summary {
  background: #fff;
  padding: 20px;
  border-radius: 15px;
  margin-top: 20px;
  text-align: right;
  border: 2px solid #6366f1;
}

.checkout {
  margin-top: 10px;
  padding: 10px 20px;
  background: black;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
}

.checkout:hover {
  background: #333;
}

.cart-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
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
}

.back-btn:hover {
  background: #6366f1;
  color: white;
  transform: translateX(-2px);
}

h1 {
  display: flex;
  align-items: center;
  gap: 15px;
}

.img {
  width: 40px;
}

@media (max-width: 768px) {

  .cart {
    margin: 20px 10px;
  }

  .cart-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .cart-item img {
    width: 100%;
    height: 200px;
  }

  .info {
    width: 100%;
  }

  .qty {
    justify-content: space-between;
    width: 100%;
  }

  .cart-summary {
    text-align: center;
  }

  .cart-summary h2 {
    font-size: 18px;
  }

  .checkout {
    width: 100%;
  }

  .cart-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  h1 {
    font-size: 20px;
  }

  .img {
    width: 30px;
  }
}

@media (max-width: 480px) {

  .cart-item {
    padding: 10px;
  }

  .cart-item img {
    height: 160px;
  }

  .qty button {
    width: 28px;
    height: 28px;
  }

  .delete {
    width: 100%;
  }

  .back-btn {
    width: 100%;
  }
}

@media (min-width: 768px) and (max-width: 1024px) {

  .cart {
    max-width: 95%;
  }

  .cart-item img {
    width: 130px;
    height: 160px;
  }

  .cart-summary {
    text-align: right;
  }
}

@media (min-width: 1200px) {

  .cart {
    max-width: 900px;
  }

  .cart-item img {
    width: 180px;
    height: 220px;
  }
}
</style>