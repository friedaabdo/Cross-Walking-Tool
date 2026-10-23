export const normalizeExternalUrl = (url) => {
  const trimmedUrl = (url || "").trim();
  if (!trimmedUrl) {
    return "";
  }

  if (/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(trimmedUrl) || trimmedUrl.startsWith("//")) {
    return trimmedUrl;
  }

  return `https://${trimmedUrl}`;
};

// Browsers block opening a data: URL in a new tab, so open the same bytes through a blob: URL instead.
export const openDataUrlInNewTab = (dataUrl) => {
  const [header, base64 = ""] = dataUrl.split(",");
  const mimeType = /^data:([^;,]+)/.exec(header)?.[1] ?? "application/octet-stream";
  const bytes = Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));

  window.open(URL.createObjectURL(new Blob([bytes], { type: mimeType })), "_blank", "noopener");
};
