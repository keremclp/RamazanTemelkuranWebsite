import { beforeEach, describe, expect, it } from "vitest";
import { getStorageObjectPath } from "./storage";

describe("getStorageObjectPath", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co";
  });

  it("extracts this project's public bucket path", () => {
    expect(
      getStorageObjectPath(
        "https://project.supabase.co/storage/v1/object/public/media/books/cover.webp"
      )
    ).toBe("books/cover.webp");
  });

  it("rejects external origins and path traversal", () => {
    expect(
      getStorageObjectPath(
        "https://other.supabase.co/storage/v1/object/public/media/books/cover.webp"
      )
    ).toBeNull();
    expect(
      getStorageObjectPath(
        "https://project.supabase.co/storage/v1/object/public/media/books/%2E%2E/cover.webp"
      )
    ).toBeNull();
  });
});
