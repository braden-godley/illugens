import { api } from "@/utils/api";
import { useState } from "react";
import Pagination from "./Pagination";
import { Skeleton } from "@/components/ui/skeleton";

const Gallery = () => {
  const [currentPage, setCurrentPage] = useState<number>(0);
  const galleryQuery = api.generation.getGallery.useQuery(
    {
      page: currentPage,
    },
    {
      refetchInterval: 5000,
      refetchIntervalInBackground: true,
    },
  );

  const numPages = galleryQuery.data?.numPages ?? 1;

  return (
    <div>
      <Pagination
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        numPages={numPages}
      />
      <div className="mt-2 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {galleryQuery.data?.results.map((generation) => (
          <div
            key={generation.requestId}
            className="rounded-md border bg-white shadow-md"
          >
            <img
              className="aspect-square w-full rounded-t-md mb-2"
              src={`/api/view-image?requestId=${generation.requestId}&size=thumbnail`}
            />
            <p className="mx-2">{generation.prompt}</p>
            <p className="mx-2 mb-2 text-muted-foreground text-sm">by {generation.createdBy}</p>
          </div>
        ))}
        {galleryQuery.isLoading &&
          Array.from(Array(8).keys()).map((_, i) => (
            <div key={i} className="rounded-md border bg-white p-2 shadow-md">
              <Skeleton className="mb-2 aspect-square w-full rounded-t-md" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
      </div>
    </div>
  );
};

export default Gallery;
