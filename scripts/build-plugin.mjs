import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { ensureLocalDeps } from "./ensure-local-deps.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const distDir = resolve(root, "dist");
const entryFile = resolve(root, "src/code.ts");
const generatedFile = resolve(root, "src/generated/ui-inline.ts");
const buildTempDir = resolve(root, ".build-temp");
const uiOnly = process.argv.includes("--ui-only");

function createDistManifest(sourceManifestText) {
  const manifest = JSON.parse(sourceManifestText);
  manifest.main = "code.js";
  return `${JSON.stringify(manifest, null, 2)}\n`;
}

async function assertGeneratedUiExists() {
  await readFile(generatedFile, "utf8");
}

async function buildRuntimeUiModule() {
  const source = await readFile(generatedFile, "utf8");
  const htmlMatch = source.match(/export const UI_HTML = `([\s\S]*)`;\s*$/);

  if (!htmlMatch) {
    throw new Error("Unable to locate UI_HTML in src/generated/ui-inline.ts");
  }

  const html = htmlMatch[1];
  const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);

  if (!scriptMatch) {
    throw new Error("Unable to locate inline <script> in UI_HTML");
  }

  const { transform } = await import("esbuild");
  const transformedScript = await transform(scriptMatch[1], {
    loader: "js",
    target: ["es2017"],
    format: "iife",
    charset: "utf8",
    minify: false
  });

  const runtimeHtml = html.replace(
    scriptMatch[0],
    `<script>\n${transformedScript.code.trim()}\n</script>`
  );

  const runtimeUiModule = resolve(buildTempDir, "ui-inline.runtime.ts");
  await mkdir(buildTempDir, { recursive: true });
  await writeFile(resolve(distDir, "ui-inline.runtime.html"), runtimeHtml, "utf8");
  await writeFile(runtimeUiModule, `export const UI_HTML = ${JSON.stringify(runtimeHtml)};\n`, "utf8");
  return runtimeUiModule;
}

async function bundlePluginCode() {
  await ensureLocalDeps();
  const { build } = await import("esbuild");
  const runtimeUiModule = await buildRuntimeUiModule();

  await build({
    entryPoints: [entryFile],
    outfile: resolve(distDir, "code.js"),
    bundle: true,
    format: "iife",
    platform: "browser",
    target: ["es2017"],
    charset: "utf8",
    sourcemap: false,
    treeShaking: true,
    logLevel: "info",
    plugins: [
      {
        name: "ui-inline-runtime-alias",
        setup(pluginBuild) {
          pluginBuild.onResolve({ filter: /^\.\/generated\/ui-inline$/ }, (args) => {
            if (resolve(args.resolveDir, args.path) === generatedFile) {
              return { path: runtimeUiModule };
            }
            return null;
          });
        }
      }
    ]
  });
}

async function copyRuntimeAssets() {
  const assetNames = ["icon.png", "icon.svg", "homepage-icon.png", "homepage-icon.svg"];
  for (const assetName of assetNames) {
    await copyFile(resolve(root, assetName), resolve(distDir, assetName));
  }
}

async function writeDistManifest() {
  const rootManifestText = await readFile(resolve(root, "manifest.json"), "utf8");
  await writeFile(resolve(distDir, "manifest.json"), createDistManifest(rootManifestText), "utf8");
}

await assertGeneratedUiExists();

if (uiOnly) {
  process.stdout.write("UI inline source is already the runtime source of truth: src/generated/ui-inline.ts\n");
  process.exit(0);
}

await rm(distDir, { recursive: true, force: true });
await rm(buildTempDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });

await bundlePluginCode();
await copyRuntimeAssets();
await writeDistManifest();
await rm(buildTempDir, { recursive: true, force: true });
