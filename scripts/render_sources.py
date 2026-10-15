"""Render original PPTX without mutation; validate hidden-slide physical counts.
Requires soffice, pypdf. On macOS uses project Fontconfig CJK mapping.
"""
from pathlib import Path
import hashlib,json,os,platform,shutil,subprocess,tempfile
from pypdf import PdfReader
R=Path(__file__).resolve().parents[1];manifest=json.loads((R/'sources/manifest.json').read_text());out=[]
(R/'sources/rendered').mkdir(exist_ok=True);(R/'docs/public/sources').mkdir(parents=True,exist_ok=True)
env=os.environ.copy()
if platform.system()=='Darwin':env['FONTCONFIG_FILE']=str(R/'scripts/fonts-macos.conf')
with tempfile.TemporaryDirectory(prefix='ucas-sensing-lo-') as profile:
 for s in manifest:
  subprocess.run(['soffice',f'-env:UserInstallation={Path(profile).as_uri()}','--headless','--convert-to','pdf:impress_pdf_Export:{"ExportHiddenSlides":{"type":"boolean","value":"true"}}','--outdir',str(R/'sources/rendered'),str(R/s['file'])],env=env,check=True)
  p=R/'sources/rendered'/(Path(s['file']).stem+'.pdf');pages=len(PdfReader(p).pages)
  if pages!=s['pages']:raise ValueError(f'Physical page mismatch {s["id"]}: {pages} != {s["pages"]}')
  dest=R/'docs/public/sources'/f'{s["id"]}.pdf';shutil.copyfile(p,dest)
  out.append({'id':s['id'],'sourceSha256':s['sha256'],'pdf':str(dest.relative_to(R)),'pdfSha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'pdfPages':pages,'method':'LibreOffice impress_pdf_Export, ExportHiddenSlides=true, system CJK fontconfig; static derivative, not source binary'})
(R/'sources/render-manifest.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print('Rendered PDFs require fresh visual review before accepting updated coverage.')
