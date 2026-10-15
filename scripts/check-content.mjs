import {readFileSync,readdirSync,existsSync} from 'node:fs'
import {execFileSync} from 'node:child_process'
import assert from 'node:assert/strict'
import {knowledge,hash,sourceRanges} from './content-lib.mjs'
const ks=knowledge(),manifest=JSON.parse(readFileSync('sources/manifest.json')),coverage=JSON.parse(readFileSync('sources/coverage.json'))
assert.equal(new Set(ks.map(k=>k.id)).size,ks.length,'duplicate knowledge id')
for(const k of ks){assert.match(k.id,/^IS-\d{2}-\d{3}$/);assert.ok(['core','support','extension'].includes(k.importance));assert.ok(['detailed','mentioned'].includes(k.depth));for(const r of sourceRanges(k.source)){const s=manifest.find(s=>s.id===r.id);assert.ok(s&&r.start>=1&&r.end>=r.start&&r.end<=s.pages,'invalid source range '+k.id)}}
assert.equal(coverage.length,manifest.reduce((a,s)=>a+s.pages,0));assert.equal(new Set(coverage.map(c=>c.source+':'+c.page)).size,coverage.length)
for(const s of manifest){const rows=coverage.filter(c=>c.source===s.id);assert.equal(rows.length,s.pages);for(let n=1;n<=s.pages;n++)assert.ok(rows.some(c=>c.page===n),'missing source page');for(const t of JSON.parse(readFileSync(`sources/${s.id}-topics.json`)))assert.ok(['detailed','mentioned','noncontent'].includes(t.depth))}
for(const row of coverage){assert.ok(row.title&&row.targets.length,'unmapped source');assert.equal(row.visual_inspected,true,`unreviewed visual ${row.source}:${row.page}`);assert.ok(['reviewed','limited'].includes(row.visual_status));if(row.visual_status==='limited')assert.ok(row.pending_review&&row.issues.length,'limited page needs explicit unresolved evidence')}
const baseline=JSON.parse(readFileSync('sources/content-baseline.json'))
assert.deepEqual(ks.map(({id,file,anchor,hash,formulas})=>({id,file,anchor,hash,formulas})),baseline.knowledge,'knowledge section changed without reviewed baseline update')
for(const b of baseline.documents)assert.equal(hash(readFileSync('docs/'+b.file,'utf8')),b.sha256,'unreviewed change '+b.file)
for(const file of [...readdirSync('docs/chapters').map(x=>'docs/chapters/'+x),...readdirSync('docs/exercises').map(x=>'docs/exercises/'+x)]){const body=readFileSync(file,'utf8');assert.ok(!/图位建议|TODO|待补正文|PLACEHOLDER/.test(body),file+' unfinished authoring note');assert.equal((body.match(/\$\$/g)||[]).length%2,0,'unpaired display math '+file)}
execFileSync(process.execPath,['scripts/check-sources.mjs'],{stdio:'inherit'})
execFileSync(process.execPath,['scripts/build-figures.mjs','--check'],{stdio:'inherit'})
execFileSync(process.execPath,['scripts/compute.mjs','--check'],{stdio:'inherit'})
console.log(`${ks.length} stable knowledge points, ${coverage.length} reviewed physical pages, baseline and figures verified.`)
