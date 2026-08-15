const fs = require("fs");
const path = require("path");
const { runtimeDir } = require("../config/paths");

function ensureDir() {
  fs.mkdirSync(runtimeDir, { recursive: true });
}

function filePath(name) {
  return path.join(runtimeDir, name);
}

function readJson(name, fallback) {
  ensureDir();
  const target = filePath(name);
  if (!fs.existsSync(target)) {
    writeJson(name, fallback);
    return structuredClone(fallback);
  }
  return JSON.parse(fs.readFileSync(target, "utf8"));
}

function writeJson(name, data) {
  ensureDir();
  fs.writeFileSync(filePath(name), JSON.stringify(data, null, 2));
}

module.exports = {
  readJson,
  writeJson,
};
