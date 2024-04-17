import DefaultLayout from "@/components/layout/default";
import { Button } from "@/components/ui/button";
import { db } from "@/server/db";
import { generation } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { GetServerSideProps } from "next";
import Link from "next/link";
import { z } from "zod";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

type GenerationData = {
  requestId: string;
  createdBy: string;
  prompt: string;
  createdOn: string;
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
              <ArrowLeft className="mr-2 text-sm" />
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
            <img className="rounded-md" src={`/api/view-image?requestId=${generation.requestId}`} />
          </div>
          <div className="col-span-4">
            <p className="font-bold text-2xl mb-2">{generation.prompt}</p>
            <p className="text-muted-foreground mb-2">{dayjs(generation.createdOn).fromNow()}</p>
            <p>by {generation.createdBy}</p>
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

  const gen = await db.query.generation.findFirst({
    where: eq(generation.requestId, requestId),
    with: {
      user: true,
    }
  });

  if (!gen) {
    return {
      props: {
        generation: null,
      },
    };
  }

  return {
    props: {
      generation: {
        requestId: gen.requestId,
        createdBy: gen.user.name,
        prompt: gen.prompt,
        createdOn: gen.createdOn?.toISOString(),
      },
    },
  };
}) satisfies GetServerSideProps<{ generation: GenerationData | null }>;
