// DREAM GUILD 윈도우 프로그램(program/)을 dist/program/ 에 만들어요.  사용: node pack-program.js
// 프로그램은 배포된 웹 페이지를 불러오니까, 웹만 고친 경우에는 다시 만들 필요가 없어요.
const { packager } = require("@electron/packager");
const fs = require("fs"), path = require("path");
(async () => {
  const P = (p) => path.join(__dirname, p);
  const png = fs.readFileSync(P("app/assets/appicon.png"));
  fs.writeFileSync(P("program/icon.png"), png);
  // PNG를 그대로 담은 .ico (실행 파일 아이콘용)
  const head = Buffer.alloc(22);
  head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(1, 4); // ICO, 그림 1개
  head.writeUInt8(0, 6); head.writeUInt8(0, 7); head.writeUInt8(0, 8); head.writeUInt8(0, 9); // 256x256
  head.writeUInt16LE(1, 10); head.writeUInt16LE(32, 12); head.writeUInt32LE(png.length, 14); head.writeUInt32LE(22, 18);
  fs.writeFileSync(P("program/icon.ico"), Buffer.concat([head, png]));
  const electronVersion = require("electron/package.json").version;
  const out = await packager({
    dir: P("program"), out: P("dist/program"), overwrite: true, platform: "win32", arch: "x64",
    name: "DreamGuild", electronVersion, icon: P("program/icon.ico"), asar: true,
    appCopyright: "Paidion 홍보영상팀",
    win32metadata: { ProductName: "DREAM GUILD", FileDescription: "DREAM GUILD 마을", CompanyName: "Paidion 홍보영상팀" },
  });
  console.log("만들었어요:", out.join(", "));
})().catch((e) => { console.error(e); process.exit(1); });
