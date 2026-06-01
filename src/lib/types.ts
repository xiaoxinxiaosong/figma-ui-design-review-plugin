export type Severity = "high" | "medium" | "low";
export type IssueStatus = "open" | "fixed";
export type AIProvider =
  | "openai"
  | "gemini"
  | "anthropic"
  | "xai"
  | "deepseek"
  | "meta"
  | "qwen"
  | "moonshot"
  | "mistral"
  | "cohere";

export type UILanguage = "zh" | "en" | "ko";

export type ReviewIssue = {
  id: string;
  title: string;
  summary: string;
  recommendation: string;
  severity: Severity;
  confidence: number;
  status?: IssueStatus;
  region: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

export type ReviewReport = {
  summary: string;
  overallRisk: Severity;
  issues: ReviewIssue[];
};

export type CapturedFrame = {
  nodeId: string;
  name: string;
  width: number;
  height: number;
  imageDataUrl: string;
};

export type PluginToUIMessage =
  | { type: "capture-success"; payload: CapturedFrame; target: "design" | "dev" }
  | { type: "capture-error"; message: string }
  | { type: "analyze-success"; report: ReviewReport }
  | { type: "analyze-error"; message: string }
  | { type: "highlight-success"; count: number }
  | { type: "highlight-error"; message: string }
  | { type: "clear-highlight-success" }
  | { type: "api-key-loaded"; provider: string; model: string; apiKey: string }
  | { type: "settings-loaded"; provider: string; model: string; apiKey: string };

export type UIToPluginMessage =
  | { type: "capture-current-frame"; target: "design" | "dev"; language?: UILanguage }
  | { type: "resize-ui"; height: number }
  | {
      type: "analyze-ui";
      provider: AIProvider;
      apiKey: string;
      model: string;
      designImage: string;
      implementedImage: string;
      extraInstruction?: string;
      language?: UILanguage;
    }
  | { type: "highlight-issues"; issues: ReviewIssue[]; language?: UILanguage }
  | { type: "clear-highlights"; language?: UILanguage }
  | { type: "open-contact"; language?: UILanguage }
  | { type: "load-settings" }
  | { type: "save-settings"; provider: string; model: string }
  | { type: "load-api-key"; provider: string; model: string }
  | { type: "save-api-key"; provider: string; model: string; apiKey: string };
