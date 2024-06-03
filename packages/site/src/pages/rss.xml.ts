import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIRoute } from "astro";

export const GET: APIRoute = async (context) => {
  const blog = await getCollection("posts");

  return rss({
    title: "Senicko",
    description: "My thoughts on different computer science related topics.",
    site: context.site!,
    items: blog.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      link: `/blog/${post.slug}`,
    })),
    customData: "<language>en-us</language>",
  });
};
