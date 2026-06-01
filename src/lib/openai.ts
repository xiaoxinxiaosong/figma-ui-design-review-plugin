import type { AIProvider, ReviewReport, UILanguage } from "./types";

const SYSTEM_PROMPT = `
你是一个用于 UI 设计走查的 AI 审核助手，请使用 ui-design-review skill 的工作方式来完成分析。

你的任务：
1. 对比手机截图和设计稿。第一张图是手机截图/实现现状，第二张图是设计稿/目标效果。
2. 设计稿是最终要求达到的效果，也是唯一验收标准；手机截图只是实现现状的截图证据，真正需要被修改和还原的是实现页面/前端实现。
3. 找出手机截图相对设计稿的视觉差异、布局问题、间距问题、字号问题、对齐问题、颜色问题、缺失元素、错误状态和交互态异常。
4. 只返回真正重要的问题，不要泛泛而谈。
5. 输出结构化 JSON。
6. 如果存在任何可疑差异，必须写入 issues；只有在你确认两张图在视觉与信息层面基本一致时，issues 才可以为空。
7. 不要因为差异较小就忽略，请优先记录布局、字号、颜色、间距、对齐、缺失元素、文案不一致、按钮状态等问题。
8. 必须检查 icon 的尺寸、粗细、位置、边距、透明度是否与设计稿一致。
9. 必须检查页面或模块背景色、卡片底色、浅色底块、分组容器底色是否与设计稿一致。
10. 必须检查标题、正文、按钮、辅助文案、列表项文案的字号、文字大小、字重、行高、文字颜色是否与设计稿一致。
11. 用户填写的“补充要求”拥有最高优先级，必须严格执行，并优先输出与其直接相关的问题。
12. 所有 title、summary、recommendation 都必须以“实现页面/前端实现需要如何修改才能匹配设计稿”为方向，不要建议修改设计稿，也不要把设计稿描述成问题来源。recommendation 里不要写“修改手机截图”，而要写“修改实现页面”。

坐标要求：
- 所有 region 坐标都基于第一张图，也就是手机截图。
- x / y 表示问题框左上角在第一张图（手机截图）中的相对坐标，不是中心点坐标。
- x / y / width / height 必须是 0 到 1 之间的小数。
- region 需要尽量覆盖问题核心区域。
- region 必须和 title/summary 里的位置描述一致：如果问题写的是“第一模块/上方/顶部”，y 不应落在页面中下部；如果问题写的是“正确拍照示例/底部”，y 才应落在对应下方模块。
- 不要给所有问题复用同一个默认坐标，也不要使用页面中央的小框作为兜底；如果无法精确判断，至少覆盖对应模块的大致区域。
`;

const BASE_REVIEW_LINES = [
  "请对比两张图并输出 UI 差异报告。",
  "第一张图是手机截图，第二张图是设计稿。",
  "主次关系必须明确：设计稿是最终目标效果和验收标准，手机截图只是实现现状截图，待修正对象是实现页面/前端实现。",
  "所有问题都要描述“手机截图反映出的实现页面相对设计稿哪里不一致”，所有修改建议都要写成“将实现页面/前端实现调整为与设计稿一致”。",
  "不要建议修改设计稿；除非用户明确说明设计稿有错，否则默认设计稿正确。",
  "请重点检查：布局、字号、颜色、间距、对齐、缺失元素、错误状态、文案差异、交互态差异。",
  "必须逐项检查：顶部返回 icon、右侧箭头 icon、列表项 icon、状态 icon 的尺寸、粗细、占位宽高是否一致。",
  "必须逐项检查：页面背景、卡片背景、浅灰/浅紫底块、分组容器底色、输入框底色是否一致。",
  "即使差异较轻微，只要会影响视觉还原或交付质量，也请输出问题。",
  "只有在你确认两张图几乎没有有效差异时，issues 才允许为空。",
  "region.x 和 region.y 必须填写为问题区域左上角坐标，不能填写中心点。",
  "每个 issue 的 title 必须写清楚具体模块或元素，例如“顶部导航栏高度偏大”或“退出登录按钮颜色过浅”。",
  "不要输出“AI 识别到的差异”“可能存在问题”“请人工确认”这类泛化标题或总结。"
];

