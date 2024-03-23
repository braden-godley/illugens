import Head from "next/head";

import { api } from "@/utils/api";
import { useEffect, useState } from "react";
import ModelOutput from "@/components/ModelOutput";
import { FabricJSCanvas, useFabricJSEditor } from "fabricjs-react";

export default function Home() {
  const { editor, onReady } = useFabricJSEditor();
  const [prompt, setPrompt] = useState<string>("an underground habitat");
  const [requestId, setRequestId] = useState<string | null>(null);
  const runJobMutation = api.job.runJob.useMutation({
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

  const addText = () => {
    editor?.addText("Text");
  }

  const runJob = () => {
    const imageData = getImageData();
    
    runJobMutation.mutate({
      prompt,
      imageData,
    });
  };

  useEffect(() => {
    editor?.canvas.setBackgroundColor("#fff", () => null);
  }, [editor]);

  return (
    <>
      <Head>
        <title>Illusion Generator</title>
        <meta name="description" content="Illusions At Your Fingertips" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="">
        <div className="container mx-auto">
          <h1>Generate an illusion</h1>
          <div>
            <label htmlFor="prompt">Prompt:</label>
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full border border-black bg-white"
              type="text"
              name="prompt"
              id="prompt"
            />
          </div>
          <button
            onClick={addText}
          >
            Add Text
          </button>
          <button
            onClick={runJob}
          >
            Submit
          </button>
          <FabricJSCanvas
            className="mx-auto h-[500px] w-[500px] border border-black"
            onReady={onReady}
          />
          {requestId !== null && <ModelOutput requestId={requestId} />}
        </div>
      </main>
    </>
  );
}

// function AuthShowcase() {
//   const { data: sessionData } = useSession();

//   const { data: secretMessage } = api.post.getSecretMessage.useQuery(
//     undefined, // no input
//     { enabled: sessionData?.user !== undefined }
//   );

//   return (
//     <div className="flex flex-col items-center justify-center gap-4">
//       <p className="text-center text-2xl text-white">
//         {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
//         {secretMessage && <span> - {secretMessage}</span>}
//       </p>
//       <button
//         className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
//         onClick={sessionData ? () => void signOut() : () => void signIn()}
//       >
//         {sessionData ? "Sign out" : "Sign in"}
//       </button>
//     </div>
//   );
// }
