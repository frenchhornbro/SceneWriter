import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function keyIsPressed(event: KeyboardEvent, keys: string[], allowOnInputBoxes: boolean = false): boolean {
  let retBool = true;
  retBool = retBool && (keys.includes("ctrl") ? (event.ctrlKey || event.metaKey) : !(event.ctrlKey || event.metaKey));
  retBool = retBool && (keys.includes("alt") ? event.altKey : !event.altKey);
  retBool = retBool && (keys.includes("shift") ? event.shiftKey : !event.shiftKey);
  if (!allowOnInputBoxes) {
    const target = event.target as HTMLElement;
    const tagName = target.tagName.toLowerCase();
    const isContentEditable = target.isContentEditable;
    retBool = retBool && !(tagName === "input" || tagName === "textarea" || isContentEditable);
  }
  return retBool && keys.includes(event.key);
}