import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import FilterLab from './FilterLab.vue'
import './style.css'
export default {extends:DefaultTheme,enhanceApp({app}){app.component('FilterLab',FilterLab)}} satisfies Theme
