const productionUrl = "https://ramazantemelkuran.com";

function normalizeUrl(value: string) {
  return value.replace(/\/+$/, "");
}

export function getSiteUrl() {
  const configured = process.env.SITE_URL?.trim();
  if (!configured) return productionUrl;

  try {
    return normalizeUrl(new URL(configured).origin);
  } catch {
    return productionUrl;
  }
}

export function absoluteUrl(path = "/") {
  return new URL(path, `${getSiteUrl()}/`).toString();
}

export function shouldAllowSearchIndexing() {
  if (process.env.VERCEL_ENV) return process.env.VERCEL_ENV === "production";
  return process.env.NODE_ENV === "production";
}

export { productionUrl };
