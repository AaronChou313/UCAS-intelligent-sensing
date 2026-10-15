import {readFileSync,readdirSync} from 'node:fs'
import {createHash} from 'node:crypto'
export const hash=s=>createHash('sha256').update(s).digest('hex')
export function knowledge(){const out=[];for(const file of readdirSync('docs/chapters').filter(x=>x.endsWith('.md')).sort()){const body=readFileSync('docs/chapters/'+file,'utf8');const re=/<!--\s*kp:([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)\|([^>]+?)\s*-->/g;const matches=[...body.matchAll(re)];for(let i=0;i<matches.length;i++){const m=matches[i];const section=body.slice(m.index+m[0].length,matches[i+1]?.index??body.length);const anchor=section.match(/^###?\s+[^\n]*\{#([^}]+)\}/m)?.[1];if(!anchor)throw Error('Missing stable heading for '+m[1]);out.push({id:m[1].trim(),title:m[2].trim(),importance:m[3].trim(),depth:m[4].trim(),source:m[5].trim(),file:'chapters/'+file,anchor,hash:hash(section),formulas:[...section.matchAll(/\$\$([\s\S]*?)\$\$/g)].map(x=>x[1].trim()),section})}}
return out}

export function sourceRanges(source){const out=[];for(const m of source.matchAll(/(S\d{2}):([^;；S]+)/g)){for(const part of m[2].split(/[,，]/)){const n=part.trim().match(/^(\d+)(?:[-—–](\d+))?$/);if(!n)throw Error('invalid source range '+source);out.push({id:m[1],start:+n[1],end:+(n[2]||n[1])})}}if(!out.length)throw Error('missing source '+source);return out}
