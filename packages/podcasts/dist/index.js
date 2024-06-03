import { Command } from "@commander-js/extra-typings";
import chalk from "chalk";
import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";
import fsSync, { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import OpenAI from "openai";
import { oraPromise } from "ora";
import prompts from "prompts";
import childProcess from "node:child_process";
import util from "node:util";
import { compileArticle } from "./lib.js";
import dotenv from "dotenv";
const exec = util.promisify(childProcess.exec);
/**
 * Returns a list of newly created articles or
 * ones that have changed sinc they were cached.
 * @param articlesPath path to articles directory
 * @param podcastsCache cache of articles' tts contents
 * @returns list of processed articles
 */
async function fetchUpdatedArticles(articlesPath) {
    const podcastsCache = await loadPodcastsCache();
    const updatedArticles = [];
    for (const filename of await fs.readdir(articlesPath)) {
        const contents = await fs.readFile(path.join(articlesPath, filename), {
            encoding: "utf-8",
        });
        let article;
        try {
            article = await compileArticle(contents);
        }
        catch (err) {
            console.error(chalk.red(`failed to process`), chalk.redBright(filename));
            console.error(err);
            continue;
        }
        const hash = createHash("md5")
            .update(article.sections.join())
            .digest("hex");
        if (podcastsCache[filename] === hash) {
            continue;
        }
        podcastsCache[filename] = hash;
        updatedArticles.push(article);
    }
    await fs.writeFile(path.resolve(".podcasts/cache.json"), JSON.stringify(podcastsCache));
    return updatedArticles;
}
/**
 * loadCache reads .podcasts/cache.json file or creates a new one
 * if it does not exist.
 * @returns loaded cache
 */
async function loadPodcastsCache() {
    const cacheFolderPath = path.resolve(".podcasts");
    if (!fsSync.existsSync(cacheFolderPath)) {
        await fs.mkdir(cacheFolderPath);
    }
    const cache = await fs.readFile(path.resolve(".podcasts/cache.json"), {
        encoding: "utf-8",
        flag: "a+",
    });
    return cache ? JSON.parse(cache) : {};
}
/**
 * Generates a podcast for the given article.
 * @param ttsInput text-to-speech input
 * @returns buffer with generated mp3 file
 */
async function generatePodcast(openai, article, outDir) {
    const outPath = path.join(outDir, `${article.frontmatter.slug}.mp3`);
    const sectionFilesPaths = await Promise.all(article.sections.map(async (section, i) => {
        const response = await openai.audio.speech.create({
            model: "tts-1-hd",
            voice: "echo",
            input: section,
        });
        const sectionFilePath = path.join(os.tmpdir(), `${article.frontmatter.slug}-section${i}.mp3`);
        await fs.writeFile(sectionFilePath, Buffer.from(await response.arrayBuffer()));
        return sectionFilePath;
    }));
    await exec(`ffmpeg -y -i "concat:${sectionFilesPaths.join("|")}" -c copy ${outPath}`);
    await Promise.all(sectionFilesPaths.map((path) => fs.rm(path, { force: true })));
}
const buildSelectArticlesPrompt = (articles) => ({
    type: "multiselect",
    name: "articles",
    message: "Pick articles for which you want to (re)generate podcast file.",
    choices: articles.map((article) => ({ title: article.frontmatter.slug })),
    instructions: false,
    hint: "\nmove with arrows, toggle with space, submit with return",
});
/**
 * generate is the generate command entry
 * @param articlesPath path to directory with all articles
 * @param outPath podcast .mp3 files output directory
 */
async function generate(articlesDir, outDir) {
    const updatedArticles = await oraPromise(fetchUpdatedArticles(articlesDir), "listing updated articles");
    if (updatedArticles.length === 0) {
        console.log(chalk.cyan("all podcasts are up to date!"));
        return;
    }
    const selectedArticles = new Set((await prompts(buildSelectArticlesPrompt(updatedArticles))).articles);
    const openai = new OpenAI();
    await Promise.all(updatedArticles
        .filter((_, i) => selectedArticles.has(i))
        .map(async (article) => await oraPromise(generatePodcast(openai, article, outDir), `${chalk.blue("generating podcast for")} ${chalk.blueBright(article.frontmatter.slug)}`)));
}
const cli = new Command();
cli
    .name("podcasts")
    .description("generate podcasts for your markdown articles");
cli
    .command("generate")
    .description("Generate podcasts for updated articles.")
    .option("--articles-dir <string>", "path to articles")
    .option("--out-dir <string>", "folder to which podcasts will be output")
    .option("--dotenv", "load environment variables from .env file")
    .action(({ dotenv: useDotenv, articlesDir = path.resolve("src/content/articles/"), outDir = path.resolve("public/assets/podcasts"), }) => {
    if (useDotenv) {
        dotenv.config();
    }
    generate(articlesDir, outDir);
});
cli.parse();
