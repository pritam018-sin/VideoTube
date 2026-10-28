export const ensureHttps = (url) => {
  if (!url || typeof url !== "string") return url;
  return url.replace(/^http:\/\//i, "https://");
};
