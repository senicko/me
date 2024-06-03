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

  const root = {
    depth: -1,
    children: [] as Array<TocEntry>,
  };

  const stack = [root];

  for (const child of headings) {
    while (stack.at(-1)!.depth >= child.depth) {
      stack.pop();
    }
    stack.at(-1)!.children.push(child);
    stack.push(child);
  }

  return root.children;
}
