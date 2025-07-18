export function getTimestamp(date: Date): string {
	return date.toLocaleString('en-US', { hour: '2-digit', hour12: false, minute: '2-digit', second: '2-digit'});
}
