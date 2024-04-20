import plugin from "tailwindcss/plugin";
import colors from "tailwindcss/colors";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      typography: ({ theme }) => ({
        theme: {
          css: {
            "--tw-prose-body": colors.zinc[600],
            "--tw-prose-headings": colors.zinc[950],
            "--tw-prose-invert-body": colors.zinc[400],
            "--tw-prose-invert-headings": colors.zinc[50],
          },
        },
      }),
    },
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
