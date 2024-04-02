import { api } from "@/utils/api";
import { useEffect, useState } from "react";
import { Progress } from "./ui/progress";

export default function ModelOutput({ requestId }: { requestId: string }) {
  const utils = api.useUtils();
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    setProgress(0);
    const eventSource = new EventSource(`/api/sse?requestId=${requestId}`);

    eventSource.onmessage = (e) => {
      const data = JSON.parse(e.data) as JobEvent;
      if (data.type === "progress") {
        setProgress(data.progress);
        if (data.progress === 1) {
          setTimeout(() => utils.generation.getGallery.invalidate(), 500);
        }
      }
    };

    eventSource.onerror = (error) => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [requestId]);

  if (progress !== 1) {
    return (
      <div className="flex h-full items-center justify-center flex-col gap-4">
        <Progress value={progress * 100} />
        <p>{progress !== 0 ? `${Math.floor(progress * 100)}%` : "Not started..."}</p>
      </div>
    );
  }

  return (
    <div className="flex h-full items-center justify-center">
      <img src={`/api/view-image?requestId=${requestId}&size=full`} />
    </div>
  );
}

type JobEvent =
  | {
      type: "progress";
      progress: number;
    }
  | {
      type: "heartbeat";
    };
