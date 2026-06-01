import { UI_HTML } from "./generated/ui-inline";
import { reviewUiWithAI } from "./lib/openai";
import type { ReviewIssue, UILanguage, UIToPluginMessage } from "./lib/types";

let capturedNodeIds: { design: string | null; dev: string | null } = {
  design: null,
  dev: null
};
let highlightNodeIds: string[] = [];

const PLUGIN_COPY = {
  zh: {
    selectFrameToCapture: "请先选中一个 Frame 或可导出的图层，再执行截图。",
    missingBounds: "当前选中对象缺少位置信息，无法高亮问题区域。",
    captureStart: (name: string) => `正在获取截图：${name}`,
    captureDone: (name: string) => `已获取当前 Frame：${name}`,
    analyzing: "AI 正在进行 UI 走查…",
    needDevFrame: "请先将手机截图设置为当前 Frame，再执行高亮。",
    cannotFindFrame: "无法定位当前 Frame。",
    noHighlightFound: "没有找到可高亮的位置，请先确认手机截图对应的是可编辑的 Figma Frame。",
    unknownError: "未知错误"
  },
  en: {
    selectFrameToCapture: "Select a Frame or another exportable layer before capturing an image.",
    missingBounds: "The selected object has no position data, so the issue area cannot be highlighted.",
    captureStart: (name: string) => `Capturing image: ${name}`,
    captureDone: (name: string) => `Captured current Frame: ${name}`,
    analyzing: "AI is reviewing the UI…",
    needDevFrame: "Set the implementation image from the current Frame before highlighting issues.",
    cannotFindFrame: "The current Frame could not be located.",
    noHighlightFound: "No highlightable location was found. Make sure the implementation screenshot corresponds to an editable Figma Frame.",
    unknownError: "Unknown error"
  },
  ko: {
    selectFrameToCapture: "이미지를 가져오기 전에 Frame 또는 내보낼 수 있는 레이어를 먼저 선택해 주세요.",
    missingBounds: "선택한 객체에 위치 정보가 없어 문제 영역을 강조 표시할 수 없습니다.",
    captureStart: (name: string) => `이미지 가져오는 중: ${name}`,
    captureDone: (name: string) => `현재 Frame을 가져왔습니다: ${name}`,
    analyzing: "AI가 UI를 리뷰하고 있습니다…",
    needDevFrame: "문제를 강조하기 전에 현재 Frame을 구현 이미지로 먼저 설정해 주세요.",
    cannotFindFrame: "현재 Frame을 찾을 수 없습니다.",
    noHighlightFound: "강조할 위치를 찾지 못했습니다. 구현 스크린샷이 편집 가능한 Figma Frame에 대응하는지 확인해 주세요.",
    unknownError: "알 수 없는 오류"
  }
} satisfies Record<UILanguage, Record<string, string | ((name: string) => string)>>;

const SUPPORT_CONTACT = "mailto:s1119551.kh@go.edu.tw";
const UI_WIDTH = 400;
const UI_DEFAULT_HEIGHT = 640;
const UI_MIN_HEIGHT = 520;
const UI_MAX_HEIGHT = 1200;

figma.showUI(UI_HTML, {
  width: UI_WIDTH,
  height: UI_DEFAULT_HEIGHT,
  themeColors: true
});

function clampUiHeight(height: number) {
  if (!Number.isFinite(height)) {
    return UI_DEFAULT_HEIGHT;
  }

  return Math.max(UI_MIN_HEIGHT, Math.min(UI_MAX_HEIGHT, Math.round(height)));
}

function bytesToDataUrl(bytes: Uint8Array) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let binary = "";
  for (let index = 0; index < bytes.length; index += 3) {
    const a = bytes[index];
    const b = index + 1 < bytes.length ? bytes[index + 1] : 0;
    const c = index + 2 < bytes.length ? bytes[index + 2] : 0;
    const triplet = (a << 16) | (b << 8) | c;

    binary += alphabet[(triplet >> 18) & 63];
    binary += alphabet[(triplet >> 12) & 63];
    binary += index + 1 < bytes.length ? alphabet[(triplet >> 6) & 63] : "=";
    binary += index + 2 < bytes.length ? alphabet[triplet & 63] : "=";
  }
  return `data:image/png;base64,${binary}`;
}

