import type { StorybookConfig } from "@storybook/react-vite"

const config: StorybookConfig = {
  stories: [
    "../../../packages/react/src/**/*.stories.@(ts|tsx|mdx)",
    "../../../packages/react-tailwind/src/**/*.stories.@(ts|tsx|mdx)",
  ],
  addons: ["@storybook/addon-essentials"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  docs: { autodocs: "tag" },
}

export default config
