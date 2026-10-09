// Render full-resolution stills of a composition at chosen frames, bundling once.
// Usage: node tools/stills.mjs <compositionId> <outDir> <frame> [frame ...]
// Set BROWSER to a local Chrome/headless_shell when the default download is unavailable.
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";

const [id, outDir, ...frames] = process.argv.slice(2);
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const browserExecutable = process.env.BROWSER || null;
const composition = await selectComposition({ serveUrl, id, browserExecutable });
for (const f of frames.map(Number)) {
  const output = path.join(outDir, `${id}-${String(f).padStart(5, "0")}.png`);
  await renderStill({ composition, serveUrl, frame: f, output, browserExecutable });
  console.log(output);
}
