import App from './App.vue'
import router from './router'

import '~/styles/reset.css'
import '~/styles/style.css'

createApp(App)
  .use(router)
  .mount('#app')
