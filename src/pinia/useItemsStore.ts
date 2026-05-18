import { defineStore } from 'pinia'
import { ref, type Ref, computed } from "vue";
import Cookies from 'js-cookie';

const token = Cookies.get('token');
export const useMainStore = defineStore('main', () => {

  const text = import.meta.env.VITE_API_URL
  const cartCount = ref(0)
  const loadingsupp = ref(false)
  const getCartCount = async () => {
    try {
      const token = Cookies.get('token') // 🔥 ВОТ СЮДА
  
      const res = await fetch(`https://${text}/cart`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })
  
      const data = await res.json()
  
      cartCount.value = data.items.reduce((sum: number, i: any) => {
        return sum + i.quantity
      }, 0)
  
    } catch (err) {
      console.log(err)
    }
  }
  interface Item {
    name: string;
    price: number;
    oldPrice: number;
    discount: number;
    image: string;
    description: string;
    id: number;
    userId: number;
  }
  const arr: Ref<Item[]> = ref([]);
  const search = ref('')
  const f = ref(false)
  const postListFilter = computed(() => {
    const q = search.value.trim().toLowerCase()
  
    if (!q) return arr.value
  
    return arr.value.filter(el =>
      el.name.toLowerCase().includes(q) ||
      (el.name  ?.toLowerCase().includes(q) ?? false)
    )
  })

  const getfunction = async () => {
    loadingsupp.value = true
    try {
      const response = await fetch(`https://${text}/items`, {
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
    }finally{
      loadingsupp.value = false
    }
  };

  const admintrue = ref(false)
  const getadmin = async () => {
    try {
      const response = await fetch(`https://${text}/admin/test`, {
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
        admintrue.value = true
      }
    } catch (error) {
      console.error(error);
    }
  };

  return { text, getCartCount, cartCount, getfunction, arr, postListFilter, search, f ,loadingsupp, token, admintrue, getadmin}
})