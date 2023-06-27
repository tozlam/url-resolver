import { createApp } from 'vue'
import App from './app'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

createApp(App).use(ElementPlus, {locale: zhCn}).mount('#app')
