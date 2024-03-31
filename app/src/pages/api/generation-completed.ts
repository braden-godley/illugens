import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import z from "zod";
import crypto from "crypto";
import { db } from "@/server/db";
import { generation } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { env } from "@/env";

const OUTPUT_FOLDER = env.OUTPUT_DIR;
const MAX_SIZE = 1024 * 1024 * 3; // 3MB max size
const SIGNATURE_KEY = env.JOB_RUNNER_SIGNATURE_KEY;

const requestSchema = z.object({
  requestId: z.string().uuid(),
  signature: z.string(),
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }

  if (requestSchema.safeParse(req.query).success === false) {
    res.status(400).end();
    return;
  }

  const { requestId, signature } = req.query as z.infer<typeof requestSchema>;

  console.log(`Received request ${requestId} with signature ${signature}`);

  const fileName = `${requestId}.png`;

  const filePath = path.join(OUTPUT_FOLDER, fileName);

  let chunks: Uint8Array[] = [];
  let totalSize = 0;

  req.on("data", (chunk) => {
    totalSize += chunk.length;
    if (totalSize > MAX_SIZE) {
      res.status(413).end("File too large");
      req.socket.destroy();
    } else {
      console.log("chunk", totalSize);
      chunks.push(chunk);
    }
  });

  req.on("end", () => {
    console.log("finished reading content");
    const buffer = Buffer.concat(chunks);

    const hmac = crypto.createHmac("sha256", SIGNATURE_KEY);
    hmac.update(buffer);
    const computedSignature = hmac.digest("hex");

    console.log("Computed signature: ", computedSignature);

    if (computedSignature !== signature) {
      console.log("invalid signature!");
      res.status(401).end("Invalid signature");
      return;
    }

    fs.writeFile(filePath, buffer, async (err) => {
      if (err) {
        console.log("Error saving file!");
        res.status(500).end("Error saving file!");
        return;
      }
      console.log("Saved file!");

      await db
        .update(generation)
        .set({
          status: "completed",
        })
        .where(eq(generation.requestId, requestId));

      res.status(200).end("Saved");
    });
  });
}
