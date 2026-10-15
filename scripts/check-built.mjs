import {readdirSync,readFileSync,existsSync,statSync} from 'node:fs'
import {resolve,dirname,join} from 'node:path'
const root=resolve('docs/.vitepress/dist'),base='/UCAS-intelligent-sensing/'
function walk(dir){return readdirSync(dir).flatMap(n=>statSync(join(dir,n)).isDirectory()?walk(join(dir,n)):[join(dir,n)])}
const files=walk(root),html=files.filter(f=>f.endsWith('.html'));let errors=[];const anchorCache=new Map()
const decode=s=>{try{return decodeURIComponent(s.replaceAll('&amp;','&'))}catch{return s}}
for(const f of html){const body=readFileSync(f,'utf8');if(/<mjx-merror|<merror|data-mjx-error/.test(body))errors.push('MathJax error '+f);anchorCache.set(f,new Set([...body.matchAll(/\bid="([^"]+)"/g)].map(m=>decode(m[1]))))}
for(const f of html){const body=readFileSync(f,'utf8');for(const m of body.matchAll(/\b(?:href|src)="([^"]+)"/g)){const href=decode(m[1]);if(/^(?:https?:|data:|mailto:|tel:|javascript:)/.test(href)||href.startsWith('//'))continue;const [pathq,frag]=href.split('#'),p=pathq.split('?')[0];let target;if(!p)target=f;else if(p.startsWith(base))target=resolve(root,p.slice(base.length));else if(p.startsWith('/')){errors.push('root-relative resource '+href+' in '+f);continue}else target=resolve(dirname(f),p);if(existsSync(target)&&statSync(target).isDirectory())target=join(target,'index.html');if(!existsSync(target)){errors.push('missing '+href+' in '+f);continue}if(frag&&target.endsWith('.html')&&!anchorCache.get(target)?.has(frag))errors.push('missing anchor '+href+' in '+f)}}
if(errors.length){console.error([...new Set(errors)].join('\n'));process.exit(1)}
console.log(`Built HTML verified: ${html.length} pages, internal targets/resources and MathJax checked.`)
