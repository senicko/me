import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import tailwind from "@astrojs/tailwind";

import { remarkReadingTime } from "./remark-reading-time.mjs";

const siteTheme = {
  name: "site-theme",
  tokenColors: [
    {
      settings: {
        background: "#fff",
        foreground: "#71717a",
      },
    },
    {
      scope: [
        "keyword.operator.accessor",
        "meta.group.braces.round.function.arguments",
        "meta.template.expression",
        "markup.fenced_code meta.embedded.block",
      ],
      settings: {
        foreground: "#24292eff",
      },
    },
    {
      scope: "meta.link.inline.markdown",
      settings: {
        fontStyle: "underline",
        foreground: "#1976D2",
      },
    },
    {
      scope: ["string", "markup.fenced_code", "markup.inline"],
      settings: {
        foreground: "#2b5581",
      },
    },
    {
      scope: ["comment", "string.quoted.docstring.multi"],
      settings: {
        foreground: "#d4d4d8",
      },
    },
    {
      scope: [
        "keyword",
        "storage.modifier",
        "storage.type",
        "storage.control.clojure",
        "entity.name.function.clojure",
        "entity.name.tag.yaml",
        "support.function.node",
        "support.type.property-name.json",
        "punctuation.separator.key-value",
        "punctuation.definition.template-expression",
        "support.function",
        "entity.name.type",
        "entity.other.inherited-class",
        "meta.function-call",
        "meta.instance.constructor",
        "entity.other.attribute-name",
        "entity.name.function",
        "constant.keyword.clojure",
      ],
      settings: {
        foreground: "#18181b",
      },
    },
    {
      scope: "variable.parameter.function",
      settings: {
        foreground: "#FF9800",
      },
    },
    {
      scope: [
        "entity.name.tag",
        "string.quoted",
        "string.regexp",
        "string.interpolated",
        "string.template",
        "string.unquoted.plain.out.yaml",
        "keyword.other.template",
        "constant.numeric",
        "constant.language",
        "constant.other.placeholder",
        "constant.character.format.placeholder",
        "variable.language.this",
        "variable.other.object",
        "variable.other.class",
        "variable.other.constant",
        "meta.property-name",
        "meta.property-value",
        "support",
      ],
      settings: {
        foreground: "#0284c7",
      },
    },
  ],
  type: "light",
};

// https://astro.build/config
export default defineConfig({
  integrations: [mdx(), tailwind()],
  site: "https://senicko.me",
  markdown: {
    remarkPlugins: [remarkReadingTime],
    shikiConfig: {
      theme: siteTheme,
    },
  },
});