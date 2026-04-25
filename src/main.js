import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// ✅ create app
const app = createApp(App)

// ✅ create pinia instance
const pinia = createPinia()

// ✅ use pinia FIRST
app.use(pinia)

// ✅ then router
app.use(router)

// ✅ mount app
app.mount('#app')

// ✅ EXPORT pinia (IMPORTANT)
export { pinia }