import chalk from "chalk";
import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import OpenAI from "openai";
import { oraPromise } from "ora";
import prompts from "prompts";
import remarkFrontmatter from "remark-frontmatter";
import remarkMDX from "remark-mdx";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import remarkUnlink from "remark-unlink";
import { unified } from "unified";
import { SKIP, visit } from "unist-util-visit";
import yaml from "yaml";

import podcastsCache from "./podcasts.cache.json" with { type: "json" };

if (!process.env.OPENAI_TTS_TOKEN) {
  throw new Error(
    "You need OPENAI_TTS_TOKEN env variable to generate audio files.",
  );
}

const ARTICLES_PATH = "./src/content/articles";
const READABLE_NODES = new Set(["paragraph", "list", "heading"]);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_TTS_TOKEN,
});

/**
 * Extracts readable nodes and frontmatter from raw MDX file
 * @param {string} rawMDX raw MDX file contents
 * @returns readableNodes and parsed frontmatter
 */
async function extractTTSInput(rawMDX) {
  const ast = await unified()
    .use(remarkUnlink)
    .run(
      unified()
        .use(remarkParse)
        .use(remarkMDX)
        .use(remarkFrontmatter)
        .parse(rawMDX),
    );

  let frontmatter;
  /** @type {Array<Node>} */
  const readableNodes = [];

  visit(ast, (node) => {
    if (node.type.startsWith("mdx")) {
      return SKIP;
    }

    if (READABLE_NODES.has(node.type)) {
      readableNodes.push(node);
      return SKIP;
    }

    if (node.type === "yaml") {
      frontmatter = yaml.parse(node.value);
    }
  });

  const ttsInput = unified().use(remarkStringify).stringify({
    type: "root",
    children: readableNodes,
  });

  return {
    ttsInput: `"${frontmatter.title}"\n${ttsInput}`,
    slug: frontmatter.slug,
  };
}

/**
 * @typedef {Array<{filename: string, slug: string, ttsInput: string, hash: string}>} Article
 */

/**
 * Returns list of updated articles for which we potentially want to generate new podcasts.
 * @returns {Array<Article>} list of updated articles
 */
async function getUpdatedArticles() {
  const articles = await fs.readdir(ARTICLES_PATH);
  /** @type {Array<Article>} */
  const updatedArticles = [];

  for (const filename of articles) {
    const contents = await fs.readFile(path.join(ARTICLES_PATH, filename), {
      encoding: "utf-8",
    });

    const { ttsInput, slug } = await extractTTSInput(contents);

    const hash = createHash("md5").update(ttsInput).digest("hex");

    if (podcastsCache[filename] === hash) {
      console.log(
        chalk.green("cache hit for"),
        chalk.greenBright(filename),
        chalk.green("(skip)"),
      );
      continue;
    }

    updatedArticles.push({
      filename,
      slug,
      ttsInput,
      hash,
    });
  }

  return updatedArticles;
}

/**
 * Generates a podcast for the given article.
 * @param {string} ttsInput
 * @returns {Buffer}
 */
async function generatePodcast(ttsInput) {
  const response = await openai.audio.speech.create({
    model: "tts-1",
    voice: "echo",
    input: ttsInput,
  });

  return Buffer.from(await response.arrayBuffer());
}

/**
 * generate generates podcasts for site articles.
 */
async function generate() {
  const updatedArticles = await oraPromise(
    getUpdatedArticles,
    "listing updated articles",
  );

  if (updatedArticles.length === 0) {
    console.log(chalk.cyan("All podcasts are up to date!"));
    return;
  }

  const response = await prompts([
    {
      type: "multiselect",
      name: "articles",
      message: "Pick articles for which you want to (re)generate podcast file.",
      choices: updatedArticles.map((article) => article.filename),
      instructions: false,
      hint: "\nmove with arrows, toggle with space, submit with return",
    },
  ]);

  const selectedArticles = new Set(response.articles);

  await Promise.all(
    updatedArticles.map(async (article, i) => {
      await oraPromise(
        async () => {
          podcastsCache[article.filename] = article.hash;
          if (!selectedArticles.has(i)) {
            return;
          }

          console.log(article.ttsInput);

          // await fs.writeFile(
          //   path.resolve(`public/assets/podcasts/${article.slug}.mp3`),
          //   await generatePodcast(article.ttsInput),
          // );
        },
        `${chalk.blue("generating podcast for")} ${chalk.blueBright(article.filename)}`,
      );
    }),
  );

  await fs.writeFile(
    path.join(import.meta.dirname, "./podcasts.cache.json"),
    JSON.stringify(podcastsCache),
  );
}

await generate();
