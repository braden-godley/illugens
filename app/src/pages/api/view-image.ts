import { NextApiRequest, NextApiResponse } from "next";
import z from "zod";
import path from "path";
import fs from "fs";

const requestSchema = z.object({
  requestId: z.string().uuid(),
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

  const { requestId } = req.query;

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

    const stream = fs.createReadStream(filePath);

    stream.on("data", (chunk) => {
      res.write(chunk);
    });

    stream.on("end", () => {
      stream.close();
      res.status(200).end();
    });
  })
  .catch(() => {
    res.status(404).end("file not found!");
  });
}
