import { z } from "zod";
import { createClient } from "redis";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { v4 } from "uuid";
import fs from "fs";
import { generation, generationStatus } from "@/server/db/schema";
import { count, desc, eq } from "drizzle-orm";
import { copiedTextStyle } from "fabric/fabric-impl";
import { redisClient } from "@/server/redis";

export const generationRouter = createTRPCRouter({
  runGeneration: publicProcedure
    .input(
      z.object({ prompt: z.string().trim().max(1024), imageData: z.string() }),
    )
    .mutation(async ({ ctx, input: { prompt, imageData } }) => {
      const requestId = v4();

      await ctx.db.insert(generation).values({
        requestId,
        prompt,
        status: "pending",
      });

      const generationJobData = {
        request_id: requestId,
        prompt,
        control_image_data: imageData,
      };

      const client = await redisClient();

      await client.connect();

      await client.lPush("job-queue", JSON.stringify(generationJobData));

      return {
        requestId,
      };
    }),

  getGallery: publicProcedure
    .input(
      z.object({
        page: z.number().int().min(0).max(1000),
      }),
    )
    .query(async ({ ctx, input: { page } }) => {
      const PAGE_SIZE = 8;

      const results = await ctx.db
        .select()
        .from(generation)
        .where(eq(generation.status, "completed"))
        .orderBy(desc(generation.id))
        .limit(PAGE_SIZE)
        .offset(PAGE_SIZE * page);

      const numPages = await ctx.db
        .select({ count: count() })
        .from(generation)
        .where(eq(generation.status, "completed"));

      return {
        results,
        numPages: Math.ceil((numPages[0]?.count ?? 1) / PAGE_SIZE),
      };
    }),
});
