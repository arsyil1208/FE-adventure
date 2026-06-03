/**
 * Format tanggal ke "DD MMM YYYY" bahasa Indonesia.
 * Contoh: "05 Jun 2025"
 */
export function formatDateDay(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format rentang tanggal trip.
 * Contoh: "05 Jun 2025 — 08 Jun 2025"
 */
export function formatTripRange(start, end) {
  if (!start) return '-';
  if (!end) return formatDateDay(start);
  return `${formatDateDay(start)} — ${formatDateDay(end)}`;
}
