import { useEffect, useMemo, useState } from "react";
import type { AIProvider, PluginToUIMessage, ReviewIssue, ReviewReport, Severity, UILanguage } from "./lib/types";

const PROVIDER_OPTIONS: { label: string; value: AIProvider | "" }[] = [
  { label: "OpenAI", value: "openai" },
  { label: "Google Gemini", value: "gemini" },
  { label: "Anthropic", value: "anthropic" },
  { label: "xAI", value: "xai" },
  { label: "DeepSeek", value: "deepseek" },
  { label: "Meta", value: "meta" },
  { label: "Qwen", value: "qwen" },
  { label: "Moonshot", value: "moonshot" },
  { label: "Mistral", value: "mistral" },
  { label: "Cohere", value: "cohere" }
];

const MODEL_OPTIONS: Record<AIProvider, { label: string; value: string }[]> = {
  openai: [
    { label: "GPT-4.1", value: "gpt-4.1" },
    { label: "GPT-4.1 Mini", value: "gpt-4.1-mini" },
    { label: "GPT-4o", value: "gpt-4o" },
    { label: "GPT-4o Mini", value: "gpt-4o-mini" },
    { label: "o4-mini", value: "o4-mini" },
    { label: "o3", value: "o3" }
  ],
  gemini: [
    { label: "Gemini 2.5 Pro", value: "gemini-2.5-pro" },
    { label: "Gemini 2.5 Flash", value: "gemini-2.5-flash" },
    { label: "Gemini 2.0 Flash", value: "gemini-2.0-flash" },
    { label: "Gemini 1.5 Pro", value: "gemini-1.5-pro" }
  ],
  anthropic: [
    { label: "Claude Sonnet 4", value: "anthropic/claude-sonnet-4" },
    { label: "Claude Opus 4", value: "anthropic/claude-opus-4" }
  ],
  xai: [
    { label: "Grok 3 Mini", value: "x-ai/grok-3-mini" },
    { label: "Grok 3", value: "x-ai/grok-3" }
  ],
  deepseek: [
    { label: "DeepSeek Chat V3", value: "deepseek/deepseek-chat-v3-0324" },
    { label: "DeepSeek R1", value: "deepseek/deepseek-r1" }
  ],
  meta: [
    { label: "Llama 4 Maverick", value: "meta-llama/llama-4-maverick" },
    { label: "Llama 3.3 70B", value: "meta-llama/llama-3.3-70b-instruct" }
  ],
  qwen: [
    { label: "Qwen3-VL-Plus", value: "qwen3-vl-plus" },
    { label: "Qwen 3 235B", value: "qwen/qwen3-235b-a22b" },
    { label: "Qwen 2.5 72B", value: "qwen/qwen-2.5-72b-instruct" }
  ],
  moonshot: [
    { label: "Kimi K2", value: "moonshotai/kimi-k2" },
    { label: "Kimi Dev 72B", value: "moonshotai/kimi-dev-72b" }
  ],
  mistral: [
    { label: "Mistral Large", value: "mistralai/mistral-large" },
    { label: "Pixtral Large", value: "mistralai/pixtral-large" }
  ],
  cohere: [
    { label: "Command R+", value: "cohere/command-r-plus" },
    { label: "Command R7B", value: "cohere/command-r7b" }
  ]
};

const OPENROUTER_BACKED_PROVIDERS: AIProvider[] = ["anthropic", "xai", "deepseek", "meta", "moonshot", "mistral", "cohere"];
const LANGUAGE_OPTIONS: { value: UILanguage; label: string }[] = [
  { value: "zh", label: "中文" },
  { value: "en", label: "English" },
  { value: "ko", label: "한국어" }
];

const DEFAULT_EXTRA_INSTRUCTION: Record<UILanguage, string> = {
  zh: "重点检查布局、字号、颜色、间距、对齐、缺失元素和交互态差异。",
  en: "Focus on layout, typography, color, spacing, alignment, missing elements, and interaction-state differences.",
  ko: "레이아웃, 글자 크기, 색상, 간격, 정렬, 누락된 요소, 인터랙션 상태 차이를 중점적으로 확인해 주세요."
};