const SECOND_PASS_LINES = [
  "你刚刚没有给出有效问题，请重新严格走查一次。",
  "重新走查时必须以设计稿为准：手机截图代表实现结果，实现页面需要向设计稿靠齐。",
  "每条问题必须写清楚实现页面哪里偏离设计稿，以及应该如何改回设计稿效果。",
  "请假设你是资深 UI 设计走查人员，至少从布局、间距、对齐、字号、颜色、文案、缺失元素这几类逐项检查。",
  "这一次请单独增加三轮目检：先只看字号/文字大小/字重/行高，再只看 icon 尺寸/粗细/位置，最后只看背景色和容器底色差异。",
  "如果发现任何一处可能影响还原度的问题，都要写入 issues。",
  "每条问题都必须点名具体元素、差异现象和修正方向，不要写空泛结论。",
  "仍然只返回结构化 JSON。"
];

const ICON_COLOR_AUDIT_LINES = [
  "请忽略大部分常规布局问题，这一轮只专项检查 icon 和背景色。",
  "判断标准是设计稿，结论必须指向实现页面/前端实现需要如何修改。",
  "只检查这些内容：返回 icon、右箭头 icon、功能 icon、状态 icon 的尺寸、粗细、位置、留白是否一致。",
  "只检查这些内容：页面背景色、卡片底色、分组底块、浅色容器底色、输入框底色是否一致。",
  "如果发现 icon 尺寸偏大偏小、线条粗细不同、箭头位置不对、背景底色深浅不一致，必须输出 issues。",
  "如果没有发现 icon 或背景色问题，可以返回空 issues，但不要输出布局类泛问题。",
  "仍然只返回结构化 JSON。"
];

const TYPOGRAPHY_AUDIT_LINES = [
  "请忽略大部分常规布局问题，这一轮只专项检查文字样式。",
  "判断标准是设计稿，结论必须指向实现页面/前端实现需要如何修改。",
  "只检查这些内容：标题、正文、说明文字、按钮文字、列表项文字的字号、文字大小、字重、行高、颜色、字距是否与设计稿一致。",
  "如果发现字号或文字大小偏大偏小、字重不对、行高过松过紧、文字颜色深浅不一致，必须输出 issues。",
  "如果没有发现文字样式问题，可以返回空 issues，但不要输出 icon 或布局类泛问题。",
  "仍然只返回结构化 JSON。"
];

const REQUEST_TIMEOUT_MS = 180000;

const REVIEW_LANGUAGE_LABELS: Record<UILanguage, string> = {
  zh: "简体中文",
  en: "English",
  ko: "한국어"
};

function clamp(n: number) {
  return Math.max(0, Math.min(1, n));
}

function isGenericText(text: string | undefined) {
  const normalized = (text || "").trim();
  if (!normalized) return true;
  return /AI识别到|AI 识别到|可能的界面差异|请人工确认|进一步人工确认|差异\s*\d+|issue-\d+/i.test(normalized);
}

function looksLikeRawStructuredText(text: string | undefined) {
  const normalized = (text || "").trim();
  if (!normalized) return false;
  return /"title"\s*:|"summary"\s*:|"recommendation"\s*:|^\{|\}$/.test(normalized);
}

function looksSpecificEnough(issue: {
  title?: string;
  summary?: string;
  recommendation?: string;
}) {
  const title = (issue.title || "").trim();
  const summary = (issue.summary || "").trim();
  const recommendation = (issue.recommendation || "").trim();

  if (!title || !summary || !recommendation) return false;
  if (isGenericText(title) || isGenericText(summary)) return false;
  if (title.length < 6 || summary.length < 10) return false;
  return true;
}

function mentionsIconOrColor(issue: {
  title?: string;
  summary?: string;
  recommendation?: string;
}) {
  const text = `${issue.title || ""} ${issue.summary || ""} ${issue.recommendation || ""}`;
  return /(icon|图标|箭头|返回图标|背景色|底色|颜色|色值|浅灰|浅紫|灰底|卡片背景|容器背景)/i.test(text);
}

function mentionsTypography(issue: {
  title?: string;
  summary?: string;
  recommendation?: string;
}) {
  const text = `${issue.title || ""} ${issue.summary || ""} ${issue.recommendation || ""}`;
  return /(字号|文字大小|字重|字体|行高|文字颜色|文案样式|文本样式|标题文字|按钮文字|辅助文案)/i.test(text);
}

