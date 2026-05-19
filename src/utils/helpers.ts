/** Format a date string to a readable format */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** Format a date-time string */
export function formatDateTime(dateStr: string): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Format a number with commas */
export function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

/** Generate a unique ID */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/** Truncate a string */
export function truncate(str: string, maxLen: number = 40): string {
  if (str.length <= maxLen) return str;
  return str.substring(0, maxLen) + '…';
}

/** Capitalize first letter */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/** Get initials from a full name */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

/** Delay utility for async operations */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Parse CSV text into arrays */
export function parseCSV(csv: string): string[][] {
  return csv.split('\n').map((row) =>
    row.split(',').map((cell) => cell.trim().replace(/^"|"$/g, ''))
  );
}

/** Status color mapping */
export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'approved':
      return 'success';
    case 'pending':
      return 'warning';
    case 'rejected':
      return 'danger';
    case 'active':
      return 'success';
    case 'completed':
      return 'primary';
    case 'draft':
      return 'surface';
    default:
      return 'surface';
  }
}