type LocalizedCopy = {
  language: string;
  title: string;
  heroText: string;
  statusReady: string;
  sectionImages: string;
  clearImages: string;
  designImage: string;
  devImage: string;
  useCurrentFrame: string;
  sectionAi: string;
  provider: string;
  providerPlaceholder: string;
  model: string;
  modelPlaceholder: string;
  modelPlaceholderBeforeProvider: string;
  apiKey: string;
  apiKeyPlaceholder: string;
  apiKeyPlaceholderOpenRouter: string;
  apiKeyPlaceholderQwen: string;
  apiKeyPlaceholderBeforeModel: string;
  extraInstruction: string;
  analyze: string;
  analyzing: string;
  sectionReport: string;
  clearHighlights: string;
  highlightAll: string;
  highlightSingle: string;
  overallRisk: string;
  confidence: string;
  emptyReport: string;
  severityHigh: string;
  severityMedium: string;
  severityLow: string;
  statusNeedInputs: string;
  statusCaptureDesign: string;
  statusCaptureDev: string;
  statusCapturedDesign: (name: string) => string;
  statusCapturedDev: (name: string) => string;
  statusClearedImages: string;
  statusAnalyzing: string;
  statusAnalyzeDone: (count: number) => string;
  statusNoHighlightIssues: string;
  statusHighlighted: (count: number) => string;
  statusHighlightsCleared: string;
};

