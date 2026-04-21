import type { MacroFactorData } from '../types';

const STORAGE_KEY = 'macrofactor_data';

export function saveData(data: MacroFactorData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function loadData(): MacroFactorData | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as MacroFactorData;
  } catch {
    return null;
  }
}

export function hasData(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null;
}

export function clearData(): void {
  localStorage.removeItem(STORAGE_KEY);
}
