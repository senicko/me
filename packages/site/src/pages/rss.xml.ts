import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIRoute } from "astro";

export const GET: APIRoute = async (context) => {
  const articles = await getCollection("articles");

  return rss({
    title: "Senicko",
    description: "My thoughts on different computer science related topics.",
    site: context.site!,
    items: articles.map((article) => ({
      title: article.data.title,
      pubDate: article.data.pubDate,
      link: `/writing/${article.slug}`,
      categories: article.data.tags,
    })),
    customData: "<language>en-us</language>",
  });
};