const COPY = {
  zh: {
    language: "语言",
    title: "UI 差异走查助手",
    heroText: "对比设计稿和手机截图，自动输出结构化 UI 差异报告，并直接在 Figma 里高亮问题区域。",
    statusReady: "准备开始",
    sectionImages: "1. 准备图片",
    clearImages: "清空图片",
    designImage: "设计稿",
    devImage: "手机截图",
    useCurrentFrame: "使用当前 Frame",
    sectionAi: "2. AI 设置",
    provider: "服务商",
    providerPlaceholder: "请选择服务商",
    model: "模型",
    modelPlaceholder: "请选择模型",
    modelPlaceholderBeforeProvider: "请先选择服务商",
    apiKey: "API Key",
    apiKeyPlaceholder: "请输入 API Key",
    apiKeyPlaceholderOpenRouter: "请输入 OpenRouter API Key",
    apiKeyPlaceholderQwen: "请输入 DashScope API Key",
    apiKeyPlaceholderBeforeModel: "请先选择模型",
    extraInstruction: "补充要求",
    analyze: "开始 AI 走查",
    analyzing: "AI 走查中…",
    sectionReport: "3. 差异报告",
    clearHighlights: "清除高亮",
    highlightAll: "一键高亮",
    highlightSingle: "高亮此问题",
    overallRisk: "整体风险",
    confidence: "置信度",
    emptyReport: "还没有差异报告。准备好图片后，点“开始 AI 走查”。",
    severityHigh: "高",
    severityMedium: "中",
    severityLow: "低",
    statusNeedInputs: "请先选择服务商、模型，填写 API Key，并准备好设计稿和手机截图",
    statusCaptureDesign: "正在获取当前 Frame 作为设计稿…",
    statusCaptureDev: "正在获取当前 Frame 作为手机截图…",
    statusCapturedDesign: (name: string) => `已使用当前 Frame 作为设计稿：${name}`,
    statusCapturedDev: (name: string) => `已使用当前 Frame 作为手机截图：${name}`,
    statusClearedImages: "已清空设计稿和手机截图",
    statusAnalyzing: "AI 正在进行 UI 走查…",
    statusAnalyzeDone: (count: number) => `AI 已返回 ${count} 条问题`,
    statusNoHighlightIssues: "当前没有可高亮的问题",
    statusHighlighted: (count: number) => `已在 Figma 中高亮 ${count} 个问题`,
    statusHighlightsCleared: "已清除 Figma 中的高亮"
  },
  en: {
    language: "Language",
    title: "UI Review Assistant",
    heroText: "Compare the design frame with the implementation screenshot, generate a structured UI review, and highlight issues directly in Figma.",
    statusReady: "Ready to start",
    sectionImages: "1. Prepare Images",
    clearImages: "Clear Images",
    designImage: "Design",
    devImage: "Implementation",
    useCurrentFrame: "Use Current Frame",
    sectionAi: "2. AI Settings",
    provider: "Provider",
    providerPlaceholder: "Select a provider",
    model: "Model",
    modelPlaceholder: "Select a model",
    modelPlaceholderBeforeProvider: "Select a provider first",
    apiKey: "API Key",
    apiKeyPlaceholder: "Enter your API key",
    apiKeyPlaceholderOpenRouter: "Enter your OpenRouter API key",
    apiKeyPlaceholderQwen: "Enter your DashScope API key",
    apiKeyPlaceholderBeforeModel: "Select a model first",
    extraInstruction: "Extra Instructions",
    analyze: "Start AI Review",
    analyzing: "Reviewing…",
    sectionReport: "3. Review Report",
    clearHighlights: "Clear Highlights",
    highlightAll: "Highlight All",
    highlightSingle: "Highlight Issue",
    overallRisk: "Overall Risk",
    confidence: "Confidence",
    emptyReport: "No review report yet. Prepare both images, then click “Start AI Review”.",
    severityHigh: "High",
    severityMedium: "Medium",
    severityLow: "Low",
    statusNeedInputs: "Select a provider and model, enter an API key, and prepare both the design and implementation images first.",
    statusCaptureDesign: "Capturing the current Frame as the design image…",
    statusCaptureDev: "Capturing the current Frame as the implementation image…",
    statusCapturedDesign: (name: string) => `Using the current Frame as the design image: ${name}`,
    statusCapturedDev: (name: string) => `Using the current Frame as the implementation image: ${name}`,
    statusClearedImages: "Cleared the design and implementation images",
    statusAnalyzing: "AI is reviewing the UI…",
    statusAnalyzeDone: (count: number) => `AI returned ${count} issues`,
    statusNoHighlightIssues: "There are no issues to highlight right now",
    statusHighlighted: (count: number) => `Highlighted ${count} issues in Figma`,
    statusHighlightsCleared: "Cleared the highlights in Figma"
  },
  ko: {
    language: "언어",
    title: "UI 리뷰 도우미",
    heroText: "디자인 프레임과 구현 스크린샷을 비교해 구조화된 UI 리뷰를 만들고, 문제 영역을 Figma에서 바로 강조 표시합니다.",
    statusReady: "시작할 준비 완료",
    sectionImages: "1. 이미지 준비",
    clearImages: "이미지 비우기",
    designImage: "디자인",
    devImage: "구현 화면",
    useCurrentFrame: "현재 Frame 사용",
    sectionAi: "2. AI 설정",
    provider: "서비스 제공자",
    providerPlaceholder: "서비스 제공자를 선택하세요",
    model: "모델",
    modelPlaceholder: "모델을 선택하세요",
    modelPlaceholderBeforeProvider: "먼저 서비스 제공자를 선택하세요",
    apiKey: "API Key",
    apiKeyPlaceholder: "API Key를 입력하세요",
    apiKeyPlaceholderOpenRouter: "OpenRouter API Key를 입력하세요",
    apiKeyPlaceholderQwen: "DashScope API Key를 입력하세요",
    apiKeyPlaceholderBeforeModel: "먼저 모델을 선택하세요",
    extraInstruction: "추가 요청",
    analyze: "AI 리뷰 시작",
    analyzing: "리뷰 진행 중…",
    sectionReport: "3. 리뷰 보고서",
    clearHighlights: "강조 해제",
    highlightAll: "모두 강조",
    highlightSingle: "이 문제 강조",
    overallRisk: "전체 위험도",
    confidence: "신뢰도",
    emptyReport: "아직 리뷰 보고서가 없습니다. 이미지를 준비한 뒤 “AI 리뷰 시작”을 눌러 주세요.",
    severityHigh: "높음",
    severityMedium: "보통",
    severityLow: "낮음",
    statusNeedInputs: "서비스 제공자와 모델을 선택하고 API Key를 입력한 뒤 디자인 이미지와 구현 이미지를 모두 준비해 주세요.",
    statusCaptureDesign: "현재 Frame을 디자인 이미지로 가져오는 중…",
    statusCaptureDev: "현재 Frame을 구현 이미지로 가져오는 중…",
    statusCapturedDesign: (name: string) => `현재 Frame을 디자인 이미지로 사용 중: ${name}`,
    statusCapturedDev: (name: string) => `현재 Frame을 구현 이미지로 사용 중: ${name}`,
    statusClearedImages: "디자인 이미지와 구현 이미지를 비웠습니다",
    statusAnalyzing: "AI가 UI를 리뷰하고 있습니다…",
    statusAnalyzeDone: (count: number) => `AI가 ${count}개의 문제를 반환했습니다`,
    statusNoHighlightIssues: "강조할 문제가 없습니다",
    statusHighlighted: (count: number) => `Figma에서 ${count}개의 문제를 강조했습니다`,
    statusHighlightsCleared: "Figma의 강조 표시를 지웠습니다"
  }
} satisfies Record<UILanguage, LocalizedCopy>;

function getStoredLanguage(): UILanguage {
  if (typeof window === "undefined") return "zh";
  const stored = window.localStorage.getItem("ui-review-language");
  return stored === "en" || stored === "ko" ? stored : "zh";
}

function severityLabel(value: Severity, language: UILanguage) {
  const copy = COPY[language];
  return value === "high" ? copy.severityHigh : value === "medium" ? copy.severityMedium : copy.severityLow;
}

