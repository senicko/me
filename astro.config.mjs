import mdx from "@astrojs/mdx";
import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";

import {
  transformer,
  transformerMetaHighlight,
  transformerNotationDiff,
  transformerNotationHighlight,
} from "@shikijs/transformers";
import { remarkReadingTime } from "./remark-reading-time.mjs";
import theme from "./theme.json";

// https://astro.build/config
export default defineConfig({
  integrations: [mdx(), tailwind()],
  site: "https://senicko.me",
  markdown: {
    remarkPlugins: [remarkReadingTime],
    shikiConfig: {
      theme: theme,
      transformers: [
        transformerNotationHighlight(),
        transformerMetaHighlight(),
      ],
    },
  },
});
