import { signIn } from "next-auth/react";
import Head from "next/head";

export default function Login() {
  return (
    <>
      <Head>
        <title>Login | Illusion Generator</title>
      </Head>
      <main className="min-h-screen bg-gray-100">
        <div className="container mx-auto p-8">
          <button onClick={() => signIn("email", {
            callbackUrl: "/"
          })}>Sign Up</button>
        </div>
      </main>
    </>
  );
}
