import { users } from "@/server/db/schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import z from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";

export const tokenRouter = createTRPCRouter({
  getTokens: protectedProcedure.query(async ({ ctx }) => {
    return getTokens(ctx.db, ctx.session.user.id);
  }),
});

export async function getTokens(
  database: typeof db,
  userId: string,
): Promise<number | null> {
  const user = await database.query.users.findFirst({
    columns: {
      tokens: true,
    },
    where: eq(users.id, userId),
  });
  if (user) {
    return user.tokens;
  } else {
    return null;
  }
}
