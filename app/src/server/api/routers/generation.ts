import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { v4 } from "uuid";
import { generation, users } from "@/server/db/schema";
import { count, desc, eq } from "drizzle-orm";
import { redisClient } from "@/server/redis";

export const generationRouter = createTRPCRouter({
  runGeneration: protectedProcedure
    .input(
      z.object({ prompt: z.string().trim().max(1024), imageData: z.string() }),
    )
    .mutation(async ({ ctx, input: { prompt, imageData } }) => {
      const requestId = v4();

      await ctx.db.insert(generation).values({
        requestId,
        prompt,
        status: "pending",
        createdBy: ctx.session.user.id,
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
        .select({
          requestId: generation.requestId,
          prompt: generation.prompt,
          createdBy: users.name,
        })
        .from(generation)
        .fullJoin(users, eq(generation.createdBy, users.id))
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
