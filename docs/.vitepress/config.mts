import { defineConfig } from 'vitepress'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
const chapters = [
 ['01-foundations','一 · 传感、测量与智能系统'],['02-sensors','二 · 常用传感器'],
 ['03-platforms','三 · 传感处理平台'],['04-data','四 · 误差、滤波与校正'],
 ['05-vision','五 · 视觉信息处理'],['06-pointcloud','六 · 点云数据处理'],
 ['07-audio','七 · 听觉信息处理'],['08-fusion','八 · 智能信息融合']
]
export default defineConfig({
 lang:'zh-CN',title:'智能传感与信息处理',description:'从物理转换到多源融合的中文自学教材，含知识清单、原页追溯与可复现计算。',
 base:'/UCAS-intelligent-sensing/',lastUpdated:true,cleanUrls:false,prefetchLinks:false,
 markdown:{math:true,config(md){
  const original=md.renderer.rules.image!
  md.renderer.rules.image=(tokens,idx,options,env,self)=>{
   const src=tokens[idx].attrGet('src')||''
   if(/^\/figures\/[a-z0-9-]+\.svg$/.test(src))return '<span class="teaching-figure">'+readFileSync(resolve(process.cwd(),'docs/public'+src),'utf8')+'</span>'
   return original(tokens,idx,options,env,self)
  }
 }},
 head:[['meta',{name:'theme-color',content:'#17657a'}]],
 themeConfig:{
  nav:[{text:'学习指南',link:'/guide'},{text:'知识清单',link:'/checklist'},{text:'练习与计算',link:'/practice'},{text:'资料来源',link:'/sources'}],
  sidebar:[
   {text:'开始学习',items:[{text:'课程首页',link:'/'},{text:'学习路线与知识地图',link:'/guide'},{text:'阅读指南与统一符号',link:'/symbols'},{text:'全课程知识点',link:'/checklist'}]},
   {text:'系统教材',items:chapters.map(([p,t])=>({text:t,link:'/chapters/'+p}))},
   {text:'练习与复现',items:[{text:'使用说明与实验',link:'/practice'},...[1,2,3,4,5,6,7,8].map(n=>({text:`第${n}章原题与参考解`,link:`/exercises/s0${n}`}))]},
   {text:'来源与维护',collapsed:true,items:[{text:'来源版本与范围',link:'/sources'},{text:'逐页覆盖记录',link:'/coverage'},{text:'公式修订与核查',link:'/corrections'},{text:'维护与更新',link:'/maintenance'},{text:'建设验收报告',link:'/acceptance'}]}
  ],
  outline:{level:[2,3],label:'本页内容'},
  search:{provider:'local',options:{locales:{root:{translations:{button:{buttonText:'搜索教材',buttonAriaLabel:'搜索教材'},modal:{noResultsText:'没有找到相关内容',resetButtonTitle:'清除搜索',footer:{selectText:'选择',navigateText:'切换',closeText:'关闭'}}}}}}},
  docFooter:{prev:'上一节',next:'下一节'},sidebarMenuLabel:'课程目录',returnToTopLabel:'返回顶部',darkModeSwitchLabel:'外观',lightModeSwitchTitle:'切换浅色',darkModeSwitchTitle:'切换深色',
  lastUpdated:{text:'最后更新',formatOptions:{dateStyle:'short',timeStyle:'short',timeZone:'Asia/Shanghai'}},
  socialLinks:[{icon:'github',link:'https://github.com/AaronChou313/UCAS-intelligent-sensing'}],
  editLink:{pattern:'https://github.com/AaronChou313/UCAS-intelligent-sensing/edit/main/docs/:path',text:'编辑本页 Markdown'},
  footer:{message:'课程资料整理与教材解释 · 版本边界见资料来源页'}
 }
})
