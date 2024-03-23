import { z } from "zod";
import { createClient } from "redis";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { v4 } from "uuid";
import fs from "fs";

export const jobRouter = createTRPCRouter({
  runJob: publicProcedure
    .input(z.object({ prompt: z.string().trim().max(1024), imageData: z.string() }))
    .mutation(async ({ ctx, input: { prompt, imageData } }) => {
      const requestId = v4();

      const jobData = {
        request_id: requestId,
        prompt,
        control_image_data: imageData,
      };

      const client = await createClient({
        url: "redis://localhost:6379"
      });

      await client.connect();

      await client.rPush("job-queue", JSON.stringify(jobData));

      return {
        requestId
      };
    }),
});
