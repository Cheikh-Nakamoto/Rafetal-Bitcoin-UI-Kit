import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/index.ts", "src/hooks/index.ts", "src/primitives/index.ts"],
  format: ["esm"],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: ["react", "react-dom"],
  target: "es2022",
})