function normalizeImplementationTargetText(text: string | undefined) {
  return (text || "")
    .replace(/在手机截图中/g, "在实现页面中")
    .replace(/在手机截图里/g, "在实现页面中")
    .replace(/在手机截图/g, "在实现页面")
    .replace(/将手机截图中的/g, "将实现页面中的")
    .replace(/把手机截图中的/g, "把实现页面中的")
    .replace(/手机截图中的/g, "实现页面中的")
    .replace(/手机截图内/g, "实现页面内")
    .replace(/手机截图需要/g, "实现页面需要")
    .replace(/手机截图应/g, "实现页面应")
    .replace(/手机截图需/g, "实现页面需")
    .replace(/手机截图\/实现/g, "实现页面");
}

function sanitizeIssue(issue: ReviewReport["issues"][number], index: number) {
  const fallbackTitle = `界面差异 ${index + 1}`;
  const title = isGenericText(issue.title) ? fallbackTitle : issue.title;
  const summary = isGenericText(issue.summary)
    ? `${title}：手机截图与设计稿不一致，需要按设计稿目标效果修正。`
    : issue.summary;
  const recommendation = normalizeImplementationTargetText(isGenericText(issue.recommendation)
    ? "请将实现页面中的对应模块调整为与设计稿一致，包括布局、样式、文案和交互态。"
    : issue.recommendation);

  return {
    title,
    summary,
    recommendation
  };
}

function getPrioritySeverity(text: string, fallback: ReviewReport["issues"][number]["severity"]) {
  const marker = /P([0-3])/.exec(text);
  if (!marker) return fallback || "medium";
  if (marker[1] === "0" || marker[1] === "1") return "high";
  if (marker[1] === "2") return "medium";
  return "low";
}

function splitByPriorityMarkers(text: string) {
  const source = (text || "").trim();
  if (!source) return [];

  const markerPattern = /P[0-3](?:\s+|[:：])/g;
  const matches: { index: number }[] = [];
  let match = markerPattern.exec(source);
  while (match) {
    matches.push({ index: match.index || 0 });
    match = markerPattern.exec(source);
  }
  if (matches.length < 2) return [];

  return matches
    .map((item, index) => {
      const start = item.index || 0;
      const end = index + 1 < matches.length ? matches[index + 1].index || source.length : source.length;
      return source.slice(start, end).trim();
    })
    .filter((item) => item.length >= 12);
}

function getTitleFromIssueChunk(chunk: string, fallbackTitle: string) {
  const problemMatch = /问题[:：]\s*([^；;。.!！?\n]+)/.exec(chunk);
  if (problemMatch && problemMatch[1]) {
    return problemMatch[1].trim().slice(0, 36);
  }

  const positionMatch = /位置[:：]\s*([^；;。.!！?\n]+)/.exec(chunk);
  const typeMatch = /类型[:：]\s*([^；;。.!！?\n]+)/.exec(chunk);
  if (positionMatch && typeMatch) {
    return `${positionMatch[1].trim()}${typeMatch[1].trim()}`.slice(0, 36);
  }

  return chunk
    .replace(/^P[0-3]\s*[:：]?/, "")
    .replace(/^类型[:：]\s*/, "")
    .split(/[；;。.!！?\n]/)[0]
    .trim()
    .slice(0, 36) || fallbackTitle;
}

function getRecommendationFromIssueChunk(chunk: string, fallbackRecommendation: string) {
  const match = /(?:修改建议|建议|Recommendation)[:：]\s*([\s\S]+)$/i.exec(chunk);
  return normalizeImplementationTargetText(match && match[1] ? match[1].trim() : fallbackRecommendation);
}

function splitMergedIssue(issue: ReviewReport["issues"][number], index: number) {
  const chunks = splitByPriorityMarkers(issue.summary || "");
  if (!chunks.length) return [issue];

  return chunks.map((chunk, chunkIndex) => ({
    id: `${issue.id || `issue-${index + 1}`}-${chunkIndex + 1}`,
    title: getTitleFromIssueChunk(chunk, issue.title || `界面差异 ${index + 1}-${chunkIndex + 1}`),
    summary: chunk,
    recommendation: getRecommendationFromIssueChunk(chunk, issue.recommendation),
    severity: getPrioritySeverity(chunk, issue.severity),
    confidence: issue.confidence,
    status: issue.status,
    region: {
      x: 0.5,
      y: 0.5,
      width: 0.1,
      height: 0.1
    }
  }));
}

