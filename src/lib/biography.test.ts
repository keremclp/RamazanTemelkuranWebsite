import { describe, expect, it } from "vitest";
import { parseBiographyBlocks } from "./biography";

describe("parseBiographyBlocks", () => {
  it("converts supported bullet markers into one semantic list", () => {
    expect(
      parseBiographyBlocks(
        "Eserleri kronolojik olarak:\n\n· 2016 – Birinci eser\n- 2017 – İkinci eser\n• 2018 – Üçüncü eser"
      )
    ).toEqual([
      { type: "paragraph", text: "Eserleri kronolojik olarak:" },
      {
        type: "list",
        items: [
          "2016 – Birinci eser",
          "2017 – İkinci eser",
          "2018 – Üçüncü eser",
        ],
      },
    ]);
  });

  it("keeps blank-line-separated prose as paragraphs", () => {
    expect(
      parseBiographyBlocks(
        "Birinci paragrafın ilk satırı\naynı paragrafın devamı.\r\n\r\nİkinci paragraf."
      )
    ).toEqual([
      {
        type: "paragraph",
        text: "Birinci paragrafın ilk satırı aynı paragrafın devamı.",
      },
      { type: "paragraph", text: "İkinci paragraf." },
    ]);
  });
});
