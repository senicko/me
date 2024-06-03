import { toMarkdown } from "mdast-util-to-markdown";
import { toString } from "mdast-util-to-string";
import util from "node:util";
import remarkFrontmatter from "remark-frontmatter";
import remarkMDX from "remark-mdx";
import remarkParse from "remark-parse";
import remarkUnlink from "remark-unlink";
import { unified } from "unified";
import { find } from "unist-util-find";
import { convert, is } from "unist-util-is";
import { remove } from "unist-util-remove";
import { CONTINUE, SKIP, visit } from "unist-util-visit";
import yaml from "yaml";
import * as z from "zod";
/** Checks if a node is valid TTS node. */
const isTTS = convert([
    "paragraph",
    "heading",
    "emphasis",
    "strong",
    "inlineCode",
    "text",
    "blockquote",
]);
const ttsTransformer = () => {
    return (ast, file) => {
        visit(ast, (node, index, parent) => {
            // Extract frontmatter
            if (is(node, "yaml")) {
                file.data.frontmatter = yaml.parse(node.value);
                return CONTINUE;
            }
            // Make sure headings are wrapped in quotation marks
            // after rendering to text
            if (is(node, "heading")) {
                const textNode = find(node, { type: "text" });
                textNode.value = `"${textNode.value}"`;
            }
            // Make sure lists are rendered properly as toString utility
            // just sticks items together without any spacing
            if (parent && index && is(node, "list")) {
                parent.children.splice(index, 1, {
                    type: "text",
                    value: toMarkdown(node),
                });
                return SKIP;
            }
        });
        remove(ast, (node) => !isTTS(node));
    };
};
const ttsCompiler = function () {
    // @ts-expect-error
    const self = this;
    self.compiler = (ast, file) => {
        const result = articleFrontmatterSchema.safeParse(file.data.frontmatter);
        if (!result.success) {
            throw new Error(`Parsed frontmatter is not an article frontmatter`);
        }
        const frontmatter = result.data;
        const sections = [`"${frontmatter.title}"\n\n`];
        for (const child of ast.children) {
            const text = toString(child) + "\n\n";
            if (text.length > 4096) {
                throw new Error(`${child.type} node will occupy over 4096 characters (${text.length}) after rendering which exceeds single API request limit.\n${util.inspect(child, { colors: true, compact: false, depth: null, maxStringLength: 50 })}`);
            }
            if (sections[sections.length - 1].length + text.length <= 4096) {
                sections[sections.length - 1] += text;
            }
            else {
                sections.push(text);
            }
        }
        return {
            sections,
            frontmatter,
        };
    };
};
const articleFrontmatterSchema = z.object({
    title: z.string(),
    slug: z.string(),
});
export async function compileArticle(rawMDX) {
    const vfile = await unified()
        .use(remarkParse)
        .use(remarkMDX)
        .use(remarkFrontmatter)
        .use(remarkUnlink)
        .use(ttsTransformer) // [!code highlight]
        .use(ttsCompiler) // [!code highlight]
        .process(rawMDX);
    return vfile.result;
}