function normalizeReport(report: ReviewReport): ReviewReport {
  const rawIssues = (report.issues || [])
    .reduce<ReviewReport["issues"]>((items, issue, index) => items.concat(splitMergedIssue(issue, index)), [])
    .map((issue, index) => {
      const safeText = sanitizeIssue(issue, index);
      return {
        id: issue.id,
        title: safeText.title,
        summary: safeText.summary,
        recommendation: safeText.recommendation,
        severity: issue.severity,
        confidence: issue.confidence,
        status: issue.status,
        region: issue.region
      };
    })
    .filter((issue) => looksSpecificEnough(issue));

  const safeSummary =
    !report.summary || isGenericText(report.summary)
      ? rawIssues.length
        ? `AI 已返回 ${rawIssues.length} 条差异结果，请逐条确认。`
        : "AI 已返回差异结果，请逐条确认。"
      : report.summary;

  return {
    summary: safeSummary,
    overallRisk: report.overallRisk || "medium",
    issues: rawIssues.map((issue, index) => ({
      title: issue.title || `AI 识别到的差异 ${index + 1}`,
      summary: issue.summary || issue.title || "AI 识别到一处可能的界面差异。",
      recommendation: issue.recommendation || "请将实现页面中的对应模块调整为与设计稿一致。",
      severity: issue.severity || "medium",
      id: issue.id || `issue-${index + 1}`,
      status: "open",
      confidence: Number(issue.confidence == null ? 0.78 : issue.confidence),
      region: {
        x: clamp(issue.region && issue.region.x != null ? issue.region.x : 0.5),
        y: clamp(issue.region && issue.region.y != null ? issue.region.y : 0.5),
        width: clamp(issue.region && issue.region.width != null ? issue.region.width : 0.1),
        height: clamp(issue.region && issue.region.height != null ? issue.region.height : 0.1)
      }
    }))
  };
}

function buildReviewPrompt(extraInstruction?: string, mode?: "base" | "strict" | "icon-color" | "typography", language?: UILanguage) {
  const lines =
    mode === "strict"
      ? SECOND_PASS_LINES.slice()
      : mode === "typography"
        ? TYPOGRAPHY_AUDIT_LINES.slice()
      : mode === "icon-color"
        ? ICON_COLOR_AUDIT_LINES.slice()
        : BASE_REVIEW_LINES.slice();
  lines.unshift("验收方向：第二张设计稿是最终目标，第一张手机截图代表实现现状；报告只能要求实现页面/前端实现向设计稿靠齐，不能写成修改手机截图。");
  lines.unshift("禁止反向判断：不要说设计稿缺少、设计稿偏差、设计稿需要修改；除非用户明确要求审设计稿，否则所有问题都归因到实现页面/前端实现未还原。");
  lines.unshift(`所有 summary、title、recommendation 以及所有可展示给用户的报告正文都必须使用 ${REVIEW_LANGUAGE_LABELS[language || "zh"]} 输出。即使补充要求或截图内出现其他语言，也不要切换输出语言。`);
  lines.unshift("summary 必须写成可直接展示给设计和产品团队的完整差异报告，不要只写一句总结。");
  lines.unshift("summary 必须严格遵循以下结构输出：先按 P0 / P1 / P2 / P3 分组列问题；每条都要包含“类型、位置、问题、原因、风险、修改建议”；最后补一段“整体风险总结 / 问题主线 / 最优先修复项”。");
  lines.unshift("issues 数组用于插件高亮，每个 issue 只保留一个最值得高亮的具体问题；title 要短，summary 要写清问题本身，recommendation 要写成可执行修改建议。");
  lines.unshift("严禁把多个问题合并到同一个 issue：如果发现 P0/P1/P2/P3 多个问题，必须拆成多个 issues 数组项；每个 issue.summary 内只能包含一个问题，不能出现第二个 P0/P1/P2/P3。");
  lines.unshift("每个 issue.region 必须框住该 issue 对应的真实视觉区域，并在最终输出前自检坐标是否符合位置描述。例如“第一模块/添加图片/上方”应位于第一张图上半部，“正确拍照示例”应位于示例图模块，“备注输入框”应位于备注区域。");
  if (extraInstruction) {
    lines.unshift(`最高优先级补充要求：${extraInstruction}`);
    lines.push(`再次强调：必须优先检查并输出与这条补充要求直接相关的问题：${extraInstruction}`);
  }
  return lines
    .filter(Boolean)
    .join("\n");
}

