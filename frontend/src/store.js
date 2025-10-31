import { writable } from 'svelte/store';

export const alertMsg = writable('');
export const clusterEventMsg = writable('');
export const isRunning = writable(false);
