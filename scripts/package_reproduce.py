from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
root=Path(__file__).resolve().parents[1]
files=['lib/models.mjs','scripts/compute.mjs','tests/models.test.mjs','docs/public/data/results.json','docs/public/data/lowpass-step.csv']
with ZipFile(root/'docs/public/code/reproduce.zip','w',ZIP_DEFLATED) as z:
 for name in files:
  info=__import__('zipfile').ZipInfo(name,date_time=(2026,10,15,0,0,0));info.compress_type=ZIP_DEFLATED;z.writestr(info,(root/name).read_bytes())
 info=__import__('zipfile').ZipInfo('README.md',date_time=(2026,10,15,0,0,0));info.compress_type=ZIP_DEFLATED
 z.writestr(info,'# 智能传感教材确定性复现\n\n需要Node.js 22+，无额外依赖。在解压目录运行：\n\n```sh\nnode scripts/compute.mjs\nnode --test tests/models.test.mjs\n```\n\n原始题目数据来源见教材；低通阶跃、PCA点集和合法DS质量是作者构造，不代表真实设备实验。无随机抽样。\n')
