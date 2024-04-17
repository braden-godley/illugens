import DefaultLayout from "@/components/layout/default";
import { Button } from "@/components/ui/button";
import { generation } from "@/server/db/schema";
import { ArrowLeft } from "lucide-react";
import { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { z } from "zod";

type GenerationData = {
  requestId: string;
};

export default function ({
  generation,
}: {
  generation: GenerationData | null;
}) {
  if (generation === null) {
    return (
      <DefaultLayout title="Generation">
        <div className="mx-auto max-w-sm">
          <h1 className="mb-2 text-4xl font-bold">Not found</h1>
          <p className="mb-4">That generation can't be found.</p>
          <Link href="/">
            <Button variant="ghost">
              <ArrowLeft className="text-sm mr-2" />
              Go home
            </Button>
          </Link>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout title="Generation">
      <div className="container mx-auto">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-8">
            <img src={`/api/view-image?requestId=${generation.requestId}`} />
          </div>
          <div className="col-span-4">
            <p>Test</p>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}

export const getServerSideProps = (async (ctx) => {
  if (z.string().uuid().safeParse(ctx.query.id).success === false) {
    return {
      props: {
        generation: null,
      },
    };
  }

  const requestId = ctx.query.id as string;

  return {
    props: {
      generation: {
        requestId,
      },
    },
  };
}) satisfies GetServerSideProps<{ generation: GenerationData | null }>;
