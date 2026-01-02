import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function keyIsPressed(event: KeyboardEvent, keys: string[]): boolean {
  let retBool = true;
  retBool = retBool && (keys.includes("ctrl") ? (event.ctrlKey || event.metaKey) : !(event.ctrlKey || event.metaKey));
  retBool = retBool && (keys.includes("alt") ? event.altKey : !event.altKey);
  retBool = retBool && (keys.includes("shift") ? event.shiftKey : !event.shiftKey);
  return retBool && keys.includes(event.key);
}