import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface Project {
  id: string;
  title: string;
  category: string;
  image: string;
  span: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  image: string;
  readTime: string;
  date: string;
}

export interface Exploration {
  id: string;
  image: string;
  title: string;
}
