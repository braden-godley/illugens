import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "redis";
import z from "zod";

const requestSchema = z.object({
  requestId: z.string().uuid(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Content-Encoding": "none",
    Connection: "keep-alive",
  });

  if (requestSchema.safeParse(req.query).success === false) {
    console.log(req.query)
    res.status(400).end();
    return;
  }

  console.log("Writing headers");

  const { requestId } = req.query;

  console.log("Got request with id", requestId);

  const client = await createClient({
    url: "redis://localhost:6379",
  });
  client.connect();

  const channel = `job_progress:${requestId}`;

  let receivedData = false;

  console.log("Subscribed to channel", channel);
  await client.subscribe(channel, (message) => {
    receivedData = true;
    const data = JSON.parse(message);
    if (data.type === "progress") {
      const progress = data.progress;

      sendData({
        type: "progress",
        progress,
      });

      if (progress === 1) {
        res.status(200).end();
      }
    }
  });


  const sendData = (data: object) => {
    console.log("Sending data", data);
    const jsonData = JSON.stringify(data);
    
    res.write(`data: ${jsonData}\n\n`, (err) => {
      if (err) {
        console.log("error sending!");
      }
    });
  };

  sendData({ type: "heartbeat" });

  const intervalId = setInterval(() => {
    if (!receivedData) {
      res.status(200).end();
      return;
    }
    sendData({ type: "heartbeat" });
  }, 5000);

  res.on("close", () => {
    clearInterval(intervalId);
    client.unsubscribe(channel);
    res.end();
  });
}
