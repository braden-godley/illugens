import Head from "next/head";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { getCsrfToken } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SignIn({
  csrfToken,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <Head>
        <title>Verify Email | Illusion Generator</title>
        <meta name="description" content="Illusions At Your Fingertips" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="mt-8">
        <form method="post" action="/api/auth/signin/email">
          <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
          <Card className="mx-auto w-full max-w-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Check your inbox</CardTitle>
              <CardDescription>
                A login link has been sent to your email. Please check your
                inbox to access it and sign in.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Link href="/login">
                <Button variant="ghost">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to login
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </form>
      </main>
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const csrfToken = await getCsrfToken(context);
  return {
    props: { csrfToken },
  };
}
