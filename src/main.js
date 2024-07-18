import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './assets/main.css'
import '@fortawesome/fontawesome-free/css/all.css'
import IPFSService from './services/ipfsService.js'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()
IPFSService.initOrbitDB().then(() => {
    if (!app._container) {  // Check if app hasn't been mounted yet
        app.mount('#app')
    }
}).catch(error => {
    console.error('Failed to initialize OrbitDB:', error)
})
app.use(pinia)
app.mount('#app')