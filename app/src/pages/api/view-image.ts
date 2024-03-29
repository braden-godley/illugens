import { NextApiRequest, NextApiResponse } from "next";
import z from "zod";
import path from "path";
import fs from "fs";
import sharp from "sharp";

const requestSchema = z.object({
  requestId: z.string().uuid(),
  size: z.enum(["thumbnail", "full"]),
});

const ROOT_DIR = "/home/bgodley/git/illusion-site/app";
const OUTPUT_FOLDER = path.join(ROOT_DIR, "output");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (requestSchema.safeParse(req.query).success === false) {
    console.log(req.query);
    res.status(400).end();
    return;
  }

  const { requestId, size } = req.query as z.infer<typeof requestSchema>;

  const fileName = `${requestId}.png`;

  const filePath = path.join(OUTPUT_FOLDER, fileName);

  const waitForFile = new Promise<void>(async (resolve, reject) => {
    const maxTime = 10;

    let timeElapsed = 0;
    while (!fs.existsSync(filePath)) {
      if (timeElapsed > maxTime) {
        reject();
        return;
      }
      timeElapsed += 0.1;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    resolve();
  });

  waitForFile.then(() => {
    res.writeHead(200, {
      "Content-Type": "image/png",
    });
    
    fs.readFile(filePath, async (err, data) => {
      if (err) {
        res.status(500).end();
        return;
      }
      let output: Buffer = data;
      if (size === "thumbnail") {
        output = await sharp(data)
          .resize({
            width: 400,
            height: 400,
            fit: "cover"
          })
          .toBuffer();
      }

      res.status(200).end(output);
    })
  })
  .catch(() => {
    res.status(404).end("file not found!");
  });
}
