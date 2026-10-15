import {readFileSync} from 'node:fs'
import {execFileSync,execFile} from 'node:child_process'
import {promisify} from 'node:util'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
const base='https://aaronchou313.github.io/UCAS-intelligent-sensing/'
const expected=process.argv[2]||execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim()
const curl=promisify(execFile)
async function get(name,method='GET'){const args=['--fail','--silent','--show-error','--location','--max-time','45'];if(method==='HEAD')args.push('--head');args.push(base+name);const {stdout}=await curl('curl',args,{encoding:'buffer',maxBuffer:30*1024*1024});return {text:async()=>stdout.toString('utf8'),json:async()=>JSON.parse(stdout.toString('utf8')),arrayBuffer:async()=>stdout}}
const version=await (await get('version.json?commit='+expected)).json()
assert.equal(version.commit,expected,'online commit differs from expected')
const manifest=JSON.parse(readFileSync('sources/manifest.json'))
assert.equal(version.knowledgePoints,JSON.parse(readFileSync('sources/knowledge.json')).length);assert.equal(version.sourcePages,manifest.reduce((a,s)=>a+s.pages,0))
assert.deepEqual(version.sources,manifest.map(({id,sha256})=>({id,sha256})))
const pages=['','guide.html','practice.html','checklist.html','coverage.html','sources.html','chapters/01-foundations.html','chapters/02-sensors.html','chapters/03-platforms.html','chapters/04-data.html','chapters/05-vision.html','chapters/06-pointcloud.html','chapters/07-audio.html','chapters/08-fusion.html']
const bodies=await Promise.all(pages.map(async name=>{const body=await (await get(name)).text();assert.ok(body.includes('智能传感与信息处理'),name);assert.ok(!/<mjx-merror|<merror|data-mjx-error/.test(body),name);return body}))
const resources=new Set([...bodies[0].matchAll(/(?:href|src)="([^"#?]+\.(?:css|js))"/g)].map(m=>new URL(m[1],base)).filter(u=>u.origin===new URL(base).origin).map(u=>u.pathname.slice(new URL(base).pathname.length)))
await Promise.all([...resources].map(n=>get(n,'HEAD')))
await Promise.all(manifest.map(s=>get(`sources/${s.id}.pdf`,'HEAD')))
const derivative=JSON.parse(readFileSync('sources/render-manifest.json')).find(s=>s.id==='S03')
const pdf=Buffer.from(await (await get('sources/S03.pdf')).arrayBuffer())
assert.equal(createHash('sha256').update(pdf).digest('hex'),derivative.pdfSha256,'online hidden-slide PDF differs')
for(const file of ['code/reproduce.zip','data/results.json']){const live=Buffer.from(await (await get(file)).arrayBuffer()),local=readFileSync('docs/public/'+file);assert.ok(live.equals(local),`online artifact differs: ${file}`)}
console.log(JSON.stringify({commit:expected,pages:pages.length,assets:resources.size,pdfHeaders:manifest.length,pdfHash:'S03 including hidden slide',reproduction:'zip and results byte-identical'},null,2))
