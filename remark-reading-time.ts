import getReadingTime from "reading-time";
import { toString } from "mdast-util-to-string";
import type { RemarkPlugins } from "astro";

export function remarkReadingTime() {
  return function (tree, { data }) {
    const textOnPage = toString(tree);
    const readingTime = getReadingTime(textOnPage);
    data.astro.frontmatter.minutesToRead = readingTime.text;
  } satisfies RemarkPlugins[0];
}
