// Render resources/icon.svg to PNG icons for the window and electron-builder.
// Usage: node scripts/make-icon.mjs
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";

const root = fileURLToPath(new URL("..", import.meta.url));
const svg = await readFile(`${root}resources/icon.svg`, "utf8");

for (const size of [512, 256]) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: size },
    background: "transparent"
  });
  const png = resvg.render().asPng();
  const out = `${root}resources/icon-${size}.png`;
  await writeFile(out, png);
  console.log(`wrote ${out} (${png.length} bytes)`);
}

// electron-builder wants resources/icon.png as the win icon input.
await writeFile(`${root}resources/icon.png`, await readFile(`${root}resources/icon-512.png`));
console.log("wrote resources/icon.png (512px copy)");
