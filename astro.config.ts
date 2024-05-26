import mdx from "@astrojs/mdx";
import tailwind from "@astrojs/tailwind";
import {
  transformerMetaHighlight,
  transformerNotationHighlight,
} from "@shikijs/transformers";
import { defineConfig } from "astro/config";
import { s } from "hastscript";
import rehypeAutolinkHeadings, {
  type Options as RehypeAutolinkHeadingsOptions,
} from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import { remarkReadingTime } from "./remark-reading-time.js";
import lightTheme from "./themes/light-theme.json";
import darkTheme from "./themes/dark-theme.json";

const rehypeAutoLinkHeadingsOptions: RehypeAutolinkHeadingsOptions = {
  behavior: "append",
  content: [
    s(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        fill: "none",
        stroke: "currentColor",
        "stroke-width": "1.5",
        viewBox: "0 0 24 24",
        width: 16,
        height: 16,
        class: "heading-anchor",
      },
      s("path", {
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        d: "M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244",
      }),
    ),
  ],
};

// https://astro.build/config
export default defineConfig({
  integrations: [
    mdx({
      rehypePlugins: [
        rehypeSlug,
        [rehypeAutolinkHeadings, rehypeAutoLinkHeadingsOptions],
      ],
      remarkPlugins: [remarkReadingTime],
      shikiConfig: {
        themes: {
          light: lightTheme,
          dark: darkTheme,
        },
        transformers: [
          transformerNotationHighlight(),
          transformerMetaHighlight(),
        ],
      },
    }),
    tailwind(),
  ],
  site: "https://senicko.me",
});
