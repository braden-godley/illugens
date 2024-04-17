import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { v4 } from "uuid";
import { generation, users } from "@/server/db/schema";
import { count, desc, eq, and, gte, sql } from "drizzle-orm";
import { redisClient } from "@/server/redis";
import { getTokens } from "./token";
import { TRPCError } from "@trpc/server";

export const generationRouter = createTRPCRouter({
  runGeneration: protectedProcedure
    .input(
      z.object({ prompt: z.string().trim().max(1024), imageData: z.string() }),
    )
    .mutation(async ({ ctx, input: { prompt, imageData } }) => {
      const pendingGeneration = await ctx.db.query.generation.findFirst({
        where: and(
          eq(generation.status, "pending"),
          eq(generation.createdBy, ctx.session.user.id),
          gte(generation.createdOn, sql`current_timestamp - interval '1 minute'`)
        ),
      });

      if (pendingGeneration !== undefined) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "You must wait for your current generation to finish first.",
        });
      }

      const success = await ctx.db.transaction(async (tx) => {
        const tokens = await getTokens(tx, ctx.session.user.id);
        if (tokens === null || tokens < 1) {
          await tx.rollback();
          return false;
        }

        await tx
          .update(users)
          .set({
            tokens: tokens - 1,
          })
          .where(eq(users.id, ctx.session.user.id));

        return true;
      });

      if (!success) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have enough tokens!",
        });
      }

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
