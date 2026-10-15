<script setup>
import {ref,computed,onMounted} from 'vue'
import {lowpass} from '../../../lib/models.mjs'
const alpha=ref(.25),ready=ref(false)
onMounted(()=>ready.value=true)
const samples=Array.from({length:31},(_,k)=>k<4?0:1)
const ys=computed(()=>lowpass(samples,Number(alpha.value)))
const path=computed(()=>ys.value.map((y,k)=>`${k?'L':'M'}${60+k*18},${200-150*y}`).join(' '))
</script>
<template>
 <figure class="filter-lab">
  <figcaption><strong>只改变一个参数：一阶低通对阶跃的响应</strong></figcaption>
  <p>输入在 k=4 时由 0 变为 1。α 越小，输出越平滑，跟上变化也越慢；这里没有随机噪声。</p>
  <div class="chart-scroll" tabindex="0" aria-label="低通响应图，可横向滚动"><svg viewBox="0 0 660 250" role="img" aria-labelledby="filter-title filter-desc">
   <title id="filter-title">一阶低通单位阶跃响应</title><desc id="filter-desc">横轴为样本编号0到30，纵轴为幅度0到1。橙色虚线是输入，蓝色实线是输出。</desc>
   <path d="M60 35V200H615" fill="none" stroke="currentColor"/><path d="M60 200H132V50H600" fill="none" stroke="#ba6922" stroke-dasharray="7 5" stroke-width="2"/>
   <path :d="path" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="3"/>
   <g fill="currentColor" font-size="15"><text x="30" y="204">0</text><text x="30" y="55">1</text><text x="58" y="224">0</text><text x="125" y="224">4</text><text x="584" y="224">30</text><text x="310" y="246">样本编号 k</text><text x="77" y="26">输入（虚线）与输出（实线）</text></g>
  </svg></div>
  <div v-if="ready" class="controls"><label for="filter-alpha">新输入权重 α = {{Number(alpha).toFixed(2)}}</label><input id="filter-alpha" v-model="alpha" type="range" min="0.05" max="1" step="0.05"/><button type="button" @click="alpha=.25">重置</button></div>
  <p v-else>静态示例：α = 0.25。启用 JavaScript 后可用键盘或拖动调节权重。</p>
  <p aria-live="polite">k=10 时输出为 {{ys[10].toFixed(4)}}。纵轴是无量纲幅度，曲线由确定性递推计算。</p>
 </figure>
</template>
<style scoped>
.filter-lab{margin:1.8rem 0;padding:1rem 0;border-block:1px solid var(--vp-c-divider)}.chart-scroll{overflow-x:auto}svg{width:100%;min-width:560px;height:auto}.controls{display:flex;align-items:center;flex-wrap:wrap;gap:1rem}.controls label{font-weight:600}.controls input{flex:1;min-width:160px;accent-color:var(--vp-c-brand-1)}button{border:1px solid var(--vp-c-divider);padding:.35rem .8rem;border-radius:6px;font-size:15px}button:hover{background:var(--vp-c-default-soft)}
</style>
