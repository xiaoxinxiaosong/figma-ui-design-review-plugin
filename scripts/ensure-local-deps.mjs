import { access, lstat, rm, symlink } from "node:fs/promises";
import { constants } from "node:fs";
import { homedir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const localNodeModules = resolve(root, "node_modules");
const requiredPackages = ["vite", "typescript", "react", "react-dom", "esbuild"];

async function pathExists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function pathEntryExists(path) {
  try {
    await lstat(path);
    return true;
  } catch {
    return false;
  }
}

async function hasRequiredPackages(nodeModulesPath) {
  for (const pkg of requiredPackages) {
    if (!(await pathExists(resolve(nodeModulesPath, pkg)))) {
      return false;
    }
  }
  return true;
}

function getCandidateNodeModules() {
  const home = homedir();
  return [
    resolve(root, "..", "..", "figma-ui-design-review-plugin", "node_modules"),
    resolve(home, "Documents", "New project", "node_modules")
  ];
}

export async function ensureLocalDeps() {
  if (await hasRequiredPackages(localNodeModules)) {
    return localNodeModules;
  }

  const localExists = await pathEntryExists(localNodeModules);
  if (localExists) {
    const stat = await lstat(localNodeModules);
    if (stat.isSymbolicLink()) {
      await rm(localNodeModules, { force: true });
    } else {
      throw new Error(
        "当前工程的 node_modules 不完整，且不是可自动修复的软链接。请删除后重试，或安装完整依赖。"
      );
    }
  }

  for (const candidate of getCandidateNodeModules()) {
    if (candidate === localNodeModules) {
      continue;
    }
    if (await hasRequiredPackages(candidate)) {
      await symlink(candidate, localNodeModules, "dir");
      return localNodeModules;
    }
  }

  throw new Error(
    "未找到可复用的本地依赖目录。请先在本机任一副本安装依赖，或为当前工程执行完整安装。"
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const linkedPath = await ensureLocalDeps();
  process.stdout.write(`Using dependencies from: ${linkedPath}\n`);
}
