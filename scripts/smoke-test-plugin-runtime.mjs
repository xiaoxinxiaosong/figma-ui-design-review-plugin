import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const code = await readFile(resolve(root, "dist/code.js"), "utf8");

function createHighlightNode(id) {
  return {
    id,
    name: "",
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    cornerRadius: 0,
    fills: [],
    strokes: [],
    strokeWeight: 0,
    strokeAlign: "OUTSIDE",
    visible: true,
    remove() {},
    resize(width, height) {
      this.width = width;
      this.height = height;
    }
  };
}

const postedMessages = [];
const notifications = [];
const openedUrls = [];
const storage = new Map([
  ["ui-review-provider", "qwen"],
  ["ui-review-model", "qwen3-vl-plus"],
  ["ui-review-api-key-qwen-qwen3-vl-plus", "test-key"]
]);

const exportableNode = {
  id: "frame-1",
  name: "Mock Frame",
  visible: true,
  absoluteBoundingBox: {
    x: 0,
    y: 0,
    width: 375,
    height: 812
  },
  children: [],
  exportAsync: async () => new Uint8Array([137, 80, 78, 71]),
  parent: null
};

const figma = {
  showUI() {},
  notify(message, options) {
    notifications.push({ message, options });
    return { cancel() {} };
  },
  loadFontAsync: async () => {},
  openExternal(url) {
    openedUrls.push(url);
  },
  async getNodeByIdAsync(id) {
    if (id === "frame-1") return exportableNode;
    return null;
  },
  currentPage: {
    selection: [exportableNode],
    appendChild() {}
  },
  viewport: {
    scrollAndZoomIntoView() {}
  },
  clientStorage: {
    async getAsync(key) {
      return storage.has(key) ? storage.get(key) : "";
    },
    async setAsync(key, value) {
      storage.set(key, value);
    }
  },
  ui: {
    postMessage(message) {
      postedMessages.push(message);
    },
    onmessage: null
  },
  createRectangle() {
    return createHighlightNode(`rect-${postedMessages.length}`);
  },
  createText() {
    return {
      ...createHighlightNode(`text-${postedMessages.length}`),
      fontName: null,
      characters: "",
      fontSize: 12,
      width: 96
    };
  }
};

const reviewResponse = {
  output: {
    choices: [
      {
        message: {
          content: [
            {
              text: JSON.stringify({
                summary: "AI 已返回 1 条差异结果，请逐条确认。",
                overallRisk: "medium",
                issues: [
                  {
                    id: "issue-1",
                    title: "顶部导航栏图标位置偏移",
                    summary: "P1 类型：布局差异；位置：顶部左上角；问题：返回图标偏左；原因：实现未对齐设计稿；风险：影响导航一致性；修改建议：将实现页面返回图标右移到与设计稿一致。",
                    recommendation: "将实现页面返回图标右移到与设计稿一致。",
                    severity: "medium",
                    confidence: 0.82,
                    region: {
                      x: 0.04,
                      y: 0.03,
                      width: 0.12,
                      height: 0.08
                    }
                  }
                ]
              })
            }
          ]
        }
      }
    ]
  }
};

const context = {
  figma,
  console,
  setTimeout,
  clearTimeout,
  fetch: async () => ({
    ok: true,
    async json() {
      return reviewResponse;
    }
  })
};

vm.createContext(context);
vm.runInContext(code, context);

if (typeof figma.ui.onmessage !== "function") {
  throw new Error("figma.ui.onmessage was not initialized");
}

await figma.ui.onmessage(null);
await figma.ui.onmessage({});
await figma.ui.onmessage({ type: "load-settings" });
await figma.ui.onmessage({ type: "capture-current-frame", target: "design", language: "zh" });
await figma.ui.onmessage({
  type: "analyze-ui",
  provider: "qwen",
  apiKey: "test-key",
  model: "qwen3-vl-plus",
  designImage: "data:image/png;base64,AAA",
  implementedImage: "data:image/png;base64,BBB",
  extraInstruction: "重点检查布局和图标位置。",
  language: "zh"
});
await figma.ui.onmessage({
  type: "highlight-issues",
  issues: [
    {
      id: "issue-1",
      title: "顶部导航栏图标位置偏移",
      summary: "顶部导航栏图标位置偏移",
      recommendation: "将实现页面返回图标右移到与设计稿一致。",
      severity: "medium",
      confidence: 0.82,
      region: {
        x: 0.04,
        y: 0.03,
        width: 0.12,
        height: 0.08
      }
    }
  ],
  language: "zh"
});
await figma.ui.onmessage({ type: "open-contact", language: "zh" });

const messageTypes = postedMessages.map((item) => item.type);

if (!messageTypes.includes("settings-loaded")) {
  throw new Error("settings-loaded was not posted");
}

if (!messageTypes.includes("capture-success")) {
  throw new Error("capture-success was not posted");
}

if (!messageTypes.includes("analyze-success")) {
  throw new Error("analyze-success was not posted");
}

if (!messageTypes.includes("highlight-success")) {
  throw new Error("highlight-success was not posted");
}

if (!openedUrls.includes("mailto:s1119551.kh@go.edu.tw")) {
  throw new Error("open-contact did not trigger figma.openExternal");
}

console.log("plugin runtime smoke ok");
