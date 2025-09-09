// esbuild.config.mjs
import esbuild from "esbuild";
import { copyFileSync } from "fs";

const isWatch = process.argv.includes("--watch");

const config = {
  entryPoints: ["src/index.js"],
  bundle: true,
  outfile: "dist/bundle.js",
  minify: false,
  logLevel: "error",
  drop: ["console"], 
  plugins: [
    {
      name: "copy-index-html",
      setup(build) {
        build.onEnd(() => {
          copyFileSync("index.html", "dist/index.html");
        });
      },
    },
  ],
};

if (isWatch) {
  const ctx = await esbuild.context(config);
  await ctx.watch();
  console.log("⚡ Watching for changes...");
} else {
  await esbuild.build(config);
  console.log("✅ Build complete");
}