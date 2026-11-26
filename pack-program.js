// DREAM GUILD 윈도우 프로그램(program/)을 dist/program/DreamGuild-win32-x64/ 에 만들어요.  사용: node pack-program.js
// 프로그램은 배포된 웹 페이지를 불러오니까, 웹만 고친 경우에는 다시 만들 필요가 없어요.
// (@electron/packager가 최신 Node에서 압축 풀기 단계에서 멈춰서, 같은 일을 직접 해요:
//  Electron 배포본을 풀고 → 실행 파일 이름·아이콘·정보를 바꾸고 → resources/app 에 program/ 을 넣어요)
const fs = require("fs"), path = require("path"), os = require("os");
const { execFileSync } = require("child_process");
const P = (p) => path.join(__dirname, p);

(async () => {
  const version = require("electron/package.json").version;
  const zipName = "electron-v" + version + "-win32-x64.zip";
  // 1) Electron 배포본 zip (npm install 때 받아 둔 캐시를 쓰고, 없으면 내려받아요)
  let zip = null;
  const cache = path.join(process.env.LOCALAPPDATA || os.homedir(), "electron", "Cache");
  if (fs.existsSync(cache)) for (const d of fs.readdirSync(cache)) { const f = path.join(cache, d, zipName); if (fs.existsSync(f)) zip = f; }
  if (!zip) {
    const { downloadArtifact } = require("@electron/get");
    zip = await downloadArtifact({ version, platform: "win32", arch: "x64", artifactName: "electron" });
  }
  // 2) 풀기
  const OUT = P("dist/program/DreamGuild-win32-x64");
  fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });
  execFileSync("tar", ["-xf", zip, "-C", OUT], { stdio: "inherit" });
  // 3) 아이콘 준비 (PNG를 그대로 담은 .ico)
  const png = fs.readFileSync(P("app/assets/appicon.png"));
  fs.writeFileSync(P("program/icon.png"), png);
  const head = Buffer.alloc(22);
  head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(1, 4);
  head.writeUInt8(0, 6); head.writeUInt8(0, 7); head.writeUInt8(0, 8); head.writeUInt8(0, 9);
  head.writeUInt16LE(1, 10); head.writeUInt16LE(32, 12); head.writeUInt32LE(png.length, 14); head.writeUInt32LE(22, 18);
  const ico = Buffer.concat([head, png]); fs.writeFileSync(P("program/icon.ico"), ico);
  // 4) 앱 넣기: resources/app
  fs.rmSync(path.join(OUT, "resources", "default_app.asar"), { force: true });
  const APP = path.join(OUT, "resources", "app"); fs.mkdirSync(APP, { recursive: true });
  for (const f of ["main.js", "preload.js", "offline.html", "package.json", "icon.png"]) fs.copyFileSync(P("program/" + f), path.join(APP, f));
  // 5) 실행 파일 이름·아이콘·정보
  const exe = path.join(OUT, "DreamGuild.exe");
  fs.renameSync(path.join(OUT, "electron.exe"), exe);
  const ResEdit = await import("resedit");
  const R = ResEdit.default && ResEdit.default.NtExecutable ? ResEdit.default : ResEdit;
  const nt = R.NtExecutable.from(fs.readFileSync(exe));
  const res = R.NtExecutableResource.from(nt);
  const iconFile = R.Data.IconFile.from(ico);
  R.Resource.IconGroupEntry.replaceIconsForResource(res.entries, 1, 1033, iconFile.icons.map((i) => i.data));
  const vi = R.Resource.VersionInfo.fromEntries(res.entries)[0];
  vi.setStringValues({ lang: 1033, codepage: 1200 }, { ProductName: "DREAM GUILD", FileDescription: "DREAM GUILD 마을", CompanyName: "Paidion 홍보영상팀", LegalCopyright: "Paidion 홍보영상팀", OriginalFilename: "DreamGuild.exe", InternalName: "DreamGuild" });
  vi.outputToResourceEntries(res.entries);
  res.outputResource(nt);
  fs.writeFileSync(exe, Buffer.from(nt.generate()));
  // 6) 팀원에게 줄 zip
  const zipOut = P("dist/DreamGuild-Windows.zip"); fs.rmSync(zipOut, { force: true });
  execFileSync("tar", ["-a", "-cf", zipOut, "-C", path.dirname(OUT), path.basename(OUT)], { stdio: "inherit" });
  console.log("만들었어요:", exe);
  console.log("zip:", zipOut, (fs.statSync(zipOut).size / 1048576).toFixed(1) + " MB");
})().catch((e) => { console.error(e); process.exit(1); });
