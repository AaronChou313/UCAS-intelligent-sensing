"""只读提取 PPTX；物理编号包含隐藏页。标准库，无需 PowerPoint。"""
from pathlib import Path
import hashlib, json, re, zipfile, xml.etree.ElementTree as E
ROOT=Path(__file__).resolve().parents[1]
NS={'a':'http://schemas.openxmlformats.org/drawingml/2006/main','m':'http://schemas.openxmlformats.org/officeDocument/2006/math','p':'http://schemas.openxmlformats.org/presentationml/2006/main'}
CHARS='一二三四五六七八'
manifest=[]
for p in sorted((ROOT/'PPT').glob('*.pptx'),key=lambda p:CHARS.index(p.name[1])):
 sid=f'S{CHARS.index(p.name[1])+1:02d}'
 with zipfile.ZipFile(p) as z:
  pres=E.fromstring(z.read('ppt/presentation.xml'))
  rels=E.fromstring(z.read('ppt/_rels/presentation.xml.rels'))
  targets={r.attrib['Id']:r.attrib['Target'] for r in rels}
  slide_paths=['ppt/'+targets[s.attrib['{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id']].lstrip('/') for s in pres.find('p:sldIdLst',NS)]
  slides=[]
  for i,name in enumerate(slide_paths,1):
   root=E.fromstring(z.read(name))
   texts=[''.join(t.itertext()) for t in root.findall('.//a:t',NS)]
   maths=[E.tostring(t,encoding='unicode') for t in root.findall('.//m:oMath',NS)]
   notesname=f'ppt/notesSlides/notesSlide{i}.xml'
   notes=[]
   if notesname in z.namelist(): notes=[t.text or '' for t in E.fromstring(z.read(notesname)).findall('.//a:t',NS)]
   slides.append({'page':i,'hidden':root.attrib.get('show')=='0','text':texts,'omml':maths,'pictures':len(root.findall('.//p:pic',NS)),'ole':len(root.findall('.//p:oleObj',NS)),'notes':notes})
  core=E.fromstring(z.read('docProps/core.xml'))
  props={e.tag.split('}')[-1]:e.text for e in core}
  item={'id':sid,'file':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size,'pages':len(slides),'properties':props,'version_policy':'仅有此文件版本；属性日期与封面日期分别记录，不认定为授课年份','slides':slides}
  (ROOT/'sources/extracted'/f'{sid}.json').write_text(json.dumps(item,ensure_ascii=False,indent=2))
  (ROOT/'sources/extracted'/f'{sid}.txt').write_text('\n\n'.join(f'--- {sid} p.{s["page"]} 图片:{s["pictures"]} OLE:{s["ole"]} OMML:{len(s["omml"])} ---\n'+ '\n'.join(s['text']) + ('\n[备注] '+ '\n'.join(s['notes']) if s['notes'] else '') for s in slides))
  manifest.append({k:v for k,v in item.items() if k!='slides'})
(ROOT/'sources/manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print(f'{len(manifest)} files, {sum(x["pages"] for x in manifest)} slides')
