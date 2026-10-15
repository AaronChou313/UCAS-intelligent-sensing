import {readFileSync,readdirSync,existsSync} from 'node:fs'
import {createHash} from 'node:crypto'
const manifest=JSON.parse(readFileSync('sources/manifest.json'));let fail=[]
const digest=p=>createHash('sha256').update(readFileSync(p)).digest('hex')
if(existsSync('PPT')){const actual=readdirSync('PPT').filter(n=>n.endsWith('.pptx')).map(n=>'PPT/'+n);for(const name of actual)if(!manifest.some(s=>s.file===name))fail.push('NEW '+name);for(const s of manifest){if(!existsSync(s.file))fail.push('MISSING '+s.file);else if(digest(s.file)!==s.sha256)fail.push('CHANGED '+s.file)}}else console.log('Original PPT directory absent: checking tracked source metadata and reviewed PDF hashes only.')
for(const s of manifest){const x=JSON.parse(readFileSync(`sources/extracted/${s.id}.json`));if(x.sha256!==s.sha256||x.slides.length!==s.pages)fail.push('extraction mismatch '+s.id)}
if(existsSync('sources/render-manifest.json'))for(const s of JSON.parse(readFileSync('sources/render-manifest.json'))){if(s.sourceSha256!==manifest.find(m=>m.id===s.id)?.sha256)fail.push('stale rendered source '+s.id);if(!existsSync(s.pdf)||digest(s.pdf)!==s.pdfSha256)fail.push('PDF changed '+s.id);if(s.pdfPages!==manifest.find(m=>m.id===s.id)?.pages)fail.push('PDF page count mismatch '+s.id)}
if(fail.length){console.error(fail.join('\n'));process.exit(1)}console.log(`${manifest.length} sources verified; raw source changes require review.`)
