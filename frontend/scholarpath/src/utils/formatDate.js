export function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function formatShortDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("fr-FR");
}
