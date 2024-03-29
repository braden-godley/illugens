import { api } from "@/utils/api";
import { useState } from "react";
import Pagination from "./Pagination";

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
      <Pagination currentPage={currentPage} setCurrentPage={setCurrentPage} numPages={numPages} />
      <div className="mt-2 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {galleryQuery.data?.results.map((generation) => (
          <div className="rounded-md border bg-white shadow-md">
            <img
              className="aspect-square w-full rounded-t-md"
              src={`/api/view-image?requestId=${generation.requestId}&size=thumbnail`}
            />
            <p className="p-2">{generation.prompt}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery;
