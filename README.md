# UI Design Review AI · Figma Plugin

这是一个基于 `TypeScript + React + Vite + Figma Plugin API` 的 UI 走查插件脚手架。

## 已包含能力

- 获取当前选中 Frame 的截图
- 上传设计稿
- 上传手机截图
- 调用 OpenAI API 做 UI 自动走查
- 按 `ui-design-review` 工作方式输出结构化差异报告
- 在 Figma 中高亮问题区域

## 使用方式

1. 修复或准备本地依赖

```bash
node ./scripts/ensure-local-deps.mjs
```

2. 构建插件产物

```bash
node ./scripts/build-plugin.mjs
```

3. 在 Figma Desktop 中导入插件

- Plugins
- Development
- Import plugin from manifest…
- 开发阶段推荐选择当前目录下的 `manifest.json`
- 如果你只想导入构建产物，也可以选择 `dist/manifest.json`

4. 在插件中：

- 先选中一个 Frame
- 点 `获取当前 Frame 截图`
- 上传设计稿
- 填写 OpenAI API Key
- 点 `开始 AI 走查`
- 返回报告后可点 `一键高亮全部问题`

## 目录说明

- `manifest.json`：开发导入入口，指向 `dist/code.js`
- `dist/manifest.json`：构建后可单独导入的产物 manifest
- `src/code.ts`：Figma 主线程逻辑
- `src/App.tsx`：React 界面
- `src/lib/openai.ts`：OpenAI UI 走查分析
- `scripts/build-plugin.mjs`：构建脚本

## 说明

- 当前版本把 `ui-design-review` 作为固定分析策略提示词内置在 OpenAI 请求里。
- 如果你后面想把它升级成服务端调用，可以把 `src/lib/openai.ts` 改成请求你自己的后端。
- 高亮区域目前使用红色描边框 + 文本标签，你可以继续改成更贴近你团队规范的视觉样式。
- 社区发布前建议先看 [docs/community-publish-kit.md](/Users/xiaoxin/Desktop/优大集买家端/figma-ui-design-review-plugin/docs/community-publish-kit.md:1) 和 [docs/privacy-policy-template.md](/Users/xiaoxin/Desktop/优大集买家端/figma-ui-design-review-plugin/docs/privacy-policy-template.md:1)。

## Maintainers

- [xiaoxinxiaosong](https://github.com/xiaoxinxiaosong) - Owner and primary maintainer
