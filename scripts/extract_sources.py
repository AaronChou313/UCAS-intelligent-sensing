"""Read-only PPTX extraction. Physical slide order includes hidden slides.
Changed inputs require a reason, and prior metadata/extraction are archived first.
"""
from pathlib import Path,PurePosixPath
import argparse,datetime,hashlib,json,posixpath,shutil,zipfile,xml.etree.ElementTree as E
ROOT=Path(__file__).resolve().parents[1]
NS={'a':'http://schemas.openxmlformats.org/drawingml/2006/main','m':'http://schemas.openxmlformats.org/officeDocument/2006/math','p':'http://schemas.openxmlformats.org/presentationml/2006/main'}
parser=argparse.ArgumentParser();parser.add_argument('--accept-change',metavar='REASON');args=parser.parse_args()
old=json.loads((ROOT/'sources/manifest.json').read_text()) if (ROOT/'sources/manifest.json').exists() else []
files=list((ROOT/'PPT').glob('*.pptx'));digests={str(p.relative_to(ROOT)):hashlib.sha256(p.read_bytes()).hexdigest() for p in files}
changes=[name for name,d in digests.items() if not any(x['file']==name and x['sha256']==d for x in old)]
removed=[x['file'] for x in old if x['file'] not in digests]
if old and (changes or removed):
 if not args.accept_change:raise SystemExit('Source changes require --accept-change REASON after retaining original old files: '+str({'changed_or_new':changes,'missing':removed}))
 folder=ROOT/'sources/history'/datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ');folder.mkdir(parents=True)
 shutil.copy2(ROOT/'sources/manifest.json',folder/'manifest.json')
 shutil.copytree(ROOT/'sources/extracted',folder/'extracted')
 (folder/'change.json').write_text(json.dumps({'reason':args.accept_change,'changed_or_new':changes,'missing':removed},ensure_ascii=False,indent=2))
 if removed:raise SystemExit('Missing original sources archived for review; restore or explicitly resolve removal before extraction. No current records overwritten.')
byfile={x['file']:x['id'] for x in old};next_id=max([int(x['id'][1:]) for x in old]+[0])+1
order='一二三四五六七八九十'
files.sort(key=lambda p:(order.index(p.name[1]) if p.name.startswith('第') and p.name[1] in order else 100,p.name))
manifest=[];catalogue=json.loads((ROOT/'sources/catalogue.json').read_text()) if (ROOT/'sources/catalogue.json').exists() else {}
def target(source,value):return value.lstrip('/') if value.startswith('/') else posixpath.normpath(posixpath.join(posixpath.dirname(source),value))
for p in files:
 relpath=str(p.relative_to(ROOT));sid=byfile.get(relpath)
 if not sid:sid=f'S{next_id:02d}';next_id+=1
 with zipfile.ZipFile(p) as z:
  pres=E.fromstring(z.read('ppt/presentation.xml'));rels=E.fromstring(z.read('ppt/_rels/presentation.xml.rels'))
  targets={r.attrib['Id']:r.attrib['Target'] for r in rels}
  slide_paths=[target('ppt/presentation.xml',targets[s.attrib['{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id']]) for s in pres.find('p:sldIdLst',NS)]
  slides=[]
  for i,name in enumerate(slide_paths,1):
   root=E.fromstring(z.read(name));texts=[''.join(t.itertext()) for t in root.findall('.//a:t',NS)]
   maths=[E.tostring(t,encoding='unicode') for t in root.findall('.//m:oMath',NS)]
   relname=str(PurePosixPath(name).parent/'_rels'/(PurePosixPath(name).name+'.rels'));relationships=[];notes=[]
   if relname in z.namelist():
    for r in E.fromstring(z.read(relname)):
     kind=r.attrib['Type'].split('/')[-1];value=r.attrib['Target'];external=r.attrib.get('TargetMode')=='External';dest=value if external else target(name,value)
     if kind=='notesSlide' and dest in z.namelist():notes=[t.text or '' for t in E.fromstring(z.read(dest)).findall('.//a:t',NS)]
     if kind in ['video','audio','media','oleObject','chart','diagramData','hyperlink']:relationships.append({'kind':kind,'target':dest,'external':external})
   slides.append({'page':i,'hidden':root.attrib.get('show')=='0','text':texts,'omml':maths,'pictures':len(root.findall('.//p:pic',NS)),'ole':len(root.findall('.//p:oleObj',NS)),'notes':notes,'relationships':relationships})
  core=E.fromstring(z.read('docProps/core.xml'));props={e.tag.split('}')[-1]:e.text for e in core}
  item={'id':sid,'file':relpath,'sha256':digests[relpath],'bytes':p.stat().st_size,'pages':len(slides),'properties':props,**catalogue.get(sid,{}),'hiddenPages':[s['page'] for s in slides if s['hidden']],'version_policy':'仅有此文件版本；属性日期与封面日期分别记录，不认定为授课年份','slides':slides}
  (ROOT/'sources/extracted'/f'{sid}.json').write_text(json.dumps(item,ensure_ascii=False,indent=2)+'\n')
  (ROOT/'sources/extracted'/f'{sid}.txt').write_text('\n\n'.join(f'--- {sid} p.{s["page"]} 图片:{s["pictures"]} OLE:{s["ole"]} OMML:{len(s["omml"])} ---\n'+'\n'.join(s['text'])+('\n[备注] '+'\n'.join(s['notes']) if s['notes'] else '') for s in slides))
  manifest.append({k:v for k,v in item.items() if k!='slides'})
(ROOT/'sources/manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print(f'{len(manifest)} files, {sum(x["pages"] for x in manifest)} slides')
