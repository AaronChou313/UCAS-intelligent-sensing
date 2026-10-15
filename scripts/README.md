# 工具环境

原始 PPTX 提取只需 Python 3 标准库。视觉核查需要 LibreOffice、Poppler、pypdf 与 Pillow；后两项可装入独立虚拟环境。来源渲染不属于普通网站构建依赖，CI核验已发布的渲染哈希。

- `python3 scripts/extract_sources.py`：扫描当前 `PPT/*.pptx`，重建来源元数据与逐页提取。
- LibreOffice 导出必须设置 `ExportHiddenSlides=true`，否则 S03 第37张隐藏幻灯片会使后续物理页号错位。
- 字体缺失时先配置 Fontconfig 的系统中文字体映射，检查单页后再批量导出。字体不完整的 PDF 不能作为最终视觉审阅依据。
- `python3 scripts/render_review.py S01 5,7,29-33`：渲染物理页。`--sheet` 生成12页联系表，公式需另看单页。
- `python3 scripts/render_sources.py`：重导出全部来源PDF，核对包括隐藏页的物理页数并保存独立渲染哈希。重导出后必须重新视读，不能把脚本成功当成视觉验收。
- `python3 scripts/serve-nojs.py`：构建后启动4183端口检查，CSP阻止页面脚本，用于查看正文、公式、SVG和交互静态回退；搜索及交互控件不运行是预期行为。

运行教材网站：Node.js 22+，`npm ci`，`npm run validate`，`npm run dev`。

线上发布后执行`npm run check:live`，默认核对当前HEAD、八章与主要入口、资源、PDF及复现产物；需要系统curl。临时核对指定旧提交可运行`node scripts/verify-live.mjs <完整commit>`。
