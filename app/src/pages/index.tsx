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
  };

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
      <main className="min-h-screen bg-gray-100">
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
                <input
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                  type="text"
                  name="prompt"
                  id="prompt"
                />
              </div>
              <div className="my-4">
                <FabricJSCanvas
                  className="mx-auto h-[500px] w-full border border-black md:w-[500px]"
                  onReady={onReady}
                />
              </div>
              <button
                onClick={addText}
                className="focus:shadow-outline mr-2 rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
              >
                Add Text
              </button>
              <button
                onClick={runJob}
                className="focus:shadow-outline rounded bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-700 focus:outline-none"
              >
                Submit
              </button>
            </div>
            <div>
              {requestId !== null && <ModelOutput requestId={requestId} />}
            </div>
          </div>
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
