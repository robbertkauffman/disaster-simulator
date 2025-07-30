import { writable } from 'svelte/store';

export const isRunning = writable(false);
export const alertMsg = writable('');