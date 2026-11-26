// 웹 버전(맥 친구들용)을 docs/ 폴더로 만들어요. GitHub Pages가 docs/를 그대로 배포해요.
const fs = require("fs"), path = require("path");
const SRC = path.join(__dirname, "app"), OUT = path.join(__dirname, "docs");
const FILES = ["index.html", "app.js", "data.js", "rooms.js", "skills.js", "style.css", "manifest.json"];
const DIRS = ["fonts", "vendor", "assets"];
const SKIP = new Set(["tray.png", "tray@2x.png", "logo.png"]);
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT);
for (const f of FILES) fs.copyFileSync(path.join(SRC, f), path.join(OUT, f));
for (const d of DIRS) fs.cpSync(path.join(SRC, d), path.join(OUT, d), { recursive: true, filter: (p) => !SKIP.has(path.basename(p)) });
fs.writeFileSync(path.join(OUT, ".nojekyll"), "");
console.log("docs/ 준비 완료");
