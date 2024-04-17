import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
});