function isDefaultExtraInstruction(value: string) {
  return Object.values(DEFAULT_EXTRA_INSTRUCTION).includes(value.trim());
}

export function App() {
  const [language, setLanguage] = useState<UILanguage>(() => getStoredLanguage());
  const [provider, setProvider] = useState<AIProvider | "">("");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("");
  const [extraInstruction, setExtraInstruction] = useState(DEFAULT_EXTRA_INSTRUCTION[getStoredLanguage()]);
  const [designImage, setDesignImage] = useState("");
  const [devImage, setDevImage] = useState("");
  const [report, setReport] = useState<ReviewReport | null>(null);
  const [status, setStatus] = useState(COPY[getStoredLanguage()].statusReady);
  const [loading, setLoading] = useState(false);

  const text = COPY[language];

  useEffect(() => {
    window.localStorage.setItem("ui-review-language", language);
  }, [language]);

  useEffect(() => {
    setStatus(text.statusReady);
  }, [text.statusReady]);

  useEffect(() => {
    setExtraInstruction((current) => {
      if (!current.trim() || isDefaultExtraInstruction(current)) {
        return DEFAULT_EXTRA_INSTRUCTION[language];
      }
      return current;
    });
  }, [language]);

  useEffect(() => {
    const handler = (event: MessageEvent<{ pluginMessage?: PluginToUIMessage }>) => {
      const message = event.data.pluginMessage;
      if (!message) return;
      if (message.type === "capture-success") {
        if (message.target === "design") {
          setDesignImage(message.payload.imageDataUrl);
          setStatus(COPY[language].statusCapturedDesign(message.payload.name));
        } else {
          setDevImage(message.payload.imageDataUrl);
          setStatus(COPY[language].statusCapturedDev(message.payload.name));
        }
      } else if (message.type === "capture-error" || message.type === "highlight-error" || message.type === "analyze-error") {
        setStatus(message.message);
        setLoading(false);
      } else if (message.type === "analyze-success") {
        setReport(message.report);
        setStatus(COPY[language].statusAnalyzeDone(message.report.issues.length));
        setLoading(false);
      } else if (message.type === "highlight-success") {
        setStatus(COPY[language].statusHighlighted(message.count));
      } else if (message.type === "clear-highlight-success") {
        setStatus(COPY[language].statusHighlightsCleared);
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [language]);

  const currentModelOptions = useMemo(() => (provider ? MODEL_OPTIONS[provider] : []), [provider]);
  const canAnalyze = useMemo(() => Boolean(provider && model && apiKey && designImage && devImage), [provider, model, apiKey, designImage, devImage]);
  const canClearImages = useMemo(() => Boolean(designImage || devImage), [designImage, devImage]);

  const apiKeyPlaceholder = useMemo(() => {
    if (!model) return text.apiKeyPlaceholderBeforeModel;
    if (OPENROUTER_BACKED_PROVIDERS.includes(provider as AIProvider)) return text.apiKeyPlaceholderOpenRouter;
    if (provider === "qwen") return text.apiKeyPlaceholderQwen;
    return text.apiKeyPlaceholder;
  }, [model, provider, text]);

  async function analyze() {
    if (!canAnalyze) {
      setStatus(text.statusNeedInputs);
      return;
    }

    setLoading(true);
    setStatus(text.statusAnalyzing);
    try {
      parent.postMessage(
        {
          pluginMessage: {
            type: "analyze-ui",
            provider: provider as AIProvider,
            apiKey,
            model,
            designImage,
            implementedImage: devImage,
            extraInstruction,
            language
          }
        },
        "*"
      );
    } catch (error) {
      setStatus(error instanceof Error ? error.message : text.statusAnalyzing);
      setLoading(false);
    }
  }

  function highlightAll() {
    if (!report?.issues.length) {
      setStatus(text.statusNoHighlightIssues);
      return;
    }
    parent.postMessage(
      {
        pluginMessage: {
          type: "highlight-issues",
          issues: report.issues,
          language
        }
      },
      "*"
    );
  }

  function highlightSingle(issue: ReviewIssue) {
    parent.postMessage(
      {
        pluginMessage: {
          type: "highlight-issues",
          issues: [issue],
          language
        }
      },
      "*"
    );
  }

  function clearImagesOnly() {
    setDesignImage("");
    setDevImage("");
    setStatus(text.statusClearedImages);
  }

  function clearHighlightsOnly() {
    parent.postMessage({ pluginMessage: { type: "clear-highlights", language } }, "*");
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <div className="hero-topbar">
          <div className="hero-copy">
            <h1>{text.title}</h1>
            <p className="hero-text">{text.heroText}</p>
          </div>
          <label className="language-field" aria-label={text.language} title={text.language}>
            <span className="sr-only">{text.language}</span>
            <select className="language-select" value={language} onChange={(event) => setLanguage(event.target.value as UILanguage)}>
              {LANGUAGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="status-chip">{status}</div>
      </header>

      <section className="panel">
        <div className="panel-head">
          <h2>{text.sectionImages}</h2>
          <button className="ghost" disabled={!canClearImages} onClick={clearImagesOnly}>
            {text.clearImages}
          </button>
        </div>

        <div className="image-grid">
          <ImagePreview
            title={text.designImage}
            src={designImage}
            action={
              <button
                className="ghost"
                onClick={() => {
                  setStatus(text.statusCaptureDesign);
                  parent.postMessage({ pluginMessage: { type: "capture-current-frame", target: "design", language } }, "*");
                }}
              >
                {text.useCurrentFrame}
              </button>
            }
          />
          <ImagePreview
            title={text.devImage}
            src={devImage}
            action={
              <button
                className="ghost"
                onClick={() => {
                  setStatus(text.statusCaptureDev);
                  parent.postMessage({ pluginMessage: { type: "capture-current-frame", target: "dev", language } }, "*");
                }}
              >
                {text.useCurrentFrame}
              </button>
            }
          />
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>{text.sectionAi}</h2>
        </div>
        <div className="form-grid">
          <label className="field">
            <span>{text.provider}</span>
            <select
              value={provider}
              onChange={(event) => {
                setProvider(event.target.value as AIProvider | "");
                setModel("");
                setApiKey("");
              }}
            >
              <option value="">{text.providerPlaceholder}</option>
              {PROVIDER_OPTIONS.map((option) => (
                <option key={option.value || "provider-placeholder"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>{text.model}</span>
            <select value={model} onChange={(event) => setModel(event.target.value)} disabled={!provider}>
              <option value="">{provider ? text.modelPlaceholder : text.modelPlaceholderBeforeProvider}</option>
              {currentModelOptions.map((option) => (
                <option key={option.value || "placeholder"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>{text.apiKey}</span>
            <input value={apiKey} onChange={(event) => setApiKey(event.target.value)} placeholder={apiKeyPlaceholder} type="password" disabled={!model} />
          </label>
        </div>
        <label className="field">
          <span>{text.extraInstruction}</span>
          <textarea value={extraInstruction} onChange={(event) => setExtraInstruction(event.target.value)} rows={4} />
        </label>
        <div className="action-row">
          <button className="primary" disabled={loading || !canAnalyze} onClick={() => void analyze()}>
            {loading ? text.analyzing : text.analyze}
          </button>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>{text.sectionReport}</h2>
          <div className="report-head-actions">
            <button className="ghost" disabled={!report?.issues.length} onClick={clearHighlightsOnly}>
              {text.clearHighlights}
            </button>
            <button className="accent" disabled={!report?.issues.length} onClick={highlightAll}>
              {text.highlightAll}
            </button>
          </div>
        </div>

        {report ? (
          <>
            <div className="report-summary">
              <div className={`risk-pill ${report.overallRisk}`}>
                {text.overallRisk}: {severityLabel(report.overallRisk, language)}
              </div>
              <p>{report.summary}</p>
            </div>
            <div className="issue-list">
              {report.issues.map((issue) => (
                <article className="issue-card" key={issue.id}>
                  <div className="issue-card-head">
                    <div>
                      <h3>{issue.title}</h3>
                      <div className="issue-meta">
                        <span className={`severity ${issue.severity}`}>{severityLabel(issue.severity, language)}</span>
                        <span>
                          {text.confidence} {Math.round(issue.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                    <button className="danger" onClick={() => highlightSingle(issue)}>
                      {text.highlightSingle}
                    </button>
                  </div>
                  <p>{issue.summary}</p>
                  <div className="recommendation">{issue.recommendation}</div>
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className="empty-block">{text.emptyReport}</div>
        )}
      </section>
    </div>
  );
}

function ImagePreview({ title, src, action }: { title: string; src: string; action?: React.ReactNode }) {
  return (
    <div className="image-card">
      <div className="image-head">{title}</div>
      <div className={`image-body ${src ? "has-image" : "is-empty"}`}>
        {src ? <img src={src} alt={title} /> : <div className="image-empty" aria-hidden="true" />}
        {!src && action ? <div className="image-card-action">{action}</div> : null}
      </div>
    </div>
  );
}