function getRequestedAuditMode(extraInstruction?: string): "icon-color" | "typography" | null {
  const text = (extraInstruction || "").trim();
  if (!text) return null;

  const hasTypography = /(字号|文字大小|字重|字体|行高|文字颜色|文本样式|标题文字|按钮文字|辅助文案)/i.test(text);
  const hasIconOrColor = /(icon|图标|箭头|返回图标|背景色|底色|颜色|色值|卡片背景|容器背景)/i.test(text);
  const hasBroadLayoutTerms = /(布局|间距|对齐|缺失元素|交互态|文案差异|错误状态|整体|全部|全面|逐项)/i.test(text);

  // Only trigger a follow-up specialty audit when the user's instruction is clearly focused.
  if (hasBroadLayoutTerms || (hasTypography && hasIconOrColor)) {
    return null;
  }
  if (hasTypography) return "typography";
  if (hasIconOrColor) return "icon-color";
  return null;
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs = REQUEST_TIMEOUT_MS) {
  const timeoutMessage = `AI 请求超时，${Math.round(timeoutMs / 1000)} 秒内未返回结果，请重试或切换更快的模型`;
  const canAbort = typeof AbortController !== "undefined";
  const controller = canAbort ? new AbortController() : null;
  const timer = setTimeout(() => {
    if (controller) {
      controller.abort();
    }
  }, timeoutMs);
  let requestInit = init;
  if (controller) {
    requestInit = Object.assign({}, init || {});
    requestInit.signal = controller.signal;
  }
  const requestPromise = fetch(url, requestInit);
  const timeoutPromise = new Promise<Response>((_, reject) => {
    setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
  });

  try {
    return await (canAbort ? requestPromise : Promise.race([requestPromise, timeoutPromise]));
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(timeoutMessage);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

async function getErrorText(response: Response, fallback: string) {
  const text = (await response.text()).trim();
  if (!text) return fallback;

  try {
    const parsed = JSON.parse(text);
    const nestedMessage =
      parsed?.error?.message ||
      parsed?.message ||
      parsed?.output?.message ||
      parsed?.code;
    return nestedMessage ? String(nestedMessage) : text;
  } catch {
    return text;
  }
}

function buildFallbackIssue(text: string, index: number) {
  return {
    id: `issue-${index + 1}`,
    title: `AI 识别到的差异 ${index + 1}`,
    summary: text,
    recommendation: "请将实现页面中的对应模块调整为与设计稿一致。",
    severity: "medium" as const,
    confidence: 0.6,
    region: {
      x: 0.5,
      y: 0.5,
      width: 0.3,
      height: 0.2
    }
  };
}

function extractIssuesFromPlainText(text: string): ReviewReport | null {
  const normalized = text
    .replace(/\r/g, "")
    .trim();

  if (!normalized) return null;

  const lines = normalized
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/^(```|json|总结[:：]?|summary[:：]?)/i.test(line));

  const candidateLines = lines
    .map((line) => line.replace(/^[-*•\d.、)\s]+/, "").trim())
    .filter((line) => line.length >= 8)
    .filter((line) => /(顶部|底部|按钮|标题|导航|卡片|列表|输入框|图标|字号|字重|间距|对齐|颜色|边框|阴影|留白|行高|文案|头像|标签|模块|区域|button|title|header|nav|navigation|card|list|input|icon|font|weight|spacing|alignment|color|border|shadow|padding|line height|copy|label|module|section|영역|버튼|제목|헤더|내비게이션|카드|목록|입력|아이콘|글자|폰트|간격|정렬|색상|테두리|그림자|여백|문구|라벨|섹션)/i.test(line))
    .filter((line) => !/^(无|没有|未发现|暂无).{0,8}(问题|差异)/.test(line));

  if (!candidateLines.length) return null;

  const issues = candidateLines.slice(0, 6).map((line, index) => buildFallbackIssue(line, index));

  return normalizeReport({
    summary: normalized,
    overallRisk: issues.length >= 3 ? "medium" : "low",
    issues
  });
}

function extractIssuesFromLooseJsonText(text: string): ReviewReport | null {
  const titles = text.match(/"title"\s*:\s*"([^"]+)"/g) || [];
  const summaries = text.match(/"summary"\s*:\s*"([^"]+)"/g) || [];
  const recommendations = text.match(/"recommendation"\s*:\s*"([^"]+)"/g) || [];
  const severities = text.match(/"severity"\s*:\s*"(high|medium|low)"/g) || [];

  if (!titles.length) return null;

  const issues = [];

  for (let index = 0; index < titles.length; index += 1) {
    const titleMatch = /"title"\s*:\s*"([^"]+)"/.exec(titles[index]);
    if (!titleMatch || !titleMatch[1]) continue;

    const summaryMatch = summaries[index] ? /"summary"\s*:\s*"([^"]+)"/.exec(summaries[index]) : null;
    const recommendationMatch = recommendations[index] ? /"recommendation"\s*:\s*"([^"]+)"/.exec(recommendations[index]) : null;
    const severityMatch = severities[index] ? /"severity"\s*:\s*"(high|medium|low)"/.exec(severities[index]) : null;

    issues.push({
      id: `issue-${index + 1}`,
      title: titleMatch[1],
      summary: summaryMatch && summaryMatch[1] ? summaryMatch[1] : titleMatch[1],
      recommendation: recommendationMatch && recommendationMatch[1] ? recommendationMatch[1] : "请将实现页面中的对应模块调整为与设计稿一致。",
      severity: severityMatch && severityMatch[1] ? severityMatch[1] as "high" | "medium" | "low" : "medium",
      confidence: 0.78,
      region: {
        x: 0.5,
        y: 0.5,
        width: 0.1,
        height: 0.1
      }
    });
  }

  if (!issues.length) return null;

  return normalizeReport({
    summary: issues[0].title,
    overallRisk: issues.some((issue) => issue.severity === "high") ? "high" : issues.some((issue) => issue.severity === "medium") ? "medium" : "low",
    issues
  });
}

function isBrokenStructuredReport(report: ReviewReport) {
  const summary = (report.summary || "").trim();
  return (!report.issues || !report.issues.length) && looksLikeRawStructuredText(summary);
}

function extractJson(text: string): ReviewReport {
  const fenced = text.match(/```json\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1] : text;
  try {
    const parsed = normalizeReport(JSON.parse(raw));
    if (!isBrokenStructuredReport(parsed)) {
      return parsed;
    }

    const loose = extractIssuesFromLooseJsonText(raw);
    if (loose) return loose;
    const fallback = extractIssuesFromPlainText(raw);
    if (fallback) return fallback;
    return parsed;
  } catch (error) {
    const firstObject = raw.match(/\{[\s\S]*\}/);
    if (firstObject) {
      try {
        const parsed = normalizeReport(JSON.parse(firstObject[0]));
        if (!isBrokenStructuredReport(parsed)) {
          return parsed;
        }
        const loose = extractIssuesFromLooseJsonText(firstObject[0]);
        if (loose) return loose;
      } catch (nestedError) {
        const loose = extractIssuesFromLooseJsonText(raw);
        if (loose) return loose;
        const fallback = extractIssuesFromPlainText(raw);
        if (fallback) return fallback;
      }
    }
    const loose = extractIssuesFromLooseJsonText(raw);
    if (loose) return loose;
    const fallback = extractIssuesFromPlainText(raw);
    if (fallback) return fallback;
    throw new Error("AI 返回内容无法解析为结构化报告");
  }
}

function needsSecondPass(report: ReviewReport) {
  if (!report.issues || !report.issues.length) return true;
  if (report.issues.every((issue) => !looksSpecificEnough(issue))) return true;
  if (!report.issues.some((issue) => mentionsIconOrColor(issue))) return true;
  if (!report.issues.some((issue) => mentionsTypography(issue))) return true;
  return false;
}

function mergeReports(base: ReviewReport, extra: ReviewReport): ReviewReport {
  const mergedIssues = [];
  const seen: Record<string, boolean> = {};
  const allIssues = (base.issues || []).concat(extra.issues || []);

  for (let index = 0; index < allIssues.length; index += 1) {
    const issue = allIssues[index];
    const key = `${(issue.title || "").trim()}::${(issue.summary || "").trim()}`;
    if (!key || seen[key]) continue;
    seen[key] = true;
    mergedIssues.push(issue);
  }

  const mergedSummary = [base.summary, extra.summary]
    .map((item) => (item || "").trim())
    .filter(Boolean)
    .join("\n\n");

  return normalizeReport({
    summary: mergedSummary || "AI 已返回差异结果，请逐条确认。",
    overallRisk:
      base.overallRisk === "high" || extra.overallRisk === "high"
        ? "high"
        : base.overallRisk === "medium" || extra.overallRisk === "medium"
          ? "medium"
          : "low",
    issues: mergedIssues
  });
}

async function runReviewFlow(
  run: (mode?: "base" | "strict" | "icon-color" | "typography") => Promise<ReviewReport>,
  extraInstruction?: string
) {
  const firstReport = await run("base");
  const requestedAuditMode = getRequestedAuditMode(extraInstruction);

  if (requestedAuditMode) {
    const auditReport = await run(requestedAuditMode);
    return mergeReports(firstReport, auditReport);
  }

  if (needsSecondPass(firstReport)) {
    return run("strict");
  }

  return firstReport;
}

function getSchema() {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      summary: { type: "string" },
      overallRisk: { type: "string", enum: ["high", "medium", "low"] },
      issues: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            id: { type: "string" },
            title: { type: "string" },
            summary: { type: "string" },
            recommendation: { type: "string" },
            severity: { type: "string", enum: ["high", "medium", "low"] },
            confidence: { type: "number" },
            region: {
              type: "object",
              additionalProperties: false,
              properties: {
                x: { type: "number" },
                y: { type: "number" },
                width: { type: "number" },
                height: { type: "number" }
              },
              required: ["x", "y", "width", "height"]
            }
          },
          required: ["id", "title", "summary", "recommendation", "severity", "confidence", "region"]
        }
      }
    },
    required: ["summary", "overallRisk", "issues"]
  };
}

