// esbuild.config.mjs
import esbuild from "esbuild";

const isWatch = process.argv.includes("--watch");

const config = {
  entryPoints: ["src/index.js"],
  bundle: true,
  outfile: "dist/bundle.js",
  minify: false,
  logLevel: "error",
  drop: ["console"], // 🔥 removes all console.* calls
};

if (isWatch) {
  const ctx = await esbuild.context(config);
  await ctx.watch();
  console.log("⚡ Watching for changes...");
} else {
  await esbuild.build(config);
  console.log("✅ Build complete");
}