import { NextApiRequest, NextApiResponse } from "next";
import z from "zod";

const requestSchema = z.object({
  requestId: z.string().uuid(),
});

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (requestSchema.safeParse(req.query).success === false) {
    res.status(400).end();
    return;
  }

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Content-Encoding": "none",
  });

  console.log("SSE connection established");

  const sendData = (data: string) => {
    console.log("Sending data:", data);
    const result = res.write(`data: ${data}\n\n`, (err) => {
      if (!err) {
        console.log("successfully sent!");
      } else {
        console.log("error sending!");
      }
    });

    console.log("result:", result);
  };

  sendData("Hello from SSE!");

  const intervalId = setInterval(() => {
    sendData(`Update: ${new Date().toISOString()}`);
  }, 5000);

  res.on("close", () => {
    clearInterval(intervalId);
    console.log("SSE connection closed");
    res.end();
  });
}