function getImageBase64(imageDataUrl: string) {
  return imageDataUrl.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, "");
}

async function reviewWithOpenAI(params: {
  apiKey: string;
  model: string;
  designImage: string;
  implementedImage: string;
  extraInstruction?: string;
  language?: UILanguage;
}): Promise<ReviewReport> {
  const { apiKey, model, designImage, implementedImage, extraInstruction, language } = params;

  async function run(mode?: "base" | "strict" | "icon-color" | "typography") {
    const response = await fetchWithTimeout("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        metadata: {
          workflow: "ui-design-review",
          source: "figma-plugin"
        },
        input: [
          {
            role: "system",
            content: [{ type: "input_text", text: SYSTEM_PROMPT }]
          },
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: buildReviewPrompt(extraInstruction, mode, language)
              },
              { type: "input_image", image_url: implementedImage },
              { type: "input_image", image_url: designImage }
            ]
          }
        ],
        text: {
          format: {
            type: "json_schema",
            name: "ui_design_review_report",
            schema: getSchema(),
            strict: true
          }
        }
      })
    });

    if (!response.ok) {
      throw new Error(await getErrorText(response, "OpenAI API 调用失败"));
    }

    const data = await response.json();
    const outputText =
      data.output_text ||
      (((data.output || []) as any[])
        .reduce((items: any[], item: any) => items.concat(item.content || []), [])
        .map((item: any) => item.text || "")
        .join("\n")) ||
      "";

    return extractJson(outputText);
  }

  return runReviewFlow(run, extraInstruction);
}

