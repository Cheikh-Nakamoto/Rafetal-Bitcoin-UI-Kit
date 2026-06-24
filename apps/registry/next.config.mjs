import { createMDX } from "fumadocs-mdx/next"

const withMDX = createMDX()

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  transpilePackages: ["@btc-ui/core", "@btc-ui/react", "@btc-ui/react-tailwind"],
  experimental: {
    typedRoutes: true,
  },
}

export default withMDX(config)
