"""渲染具体来源页或联系表；联系表用于全页扫读，公式另看单页。"""
import argparse,subprocess,json
from pathlib import Path
from PIL import Image,ImageDraw
R=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser();p.add_argument('source');p.add_argument('pages');p.add_argument('--sheet',action='store_true');a=p.parse_args()
s=next(x for x in json.loads((R/'sources/manifest.json').read_text()) if x['id']==a.source)
pages=[]
for x in a.pages.split(','):
 if '-' in x:
  l,h=map(int,x.split('-'));pages+=list(range(l,h+1))
 else:pages.append(int(x))
(R/'sources/review/fixed').mkdir(parents=True,exist_ok=True)
paths=[]
for page in pages:
 prefix=R/'sources/review/fixed'/f'{a.source}-{page:03d}'
 dest=prefix.with_suffix('.png')
 if not dest.exists():
  subprocess.run(['pdftoppm','-f',str(page),'-l',str(page),'-scale-to','1500','-singlefile','-png',str(R/'sources/rendered'/(Path(s['file']).stem+'.pdf')),str(prefix)],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
 paths.append(dest)
if a.sheet:
 for k in range(0,len(paths),12):
  batch=paths[k:k+12]; w=640;h=480
  out=Image.new('RGB',(w*3,h*4),'#e5e7eb'); d=ImageDraw.Draw(out)
  for j,path in enumerate(batch):
   im=Image.open(path);im.thumbnail((w,h-26));x=(j%3)*w;y=(j//3)*h
   out.paste(im,(x,y+24));d.text((x+8,y+5),path.stem,fill='black')
  target=R/'sources/review/fixed'/f'{a.source}-sheet-{pages[k]:03d}.jpg';out.save(target,quality=90);print(target)
else:
 for path in paths:print(path)
