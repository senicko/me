import type { MarkdownHeading } from "astro";

/** Toc represents a toc of a document. */
export type Toc = Array<TocEntry>;

/** TocEntry represents a single entry in a toc. */
export type TocEntry = MarkdownHeading & {
  children: Array<TocEntry>;
};

/**
 * generateToc converts a linear toc structure into a tree structure
 * that can be used for semantic html rendering.
 */
export function generateToc(
  rawHeadings: Array<MarkdownHeading>,
  depth: number,
): Array<TocEntry> {
  if (rawHeadings.length === 0 || depth < 1) {
    return [];
  }

  const headings = rawHeadings.map((heading) => ({
    ...heading,
    children: [],
  }));

  const toc: Array<TocEntry> = [headings.shift()!];

  for (const heading of headings) {
    if (heading.depth > depth) {
      continue;
    }

    while (toc.length !== 0 && heading.depth < toc.at(-1)!.depth) {
      let top = toc.pop()!;
      const targetDepth = top.depth - 1;
      const children = [];

      while (top.depth > targetDepth) {
        children.unshift(top);
        top = toc.pop()!;
      }

      top.children = children;
      toc.push(top);
    }

    toc.push(heading);
  }

  return toc;
}
