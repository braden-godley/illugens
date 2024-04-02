import { useMemo } from "react";

import {
  Pagination as PaginationShadcn,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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
    <PaginationShadcn>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => setCurrentPage((page) => Math.max(0, page - 1))}
          />
        </PaginationItem>
        {pages.map((page) => (
          <PaginationItem key={page}>
            {typeof page === "string" ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink onClick={() => setCurrentPage(page)} isActive={page === currentPage}>
                {page + 1}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            onClick={() =>
              setCurrentPage((page) => Math.min(numPages - 1, page + 1))
            }
          />
        </PaginationItem>
      </PaginationContent>
    </PaginationShadcn>
  );
};

export default Pagination;