async function reviewWithGemini(params: {
  apiKey: string;
  model: string;
  designImage: string;
  implementedImage: string;
  extraInstruction?: string;
  language?: UILanguage;
}): Promise<ReviewReport> {
  const { apiKey, model, designImage, implementedImage, extraInstruction, language } = params;

  async function run(mode?: "base" | "strict" | "icon-color" | "typography") {
    const response = await fetchWithTimeout(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT }]
        },
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${buildReviewPrompt(extraInstruction, mode, language)}\n只返回 JSON，不要额外解释。`
              },
              {
                inline_data: {
                  mime_type: "image/png",
                  data: getImageBase64(implementedImage)
                }
              },
              {
                inline_data: {
                  mime_type: "image/png",
                  data: getImageBase64(designImage)
                }
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: getSchema()
        }
      })
    });

    if (!response.ok) {
      throw new Error(await getErrorText(response, "Gemini API 调用失败"));
    }

    const data = await response.json();
    const candidate = data.candidates && data.candidates[0];
    const outputText =
      candidate &&
      candidate.content &&
      candidate.content.parts
        ? candidate.content.parts.map((part: { text?: string }) => part.text || "").join("\n")
        : "";

    return extractJson(outputText);
  }

  return runReviewFlow(run, extraInstruction);
}

async function reviewWithOpenRouter(params: {
  apiKey: string;
  model: string;
  designImage: string;
  implementedImage: string;
  extraInstruction?: string;
  language?: UILanguage;
}): Promise<ReviewReport> {
  const { apiKey, model, designImage, implementedImage, extraInstruction, language } = params;

  async function run(mode?: "base" | "strict" | "icon-color" | "typography") {
    const response = await fetchWithTimeout("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        response_format: {
          type: "json_object"
        },
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `${buildReviewPrompt(extraInstruction, mode, language)}\n只返回 JSON，不要额外解释。`
              },
              {
                type: "image_url",
                image_url: {
                  url: implementedImage
                }
              },
              {
                type: "image_url",
                image_url: {
                  url: designImage
                }
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(await getErrorText(response, "OpenRouter API 调用失败"));
    }

    const data = await response.json();
    const outputText =
      data.choices && data.choices[0] && data.choices[0].message
        ? data.choices[0].message.content || ""
        : "";
    return extractJson(outputText);
  }

  return runReviewFlow(run, extraInstruction);
}

async function reviewWithQwen(params: {
  apiKey: string;
  model: string;
  designImage: string;
  implementedImage: string;
  extraInstruction?: string;
  language?: UILanguage;
}): Promise<ReviewReport> {
  const { apiKey, model, designImage, implementedImage, extraInstruction, language } = params;

  async function run(mode?: "base" | "strict" | "icon-color" | "typography") {
    const response = await fetchWithTimeout("https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        input: {
          messages: [
            {
              role: "system",
              content: [{ text: SYSTEM_PROMPT }]
            },
            {
              role: "user",
              content: [
                {
                  image: implementedImage
                },
                {
                  image: designImage
                },
                {
                  text: `${buildReviewPrompt(extraInstruction, mode, language)}\n只返回 JSON，不要额外解释。`
                }
              ]
            }
          ]
        },
        parameters: {
          result_format: "message"
        }
      })
    });

    if (!response.ok) {
      throw new Error(
        await getErrorText(response, "Qwen API 调用失败，请检查 DashScope API Key、模型权限和网络连接")
      );
    }

    const data = await response.json();
    const outputContent =
      data.output && data.output.choices && data.output.choices[0] && data.output.choices[0].message
        ? data.output.choices[0].message.content || []
        : [];
    const outputText = Array.isArray(outputContent)
      ? outputContent
          .map((item: { text?: string } | null | undefined) => (item && item.text) || "")
          .join("\n")
      : "";

    if (!outputText) {
      throw new Error("Qwen 没有返回可解析的内容，请检查模型是否支持当前图片输入。");
    }

    return extractJson(outputText);
  }

  return runReviewFlow(run, extraInstruction);
}

export async function reviewUiWithAI(params: {
  provider: AIProvider;
  apiKey: string;
  model: string;
  designImage: string;
  implementedImage: string;
  extraInstruction?: string;
  language?: UILanguage;
}): Promise<ReviewReport> {
  if (params.provider === "gemini") {
    return reviewWithGemini(params);
  }
  if (params.provider === "qwen") {
    return reviewWithQwen(params);
  }
  if (params.provider !== "openai") {
    return reviewWithOpenRouter(params);
  }
  return reviewWithOpenAI(params);
}
