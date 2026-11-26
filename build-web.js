// 웹 버전(맥 친구들용)을 docs/ 폴더로 만들어요. GitHub Pages가 docs/를 그대로 배포해요.
const fs = require("fs"), path = require("path");
const SRC = path.join(__dirname, "app"), OUT = path.join(__dirname, "docs");
const FILES = ["index.html", "app.js", "data.js", "rooms.js", "skills.js", "wardrobe.js", "village.js", "style.css", "manifest.json"];
const DIRS = ["fonts", "vendor", "assets"];
const SKIP = new Set(["tray.png", "tray@2x.png", "logo.png"]);
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT);
for (const f of FILES) fs.copyFileSync(path.join(SRC, f), path.join(OUT, f));
for (const d of DIRS) fs.cpSync(path.join(SRC, d), path.join(OUT, d), { recursive: true, filter: (p) => !SKIP.has(path.basename(p)) });
fs.writeFileSync(path.join(OUT, ".nojekyll"), "");
/* 새로고침만 해도 새 버전이 뜨게: index.html 안의 js·css 주소 뒤에 내용 지문(?v=...)을 붙여요.
   파일이 바뀌면 주소가 바뀌어서 브라우저가 예전 파일을 다시 쓰지 않아요. */
const crypto = require("crypto");
let html = fs.readFileSync(path.join(OUT, "index.html"), "utf8");
html = html.replace(/(src|href)="([\w./-]+\.(?:js|css))"/g, (all, attr, file) => {
  const p = path.join(OUT, file); if (!fs.existsSync(p)) return all;
  const v = crypto.createHash("sha1").update(fs.readFileSync(p)).digest("hex").slice(0, 8);
  return attr + '="' + file + "?v=" + v + '"';
});
fs.writeFileSync(path.join(OUT, "index.html"), html);
console.log("docs/ 준비 완료");
