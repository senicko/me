import plugin from "tailwindcss/plugin";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {},
  },
  plugins: [
    require("@tailwindcss/typography"),
    plugin(function ({ addVariant }) {
      addVariant(
        "prose-inline-code",
        '&.prose :where(:not(pre)>code):not(:where([class~="not-prose"],[class~="not-prose"] *))',
      );
    }),
  ],
};