function getNodeBounds(node: BaseNode | null) {
  if (!node || !("absoluteBoundingBox" in node) || !node.absoluteBoundingBox) {
    return null;
  }
  return node.absoluteBoundingBox;
}

function clamp(min: number, value: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getPluginText(language?: UILanguage) {
  return PLUGIN_COPY[language || "zh"];
}

function getMessageLanguageSafe(message: unknown): UILanguage {
  if (!message || typeof message !== "object" || !("language" in message)) {
    return "zh";
  }

  const candidate = (message as { language?: unknown }).language;
  return candidate === "en" || candidate === "ko" ? candidate : "zh";
}

function getApiKeyStorageKey(provider: string, model: string) {
  return provider && model ? `ui-review-api-key-${provider}-${model}` : "";
}

async function loadLastSettings() {
  const provider = await figma.clientStorage.getAsync("ui-review-provider");
  const model = await figma.clientStorage.getAsync("ui-review-model");
  const normalizedProvider = typeof provider === "string" ? provider : "";
  const normalizedModel = typeof model === "string" ? model : "";
  const apiKey = await loadApiKey(normalizedProvider, normalizedModel);
  return { provider: normalizedProvider, model: normalizedModel, apiKey };
}

async function saveLastSelection(provider: string, model: string) {
  if (!provider || !model) return;
  await figma.clientStorage.setAsync("ui-review-provider", provider);
  await figma.clientStorage.setAsync("ui-review-model", model);
}

async function loadApiKey(provider: string, model: string) {
  const key = getApiKeyStorageKey(provider, model);
  if (!key) return "";
  const value = await figma.clientStorage.getAsync(key);
  return typeof value === "string" ? value : "";
}

async function saveApiKey(provider: string, model: string, apiKey: string) {
  const key = getApiKeyStorageKey(provider, model);
  if (!key) return;
  await saveLastSelection(provider, model);
  await figma.clientStorage.setAsync(key, apiKey);
}

function normalizeSearchText(text: string) {
  return text
    .replace(/[“”"'`‘’【】\[\]()（）:：;；,.，。!?！？]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function extractIssueKeywords(issue: ReviewIssue) {
  const rawText = `${issue.title || ""} ${issue.summary || ""} ${issue.recommendation || ""}`;
  const quotedMatches: string[] = [];
  const quotedPattern = /[“"'`「『]([^“”"'`「」『』]{2,20})[”"'`」』]/g;
  let quotedMatch = quotedPattern.exec(rawText);
  while (quotedMatch) {
    quotedMatches.push(quotedMatch[1].trim());
    quotedMatch = quotedPattern.exec(rawText);
  }

  const genericTokens = new Set([
    "手机截图",
    "设计稿",
    "不一致",
    "偏大",
    "偏小",
    "过浅",
    "过深",
    "需要",
    "进一步",
    "核对",
    "差异",
    "问题",
    "列表项",
    "顶部",
    "右侧",
    "文案",
    "颜色",
    "字号",
    "icon",
    "按钮",
    "文字",
    "implementation",
    "design",
    "difference",
    "issue",
    "module",
    "section",
    "header",
    "button",
    "text",
    "design frame",
    "implemented frame",
    "구현",
    "디자인",
    "차이",
    "문제",
    "모듈",
    "섹션",
    "헤더",
    "버튼",
    "텍스트"
  ]);

  const splitTokens = rawText
    .split(/[\s,，。；;：:、|/]+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2)
    .filter((token) => !genericTokens.has(token));

  return Array.from(new Set(quotedMatches.concat(splitTokens)))
    .map((token) => token.trim())
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);
}

function collectSearchCandidates(root: BaseNode) {
  const candidates: Array<{ node: SceneNode; text: string }> = [];

  function visit(node: BaseNode) {
    if ("visible" in node && node.visible === false) return;

    if ("characters" in node && typeof node.characters === "string") {
      candidates.push({
        node: node as SceneNode,
        text: normalizeSearchText(node.characters)
      });
    } else if ("name" in node && typeof node.name === "string" && node.name.trim()) {
      candidates.push({
        node: node as SceneNode,
        text: normalizeSearchText(node.name)
      });
    }

    if ("children" in node) {
      for (const child of node.children) {
        visit(child);
      }
    }
  }

  visit(root);
  return candidates;
}

function pickHighlightContainer(node: SceneNode, target: SceneNode & LayoutMixin) {
  const targetBounds = getNodeBounds(target);
  if (!targetBounds) return getNodeBounds(node);

  let current: BaseNode | null = node;
  let bestBounds = getNodeBounds(node);

  while (current && "parent" in current && current.parent && current.parent !== figma.currentPage) {
    const parent = current.parent as BaseNode;
    const parentBounds = getNodeBounds(parent);
    if (!parentBounds) break;

    const widthRatio = parentBounds.width / targetBounds.width;
    const heightRatio = parentBounds.height / targetBounds.height;

    if (widthRatio > 0.88 || heightRatio > 0.4) break;

    bestBounds = parentBounds;
    current = parent;

    if (parent === target) break;
  }

  return bestBounds;
}

function findIssueBounds(target: SceneNode & LayoutMixin, issue: ReviewIssue) {
  const keywords = extractIssueKeywords(issue);
  if (!keywords.length) {
    return null;
  }

  const candidates = collectSearchCandidates(target);
  let bestMatch:
    | {
        score: number;
        bounds: Rect;
      }
    | null = null;

  for (const candidate of candidates) {
    const bounds = pickHighlightContainer(candidate.node, target);
    if (!bounds) continue;

    for (const keyword of keywords) {
      const normalizedKeyword = normalizeSearchText(keyword);
      if (!normalizedKeyword || normalizedKeyword.length < 2) continue;
      if (!candidate.text.includes(normalizedKeyword)) continue;

      const exact = candidate.text === normalizedKeyword ? 2 : 1;
      const score = normalizedKeyword.length * 10 + exact * 5 - bounds.width * 0.01;

      if (!bestMatch || score > bestMatch.score) {
        bestMatch = { score, bounds };
      }
    }
  }

  return bestMatch ? bestMatch.bounds : null;
}

function getIssueSearchText(issue: ReviewIssue) {
  return `${issue.title || ""} ${issue.summary || ""} ${issue.recommendation || ""}`;
}

function getRelativeTargetBounds(target: SceneNode & LayoutMixin, x: number, y: number, width: number, height: number) {
  const bounds = getNodeBounds(target);
  if (!bounds) return null;
  return {
    x: bounds.x + x * bounds.width,
    y: bounds.y + y * bounds.height,
    width: Math.max(24, width * bounds.width),
    height: Math.max(24, height * bounds.height)
  };
}

function inferSemanticIssueBounds(target: SceneNode & LayoutMixin, issue: ReviewIssue) {
  const text = getIssueSearchText(issue);
  const normalized = normalizeSearchText(text);

  if (/(标题右侧|右侧状态|状态标签|status tag|status label)/i.test(normalized)) {
    return getRelativeTargetBounds(target, 0.58, 0.08, 0.36, 0.08);
  }

  if (/(第一模块|首个模块|第一块|上方模块|添加图片|点击上传|上传图片|上传入口|upload|image upload|加号|\+)/i.test(normalized)) {
    return getRelativeTargetBounds(target, 0.08, 0.16, 0.36, 0.18);
  }

  if (/(顶部|导航|navbar|nav\s*bar|返回|back)/i.test(normalized) && /(返回|back|icon|图标|箭头)/i.test(normalized)) {
    return getRelativeTargetBounds(target, 0.02, 0.02, 0.24, 0.1);
  }

  if (/(顶部|导航|navbar|nav\s*bar|状态栏)/i.test(normalized)) {
    return getRelativeTargetBounds(target, 0, 0, 1, 0.12);
  }

  if (/(备注|输入框|textarea|text area|note|remark|占位符|placeholder)/i.test(normalized)) {
    return getRelativeTargetBounds(target, 0.06, 0.27, 0.88, 0.18);
  }

  if (/(正确拍照|拍照示例|示例图|示例模块|photo example|example image|sample)/i.test(normalized)) {
    return getRelativeTargetBounds(target, 0.04, 0.43, 0.92, 0.24);
  }

  if (/(第二模块|第二块|中部模块)/i.test(normalized)) {
    return getRelativeTargetBounds(target, 0.05, 0.33, 0.9, 0.24);
  }

  if (/(第三模块|第三块|下方模块)/i.test(normalized)) {
    return getRelativeTargetBounds(target, 0.05, 0.52, 0.9, 0.26);
  }

  if (/(第一项|首项|列表第一项|顶部列表项)/i.test(normalized)) {
    return getRelativeTargetBounds(target, 0.04, 0.12, 0.92, 0.08);
  }

  if (/(门店设置|store settings|store setting)/i.test(normalized)) {
    return getRelativeTargetBounds(target, 0.04, 0.12, 0.92, 0.07);
  }

  if (/(账号与安全|账户与安全|account security|account and security)/i.test(normalized)) {
    return getRelativeTargetBounds(target, 0.04, 0.19, 0.92, 0.07);
  }

  if (/(员工账号|员工帐号|employee account)/i.test(normalized)) {
    return getRelativeTargetBounds(target, 0.04, 0.26, 0.92, 0.07);
  }

  if (/(支付密码|payment password)/i.test(normalized)) {
    return getRelativeTargetBounds(target, 0.04, 0.33, 0.92, 0.07);
  }

  if (/(个人信息收集|个人信息|personal information)/i.test(normalized)) {
    return getRelativeTargetBounds(target, 0.04, 0.44, 0.92, 0.07);
  }

  if (/(隐私政策|privacy policy)/i.test(normalized)) {
    return getRelativeTargetBounds(target, 0.04, 0.51, 0.92, 0.07);
  }

  if (/(服务协议|service agreement|terms)/i.test(normalized)) {
    return getRelativeTargetBounds(target, 0.04, 0.58, 0.92, 0.07);
  }

  if (/(清理缓存|清除缓存|缓存|cache|11\.41mb|230\.8mb)/i.test(normalized)) {
    return getRelativeTargetBounds(target, 0.04, 0.66, 0.92, 0.07);
  }

  if (/(消息通知|notification|notifications)/i.test(normalized)) {
    return getRelativeTargetBounds(target, 0.04, 0.73, 0.92, 0.07);
  }

  if (/(关于我们|about us)/i.test(normalized)) {
    return getRelativeTargetBounds(target, 0.04, 0.8, 0.92, 0.07);
  }

  if (/(列表项|列表|list item|list spacing|垂直间距|vertical padding|padding)/i.test(normalized)) {
    return getRelativeTargetBounds(target, 0.04, 0.12, 0.92, 0.75);
  }

  if (/(底部|安全区|home indicator|退出登录)/i.test(normalized)) {
    return getRelativeTargetBounds(target, 0.05, 0.84, 0.9, 0.12);
  }

  return null;
}

function getRegionBounds(target: SceneNode & LayoutMixin, issue: ReviewIssue) {
  const bounds = getNodeBounds(target);
  if (!bounds) return null;
  const region = issue.region;
  if (!region) return null;

  const looksLikeDefaultRegion =
    Math.abs(region.x - 0.5) < 0.001 &&
    Math.abs(region.y - 0.5) < 0.001 &&
    Math.abs(region.width - 0.1) < 0.001 &&
    Math.abs(region.height - 0.1) < 0.001;
  if (looksLikeDefaultRegion) return null;

  return {
    x: bounds.x + clamp(0, region.x, 1) * bounds.width,
    y: bounds.y + clamp(0, region.y, 1) * bounds.height,
    width: Math.max(24, clamp(0.02, region.width, 1) * bounds.width),
    height: Math.max(24, clamp(0.02, region.height, 1) * bounds.height)
  };
}

function getExportableSelection(language?: UILanguage) {
  const text = getPluginText(language);
  const node = figma.currentPage.selection.find(
    (item): item is SceneNode & ExportMixin =>
      typeof (item as SceneNode & Partial<ExportMixin>).exportAsync === "function"
  );
  if (!node) {
    throw new Error(text.selectFrameToCapture);
  }
  if (!("absoluteBoundingBox" in node) || !node.absoluteBoundingBox) {
    throw new Error(text.missingBounds);
  }
  return node;
}

async function getNodeByIdSafe(id: string) {
  return figma.getNodeByIdAsync(id);
}

async function captureCurrentFrame(target: "design" | "dev", language?: UILanguage) {
  const text = getPluginText(language);
  const node = getExportableSelection(language);
  figma.notify(text.captureStart(node.name), { timeout: 1200 });
  const bytes = await node.exportAsync({
    format: "PNG",
    constraint: { type: "SCALE", value: 2 }
  });

  capturedNodeIds[target] = node.id;
  figma.notify(text.captureDone(node.name), { timeout: 1800 });
  figma.ui.postMessage({
    type: "capture-success",
    target,
    payload: {
      nodeId: node.id,
      name: node.name,
      width: node.absoluteBoundingBox?.width || 0,
      height: node.absoluteBoundingBox?.height || 0,
      imageDataUrl: bytesToDataUrl(bytes)
    }
  });
}

async function clearHighlights() {
  for (const id of highlightNodeIds) {
    const node = await getNodeByIdSafe(id);
    if (node && "remove" in node) {
      node.remove();
    }
  }
  highlightNodeIds = [];
  figma.ui.postMessage({ type: "clear-highlight-success" });
}

async function analyzeUi(message: Extract<UIToPluginMessage, { type: "analyze-ui" }>) {
  figma.notify(getPluginText(message.language).analyzing, { timeout: 1200 });
  const report = await reviewUiWithAI({
    provider: message.provider,
    apiKey: message.apiKey,
    model: message.model,
    designImage: message.designImage,
    implementedImage: message.implementedImage,
    extraInstruction: message.extraInstruction,
    language: message.language
  });
  figma.ui.postMessage({ type: "analyze-success", report });
}

async function highlightIssues(issues: ReviewIssue[], language?: UILanguage) {
  const text = getPluginText(language);
  const nodeId = capturedNodeIds.dev || figma.currentPage.selection[0]?.id;
  if (!nodeId) {
    throw new Error(text.needDevFrame);
  }

  const target = await getNodeByIdSafe(nodeId) as (SceneNode & LayoutMixin) | null;
  if (!target || !("absoluteBoundingBox" in target) || !target.absoluteBoundingBox) {
    throw new Error(text.cannotFindFrame);
  }

  await clearHighlights();
  const labelFont = { family: "Inter", style: "Semi Bold" as const };
  await figma.loadFontAsync(labelFont);

  const targetBounds = target.absoluteBoundingBox;
  let highlightedCount = 0;

  for (const issue of issues) {
    const regionBounds = getRegionBounds(target, issue);
    const matchedBounds = findIssueBounds(target, issue);
    const semanticBounds = inferSemanticIssueBounds(target, issue);
    const bounds = regionBounds || matchedBounds || semanticBounds;
    if (!bounds) continue;

    const box = figma.createRectangle();
    box.name = `[UI Review] ${issue.title}`;
    box.x = bounds.x;
    box.y = bounds.y;
    box.resize(bounds.width, bounds.height);
    box.cornerRadius = 8;
    box.fills = [];
    box.strokes = [{ type: "SOLID", color: { r: 0.92, g: 0.27, b: 0.27 } }];
    box.strokeWeight = 2;
    box.strokeAlign = "OUTSIDE";

    const label = figma.createText();
    label.name = `[UI Review Label] ${issue.title}`;
    label.fontName = labelFont;
    label.characters = issue.title;
    label.fontSize = 12;
    label.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
    label.x = box.x;
    label.y = Math.max(targetBounds.y, box.y - 28);

    const bg = figma.createRectangle();
    bg.name = `[UI Review Badge] ${issue.title}`;
    bg.cornerRadius = 999;
    bg.resize(Math.max(label.width + 16, 84), 24);
    bg.x = label.x - 8;
    bg.y = label.y - 4;
    bg.fills = [{ type: "SOLID", color: { r: 0.92, g: 0.27, b: 0.27 } }];

    figma.currentPage.appendChild(box);
    figma.currentPage.appendChild(bg);
    figma.currentPage.appendChild(label);
    highlightNodeIds.push(box.id, bg.id, label.id);
    highlightedCount += 1;
  }

  if (!highlightedCount) {
    throw new Error(text.noHighlightFound);
  }

  figma.ui.postMessage({ type: "highlight-success", count: highlightedCount });
  const highlightNodes = await Promise.all(highlightNodeIds.map((id) => getNodeByIdSafe(id)));
  figma.viewport.scrollAndZoomIntoView(
    highlightNodes.filter((node): node is SceneNode => Boolean(node))
  );
}

figma.ui.onmessage = async (message: UIToPluginMessage) => {
  try {
    if (!message || typeof message !== "object" || !("type" in message)) {
      return;
    }

    if (message.type === "capture-current-frame") {
      await captureCurrentFrame(message.target, message.language);
      return;
    }
    if (message.type === "resize-ui") {
      figma.ui.resize(UI_WIDTH, clampUiHeight(message.height));
      return;
    }
    if (message.type === "highlight-issues") {
      await highlightIssues(message.issues, message.language);
      return;
    }
    if (message.type === "analyze-ui") {
      await saveApiKey(message.provider, message.model, message.apiKey);
      await analyzeUi(message);
      return;
    }
    if (message.type === "clear-highlights") {
      await clearHighlights();
      return;
    }
    if (message.type === "open-contact") {
      figma.openExternal(SUPPORT_CONTACT);
      return;
    }
    if (message.type === "load-settings") {
      const settings = await loadLastSettings();
      figma.ui.postMessage({
        type: "settings-loaded",
        provider: settings.provider,
        model: settings.model,
        apiKey: settings.apiKey
      });
      return;
    }
    if (message.type === "save-settings") {
      await saveLastSelection(message.provider, message.model);
      return;
    }
    if (message.type === "load-api-key") {
      const apiKey = await loadApiKey(message.provider, message.model);
      figma.ui.postMessage({ type: "api-key-loaded", provider: message.provider, model: message.model, apiKey });
      return;
    }
    if (message.type === "save-api-key") {
      await saveApiKey(message.provider, message.model, message.apiKey);
    }
  } catch (error) {
    const messageLanguage = getMessageLanguageSafe(message);
    const messageType = message && typeof message === "object" && "type" in message
      ? (message as { type?: string }).type
      : "";
    const text = error instanceof Error ? error.message : getPluginText(messageLanguage).unknownError;
    const type = messageType === "capture-current-frame" ? "capture-error" : messageType === "analyze-ui" ? "analyze-error" : "highlight-error";
    figma.notify(text, { error: true, timeout: 2400 });
    figma.ui.postMessage({ type, message: text });
  }
};
