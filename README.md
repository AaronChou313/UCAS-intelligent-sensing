# 智能传感与信息处理 · 中文自学教材

从传感器的物理转换、处理平台与误差分析，学习视觉、点云、听觉与多源信息融合。面向具备大学理工科基础、首次系统学习本课程的读者。

[在线阅读](https://aaronchou313.github.io/UCAS-intelligent-sensing/) · [学习指南](docs/guide.md) · [统一符号](docs/symbols.md) · [知识清单](docs/checklist.md) · [来源与版本](docs/sources.md) · [逐页覆盖](docs/coverage.md)

教材基于当前八份PPTX的1,063张物理幻灯片，包含隐藏页；建设八章、174个稳定知识点、八组原题与参考解、18幅科学SVG和一项低通参数交互。解释、推导、作者例题与原课件内容区分标注。保留课程原有合理章序，在章内按学习依赖组织。

## 本地阅读与检查

需要Node.js 22+和Python 3（复现包打包仅用标准库）。

```sh
npm ci
npm run validate
npm run dev
```

生产预览：`npm run build`后运行`npm run preview`，访问终端给出的`/UCAS-intelligent-sensing/`地址。构建后如再次修改并构建，应重启预览服务器，以免它保留旧资源映射。

```sh
node scripts/compute.mjs
node --test tests/models.test.mjs
npm run figures:generate
```

确定性计算无额外数值依赖；来源数据和作者合成数据见[实践说明](docs/practice.md)。没有原始录音、硬件或完整旧项目的实验不声称已复现。

## 工程结构

| 路径 | 用途 |
| --- | --- |
| `docs/` | 唯一教材正文、知识清单、原题、来源页与维护说明 |
| `docs/.vitepress/` | VitePress、MathJax、主题及轻量交互 |
| `docs/public/` | 公开静态PDF、SVG、计算结果和复现包 |
| `sources/` | SHA-256清单、逐页提取与审阅、知识和正文完整性基线 |
| `lib/`、`tests/` | 共享计算模型及独立数学检查 |
| `scripts/` | 提取、渲染、索引、科学图与质量门禁 |
| `reports/` | 调查、审阅、进度、建设验收和变更理由 |
| `PPT/` | 本地只读原始资料；大文件不进入普通Git |

来源PDF是静态导出版本，不是原PPTX；含隐藏页、中文字体映射和独立哈希。视频与动画不能由静态PDF完整还原。

## 更新与部署

先读[AGENTS.md](AGENTS.md)与[维护流程](docs/maintenance.md)。新增资料先做`npm run check:sources`，再有意识地接纳来源变化、逐页复核、更新知识与图表。正文基线有变化时须填写具体理由；不得删测试掩盖错误。

GitHub Actions在提交与PR上执行来源、正文、数学、图形和生成网页检查；仅`main`通过后部署Pages。线上`version.json`记录实际Git commit、知识点数量与来源摘要。部署方法参考[VitePress官方文档](https://vitepress.dev/guide/deploy#github-pages)。

## 已知边界

课件日期和讲次并非一致的同年度套装，不推测当前考试范围。缺少独立FPGA图像加速课件、听觉原题录音及部分演示数据；嵌入音视频未完整播放。S04第35张、S08第125—127张旧公式表格的原生视觉呈现仍待核查，正文有明确交叉说明。完整证据见[建设验收报告](reports/final-report.md)。
