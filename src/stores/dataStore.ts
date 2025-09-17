import { writable } from "svelte/store";
import type { DashboardData } from "../types";

export const dataStore = writable<DashboardData | null>(null);

export const loadData = async () => {
  const res = await fetch("/data.json");
  const json: DashboardData = await res.json();
  dataStore.set(json);
};
