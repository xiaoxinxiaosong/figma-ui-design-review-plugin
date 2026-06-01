import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const inputPath = process.argv[2] ? resolve(root, process.argv[2]) : resolve(root, "src/generated/ui-inline.ts");
const source = await readFile(inputPath, "utf8");
const isHtmlFile = inputPath.endsWith(".html");
const html = isHtmlFile
  ? source
  : (source.match(/export const UI_HTML = `([\s\S]*)`;/) || [])[1];

if (!html) {
  throw new Error("UI_HTML not found in src/generated/ui-inline.ts");
}

const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);

if (!scriptMatch) {
  throw new Error("Inline <script> not found in UI_HTML");
}

class ElementStub {
  constructor(id = "") {
    this.id = id;
    this.children = [];
    this.innerHTML = "";
    this.textContent = "";
    this.value = "";
    this.disabled = false;
    this.placeholder = "";
    this.src = "";
    this.title = "";
    this.style = {
      setProperty() {}
    };
    this.classList = {
      add() {},
      remove() {},
      toggle() {}
    };
    this.listeners = {};
  }

  appendChild(child) {
    this.children.push(child);
    return child;
  }

  addEventListener(type, handler) {
    this.listeners[type] = handler;
  }

  removeAttribute(name) {
    delete this[name];
  }

  setAttribute(name, value) {
    this[name] = value;
  }

  getAttribute(name) {
    return this[name];
  }

  querySelectorAll() {
    return [];
  }

  getBoundingClientRect() {
    return { left: 0, top: 0, width: 400, height: 920 };
  }
}

const ids = [
  "landingScreen",
  "appShell",
  "enterAppButton",
  "contactAuthorButton",
  "landingLanguageSelect",
  "landingLanguageLabel",
  "landingTitle",
  "landingText",
  "backToLanding",
  "heroTitle",
  "heroText",
  "statusChip",
  "imagesTitle",
  "clearImagesButton",
  "designTitle",
  "devTitle",
  "captureDesignButton",
  "captureDevButton",
  "designBody",
  "devBody",
  "designImage",
  "devImage",
  "aiTitle",
  "providerLabel",
  "modelLabel",
  "apiKeyLabel",
  "extraInstructionLabel",
  "providerSelect",
  "modelSelect",
  "apiKeyInput",
  "extraInstructionInput",
  "analyzeButton",
  "reportTitle",
  "clearHighlightsButton",
  "highlightAllButton",
  "reportContainer"
];

const elements = Object.fromEntries(ids.map((id) => [id, new ElementStub(id)]));
const flowHorizontal = new ElementStub("flowHorizontal");
const flowHorizontalDot = new ElementStub("flowHorizontalDot");
const flowVertical = new ElementStub("flowVertical");
const flowVerticalDot = new ElementStub("flowVerticalDot");

const documentStub = {
  body: new ElementStub("body"),
  getElementById(id) {
    return elements[id] || null;
  },
  querySelector(selector) {
    if (selector === ".flow-track-horizontal") return flowHorizontal;
    if (selector === ".flow-track-horizontal span") return flowHorizontalDot;
    if (selector === ".flow-track-vertical") return flowVertical;
    if (selector === ".flow-track-vertical span") return flowVerticalDot;
    return null;
  },
  createElement(tagName) {
    return new ElementStub(tagName);
  }
};

const postedMessages = [];
const windowStub = {
  localStorage: {
    getItem() {
      return null;
    },
    setItem() {},
    removeItem() {}
  },
  listeners: {},
  addEventListener(type, handler) {
    this.listeners[type] = handler;
  },
  onmessage: null
};

const parentStub = {
  postMessage(message) {
    postedMessages.push(message);
  }
};

const context = {
  console,
  document: documentStub,
  window: windowStub,
  parent: parentStub,
  setTimeout,
  clearTimeout
};

vm.createContext(context);
vm.runInContext(scriptMatch[1], context);

if (typeof windowStub.onmessage !== "function") {
  throw new Error("UI inline script did not register window.onmessage");
}

windowStub.onmessage({ data: null });
windowStub.onmessage({});

if (typeof elements.enterAppButton.listeners.click !== "function") {
  throw new Error("Enter Workspace button click handler is missing");
}

if (typeof elements.contactAuthorButton.listeners.click !== "function") {
  throw new Error("Contact Author button click handler is missing");
}

console.log("ui-inline smoke ok");
