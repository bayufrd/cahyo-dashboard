import { writable } from 'svelte/store';
import type { DashboardData } from '$lib/types';

export const dataStore = writable<DashboardData | null>(null);

export async function loadData() {
  try {
    const response = await fetch('/data.json');
    const data = await response.json() as DashboardData;
    dataStore.set(data);
  } catch (error) {
    console.error('Error loading data:', error);
    dataStore.set(null);
  }
}