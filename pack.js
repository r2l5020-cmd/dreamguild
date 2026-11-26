const { packager } = require("@electron/packager");
(async () => {
  for (const [platform, arch] of [["win32", "x64"], ["darwin", "arm64"], ["darwin", "x64"]]) {
    const out = await packager({
      dir: ".", out: "dist", overwrite: true, platform, arch,
      name: "DreamGuild", appBundleId: "org.paidion.dreamguild",
      appCopyright: "Paidion 홍보영상팀",
      prune: true, asar: true,
      ignore: [/^\/dist/, /^\/pack\.js/, /^\/build_icon/, /node_modules\/(electron|@electron|galmuri)/],
      ...(platform === "darwin" ? { icon: "build_icon.icns" } : {})
    });
    console.log("built", out);
  }
})().catch((e) => { console.error(e); process.exit(1); });
