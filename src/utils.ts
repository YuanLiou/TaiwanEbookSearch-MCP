export function truncateText(
  text: string | undefined,
  maxLength: number,
): string {
  if (!text) return "";
  const cleaned = text.replace(/\n/g, " ").trim();
  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.slice(0, maxLength) + "…";
}

export interface Ebook {
  title?: string;
  price?: number;
  priceCurrency?: string;
  link?: string;
  authors?: string[];
  publishDate?: string;
  about?: string;
}

export interface BookstoreResult {
  bookstore?: { displayName?: string };
  quantity: number;
  books?: Ebook[];
}

export interface SearchResponse {
  keywords: string;
  totalQuantity: number;
  id: string;
  results?: BookstoreResult[];
}

export function transformSearchResponse(
  data: SearchResponse,
  maxPerBookstore: number,
  aboutMaxLength: number,
) {
  return {
    keywords: data.keywords,
    totalQuantity: data.totalQuantity,
    id: data.id,
    results: (data.results ?? []).map((r) => {
      const books = (r.books ?? []).slice(0, maxPerBookstore).map((b) => ({
        title: b.title?.trim(),
        price: b.price,
        priceCurrency: b.priceCurrency,
        link: b.link,
        authors: b.authors,
        publishDate: b.publishDate,
        about: truncateText(b.about, aboutMaxLength),
      }));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result: any = {
        bookstore: r.bookstore?.displayName,
        quantity: r.quantity,
        books,
      };

      if (r.quantity > maxPerBookstore) {
        result.booksShown = maxPerBookstore;
      }

      return result;
    }),
  };
}
