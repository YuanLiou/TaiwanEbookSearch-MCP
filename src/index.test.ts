import { describe, it, expect } from "vitest";
import {
  truncateText,
  transformSearchResponse,
  type SearchResponse,
} from "./utils.js";

describe("truncateText", () => {
  it("returns empty string for undefined or empty input", () => {
    // Given: an undefined or empty string input
    // When: truncateText is called
    // Then: it should return an empty string
    expect(truncateText(undefined, 10)).toBe("");
    expect(truncateText("", 10)).toBe("");
  });

  it("does not truncate if length is within maxLength", () => {
    // Given: a string shorter than or equal to maxLength
    // When: truncateText is called
    // Then: it should return the original string without ellipsis
    expect(truncateText("hello world", 20)).toBe("hello world");
  });

  it("truncates and adds ellipsis if length exceeds maxLength", () => {
    // Given: a string longer than maxLength
    // When: truncateText is called
    // Then: it should return the string truncated to maxLength with an ellipsis appended
    expect(truncateText("hello world", 5)).toBe("hello…");
  });

  it("replaces newlines with spaces", () => {
    // Given: a string containing newline characters
    // When: truncateText is called
    // Then: it should return the string with newlines replaced by spaces
    expect(truncateText("hello\nworld", 20)).toBe("hello world");
  });

  it("trims whitespace from the ends", () => {
    // Given: a string with leading or trailing whitespace
    // When: truncateText is called
    // Then: it should return the string with whitespace trimmed
    expect(truncateText("  hello world  ", 20)).toBe("hello world");
  });
});

describe("transformSearchResponse", () => {
  it("transforms response and limits books per bookstore", () => {
    // Given: a mock SearchResponse with multiple books exceeding the maxPerBookstore limit
    const input: SearchResponse = {
      keywords: "test",
      totalQuantity: 5,
      id: "123",
      results: [
        {
          bookstore: { displayName: "Store A" },
          quantity: 5,
          books: [
            { title: "Book 1", about: "Long description here" },
            { title: "Book 2", about: "Short" },
            { title: "Book 3" },
            { title: "Book 4" },
          ],
        },
      ],
    };

    // When: transformSearchResponse is called with a limit of 2 books and about text length of 10
    const result = transformSearchResponse(input, 2, 10);

    // Then: the response should be transformed correctly, limiting books to 2, setting booksShown, and truncating the 'about' text
    expect(result.keywords).toBe("test");
    expect(result.results.length).toBe(1);
    expect(result.results[0].books.length).toBe(2);
    expect(result.results[0].booksShown).toBe(2);
    expect(result.results[0].books[0].about).toBe("Long descr…");
  });

  it("handles empty results gracefully", () => {
    // Given: a mock SearchResponse with empty results array
    const input: SearchResponse = {
      keywords: "empty",
      totalQuantity: 0,
      id: "456",
      results: [],
    };

    // When: transformSearchResponse is called
    const result = transformSearchResponse(input, 3, 10);

    // Then: it should return an empty results array without throwing errors
    expect(result.results).toEqual([]);
  });
});
