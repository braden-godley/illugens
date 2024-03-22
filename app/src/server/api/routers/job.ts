import { z } from "zod";
import { createClient } from "redis";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const jobRouter = createTRPCRouter({
  runJob: publicProcedure
    .input(z.object({ prompt: z.string().trim(), imageUrl: z.string().trim().url() }))
    .mutation(async ({ ctx, input: { prompt, imageUrl } }) => {
      const client = await createClient({
        url: "redis://localhost:6379"
      });

      await client.connect();

      await client.rPush("job-queue", JSON.stringify({
        prompt,
        control_image_url: imageUrl
      }));
    }),
});
