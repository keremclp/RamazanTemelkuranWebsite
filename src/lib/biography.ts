export type BiographyBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

const listItemPattern = /^\s*[-•·]\s+(.+)$/;

export function parseBiographyBlocks(value: string): BiographyBlock[] {
  const lines = value.replace(/\r\n?/g, "\n").trim().split("\n");
  const blocks: BiographyBlock[] = [];
  let paragraphLines: string[] = [];
  let listItems: string[] = [];

  function flushParagraph() {
    const text = paragraphLines.join(" ").trim();
    if (text) blocks.push({ type: "paragraph", text });
    paragraphLines = [];
  }

  function flushList() {
    if (listItems.length > 0) blocks.push({ type: "list", items: listItems });
    listItems = [];
  }

  for (const line of lines) {
    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }

    const listItem = line.match(listItemPattern);
    if (listItem) {
      flushParagraph();
      listItems.push(listItem[1].trim());
      continue;
    }

    flushList();
    paragraphLines.push(line.trim());
  }

  flushParagraph();
  flushList();

  return blocks;
}
