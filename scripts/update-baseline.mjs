import {readFileSync,writeFileSync,readdirSync,existsSync} from 'node:fs'
import {knowledge,hash} from './content-lib.mjs'
const at=process.argv.indexOf('--reason'),reason=at>=0?process.argv[at+1]:''
if(!reason||reason.length<8)throw Error('Provide --reason with specific review rationale, at least 8 characters')
const docs=['guide.md','symbols.md','practice.md',...readdirSync('docs/chapters').filter(x=>x.endsWith('.md')).map(x=>'chapters/'+x),...readdirSync('docs/exercises').filter(x=>x.endsWith('.md')).map(x=>'exercises/'+x)]
const sources=JSON.parse(readFileSync('sources/manifest.json')).map(s=>({id:s.id,sha256:s.sha256,topicsSha256:hash(readFileSync(`sources/${s.id}-topics.json`,'utf8'))}))
const baseline={schema:2,reason,sources,knowledge:knowledge().map(({id,file,anchor,hash,formulas})=>({id,file,anchor,hash,formulas})),documents:docs.map(file=>({file,sha256:hash(readFileSync('docs/'+file,'utf8'))}))}
let old='';if(existsSync('reports/change-log.md'))old=readFileSync('reports/change-log.md','utf8');else old='# 内容与基线变更记录\n\n'
writeFileSync('reports/change-log.md',old+`- ${new Date().toISOString()}：${reason}；${baseline.knowledge.length}个知识点，${docs.length}个正文文件。\n`)
writeFileSync('sources/content-baseline.json',JSON.stringify(baseline,null,2)+'\n')
console.log('Baseline recorded with explicit review reason.')
