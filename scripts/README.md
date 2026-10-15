# 工具环境

原始 PPTX 提取只需 Python 3 标准库。视觉核查需要 LibreOffice、Poppler 与 Pillow。

- `python3 scripts/extract_sources.py`：扫描当前 `PPT/*.pptx`，重建来源元数据与逐页提取。
- LibreOffice 导出必须设置 `ExportHiddenSlides=true`，否则 S03 第37张隐藏幻灯片会使后续物理页号错位。
- 字体缺失时先配置 Fontconfig 的系统中文字体映射，检查单页后再批量导出。字体不完整的 PDF 不能作为最终视觉审阅依据。
- `python3 scripts/render_review.py S01 5,7,29-33`：渲染物理页。`--sheet` 生成12页联系表，公式需另看单页。

运行教材网站：Node.js 22+，`npm ci`，`npm run validate`，`npm run dev`。
