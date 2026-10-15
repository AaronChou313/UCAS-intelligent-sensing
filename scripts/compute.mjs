import {errors,scalarKalman,project,normal2D,ransacIterations,dsCombine,lowpass} from '../lib/models.mjs'
import {writeFileSync,mkdirSync,readFileSync} from 'node:fs'
const reference=[505,1002,1999,3002,4003,4998,6002,7001],observed=[495,990,2040,3020,3940,4940,5880,6800]
const results={description:'来源数值与编写者合成计算，非真实学生实验或传感器性能测评',s01Errors:errors(reference,observed),s01Resolution:Math.ceil(90*50000*5.76/(12*440)),s01Blur:2000*43e-6*1360/70,temperature:scalarKalman(23,25,25,16),camera:project([100,100,100],[[.41,.90,.13],[-.64,.18,.75],[.65,-.39,.65]],[0,0,800],{fx:840,fy:840,cx:600,cy:400}),pca:normal2D([[0,3],[1,5],[2,7],[3,9]]),ransac:ransacIterations(.6,3,.99),evidence:dsCombine({1:.6,3:.4},{2:.5,3:.5})}
const input=Array.from({length:41},(_,k)=>k<5?0:1),output=lowpass(input,.25)
const artifacts={'results.json':JSON.stringify(results,null,2)+'\n','lowpass-step.csv':'k,input,output\n'+input.map((x,k)=>`${k},${x},${output[k]}`).join('\n')+'\n'}
mkdirSync('docs/public/data',{recursive:true})
for(const [name,body] of Object.entries(artifacts)){const file='docs/public/data/'+name;if(process.argv.includes('--check')){if(readFileSync(file,'utf8')!==body)throw Error('Stale calculation: '+file)}else writeFileSync(file,body)}
console.log(process.argv.includes('--check')?'Reproducible calculation artifacts verified.':JSON.stringify(results,null,2))
