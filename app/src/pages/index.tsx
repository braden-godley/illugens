import Head from "next/head";

import { api } from "@/utils/api";
import { useRef, useState } from "react";
import ModelOutput from "@/components/ModelOutput";
import { FabricJSEditor } from "fabricjs-react";
import Gallery from "@/components/Gallery";
import CanvasEditor from "@/components/CanvasEditor";
import { Input } from "@/components/ui/input";
import DefaultLayout from "@/components/layout/default";

export default function Home() {
  const [prompt, setPrompt] = useState<string>("bagel world");
  const [requestId, setRequestId] = useState<string | null>(null);
  const [editor, setEditor] = useState<FabricJSEditor | undefined>(undefined);
  const runJobMutation = api.generation.runGeneration.useMutation({
    onSuccess: (response) => {
      setRequestId(response.requestId);
    },
  });

  const getImageData = () => {
    const url = editor?.canvas.toDataURL({
      format: "jpeg",
    });
    if (url === undefined) throw new Error("");
    const data = url.split(",")[1] as string;

    return data;
  };

  const runJob = () => {
    const imageData = getImageData();

    runJobMutation.mutate({
      prompt,
      imageData,
    });
  };

  return (
    <DefaultLayout title="Illusion Generator">
      <div className="container mx-auto p-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <h1 className="mb-6 text-4xl font-bold text-gray-800">
              Generate an illusion
            </h1>
            <div className="mb-4">
              <label
                htmlFor="prompt"
                className="mb-2 block text-sm font-bold text-gray-700"
              >
                Prompt:
              </label>
              <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                type="text"
                name="prompt"
                id="prompt"
              />
            </div>
            <CanvasEditor
              setEditor={(editor) => setEditor(editor)}
              onRunJob={runJob}
            />
          </div>
          <div>
            {requestId !== null && <ModelOutput requestId={requestId} />}
          </div>
        </div>
        <Gallery />
      </div>
    </DefaultLayout>
  );
}
