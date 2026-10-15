import {readFileSync,writeFileSync,mkdirSync,existsSync,copyFileSync,readdirSync} from 'node:fs'
import {execFileSync} from 'node:child_process'
import {knowledge,hash,sourceRanges} from './content-lib.mjs'
const kps=knowledge(),manifest=JSON.parse(readFileSync('sources/manifest.json'))
const labels={core:'核心',support:'支撑',extension:'延伸',detailed:'详讲',mentioned:'提及',noncontent:'非教学正文'}
const clean=s=>String(s??'').replaceAll('|','／').replaceAll('<','＜').replaceAll('>','＞').replaceAll('\n',' ').replaceAll('$','\\$')
const link=k=>`[${k.id} ${k.title}](/${k.file}#${k.anchor})`
writeFileSync('sources/knowledge.json',JSON.stringify(kps.map(({section,...rest})=>rest),null,2)+'\n')
let checklist='# 全课程知识点清单\n\n本表由正文稳定编号生成，点击定位实际定义与推导。“核心／支撑／延伸”是学习地位，不是教师考核重点；“详讲／提及”是原课件深度，不是教材篇幅。\n\n'
for(const s of manifest){const ks=kps.filter(k=>k.id.startsWith('IS-'+s.id.slice(1)));checklist+=`## ${s.id} · ${s.file.split('/').at(-1).replace('.pptx','')}\n\n|编号与知识点|学习地位|来源深度|来源页段|\n|---|---|---|---|\n`+ks.map(k=>`|${link(k)}|${labels[k.importance]}|${labels[k.depth]}|${k.source}|`).join('\n')+'\n\n'}
checklist+=`共 **${kps.length}** 个稳定知识点；有效来源页还有案例、原题、文献线索及非正文页，完整性须同时检查[逐页覆盖](/coverage.md)。\n`
writeFileSync('docs/checklist.md',checklist)
mkdirSync('docs/coverage',{recursive:true});let coverage=[]
const sourceTitle=s=>s.file.split('/').at(-1)
for(const s of manifest){const topics=JSON.parse(readFileSync(`sources/${s.id}-topics.json`));const slides=JSON.parse(readFileSync(`sources/extracted/${s.id}.json`)).slides;let text=`# ${s.id} 逐页覆盖\n\n来源：${sourceTitle(s)}，${s.pages}张物理幻灯片（包括隐藏页）。[打开含隐藏页PDF](/sources/${s.id}.pdf)；编号不采用原页脚分母。文字与图形审阅记录见下表；局部转换异常不表示已逐格确认。\n\n|物理页|实际主题与性质|正文／处理位置|审阅说明|\n|---:|---|---|---|\n`
for(const t of topics){for(let page=t.start;page<=t.end;page++){let ks=kps.filter(k=>{return sourceRanges(k.source).some(r=>r.id===s.id&&page>=r.start&&page<=r.end)});let targets=ks.map(k=>({label:k.id,path:`/${k.file}#${k.anchor}`}));
if(s.id==='S01'&&page>=3&&page<=4)targets=[{label:'课程定位与安排',path:'/guide.md#资料范围与课程安排'}]
const ex={S01:[84,85],S02:[14,34,42,105,151,240,241,350,351,352,353,354],S03:[1,139],S04:[85],S05:[81,82],S06:[94],S07:[77],S08:[135,136]}
if((ex[s.id]||[]).includes(page))targets.push({label:'原题与参考解',path:`/exercises/${s.id.toLowerCase()}.md`})
if(s.id==='S07'&&page>=2&&page<=3)targets=[{label:'听觉任务导论',path:'/chapters/07-audio.md'}]
if(s.id==='S08'&&page===10)targets=[{label:'Kalman方法背景',path:'/chapters/08-fusion.md#s08-state'}]
if(!targets.length&&t.depth==='noncontent')targets=[{label:'来源版本说明',path:'/sources.md'}]
if(!targets.length)throw Error(`Unmapped content ${s.id}:${page} ${t.title}`)
const inspected=(t.visual_pages||[]).includes(page);const visualStatus=inspected?(t.visual_status||"reviewed"):"pending";const slide=slides[page-1];const features={nativeMath:slide.omml.length,pictures:slide.pictures,embeddedObjects:slide.ole,media:(slide.relationships||[]).filter(r=>["audio","video"].includes(r.kind)).length};const row={visual_status:visualStatus,pending_review:t.pending_review||null,features,source:s.id,page,title:t.title,depth:t.depth,notes:t.notes,issues:t.issues||[],targets,visual_inspected:inspected};coverage.push(row)
text+=`|[${page}](/sources/${s.id}.pdf#page=${page})|${clean(t.title)}（${labels[t.depth]||t.depth}）|${targets.map(x=>`[${x.label}](${x.path})`).join('、')}|${visualStatus==='limited'?'已视读；原生视觉待核查':inspected?'已视读':'待视读'}${(t.issues||[]).length?'；'+clean(t.issues.join('；')):''}|\n`
}}
writeFileSync(`docs/coverage/${s.id}.md`,text)
if(existsSync('sources/rendered/'+sourceTitle(s).replace('.pptx','.pdf')))copyFileSync('sources/rendered/'+sourceTitle(s).replace('.pptx','.pdf'),`docs/public/sources/${s.id}.pdf`)
}
writeFileSync('sources/coverage.json',JSON.stringify(coverage,null,2)+'\n')
writeFileSync('docs/coverage.md','# 逐页覆盖总索引\n\n逐页记录由人工阅读后填写的主题表生成。每页均有物理编号、实际主题、来源深度、正文去向与视觉审阅状态。封面、目录、致谢及视频占位单独登记；不能用知识点数量替代覆盖检查。\n\n'+manifest.map(s=>`- [${s.id} · ${sourceTitle(s)}：${s.pages}页](./coverage/${s.id}.md)`).join('\n')+`\n\n共${coverage.length}页。原生中文缺字的初次PDF已废弃，发布版本采用修复字体并包含隐藏页的导出。S04第35张及S08第125—127张的部分表格转换异常，详见[修订说明](./corrections.md)，不将其称为逐格视觉核对成功。\n`)
let src='# 资料来源、版本与范围\n\n课程名称依据封面为《智能传感与信息处理》，学科方向为智能机器人、智能制造中的传感与信息处理。当前只取得以下八份PPTX；每份仅一个版本，按实际文件作为主来源，不根据属性时间推断它们属于同一年完整课程。\n\n|编号与文件|物理页数|文件属性修改时间（UTC）|原页PDF|\n|---|---:|---|---|\n'+manifest.map(s=>`|${s.id} ${sourceTitle(s)}|${s.pages}|${s.properties.modified||'未注明'}|[阅读](/sources/${s.id}.pdf)|`).join('\n')+'\n\n## 版本差异与边界\n\n- S01封面2025-09-15，安排页含2026-12-14考试日期，真实物理页86而页脚多写/81。\n- S03第37张是隐藏幻灯片，仍纳入143张覆盖；正文封面位于第12张。\n- S04封面2026-10-04；S05、S06、S07封面2026-10-14。S05文件第五章、封面第8讲；S06第11讲；S07第7讲。文件章号、讲次及页脚不作同一个编号体系。\n- S08文件属性修改停留2023年、封面无日期；物理137张而页脚/138，不认定它已与2026授课同步。\n- 没有独立课程大纲文件、原始实验数据目录或完整可运行源码工程。概述提及的独立FPGA图像加速课件尚未取得；S07原题引用的三组声波数据尚未取得。\n- 开卷、成绩组成等只按S01第4张登记；权重、当前考试范围和实际提交要求仍以教师正式通知为准。\n\n## 页码、哈希和追溯\n\n页码从1开始，统一使用PPTX物理幻灯片编号，包含隐藏页。下载PDF的页码与之对齐。PDF由LibreOffice导出，补充中文字体映射；不是逐字节原件，不能完整还原动画、视频及某些旧公式对象的呈现。原PPTX保留在本地`PPT/`，未因建设教材而修改。\n\n来源清单记录SHA-256、大小、页数与属性；原始大文件超过普通Git单文件限制，不直接推入仓库。公开的是导出PDF和来源元数据，拿到原件后可对照下列哈希核验。\n\n'
for(const s of manifest)src+=`### ${s.id}\n\n\`${s.sha256}\`\n\n${(s.bytes/1048576).toFixed(2)} MiB；[逐页覆盖](./coverage/${s.id}.md)。\n\n`
src+='## 补充资料\n\n外部补充只用于核对方法和修订边界，未写成教师正式讲授内容。\n\n- [NXP I²C规范 UM10204 Rev.7.0](https://www.nxp.com/docs/en/user-guide/UM10204.pdf)：电气、寻址与时序。\n- [Linux ARM启动文档](https://docs.kernel.org/arch/arm/booting.html)：旧ATAG与设备树交接边界。\n- [ROS 2中间件接口设计](https://design.ros2.org/articles/ros_middleware_interface.html)：框架层与中间件层。\n- [OpenCV相机标定和三维重建](https://docs.opencv.org/4.x/d9/d0c/group__calib3d.html)：投影、畸变和标定模型。\n- [PCL法线估计](https://pointclouds.org/documentation/tutorials/normal_estimation.html)、[ICP](https://pointclouds.org/documentation/tutorials/iterative_closest_point.html)：几何定义与实现线索。\n\n课件中出现的参考书、论文、旧期刊排名和产品案例在相应来源页记录，未核对的版本/URL不补造。\n'
let media=[]
for(const source of manifest){const x=JSON.parse(readFileSync(`sources/extracted/${source.id}.json`));const seen=new Set();for(const slide of x.slides)for(const r of slide.relationships||[]){if(!['audio','video'].includes(r.kind))continue;const key=slide.page+':'+r.kind+':'+r.target;if(seen.has(key))continue;seen.add(key);media.push({source:source.id,page:slide.page,kind:r.kind,embedded:!r.external,resource:r.external?'外部本地路径（未取得）':r.target.split('/').at(-1),review:'已登记静态占位；未完整播放核验'})}}
writeFileSync('sources/media.json',JSON.stringify(media,null,2)+'\n')
src+='\n## 嵌入音视频与外链边界\n\n以下媒体逐项从关系文件登记。页面视读与视频完整播放是两类审阅，当前不宣称视频过程已完整核验；静态教材只依据可读页面与明确模型。外链本地视频未取得，不能推断内容。\n\n|来源页|类型|资源|处理边界|\n|---|---|---|---|\n'+media.map(m=>`|${m.source}:${m.page}|${m.kind}|${m.embedded?'嵌入：':'外链：'}${m.resource}|${m.review}|`).join('\n')+'\n'
writeFileSync('docs/sources.md',src)
let corrections='# 公式、单位与来源疑义\n\n这里区分课件原表述、编写者修订和未能确认的信息。正文已在相关位置改写，不要求读者依靠此报告补齐关键解释。原课件保持不变。\n\n'
for(const s of manifest){const rows=coverage.filter(x=>x.source===s.id&&x.issues.length);corrections+=`## ${s.id}\n\n`+rows.map(x=>`- 第${x.page}张：${clean(x.issues.join('；'))}。${x.targets.map(t=>`[相关位置](${t.path})`).join(' ' )}`).join('\n')+'\n\n'}
corrections+='## 独立数学核查\n\n误差统计、低通闭式响应、标量Kalman与精度加权等价、相机投影、视差反比、PCA法线、RANSAC概率下界、D-S归一化与平面距离缩放不变性有独立数值检查。测试通过不等于所有课程数学均获形式化证明；复杂证明仍由编写者逐节审阅。\n'
writeFileSync('docs/corrections.md',corrections)
let commit='uncommitted';try{commit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim()}catch{}
writeFileSync('docs/public/version.json',JSON.stringify({commit,sourceCount:manifest.length,sourcePages:coverage.length,knowledgePoints:kps.length,sources:manifest.map(s=>({id:s.id,sha256:s.sha256})),contentHash:hash(kps.map(k=>k.hash).join(''))},null,2)+'\n')
mkdirSync('docs/public/code',{recursive:true})
execFileSync('python3',['scripts/package_reproduce.py'])
console.log(`Prepared ${kps.length} knowledge points and ${coverage.length} source pages`)
