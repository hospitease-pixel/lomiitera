import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ContactInfo } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeContactInfo(items: any[], defaultTag: string): ContactInfo[] {
  if (!items) return [];
  return items.map(item => {
    if (typeof item === 'string') {
      return { tag: defaultTag, value: item };
    }
    return item as ContactInfo;
  });
}
