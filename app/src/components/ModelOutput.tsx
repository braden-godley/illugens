import { useEffect, useState } from "react";

export default function ModelOutput({ requestId }: { requestId: string }) {
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    setProgress(0);
    const eventSource = new EventSource(`/api/sse?requestId=${requestId}`);

    eventSource.onmessage = (e) => {
      const data = JSON.parse(e.data) as JobEvent;
      if (data.type === "progress") setProgress(data.progress);
    };

    eventSource.onerror = (error) => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [requestId]);

  if (progress !== 1) {
    return <p>Progress: {Math.floor(progress * 100)}%</p>
  }

  return <img src={`/api/view-image?requestId=${requestId}`} width="400" height="400"/>
}

type JobEvent =
  | {
      type: "progress";
      progress: number;
    }
  | {
      type: "heartbeat";
    };
