import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";

import { api } from "@/utils/api";
import { useState } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const runJob = api.job.runJob.useMutation();

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
            <input value={prompt} onChange={(e) => setPrompt(e.target.value)} className="bg-white border w-full border-black" type="text" name="prompt" id="prompt"/>
          </div>
          <div>
            <label htmlFor="imageUrl">Control Image URL:</label>
            <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="bg-white border w-full border-black" type="text" name="imageUrl" id="imageUrl"/>
          </div>
          <button onClick={() => {
            console.log(imageUrl)
            runJob.mutate({
              prompt,
              imageUrl,
            });
          }}>Submit</button>
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
