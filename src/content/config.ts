import { z, defineCollection } from "astro:content";

const postsCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    pubDate: z.date(),
    description: z.string(),
    podcast: z.boolean().optional(),
  }),
});

export const collections = {
  articles: postsCollection,
};
