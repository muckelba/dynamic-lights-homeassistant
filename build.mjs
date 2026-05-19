import * as esbuild from "esbuild";
import { sassPlugin } from "esbuild-sass-plugin";
import { argv } from "node:process";
import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import fs from "node:fs";

const EXTENSION_NAME = "dynamic-lights-homeassistant";

const isMinify = argv.includes("--minify");
const isWatch = argv.includes("--watch");
const outFlag = argv.find((a) => a.startsWith("--out="));

let outDirectory;

if (outFlag) {
  outDirectory = outFlag.slice("--out=".length);
} else {
  try {
    const spicetifyConfigPath = execSync("spicetify -c", {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "ignore"],
    }).trim();
    const spicetifyDirectory = dirname(spicetifyConfigPath);
    outDirectory = join(spicetifyDirectory, "Extensions");
    console.log(`Detected Spicetify Extensions directory: ${outDirectory}`);
  } catch {
    outDirectory = "dist";
    console.log(
      `Could not detect Spicetify directory, falling back to: ${outDirectory}`,
    );
  }
}

const outfile = join(outDirectory, `${EXTENSION_NAME}.js`);

if (!fs.existsSync(outDirectory)) {
  fs.mkdirSync(outDirectory, { recursive: true });
}

const banner = `(async () => {
  while (!Spicetify.React || !Spicetify.ReactDOM) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  const React = Spicetify.React;
  const ReactDOM = Spicetify.ReactDOM;
`;

const footer = `
})();
`;

const buildOptions = {
  entryPoints: ["src/app.tsx"],
  outfile,
  bundle: true,
  format: "iife",
  platform: "browser",
  target: "es2017",
  jsx: "transform",
  jsxFactory: "React.createElement",
  jsxFragment: "React.Fragment",
  minify: isMinify,
  banner: { js: banner },
  footer: { js: footer },
  plugins: [
    sassPlugin({
      type: "style",
    }),
  ],
  alias: {
    react: "./src/shims/react.ts",
  },
};

if (isWatch) {
  const ctx = await esbuild.context(buildOptions);
  await ctx.watch();
  console.log(`Watching for changes... Output: ${outfile}`);
} else {
  await esbuild.build(buildOptions);
  console.log(`Build complete: ${outfile}`);
}
