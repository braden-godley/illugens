import { useMemo } from "react";

const MAX_PAGES = 6;

const Pagination = ({
  currentPage,
  setCurrentPage,
  numPages,
}: {
  currentPage: number;
  setCurrentPage: (newPage: number | ((currentPage: number) => number)) => void;
  numPages: number;
}) => {
  const pages = useMemo(() => {
    const pagesToShowSet = new Set<number>(Array.from(Array(numPages).keys()));

    if (numPages > MAX_PAGES) {
      for (let i = 0; i < numPages - MAX_PAGES + 1; i++) {
        const distances: Array<[number, number]> = Array.from(pagesToShowSet)
          .filter((page) => page !== 0 && page !== numPages - 1)
          .map((page) => [page, Math.abs(currentPage - page)]);
        distances.sort((a, b) => a[1] - b[1]);
        const furthest = distances.pop() as [number, number];
        pagesToShowSet.delete(furthest[0]);
      }
    }

    const pagesToShowArray = Array.from(pagesToShowSet) as number[];

    const pagesToShowArrayWithEllipses = pagesToShowArray.reduce(
      (acc, cur, i) => {
        const prev = pagesToShowArray[i - 1] as number;
        if (cur - prev > 1) {
          return [...acc, "..." + cur, cur];
        }
        return [...acc, cur];
      },
      [] as Array<string | number>,
    );

    return pagesToShowArrayWithEllipses;
  }, [currentPage, numPages, MAX_PAGES]);

  return (
    <div className="mt-2 flex items-baseline">
      <button
        className={`rounded-l-md border px-3 py-1 ${currentPage === 0 ? "bg-grey" : "bg-white"}`}
        onClick={() => setCurrentPage((page) => Math.max(0, page - 1))}
        disabled={currentPage === 0}
        aria-label="Previous page"
      >
        &lt;
      </button>
      {pages.map((page) =>
        typeof page === "number" ? (
          <button
            key={page}
            className={`min-w-8 border-y border-r px-2 py-1 ${page === currentPage ? "bg-grey" : "bg-white"}`}
            onClick={() => setCurrentPage(page)}
            disabled={page === currentPage}
            aria-label={`Go to page ${page + 1}`}
          >
            {page + 1}
          </button>
        ) : (
          <button
            key={page}
            className={`bg-grey border-y border-r min-w-8 px-2 py-1`}
            disabled={true}
            aria-label={`Go to page ${page + 1}`}
          >
            ...
          </button>
        ),
      )}
      <button
        className={`rounded-r-md border-y border-r px-3 py-1 ${currentPage === numPages - 1 ? "bg-grey" : "bg-white"}`}
        onClick={() =>
          setCurrentPage((page) => Math.min(numPages - 1, page + 1))
        }
        disabled={currentPage === numPages - 1}
        aria-label="Next page"
      >
        &gt;
      </button>
    </div>
  );
};

export default Pagination;
